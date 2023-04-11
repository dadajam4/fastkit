import { defineComponent, computed } from 'vue';
import { VPage } from '@fastkit/vue-page';
import { VDocsLayout, DocsLayoutNavigation } from '~/components';
import { i18n } from '@@/i18n';
import packages from 'virtual:packages';

const PACKAGE_PATHS = packages.map((pkg) => `/${pkg.name}/`);

const PACKAGES_MATCH = ['/packages/', ...PACKAGE_PATHS];

export default defineComponent({
  setup() {
    const space = i18n.use();
    const { trans } = space.at.common;
    const navigationsRef = computed<DocsLayoutNavigation[]>(() => {
      return [
        {
          key: 'guide',
          items: [
            {
              key: 'guide',
              to: '/guide/',
              label: trans.guide,
              startIcon: 'mdi-speedometer',
              children: [
                {
                  key: 'what',
                  to: '/guide/what/',
                  label: trans.whatIsFastkit,
                },
                {
                  key: 'try',
                  to: '/guide/',
                  label: trans.tryItOut,
                },
              ],
            },
            {
              key: 'packages',
              to: '/packages/',
              match: PACKAGES_MATCH,
              label: trans.packages,
              startIcon: 'mdi-package-variant',
              children: packages.map((pkg) => ({
                key: pkg.name,
                label: pkg.name,
                to: `/${pkg.name}/`,
              })),
            },
          ],
        },
      ];
    });

    return () => {
      return (
        <VDocsLayout navigations={navigationsRef.value}>
          <VPage />
        </VDocsLayout>
      );
    };
  },
});
