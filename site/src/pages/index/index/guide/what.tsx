import { defineComponent } from 'vue';
import { VHero } from '@fastkit/vui';
import { VDocsSection, DocsPackage, VDocsPaging } from '~/components';
import { i18n } from '~/i18n';

export default defineComponent({
  setup() {
    const pkg = DocsPackage.use();
    const { trans } = i18n.use().at.common;

    pkg.useHead({
      title: trans.whatIsFastkit,
    });

    return () => {
      return (
        <div>
          <VHero>{trans.whatIsFastkit}</VHero>

          <VDocsSection title="モチベーション">
            <p>
              ゼロからアプリケーションを開発するチャンスに巡り合える時があります。趣味やビジネス、きっかけは様々です。このチャンスに出会えた時、私は少しでも早く、今イメージできる最高の機能をユーザーに届けたいと願っています。
            </p>
            <p>
              スクラッチ開発において、基礎の開発に頭を悩ませながら時間を使うのはつきものです。fastkitはこの基礎開発の時間を少しでも短縮し本体機能のイメージ＆開発を行えるようにするために育て始めたツールキットです。
            </p>

            <VDocsSection title="特徴">
              <ul>
                <li>
                  あらゆるアプリケーションのスクラッチ開発を支える低レベルなツールキット
                </li>
                <li>
                  様々なUIフレームワーク、アプリケーションフレームワークに統合するための柔軟なインターフェース
                </li>
                <li>TypeScriptとの高い親和性</li>
                <li>
                  ブラウザ、サーバ、拡張機能等の異なる実行環境でユニバーサルに動作可能
                </li>
              </ul>
            </VDocsSection>

            <p class="mt-6">
              npmリポジトリには良くテストされた良質なパッケージが多くあります。日々それらを利用しないことはあり得ません。
              fastkitはそれらと組み合わせて利用可能なように、個々のツールは小さな機能として設計されています。
              いくつかのツールがあなたの開発を支えることができればそれは私にとっての幸せです。
            </p>
            <p>
              あなたのフィードバックはこのツールを良くしてくれるものだと信じています。フィードバックを歓迎しています。
            </p>
          </VDocsSection>

          <VDocsPaging
            next={{
              to: '/guide/',
              title: trans.tryItOut,
            }}
          />
        </div>
      );
    };
  },
});
