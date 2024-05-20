import { defineComponent } from 'vue';
import { VPage } from '@fastkit/vot';
import { VHero, VTabs, VTabsItem, VBreadcrumbs } from '@fastkit/vui';
import { PackageProvide } from '@@/package-loader';
import { VDocsPaging } from '~/components';
import { useMatchedCategory } from './api/-shared';

export default defineComponent({
  setup() {
    const matchedCagtegory = useMatchedCategory();
    const pkg = PackageProvide.use();
    pkg.useHead({
      title: 'API',
    });

    const tabsItems: VTabsItem[] = matchedCagtegory.names.map((category) => ({
      label: () => <span class="notranslate">{category}</span>,
      value: category,
    }));

    return () => {
      const category = matchedCagtegory.matched;
      return (
        <div>
          <VHero>{`${pkg.displayName} API`}</VHero>
          <VTabs
            items={tabsItems}
            router={(value) => `/helpers/api/${value}/`}
          />
          <VBreadcrumbs
            items={[
              {
                to: `/helpers/`,
                text: () => <span class="notranslate">HOME</span>,
              },
              {
                to: `/helpers/api/`,
                text: () => <span class="notranslate">API</span>,
                disabled: true,
              },
              ...(category
                ? [
                    {
                      to: `/helpers/api/${category.name}/`,
                      text: () => (
                        <span class="notranslate">{category.name}</span>
                      ),
                      disabled: true,
                    },
                  ]
                : []),
            ]}
          />
          <VPage />
          <VDocsPaging
            prev={{
              to: `/helpers/`,
              title: 'HOME',
            }}
          />
        </div>
      );
    };
  },
});
