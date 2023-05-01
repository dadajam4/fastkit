import {
  Type,
  Node,
  Signature,
  Symbol as MorphSymbol,
  ClassDeclaration,
  InterfaceDeclaration,
  MethodDeclaration,
  PropertyDeclaration,
  GetAccessorDeclaration,
  SetAccessorDeclaration,
  SignaturedDeclaration,
  Scope,
  FunctionLikeDeclaration,
  CallSignatureDeclaration,
  MethodSignature,
  ConstructSignatureDeclaration,
  PropertySignature,
  IndexSignatureDeclaration,
  TypeLiteralNode,
  ObjectLiteralExpression,
  PropertyAssignment,
  ClassMemberTypes,
  JSDoc,
  IntersectionTypeNode,
  FunctionTypeNode,
  // SyntaxKind,
  JSDocableNode,
  TypeFormatFlags,
  PropertyAccessExpression,
  // TypeFlags,
} from 'ts-morph';

import {
  SignatureMeta,
  ClassMeta,
  ParameterMeta,
  FunctionMetaBody,
  FunctionMata,
  ObjectMemberMeta,
  ObjectMethodMeta,
  ObjectPropertyMeta,
  BasicMeta,
  BasicMetaBody,
  ParameterDocs,
  ObjectMeta,
  AnyMeta,
  ObjectMembers,
} from '../../types';
import { getMetaDocs, hasPrivateLikeTag } from './doc';

import type { SourceFileExporter } from '../source-file-exporter';

type ObjectPropertyType =
  | MethodDeclaration
  | PropertyDeclaration
  | GetAccessorDeclaration
  | SetAccessorDeclaration
  | CallSignatureDeclaration
  | MethodSignature
  | ConstructSignatureDeclaration
  | PropertySignature
  | IndexSignatureDeclaration
  | PropertyAssignment
  | PropertyAccessExpression;

export function isObjectPropertyType(node: Node): node is ObjectPropertyType {
  return (
    Node.isMethodDeclaration(node) ||
    Node.isPropertyDeclaration(node) ||
    Node.isGetAccessorDeclaration(node) ||
    Node.isSetAccessorDeclaration(node) ||
    Node.isCallSignatureDeclaration(node) ||
    Node.isMethodSignature(node) ||
    Node.isConstructSignatureDeclaration(node) ||
    Node.isPropertySignature(node) ||
    Node.isIndexSignatureDeclaration(node) ||
    Node.isPropertyAssignment(node) ||
    Node.isPropertyAccessExpression(node)
  );
}

export function serializeParameter(
  exporter: SourceFileExporter,
  symbol: MorphSymbol,
  paramDocs?: ParameterDocs | null,
): ParameterMeta {
  const declaration = symbol.getValueDeclarationOrThrow();
  if (!Node.isParameterDeclaration(declaration)) {
    throw new Error('xxxx');
  }
  const name = declaration.getName();
  const doc = paramDocs?.[name];
  const docs = doc || [];
  const defaultValue = declaration.getInitializer()?.getText();
  return {
    kind: 'parameter',
    name,
    optional: declaration.isOptional(),
    rest: declaration.isRestParameter(),
    text: getTypeText(declaration.getType(), declaration),
    defaultValue,
    docs,
  };
}

const LIB_TYPE_RE = /\/node_modules\/typescript\/lib\//;

export function isLibType(type: Type, declarations?: Node[]): boolean {
  if (type.isLiteral()) return true;
  // console.log(type.getFlags() === TypeFlags.ESSymbol);

  const typeDeclarations = type.getSymbol()?.getDeclarations();
  if (!declarations && !typeDeclarations) return false;
  const merged: Node[] = [];
  declarations && merged.push(...declarations);
  typeDeclarations && merged.push(...typeDeclarations);
  return merged.some((declaration) => {
    return LIB_TYPE_RE.test(declaration.getSourceFile().getFilePath());
  });
}

const TYPE_TEXT_IMPORTS_MATCH_RE = /(^|\s|<)import\(.+?\)\./g;

function getTypeText(
  type: Type,
  enclosingNode?: Node,
  typeFormatFlags?: TypeFormatFlags | undefined,
): string {
  return type
    .getText(enclosingNode, typeFormatFlags)
    .replace(TYPE_TEXT_IMPORTS_MATCH_RE, '$1');
}

function _normalizeTypeOrNode(typeOrNode: Type | Node): Node | undefined {
  if (Node.isNode(typeOrNode)) return typeOrNode;
  const symbol = typeOrNode.getSymbol();
  if (!symbol) return;
  return symbol.getDeclarations()[0];
}

