import { packageExploerI18nScheme } from './scheme';

export default packageExploerI18nScheme.defineLocale.strict({
  translations: {
    scopes: {
      anywhere: {
        name: 'どこでも',
        description: 'ブラウザ・サーバ等、実行環境を問わない。',
      },
      node: {
        name: 'Node.js',
        description: 'Node.jsのサーバサイドやCLI開発用。',
      },
      vite: {
        name: 'Vite',
        description: 'Vite拡張用のプラグイン等。',
      },
      vot: {
        name: 'Vot',
        description: 'Vot拡張用のプラグイン等。',
      },
      vue: {
        name: 'Vue.js',
        description: 'Vueアプリケーション用。',
      },
    },
    features: {
      general: {
        name: '汎用',
        description: '様々な機能に利用可能な汎用ツール。',
      },
      i18n: {
        name: '国際化',
        description: 'アプリケーションを国際化・多言語する。',
      },
      color: {
        name: '色',
        description: 'JSやCSS用のカラーへルパ。',
      },
      file: {
        name: 'ファイル',
        description: 'ファイル操作用へルパ。',
      },
      icon: {
        name: 'アイコン',
        description: 'JSやCSS用のWebフォントアイコンへルパ。',
      },
      ui: {
        name: 'UI・コンポーネント',
        description: 'ユーザーインターフェースを構築するためのライブラリ。',
      },
      validation: {
        name: 'バリデーション',
        description: 'ユーザーの入力値や通信ペイロード等様々な値を検証する。',
      },
      image: {
        name: '画像',
        description: '画像用ヘルパ・ライブラリ。',
      },
      log: {
        name: 'ログ',
        description: 'ログ生成・出力用ライブラリ。',
      },
      framework: {
        name: 'フレームワーク',
        description: 'アプリケーションの全体的に構築のためのフレームワーク。',
      },
    },
    header: {
      name: 'パッケージ名',
      scope: 'スコープ',
      feature: '機能',
      description: '概要',
    },
  },
});
