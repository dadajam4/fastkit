import { defineComponent } from 'vue';
import { VHero } from '@fastkit/vui';
import { VDocsSection, VDocsPaging, VMarked } from '~/components';
import { PackageProvide } from '@@';
import { GuideI18nSpace } from './-i18n';

export default defineComponent({
  i18n: GuideI18nSpace,
  setup() {
    const guideI18n = GuideI18nSpace.use();
    const guide = guideI18n.at.guide.t;
    const { trans } = guideI18n.at.common;

    PackageProvide.useHead({
      title: trans.whatIsFastkit,
    });

    return () => {
      return (
        <div>
          <VHero>{trans.whatIsFastkit}</VHero>

          <VDocsSection title={guide.motivation.title}>
            <VMarked code={guide.motivation.body} />

            <VDocsSection title={guide.feature.title}>
              <VMarked code={guide.feature.body} />
            </VDocsSection>

            <VMarked code={guide.thanks} class="mt-6" />

            <VDocsSection title={guide.contributing.title}>
              <VMarked code={guide.contributing.body} />
            </VDocsSection>
          </VDocsSection>

          <VDocsPaging
            next={{
              to: '/guide/',
              title: trans.howToUse,
            }}
          />
        </div>
      );
    };
  },
});
