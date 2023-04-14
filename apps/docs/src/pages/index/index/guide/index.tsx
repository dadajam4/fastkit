import { defineComponent } from 'vue';
import { VHero } from '@fastkit/vui';
import { VDocsSection, VDocsPaging, VMarked, VCode } from '~/components';
import { PackageProvide, PMScript } from '@@';
import { GuideI18nSpace } from './-i18n';

export default defineComponent({
  i18n: GuideI18nSpace,
  setup() {
    const guideI18n = GuideI18nSpace.use();
    const guide = guideI18n.at.guide.t;
    const { trans } = guideI18n.at.common;

    const pm = PMScript.use();

    PackageProvide.useHead({
      title: trans.howToUse,
    });

    return () => {
      return (
        <div>
          <VHero>{trans.howToUse}</VHero>

          <VDocsSection title={trans.installation}>
            <VMarked code={guide.installation.description} />

            {pm.renderInstallCommand([
              '@fastkit/universal-logger',
              '@fastkit/ev',
            ])}
          </VDocsSection>

          <VDocsSection title={guide.optimization.title}>
            <VMarked code={guide.optimization.description} />

            <h4>npm</h4>
            <VMarked code={guide.optimization.npm} />

            <h4>yarn</h4>
            <VCode
              code="yarn upgrade --pattern @fastkit/ --latest"
              language="sh"
            />

            <h4>pnpm</h4>
            <VCode
              code="pnpm update --filter @fastkit/ --latest"
              language="sh"
            />
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
