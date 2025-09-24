import ts from 'typescript';

export function normalizeNodeToIdentifier(
  node: ts.Node,
): ts.Identifier | undefined {
  if (ts.isIdentifier(node)) return node;
  if (ts.isTypeReferenceNode(node)) {
    const { typeName } = node;
    if (ts.isIdentifier(typeName)) return typeName;
    return;
  }
  if (ts.isTypeQueryNode(node)) {
    const { exprName } = node;
    if (ts.isIdentifier(exprName)) return exprName;
  }
}

export function getIdentifierArgFromCallExpression(
  expression: ts.CallExpression,
): ts.Identifier | undefined {
  const { typeArguments, arguments: args } = expression;
  if (typeArguments) {
    return normalizeNodeToIdentifier(typeArguments[0]);
  }
  return normalizeNodeToIdentifier(args[0]);
}

export function getAliasedSymbolIfNecessary(
  symbol: ts.Symbol,
  checker: ts.TypeChecker,
): ts.Symbol {
  if ((symbol.flags & ts.SymbolFlags.Alias) !== 0) {
    return checker.getAliasedSymbol(symbol);
  }
  return symbol;
}

export function isExtractMetaInitializer(
  initializer: ts.Expression,
  checker: ts.TypeChecker,
): initializer is ts.CallExpression {
  if (!ts.isCallExpression(initializer)) return false;
  const symbol = checker.getSymbolAtLocation(initializer.expression);
  if (!symbol) return false;
  const aliased = getAliasedSymbolIfNecessary(symbol, checker);
  return aliased.name === 'extractMeta';
}

export interface ExtractInfo {
  symbol: ts.Symbol;
  arg: ts.Identifier;
  declaration: ts.Declaration;
}

export function getExtractInfoByExportedSymbol(
  symbol: ts.Symbol,
  checker: ts.TypeChecker,
): ExtractInfo | undefined {
  const [declaration] = symbol.getDeclarations() ?? [];
  if (!declaration || !ts.isVariableDeclaration(declaration)) return;
  const { initializer } = declaration;
  if (!initializer || !isExtractMetaInitializer(initializer, checker)) return;
  const arg = getIdentifierArgFromCallExpression(initializer);
  if (!arg) return;

  const argSymbol = checker.getSymbolAtLocation(arg);
  if (!argSymbol) return;

  const aliasedSymbol = getAliasedSymbolIfNecessary(argSymbol, checker);
  const [_declaration] = aliasedSymbol.getDeclarations() ?? [];

  return {
    symbol,
    arg,
    declaration: _declaration,
  };
}

export function getExportsBySourceFile(
  sourceFile: ts.SourceFile,
  checker: ts.TypeChecker,
): ExtractInfo[] {
  const exports: ExtractInfo[] = [];

  const moduleSymbol = checker.getSymbolAtLocation(sourceFile);
  if (!moduleSymbol) {
    throw new Error(`Could not find module symbol >>> ${sourceFile.fileName}`);
  }

  const exportedSymbols = checker.getExportsOfModule(moduleSymbol);

  for (const symbol of exportedSymbols) {
    const info = getExtractInfoByExportedSymbol(symbol, checker);
    if (!info) {
      throw new Error(
        `Could not extract type information from exported member ${symbol.name}.`,
      );
    }
    exports.push(info);
  }

  return exports;
}
