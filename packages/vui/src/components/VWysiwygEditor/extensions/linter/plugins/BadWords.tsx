import { WysiwygLinterPlugin } from '../LinterPlugin';

export function WysiwygLinterBadWords(
  words: string[],
): typeof WysiwygLinterPlugin {
  const regex = new RegExp(`\\b(${words.join('|')})\\b`);

  return class WysiwygLinterBadWords extends WysiwygLinterPlugin {
    scan() {
      this.doc.descendants((node: any, position: number) => {
        if (!node.isText) {
          return;
        }

        const matches = regex.exec(node.text);

        if (matches) {
          const fixValue = matches[0] + '!!!!!';

          this.record({
            level: 'warning',
            message: `Try not to say '${matches[0]}'`,
            from: position + matches.index,
            to: position + matches.index + matches[0].length,
            fix: [
              {
                message: () => (
                  <span>
                    <code>{fixValue}</code>に修正する。
                  </span>
                ),
                handler: () => {
                  console.log('hoge');
                },
              },
              {
                message: 'どうにかする',
                handler: () => {
                  console.log('hoge');
                },
              },
            ],
          });
        }
      });

      return this;
    }
  };
}
