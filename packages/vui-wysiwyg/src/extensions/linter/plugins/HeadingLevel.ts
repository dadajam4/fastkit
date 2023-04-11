import { EditorView } from '@tiptap/pm/view';
import {
  WysiwygLinterPlugin,
  WysiwygLinterResult as Issue,
} from '../LinterPlugin';

export class WysiwygLinterHeadingLevel extends WysiwygLinterPlugin {
  fixHeader(level: number) {
    return function ({ state, dispatch }: EditorView, issue: Issue) {
      dispatch(state.tr.setNodeMarkup(issue.from - 1, undefined, { level }));
    };
  }

  scan() {
    let lastHeadLevel: number | null = null;

    this.doc.descendants((node, position) => {
      if (node.type.name === 'heading') {
        // Check whether heading levels fit under the current level
        const { level } = node.attrs;

        if (lastHeadLevel != null && level > lastHeadLevel + 1) {
          this.record({
            message: `Heading too small (${level} under ${lastHeadLevel})`,
            from: position + 1,
            to: position + 1 + node.content.size,
            fix: {
              message: '修正する',
              handler: this.fixHeader(lastHeadLevel + 1),
            },
          });
        }
        lastHeadLevel = level;
      }
    });

    return this;
  }
}
