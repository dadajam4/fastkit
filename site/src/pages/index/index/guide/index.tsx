import { defineComponent } from 'vue';
import { VHero } from '@fastkit/vui';
import { VDocsSection, DocsPackage, VCode, VDocsPaging } from '~/components';
import { i18n } from '~/i18n';
import pkg from '~~~/packages/fastkit/package.json';

const dependencies = Object.entries(pkg.dependencies);

export default defineComponent({
  setup() {
    const pkg = DocsPackage.use();
    const { trans } = i18n.use().at.common;

    pkg.useHead({
      title: trans.tryItOut,
    });

    return () => {
      return (
        <div>
          <VHero>{trans.tryItOut}</VHero>

          <VDocsSection title={trans.installation}>
            <p>
              あなたのアプリケーションにとって必要なもの探して、それらを個別にインストールするだけです。
            </p>

            <VCode language="sh">
              npm i @fastkit/universal-logger @fastkit/ev -D
            </VCode>

            <p class="mt-8">
              以下のように<code>fastkit</code>
              パッケージをインストールすることで、よく使われるツールをまとめてインストール可能です。
            </p>
            <VCode language="sh">npm i fastkit -D</VCode>

            <p>
              このインストールによって以下のパッケージが依存関係としてインストールされます。
              <br />
              これらのツールはあなたのアプリケーションが適切なバンドラ（vite等）を利用している限り、利用していないパッケージはtree
              shakingによってバンドルから除外されますが、不用なインストールを避けて最適化をしたい場合、個別インストールを行なってください。
            </p>

            <ul>
              {dependencies.map(([pkg]) => (
                <li key={pkg}>{pkg.replace('@fastkit/', '')}</li>
              ))}
            </ul>
          </VDocsSection>

          <VDocsPaging
            prev={{
              to: '/guide/what/',
              title: trans.whatIsFastkit,
            }}
            next={{
              to: '/guide/packages/',
              title: trans.packages,
            }}
          />
        </div>
      );
    };
  },
});