function _searchJSDocableNode(
  typeOrNode: Type | Node,
  currentDepth = 0,
): JSDocableNode | undefined {
  const node = _normalizeTypeOrNode(typeOrNode);
  if (!node) return;
  if (Node.isJSDocable(node)) return node;
  if (Node.isSourceFile(node)) return;

  currentDepth++;
  if (currentDepth > 5) return;

  const parent = node.getParent();
  if (!parent) return;
  return _searchJSDocableNode(parent, currentDepth);
}

/**
 *
 * @TODO https://github.com/dsherret/ts-morph/issues/1379
 *
 * @param exporter
 * @param docNode
 * @returns
 */
function _extractJSDocs(
  exporter: SourceFileExporter,
  typeOrNode: Type | Node,
): JSDoc[] {
  const node = _searchJSDocableNode(typeOrNode);
  if (!node) return [];
  return node.getJsDocs();
}

function _extractMetaDocs(
  exporter: SourceFileExporter,
  typeOrNode: Type | Node,
) {
  const jsDocs = _extractJSDocs(exporter, typeOrNode);
  return getMetaDocs(jsDocs);
}

export function extractBasicMetaBody(
  exporter: SourceFileExporter,
  type: Type,
  docNode?: Node, // @TODO https://github.com/dsherret/ts-morph/issues/1379
): BasicMetaBody {
  const types = type.getUnionTypes();
  // if (!types.length) {
  //   types = [type];
  // }

  const text = type.isUnion()
    ? types.map((type) => getTypeText(type, docNode)).join(' | ')
    : getTypeText(type, docNode);

  return {
    text,
    docs: _extractMetaDocs(exporter, docNode || type),
    types: types.map((type) => {
      const typeRef = exporter.getRefByItem(type);
      if (typeRef) {
        return typeRef as AnyMeta;
      }

      const declaration = type.getSymbol()?.getDeclarations()?.[0];
      if (!declaration || isLibType(type)) {
        return {
          kind: 'single',
          text: getTypeText(type, docNode),
          literal: type.getLiteralValue(),
        };
      }

      const declarationRef = exporter.getRefByItem(declaration);
      if (declarationRef) {
        return declarationRef;
      }

      return serializeDeclaration(exporter, declaration);
    }),
  };
}

export function serializeBasicMeta(
  exporter: SourceFileExporter,
  type: Type,
  docNode?: Node,
  name?: string,
): BasicMeta {
  return {
    kind: 'basic',
    name,
    ...extractBasicMetaBody(exporter, type, docNode),
  };
}

export function serializeSignature(
  exporter: SourceFileExporter,
  signature: Signature,
): SignatureMeta {
  const declaration = signature.getDeclaration();
  const jsDocs = Node.isJSDocable(declaration) ? declaration.getJsDocs() : null;
  const docs = getMetaDocs(jsDocs);
  const [doc] = docs;
  const returnsTag = doc?.tags.find((tag) => tag.name === 'returns');
  const returnType = serializeBasicMeta(
    exporter,
    signature.getReturnType(),
    declaration,
  );
  if (returnsTag) {
    returnType.docs = [
      {
        description: {
          text: returnsTag.text,
          parts: returnsTag.parts,
        },
        tags: [],
        params: {},
      },
    ];
  }

  const text = exporter.workspace.project
    .getTypeChecker()
    .compilerObject.signatureToString(
      signature.compilerSignature,
      declaration.compilerNode,
    );

  return {
    kind: 'signature',
    text,
    declarationKind: declaration.getKindName(),
    parameters: signature
      .getParameters()
      .map((parameter) => serializeParameter(exporter, parameter, doc?.params)),
    returnType,
    docs: getMetaDocs(jsDocs),
  };
}

export function extractFunctionMetaBody(
  exporter: SourceFileExporter,
  declaration: SignaturedDeclaration,
): FunctionMetaBody {
  const { declarations, declarationKind } = (() => {
    if (Node.isNode(declaration)) {
      declaration.getType;
      const overloads =
        (Node.isOverloadable(declaration) && declaration.getOverloads()) || [];
      const declarations = [...overloads, declaration];
      return {
        declarations,
        declarationKind: declaration.getKindName(),
      };
    }
    const declarationKind = declaration
      .getSignature()
      .getDeclaration()
      .getKindName();
    return {
      declarations: [declaration],
      declarationKind,
    };
  })();
  const signatures = declarations.map((declaration) => {
    const signature = declaration.getSignature();
    return serializeSignature(exporter, signature);
  });
  const lastSignature = signatures[signatures.length - 1];

  return {
    text: lastSignature.text,
    declarationKind,
    signatures,
    docs: lastSignature.docs,
  };
}

