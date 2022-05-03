import { Node as ProsemirrorNode } from 'prosemirror-model';
import { EditorView } from 'prosemirror-view';

export type FixFn = (view: EditorView, issue: LinterResult) => any;

export type LinterResultLevel = 'warning' | 'error';

export interface LinterResult {
  level: LinterResultLevel;
  message: string;
  from: number;
  to: number;
  fix?: FixFn;
  fixMessage?: string;
}

export interface RawLinterResult extends Omit<LinterResult, 'level'> {
  level?: LinterResultLevel;
}

export class LinterPlugin {
  protected doc;

  private results: Array<LinterResult> = [];

  constructor(doc: ProsemirrorNode) {
    this.doc = doc;
  }

  record(result: RawLinterResult) {
    this.results.push({
      level: 'error',
      ...result,
    });
  }

  scan() {
    return this;
  }

  getResults() {
    return this.results;
  }
}
