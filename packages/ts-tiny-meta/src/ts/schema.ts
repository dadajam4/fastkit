import { Node } from 'ts-morph';
import { AnyMeta } from '../types';

export interface LineAndColumn {
  line: number;
  column: number;
}

export interface NodeLocation {
  filePath: string;
  start: LineAndColumn;
  end: LineAndColumn;
}

export function getNodeLocationInSourceFile(node: Node) {
  const sourceFile = node.getSourceFile();
  const filePath = sourceFile.getFilePath();
  const start = sourceFile.getLineAndColumnAtPos(node.getStart());
  const end = sourceFile.getLineAndColumnAtPos(node.getStart());
  return {
    filePath,
    start,
    end,
  };
}

export interface MetaRef {
  _refId: string;
}

export interface SourceFileExportResult {
  refs: Record<string, AnyMeta>;
  exports: Record<string, MetaRef>;
}
