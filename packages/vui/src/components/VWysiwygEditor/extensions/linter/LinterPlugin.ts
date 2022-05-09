import { VNodeChild } from 'vue';
import { Node as ProsemirrorNode } from 'prosemirror-model';
import { EditorView } from 'prosemirror-view';
import { cheepUUID } from './utils';

export type WysiwygLinterFixFn = (
  view: EditorView,
  issue: WysiwygLinterResult,
) => any;

export type WysiwygLinterFixMessage = string | (() => VNodeChild);

export interface WysiwygLinterFixer {
  message: WysiwygLinterFixMessage;
  handler: WysiwygLinterFixFn;
}

export type WysiwygLinterResultLevel = 'warning' | 'error';

// fixers
export interface WysiwygLinterResult {
  id: string;
  icon: boolean;
  level: WysiwygLinterResultLevel;
  message: WysiwygLinterFixMessage;
  from: number;
  to: number;
  fix: WysiwygLinterFixer[];
}

export interface RawLinterResult
  extends Omit<WysiwygLinterResult, 'level' | 'fix' | 'id' | 'icon'> {
  level?: WysiwygLinterResultLevel;
  icon?: boolean;
  fix?: WysiwygLinterFixer | WysiwygLinterFixer[];
}

export class WysiwygLinterPlugin {
  protected doc: ProsemirrorNode;

  private results: Array<WysiwygLinterResult> = [];

  constructor(doc: ProsemirrorNode) {
    this.doc = doc;
  }

  record(result: RawLinterResult) {
    const { fix = [], icon = false } = result;
    this.results.push({
      level: 'error',
      id: cheepUUID(),
      ...result,
      fix: Array.isArray(fix) ? fix : [fix],
      icon,
    });
  }

  scan() {
    return this;
  }

  getResults() {
    return this.results;
  }
}
