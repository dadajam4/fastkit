import { Node, Symbol as MorphSymbol } from 'ts-morph';

export interface LineAndColumn {
  line: number;
  column: number;
}

export interface NodeLocation {
  filePath: string;
  // startCursor: string;
  start: LineAndColumn;
  end: LineAndColumn;
}

export function getNodeLocationInSourceFile(
  nodeOrSymbol: Node | MorphSymbol,
): NodeLocation {
  const node =
    'getSourceFile' in nodeOrSymbol
      ? nodeOrSymbol
      : nodeOrSymbol.getDeclarations()[0];
  const sourceFile = node.getSourceFile();
  const filePath = sourceFile.getFilePath();
  const start = sourceFile.getLineAndColumnAtPos(node.getStart());
  const end = sourceFile.getLineAndColumnAtPos(node.getStart());
  return {
    filePath,
    start,
    end,
    // startCursor,
  };
}
