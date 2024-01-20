import {
  SourceFile,
  Symbol as MorphSymbol,
  Node,
  Type,
  Signature,
  Expression,
  Identifier,
  CallExpression,
} from 'ts-morph';
import type { Workspace } from './workspace';
import { serializeDeclaration } from './serializers';
import { NodeLocation, getNodeLocationInSourceFile } from './location';
import { AnyMeta, SourceFileExports, RefQuery } from '../types';
import { hasPrivateLikeTag } from './serializers/doc';

// eslint-disable-next-line no-shadow
enum ExtractMethod {
  Single = 'extractMeta',
  Module = 'extractModule',
}

export interface ExportItem {
  name: string;
  location: NodeLocation;
  method: ExtractMethod;
  symbol: MorphSymbol;
}

const AVAILABLE_DEFINER_METHODS = Object.values(ExtractMethod);

function isAvailableDefinerMethod(method: unknown): method is ExtractMethod {
  return AVAILABLE_DEFINER_METHODS.includes(method as ExtractMethod);
}

function extractMetaDefinerName(definer: Node): ExtractMethod | undefined {
  if (!Node.isIdentifier(definer)) return;
  const name = definer.getSymbolOrThrow().getAliasedSymbolOrThrow().getName();
  if (isAvailableDefinerMethod(name)) return name;
}

function getAliasSymbolOrSelf(symbol: MorphSymbol): MorphSymbol {
  return symbol.getAliasedSymbol() || symbol;
}

function getCallExpressionArgNode(
  expression: CallExpression,
): Node | undefined {
  const [typeArgument] = expression.getTypeArguments();
  if (typeArgument) {
    return normalizeNodeIdentifier(typeArgument);
  }
  const [argument] = expression.getArguments();
  return argument;
}

function normalizeNodeIdentifier(node: Node): Identifier | undefined {
  if (Node.isIdentifier(node)) return node;
  if (Node.isTypeReference(node)) {
    const typeName = node.getTypeName();
    return normalizeNodeIdentifier(typeName);
  }
  if (Node.isTypeQuery(node)) {
    const exprName = node.getExprName();
    return normalizeNodeIdentifier(exprName);
  }
}

function getCallExpressionArgNodeSymbol(
  expression: CallExpression,
): MorphSymbol | undefined {
  const node = getCallExpressionArgNode(expression);
  if (!node) return;
  return getAliasSymbolOrSelf(node.getSymbolOrThrow());
}

export function exportSymbolToExportItem(
  exportSymbol: MorphSymbol,
): ExportItem {
  const name = exportSymbol.getName();
  const declaration = exportSymbol.getValueDeclarationOrThrow();
  const location = getNodeLocationInSourceFile(declaration);
  const startCursor = `${location.filePath}:${location.start.line}:${location.start.column}`;

  const initializer =
    Node.isInitializerExpressionGetable(declaration) &&
    declaration.getInitializerOrThrow();

  const invalidMethodMessage = `The declaration of the export member "${name}" requires an initializer using the ${AVAILABLE_DEFINER_METHODS.map(
    (m) => `${m}()`,
  ).join(' or ')} method. at ${startCursor}`;

  if (!initializer) {
    throw new Error(invalidMethodMessage);
  }

  if (!Expression.isCallExpression(initializer)) {
    throw new Error(invalidMethodMessage);
  }

  const [definer] = initializer.getChildren();
  const method = extractMetaDefinerName(definer);

  if (!method) {
    throw new Error(invalidMethodMessage);
  }

  let symbol: MorphSymbol;

  if (method === ExtractMethod.Single) {
    const _symbol = getCallExpressionArgNodeSymbol(initializer);
    if (!_symbol) {
      throw new Error(
        `The declaration of an export member "${name}" requires either a generic argument or a method argument.`,
      );
    }
    symbol = _symbol;
  } else {
    const node = getCallExpressionArgNode(initializer);
    if (!node) {
      throw new Error('missing node.');
    }

    if (Node.isIdentifier(node)) {
      symbol = node.getSymbolOrThrow().getAliasedSymbolOrThrow();
    } else if (Node.isCallExpression(node)) {
      symbol = node.getReturnType().getTypeArguments()[0].getSymbolOrThrow();
    } else {
      throw new Error('なんかへん。');
    }
  }

  return {
    name,
    location,
    method,
    symbol,
  };
}

export type CacheableItem = Type | Node | MorphSymbol | Signature;

const REF_SYMBOL = Symbol('MetaRef');

export type MetaRef<Meta extends AnyMeta = AnyMeta> = Meta & {
  readonly _refId: string;
  setMeta(meta: Meta): void;
  [REF_SYMBOL]: AnyMeta;
};

function toRef<Meta extends AnyMeta = AnyMeta>(
  id: string,
  bucket: any = {},
): MetaRef<Meta> {
  const toJSON = () => ({
    _refId: id,
  });
  const setMeta = (meta: any) => {
    bucket = meta;
  };
  const target = {
    _refId: id,
  };
  const proxy = new Proxy(target, {
    get(_target, prop) {
      if (prop === REF_SYMBOL) return bucket;
      if (prop === 'toJSON') return toJSON;
      if (prop === 'setMeta') return setMeta;
      return (_target as any)[prop];
    },
  }) as MetaRef<Meta>;
  return proxy;
}

