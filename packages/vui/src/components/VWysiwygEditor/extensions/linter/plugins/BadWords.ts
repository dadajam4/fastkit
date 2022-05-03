import { LinterPlugin } from '../LinterPlugin';

export function BadWords(words: string[]) {
  const regex = new RegExp(`\\b(${words.join('|')})\\b`);

  return class BadWords extends LinterPlugin {
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
            fix: () => {
              console.log('hoge');
            },
            fixMessage: `「${fixValue}」に修正する。`,
          });
        }
      });

      return this;
    }
  };
}
