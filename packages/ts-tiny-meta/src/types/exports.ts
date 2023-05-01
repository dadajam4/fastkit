import { AnyMeta } from './meta';

export interface RefQuery {
  _refId: string;
}

export interface SourceFileExports {
  refs: Record<string, AnyMeta>;
  exports: Record<string, AnyMeta | RefQuery | (AnyMeta | RefQuery)[]>;
  dependencies: string[];
}
