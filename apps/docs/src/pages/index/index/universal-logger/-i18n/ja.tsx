import { schema } from './schema';

export const ja = schema.defineLocale.strict({
  translations: {
    concept: {
      title: 'コンセプト',
      content: () => (
        <>
          JavaScript用のロガーライブラリは、NodeJS等サーバサイドでの動作を前提としているものがほとんどで、ブラウザ環境向けのものがあまり見当たりませんでした。
          <br />
          ブラウザ＆サーバサイドでユニバーサルに動作可能で、ログのトランスフォームや複数のトランスポート設定をプラグイン可能で、なおかつ軽量なライブラリが必要で作成したライブラリです。
          <br />
          <br />
          ロガーの基本機能と、いくつかの組み込みのトランスフォーマーとトランスポーターを提供しています。
        </>
      ),
    },
    define: {
      title: 'アプリケーションのロギング要件に合わせてロガーを定義する',
    },
    use: {
      title: 'ロガーを利用する',
    },
  },
});

export default ja;