export function serializeFunction(
  exporter: SourceFileExporter,
  declaration: FunctionLikeDeclaration | FunctionTypeNode,
  name?: string,
): FunctionMata {
  const body = extractFunctionMetaBody(exporter, declaration);
  const node = Node.isNode(declaration) && declaration;
  const _name =
    node && (Node.isNameable(node) || Node.isNamed(node))
      ? node.getName()
      : name;

  const propDeclarations = node
    ? node
        .getType()
        .getProperties()
        .map((property) => property.getDeclarations()[0])
    : [];

  const properties = serializeObjectMembersToMap(
    exporter,
    propDeclarations,
  ) as FunctionMata['properties'];

  return {
    kind: 'function',
    name: _name,
    ...body,
    properties,
  };
}

export function serializeObjectMethod(
  exporter: SourceFileExporter,
  declaration: SignaturedDeclaration,
  name: string,
): ObjectMethodMeta {
  const body = extractFunctionMetaBody(exporter, declaration);
  return {
    kind: 'method',
    ...body,
    name,
  };
}

export function serializeObjectProperty(
  exporter: SourceFileExporter,
  declaration:
    | PropertyDeclaration
    | PropertySignature
    | PropertyAssignment
    | PropertyAccessExpression,
  name = declaration.getName(),
): ObjectPropertyMeta {
  return {
    kind: 'property',
    name,
    readonly: Node.isReadonlyable(declaration) && declaration.isReadonly(),
    optional: declaration.getSymbolOrThrow().isOptional(),
    ...extractBasicMetaBody(exporter, declaration.getType(), declaration),
  };
}

export function serializeObjectGetter(
  exporter: SourceFileExporter,
  declaration: GetAccessorDeclaration,
  name = declaration.getName(),
): ObjectPropertyMeta {
  return {
    kind: 'property',
    name,
    readonly: true,
    optional: false,
    ...extractBasicMetaBody(exporter, declaration.getType(), declaration),
  };
}

export function serializeIndexSignature(
  exporter: SourceFileExporter,
  declaration: IndexSignatureDeclaration,
): ObjectPropertyMeta {
  const keyName = declaration.getKeyName();
  const keyType = declaration.getKeyType().getText();
  const name = `[${keyName}: ${keyType}]`;
  return {
    kind: 'property',
    name,
    readonly: Node.isReadonlyable(declaration) && declaration.isReadonly(),
    optional: declaration.getSymbolOrThrow().isOptional(),
    ...extractBasicMetaBody(exporter, declaration.getReturnType(), declaration),
  };
}

export function serializeObjectMembers(
  exporter: SourceFileExporter,
  members: Node[],
): ObjectMemberMeta[] {
  const metaArray: ObjectMemberMeta[] = [];
  for (const member of members) {
    if (!isObjectPropertyType(member)) {
      continue;
      // throw new Error(
      //   `未対応のオブジェクトメンバです。"${member.getKindName()}"`,
      // );
    }

    // privateなメンバを削ぎ落とす
    if (Node.isScopeable(member) || Node.isScoped(member)) {
      const scope = member.getScope();
      if (scope && scope !== Scope.Public) {
        continue;
      }
    }

    let name: string;
    if (Node.isConstructSignatureDeclaration(member)) {
      name = 'new ()';
    } else if (Node.isCallSignatureDeclaration(member)) {
      name = '()';
    } else if (Node.isIndexSignatureDeclaration(member)) {
      // @TODO
      // console.log(member.getText());
      name = '';
    } else {
      name = member.getName();
    }

    if (Node.isSignaturedDeclaration(member)) {
      metaArray.push(serializeObjectMethod(exporter, member, name));
      continue;
    }

    if (
      Node.isPropertyDeclaration(member) ||
      Node.isPropertySignature(member) ||
      Node.isPropertyAssignment(member) ||
      Node.isPropertyAccessExpression(member)
    ) {
      metaArray.push(serializeObjectProperty(exporter, member, name));
      continue;
    }

    if (Node.isGetAccessorDeclaration(member)) {
      metaArray.push(serializeObjectGetter(exporter, member, name));
      continue;
    }

    if (Node.isSetAccessorDeclaration(member)) {
      const sameMeta = metaArray.find((meta) => meta.name === name);
      if (sameMeta && 'readonly' in sameMeta) {
        sameMeta.readonly = false;
      }
      continue;
    }

    if (Node.isIndexSignatureDeclaration(member)) {
      metaArray.push(serializeIndexSignature(exporter, member));
      continue;
    }
  }
  return metaArray.filter((meta) => {
    return !hasPrivateLikeTag(meta.docs);
  });
}