function isRef<Meta extends AnyMeta = AnyMeta>(
  source: Meta | MetaRef<Meta>,
): source is MetaRef<Meta> {
  return !!(source as any)[REF_SYMBOL];
}

export interface ExportVisitorScope {
  readonly id: string;
  readonly exporter: SourceFileExporter;
}

export type ExportMetaVisitor<Meta extends AnyMeta = AnyMeta> = (
  scope: ExportVisitorScope,
) => Meta | MetaRef<Meta>;

export type ExportorSerializeHook<Meta extends AnyMeta = AnyMeta> = (
  exporter: SourceFileExporter,
  declaration: Node,
  name?: string,
) => Meta | void;

export function defineSerializeHook<Meta extends AnyMeta = AnyMeta>(
  hook: ExportorSerializeHook<Meta>,
): ExportorSerializeHook<Meta> {
  return hook;
}

export class SourceFileExporter {
  readonly deps: string[] = [];

  readonly workspace: Workspace;

  readonly sourceFile: SourceFile;

  private _lastItemCacheId = -1;

  private _refCache = new Map<CacheableItem, MetaRef>();

  constructor(workspace: Workspace, sourceFile: SourceFile) {
    this.workspace = workspace;
    this.sourceFile = sourceFile;
  }

  callHook(declaration: Node, name?: string): AnyMeta | void {
    const hooks = this.workspace.getHooks();
    for (const hook of hooks) {
      const meta = hook(this, declaration, name);
      if (meta) return meta;
    }
  }

  getExportItems(): ExportItem[] {
    const items: ExportItem[] = [];
    const exports = this.sourceFile.getExportSymbols();
    for (const symbol of exports) {
      items.push(exportSymbolToExportItem(symbol));
    }
    return items;
  }

  clear() {
    this._refCache.clear();
    this._lastItemCacheId = -1;
  }

  export(): SourceFileExports {
    this.clear();
    const items = this.getExportItems();
    const exports: {
      item: ExportItem;
      meta: AnyMeta | RefQuery | (AnyMeta | RefQuery)[];
    }[] = [];

    for (const item of items) {
      const { method, symbol } = item;

      if (method === ExtractMethod.Module) {
        const symbolExports = symbol.getExports();
        const allMeta = symbolExports.map((exportSymbol) => {
          const [_declaration] = exportSymbol.getDeclarations();
          const meta = serializeDeclaration(this, _declaration);
          return meta;
        });
        const filtered = allMeta.filter(
          (meta) => !hasPrivateLikeTag(meta.docs),
        );
        exports.push({ item, meta: filtered });
        continue;
      }

      const [_declaration] = symbol.getDeclarations();
      const meta = serializeDeclaration(this, _declaration);
      exports.push({ item, meta });
    }

    const refValues = Array.from(this._refCache.values());
    const refs = Object.fromEntries(
      refValues.map((ref) => {
        const id = ref._refId;
        return [id, ref[REF_SYMBOL]];
      }),
    );

    const _exports = Object.fromEntries(
      exports.map(({ item, meta }) => [item.name, meta]),
    );

    return {
      refs,
      exports: _exports,
      // @MEMO 本当はvisit中にであったやつを細かく拾いたい
      dependencies: this.workspace.project
        .getSourceFiles()
        .map((dep) => dep.getFilePath()),
    };
  }

  getRefById(id: string): MetaRef | undefined {
    const refs = this._refCache.values();
    for (const ref of refs) {
      if (ref._refId === id) return ref;
    }
  }

  getRefByIdOrThrow(id: string): MetaRef {
    const ref = this.getRefById(id);
    if (!ref) {
      throw new Error(`missing meta ref "${id}"`);
    }
    return ref;
  }

  getRefByItem(item: CacheableItem) {
    return this._refCache.get(item);
  }

  resolveRef(refOrMate: MetaRef | AnyMeta): AnyMeta {
    if (isRef(refOrMate)) return refOrMate[REF_SYMBOL];
    return refOrMate;
  }

  setRef(item: CacheableItem, ref: MetaRef) {
    this._refCache.set(item, ref);
  }

  dropRef(item: CacheableItem) {
    this._refCache.delete(item);
  }

  private _createEmptyRef(item: CacheableItem) {
    const id = `${++this._lastItemCacheId}`;
    const ref = toRef(id);
    this.setRef(item, ref);
    return ref;
  }

  visitWithScope<Meta extends AnyMeta = AnyMeta>(
    item: CacheableItem,
    visitor: ExportMetaVisitor<Meta>,
  ): Meta | MetaRef<Meta> {
    const ref = this.getRefByItem(item);
    if (ref) return ref as any;

    const emptyRef = this._createEmptyRef(item);
    const scope: ExportVisitorScope = {
      id: emptyRef._refId,
      exporter: this,
    };

    try {
      const result = visitor(scope);
      if (!isRef(result)) {
        emptyRef.setMeta(result);
      }
      return emptyRef as any;
    } catch (err) {
      this.dropRef(item);
      throw err;
    }
  }
}
