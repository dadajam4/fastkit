import { scheme } from './scheme';

export const ja = scheme.defineLocale.strict({
  translations: {
    motivation: {
      title: 'モチベーション',
      body: `
        アプリケーションを制作する時の、サードパーティーライブラリの選定におけるこんな悩み。

        - TypeScriptとの親和性が低い（最近は減ってきた）
        - Native ESM対応がされていない
        - ブラウザ、Node等のランタイムに依存していてうまく動作しない
        - 似たような機能が依存関係の中にたくさん存在していてバンドルサイズが大きくなる

        こういう悩み時間をとっぱらってさっさとアプリケーション本体の開発に燃えるために、
        [メンテナ](https://github.com/dadajam4)が育て始めた小さなツールキット集です。
      `,
    },
    feature: {
      title: '特徴',
      body: `
        - TypeScriptとの高い親和性
        - 完全なNative ESM対応
        - ブラウザ、サーバ、拡張機能等の異なる実行環境でユニバーサルに動作する
        - メンテナの生息環境の影響で、Vue.jsに偏っている
      `,
    },
    thanks: `
      npmリポジトリには良くテストされた良質なパッケージが多くあり、日々それらに感謝してます。
      ここにはメンテナが必要としているものしか置いていませんが、あなたの開発を支えることができればそれは私にとっての幸せです。
    `,
    contributing: {
      title: '貢献する',
      body: `
        Fastkitはメンテナの日々の営業時間外にメンテナンスされているため、迅速な対応が難しい場合がありますが、バグレポートや機能リクエストは大歓迎です。
        あなたの[フィードバック](https://github.com/dadajam4/fastkit/issues)はこのツールを良くしてくれるものだと信じています。

        コードへの貢献も歓迎しています。
        [こちらのガイド](https://github.com/dadajam4/fastkit/blob/main/CONTRIBUTING.md)をお読みになり、プルリクエストを送信してください。
      `,
    },
    installation: {
      description: `
        あなたのアプリケーションにとって必要なもの探して、それらを個別にインストールします。

        [こちら](/packages/)にあなたの探している機能があるか探してください。
      `,
    },
    optimization: {
      title: '最適化のポイント',
      description: `
        Fastkitプロジェクトの内部パッケージはできる限り重複した機能が存在しないように小さく分割し依存関係を構築しています。
        新しくパッケージを追加する際やパッケージのアップグレードを行う際は可能な限り全てのパッケージを最新に保つようにしてください。
      `,
      npm: `
        [npm-check-updates](https://www.npmjs.com/package/npm-check-updates) のようなツールを利用することで一括で更新が可能です。
      `,
    },
    packages: {
      title: 'パッケージ構成',
      description: `
        Fastkitは様々な状況で利用可能なVanilla JSの実装と、よく利用されるフレームワークやライブラリと併用するプラグイン実装に分かれています。
        エクスプローラーを利用して必要なツールを見つけてください。
      `,
    },
  },
});

export default ja;
