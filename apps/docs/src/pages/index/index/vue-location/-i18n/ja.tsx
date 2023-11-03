import { scheme } from './scheme';

export const ja = scheme.defineLocale.strict({
  translations: {
    // why: {
    //   title: 'なぜcatcherなのか',
    //   content: () => (
    //     <>
    //       アプリケーションに例外の発生はつきものです。また、意図的に例外を投げる必要がある時もあります。
    //       <br />
    //       いずれにしてもこれらの例外は最終的にどこかのレイヤーで処理をする必要があり、私はパッケージやアプリケーション単位で、
    //       この例外のパラメータが抽象化されていて、例外処理を行う時も、例外を投げる時も、一貫したスキーマを参照したいと思います。
    //       <br />
    //       catcherは、あなたのアプリケーションやパッケージ開発でこのニーズを満たすための、あなたのアプリケーション専用の例外クラスのビルダーです。
    //     </>
    //   ),
    // },
    // assumedPhilosophy: {
    //   title: '前提とする思想',
    //   content: () => (
    //     <>
    //       catcherは基本的に以下の思想を前提としています。もちろん、以下を前提としなくとも、利用することに問題はありません。
    //       <ul>
    //         <li>
    //           発生した例外は、できるだけ処理の呼び出しに近い層でまとめて処理する
    //         </li>
    //         <li>
    //           末端のサービスロジックなどは、極力例外を補足しないか、補足して必要な例外インスタンスを生成し、呼び出し元へ投げる
    //         </li>
    //         <li>
    //           例外の状況を、アプリケーションの要件や性質に合わせて抽象化することで例外の処理やコンストラクト時のスキームにルールを持つ
    //           <ul>
    //             <li>要求したリソースが見つからなかった</li>
    //             <li>対抗システムからの応答がなかった</li>
    //             <li>要求したリソースに対する権限がなかった</li>
    //           </ul>
    //         </li>
    //       </ul>
    //     </>
    //   ),
    // },
    // flowOfUsage: {
    //   title: '基本的な使い方の流れ',
    //   example: '例）',
    // },
    // step1: {
    //   title: 'あなたのアプリケーションで例外を設計する',
    //   content: () => (
    //     <>
    //       <ul>
    //         <li>
    //           全ての例外はHTTPステータスコードに準じた数値ステータスを持ち、そのステータスだけで例外の状況がおおよそ分別できる
    //         </li>
    //         <li>
    //           アプリケーションではaxiosをメインに利用しているので、axiosのエラークラスを元にコンストラクトすると、メッセージやステータスが動機される
    //         </li>
    //       </ul>
    //     </>
    //   ),
    // },
    // step2: {
    //   title: '設計に準じた例外クラスを定義する',
    // },
    // step3: {
    //   title: '定義したカスタム例外を利用',
    // },
  },
});

export default ja;
