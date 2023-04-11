import { defineComponent } from 'vue';
import { VHero } from '@fastkit/vui';
import { VDocsSection, VDocsPaging } from '~/components';
import { i18n, PackageProvide, VPackageExplorer } from '@@';
import _pkgs from 'virtual:packages';

export default defineComponent({
  i18n: VPackageExplorer,
  setup() {
    const { trans } = i18n.use().at.common;

    PackageProvide.useHead({
      title: trans.packages,
    });

    return () => {
      return (
        <div>
          <VHero>{trans.packages}</VHero>

          <VDocsSection title="パッケージ構成">
            <p>
              fastkitは単体でそのまま利用可能なVanilla
              JSの実装と、よく利用されるフレームワークやライブラリと併用するプラグイン実装に分かれています。
              エクスプローラーを利用して必要なツールを見つけてください。
            </p>

            <VPackageExplorer class="mt-6" value={_pkgs} />
          </VDocsSection>

          <VDocsPaging
            prev={{
              to: '/guide/',
              title: trans.tryItOut,
            }}
          />
        </div>
      );
    };
  },
});