function metaArrayToMap(
  metaArray: ObjectMemberMeta[],
): Record<string, ObjectMemberMeta> {
  return Object.fromEntries(metaArray.map((meta) => [meta.name, meta]));
}

export function serializeObjectMembersToMap(
  exporter: SourceFileExporter,
  members: Node[],
): Record<string, ObjectMemberMeta> {
  return metaArrayToMap(serializeObjectMembers(exporter, members));
}

export function serializeClass(
  exporter: SourceFileExporter,
  declaration: ClassDeclaration,
): ClassMeta {
  const constructors = declaration.getConstructors();
  const signatures = constructors.map((constructor) =>
    constructor.getSignature(),
  );
  const _members = declaration.getMembers();
  const members: ClassMemberTypes[] = [];
  const staticMembers: ClassMemberTypes[] = [];
  _members.forEach((member) => {
    const isStatic = Node.isStaticable(member) && member.isStatic();
    if (isStatic) {
      staticMembers.push(member);
    } else {
      members.push(member);
    }
  });

  const _constructors = signatures.map((signature) =>
    serializeSignature(exporter, signature),
  );

  const name = declaration.getName() || 'n/a';

  return {
    kind: 'class',
    name,
    text: _constructors.length
      ? _constructors[_constructors.length - 1].text
      : `(): ${name}`,
    constructors: _constructors,
    members: serializeObjectMembersToMap(exporter, members),
    staticMembers: serializeObjectMembersToMap(exporter, staticMembers),
    docs: getMetaDocs(declaration.getJsDocs()),
  };
}

export function extractObjectMeta(
  exporter: SourceFileExporter,
  declaration: InterfaceDeclaration | TypeLiteralNode,
): ObjectMeta {
  const members = declaration.getMembers().filter((member) => {
    return (
      !Node.isConstructSignatureDeclaration(member) &&
      !Node.isCallSignatureDeclaration(member)
    );
  });
  const signatures = declaration.getCallSignatures();
  const constructors = declaration.getConstructSignatures();

  return {
    kind: 'object',
    text: getTypeText(declaration.getType(), declaration),
    signatures: signatures.map((dec) => {
      return serializeSignature(exporter, dec.getSignature());
    }),
    constructors: constructors.map((dec) => {
      return serializeSignature(exporter, dec.getSignature());
    }),
    properties: serializeObjectMembersToMap(exporter, members),
    docs: _extractMetaDocs(exporter, declaration),
  };
}

export function serializeInterface(
  exporter: SourceFileExporter,
  declaration: InterfaceDeclaration,
  name = declaration.getName(),
): ObjectMeta {
  return {
    name,
    ...extractObjectMeta(exporter, declaration),
  };
}

export function serializeTypeLiteral(
  exporter: SourceFileExporter,
  declaration: TypeLiteralNode,
  name?: string,
): ObjectMeta {
  return {
    name,
    ...extractObjectMeta(exporter, declaration),
  };
}

export function serializeObjectLiteralExpression(
  exporter: SourceFileExporter,
  declaration: ObjectLiteralExpression,
  name?: string,
): ObjectMeta {
  const type = declaration.getType();
  const declarations = type
    .getProperties()
    .map((property) => property.getDeclarations()[0]);
  const properties = serializeObjectMembersToMap(exporter, declarations);
  return {
    kind: 'object',
    name,
    text: getTypeText(type, declaration),
    constructors: [],
    signatures: [],
    properties,
    docs: _extractMetaDocs(exporter, declaration),
  };
}

