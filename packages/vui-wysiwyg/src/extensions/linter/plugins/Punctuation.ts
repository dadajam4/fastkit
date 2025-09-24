import { EditorView } from '@tiptap/pm/view';
import {
  WysiwygLinterPlugin,
  WysiwygLinterResult as Issue,
} from '../LinterPlugin';

export class WysiwygLinterPunctuation extends WysiwygLinterPlugin {
  public regex = / ([,.!?:]) ?/g;

  fix(replacement: any) {
    return function ({ state, dispatch }: EditorView, issue: Issue) {
      dispatch(
        state.tr.replaceWith(
          issue.from,
          issue.to,
          state.schema.text(replacement),
        ),
      );
    };
  }

  scan() {
    this.doc.descendants((node, position) => {
      if (!node.isText) {
        return;
      }

      if (!node.text) {
        return;
      }

      const matches = this.regex.exec(node.text);

      if (matches) {
        this.record({
          message: 'Suspicious spacing around punctuation',
          from: position + matches.index,
          to: position + matches.index + matches[0].length,
          fix: {
            message: 'Fix it!!!',
            handler: this.fix(`${matches[1]} `),
          },
        });
      }
    });

    return this;
  }
}
