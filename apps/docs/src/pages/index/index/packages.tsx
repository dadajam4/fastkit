import { defineComponent } from 'vue';
import { VHero } from '@fastkit/vui';
import _pkgs from 'virtual:packages';
import { VDocsSection, VDocsPaging, VMarked } from '~/components';
import { PackageProvide, VPackageExplorer } from '@@';
import { GuideI18nSpace } from './guide/-i18n';

export default defineComponent({
  i18n: [VPackageExplorer, GuideI18nSpace],
  setup() {
    const guideI18n = GuideI18nSpace.use();
    const guide = guideI18n.at.guide.t;
    const { trans } = guideI18n.at.common;

    PackageProvide.useHead({
      title: trans.packages,
    });

    return () => (
      <div>
        <VHero>{trans.packages}</VHero>

        <VDocsSection title={guide.packages.title}>
          <VMarked code={guide.packages.description} />

          <VPackageExplorer class="mt-6" value={_pkgs} />
        </VDocsSection>

        <VDocsPaging
          prev={{
            to: '/guide/',
            title: trans.howToUse,
          }}
        />
      </div>
    );
  },
});
