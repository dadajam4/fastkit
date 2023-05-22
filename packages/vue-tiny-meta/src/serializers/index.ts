import { Node, CallExpression } from '@fastkit/ts-tiny-meta/ts-morph';
import {
  _extractMetaDocs,
  SourceFileExporter,
  getNodeLocationInSourceFile,
  Workspace,
} from '@fastkit/ts-tiny-meta/ts';
import { ComponentMeta, SerializeVueOptions } from '../types';
import {
  SUPPORT_EXPRESSION_NAME,
  SUPPORT_SOURCE_FILE_SUFFIX,
} from '../constants';
import { serializeDefineComponent } from './component';

export interface SerializeVueSource {
  exportName: string;
  expression: CallExpression;
}

export function extractSerializeVueSource(
  exporter: SourceFileExporter,
  declaration: Node,
  exportName?: string,
): SerializeVueSource | undefined {
  if (!exportName) return;
  if (!Node.isCallExpression(declaration)) return;
  const expression = declaration.getExpression();
  const typeChecker = exporter.workspace.project.getTypeChecker();
  const symbol = typeChecker
    .getSymbolAtLocation(expression)
    ?.getAliasedSymbol();
  if (!symbol || symbol.getName() !== SUPPORT_EXPRESSION_NAME) return;

  const symbolDec = symbol.getDeclarations()[0];
  const filePath = symbolDec.getSourceFile().getFilePath();

  if (!filePath.endsWith(SUPPORT_SOURCE_FILE_SUFFIX)) return;

  return {
    exportName,
    expression: declaration,
  };
}

export function serializeVue(
  exporter: SourceFileExporter,
  source: SerializeVueSource,
  options?: SerializeVueOptions,
): ComponentMeta {
  const { exportName, expression } = source;
  const { optionName, props, events, slots } = serializeDefineComponent(
    exporter,
    expression,
    options,
  );

  const displayName = optionName || exportName;
  const docs = _extractMetaDocs(exporter, expression);
  const location = getNodeLocationInSourceFile(expression);

  return {
    displayName,
    exportName,
    description: docs[0]?.description.text,
    props,
    events,
    slots,
    docs,
    sourceFile: {
      path: location.filePath.replace(exporter.workspace.dirPath + '/', ''),
      line: location.start.line,
    },
  };
}

export function extractAll(
  filePath: string,
  options?: SerializeVueOptions,
): ComponentMeta[] {
  const results: ComponentMeta[] = [];
  const workspace = Workspace.getBySourceFilePath(filePath);
  const exporter = workspace.createSourceFileExporter(filePath);
  const { sourceFile } = exporter;
  const symbols = sourceFile.getExportSymbols();

  for (const symbol of symbols) {
    const name = symbol.getName();
    const declaration = symbol.getValueDeclaration();
    if (!declaration || declaration.getSourceFile() !== sourceFile) continue;

    const initializer =
      Node.isInitializerExpressionGetable(declaration) &&
      declaration.getInitializerOrThrow();

    if (!initializer || !Node.isCallExpression(initializer)) continue;

    const source = extractSerializeVueSource(exporter, initializer, name);
    if (!source) continue;
    const meta = serializeVue(exporter, source, options);
    results.push(meta);
  }
  return results;
}
