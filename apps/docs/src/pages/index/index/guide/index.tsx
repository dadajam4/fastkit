import { defineComponent } from 'vue';
import { VHero } from '@fastkit/vui';
import { VDocsSection, VCode, VDocsPaging, VMarked } from '~/components';
import { i18n, PackageProvide } from '@@';

export default defineComponent({
  setup() {
    const $i18n = i18n.use();
    const { trans } = $i18n.at.common;

    PackageProvide.useHead({
      title: trans.howToUse,
    });

    return () => {
      return (
        <div>
          <VHero>{trans.howToUse}</VHero>

          <VDocsSection title={trans.installation}>
            <VMarked
              code={`
              あなたのアプリケーションにとって必要なもの探して、それらを個別にインストールするだけです。

              Fastkitでこねこねしているパッケージは[ここ](/packages/)に一覧があります。
              `}
            />

            <VCode language="sh">
              npm i @fastkit/universal-logger @fastkit/ev -D
            </VCode>

            {/* <>
              <p>
                このインストールによって以下のパッケージが依存関係としてインストールされます。
                <br />
                これらのツールはあなたのアプリケーションが適切なバンドラ（vite等）を利用している限り、利用していないパッケージはtree
                shakingによってバンドルから除外されるでしょう。node_modulesへの不用なインストールを避けたい場合、個別インストールを検討してください。
              </p>

              <ul>
                {pkg.dependencies.map(({ name }) => (
                  <li key={name}>{name.replace('@fastkit/', '')}</li>
                ))}
              </ul>
            </> */}
          </VDocsSection>

          <VDocsPaging
            prev={{
              to: '/guide/what/',
              title: trans.whatIsFastkit,
            }}
            next={{
              to: '/packages/',
              title: trans.packages,
            }}
          />
        </div>
      );
    };
  },
});