export function serializeIntersectionType(
  exporter: SourceFileExporter,
  declaration: IntersectionTypeNode,
  name?: string,
): ObjectMeta {
  const properties: ObjectMembers = {};
  const chunks: ObjectMembers[] = [];
  const nodes = declaration.getTypeNodes();
  for (const node of nodes) {
    const metaOrRef = serializeDeclaration(exporter, node);
    const meta = exporter.resolveRef(metaOrRef);
    if (meta.kind === 'object') {
      chunks.push(meta.properties);
    } else if (meta.kind === 'class') {
      chunks.push(meta.members);
    }
  }

  for (const chunk of chunks) {
    for (const [propName, meta] of Object.entries(chunk)) {
      const same = properties[propName];
      if (!same) {
        properties[propName] = meta;
        continue;
      }
      if (same.kind === 'property') {
        if (meta.kind !== 'property') {
          throw new Error('タイプちゃうやん');
        }
        same.docs = [...same.docs, ...meta.docs];
      }
    }
  }

  return {
    kind: 'object',
    name,
    text: getTypeText(declaration.getType(), declaration),
    constructors: [],
    signatures: [],
    properties,
    docs: _extractMetaDocs(exporter, declaration),
  };
}

function _serializeDeclaration(
  exporter: SourceFileExporter,
  declaration: Node,
  name?: string,
): AnyMeta {
  const type = declaration.getType();

  if (isLibType(type)) {
    return serializeBasicMeta(exporter, type, declaration, name);
  }

  if (Node.isExportSpecifier(declaration)) {
    const localTarget = declaration.getLocalTargetDeclarations()[0];
    return _serializeDeclaration(
      exporter,
      localTarget,
      name || localTarget.getSymbol()?.getName(),
    );
  }

  if (Node.isTypeAliasDeclaration(declaration)) {
    const targetTypeNode = declaration.getTypeNodeOrThrow();
    return _serializeDeclaration(
      exporter,
      targetTypeNode,
      declaration.getName(),
    );
  }

  if (Node.isTypeReference(declaration)) {
    const _name = declaration.getTypeName();
    const symbol = _name.getSymbolOrThrow();
    const [referenceDeclaration] = symbol.getDeclarations();
    return _serializeDeclaration(exporter, referenceDeclaration, name);
  }

  if (Node.isTypeQuery(declaration)) {
    const _name = declaration.getExprName();
    const symbol = _name.getSymbolOrThrow();
    const [referenceDeclaration] = symbol.getDeclarations();
    return _serializeDeclaration(exporter, referenceDeclaration, name);
  }

  // これあやしい。左辺の型定義が代入値の型で上書きされる
  if (Node.isVariableDeclaration(declaration)) {
    const initializer = declaration.getInitializer();
    if (!initializer) {
      return serializeBasicMeta(exporter, type, declaration, name);
    }
    // ここでチェックはさんだ方が良いかも

    // console.log(initializer.getText(), initializer.getKindName());
    // if (Node.isCallExpression(initializer)) {
    //   const returnType = initializer.getReturnType();
    //   console.log(returnType.getApparentType().getText());
    // }
    return _serializeDeclaration(exporter, initializer, declaration.getName());
  }

  if (Node.isClassDeclaration(declaration)) {
    return serializeClass(exporter, declaration);
  }

  if (Node.isInterfaceDeclaration(declaration)) {
    return serializeInterface(exporter, declaration, name);
  }

  if (Node.isCallExpression(declaration)) {
    // const returnType = declaration.getReturnType();
    const returnType = declaration.getReturnType().getApparentType();
    const typeSymbol = returnType.getSymbol();
    if (!typeSymbol) {
      return serializeBasicMeta(exporter, returnType, declaration, name);
    }
    const node = typeSymbol.getDeclarations()[0];
    // console.log(node.getKindName(), Node);
    // console.log(typeSymbol.getAliasedSymbol()?.getDeclarations()[0]);
    // throw new Error('hoge');
    return _serializeDeclaration(exporter, node, name);
  }

  if (Node.isTypeLiteral(declaration)) {
    return serializeTypeLiteral(exporter, declaration, name);
  }

  if (Node.isObjectLiteralExpression(declaration)) {
    return serializeObjectLiteralExpression(exporter, declaration, name);
  }

  if (
    Node.isFunctionLikeDeclaration(declaration) ||
    Node.isFunctionTypeNode(declaration)
  ) {
    return serializeFunction(exporter, declaration, name);
  }

  if (Node.isIntersectionTypeNode(declaration)) {
    return serializeIntersectionType(exporter, declaration, name);
  }

  return serializeBasicMeta(exporter, type, declaration, name);
}

export function serializeDeclaration(
  exporter: SourceFileExporter,
  declaration: Node,
  name?: string,
) {
  return exporter.visitWithScope(declaration, (scope) => {
    if (!name) {
      name = declaration.getSymbol()?.getName();
    }
    return _serializeDeclaration(exporter, declaration, name);
  });
}
