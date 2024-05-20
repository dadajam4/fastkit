import { defineComponent } from 'vue';
import { VPage } from '@fastkit/vot';
import { VHero, VTabs, VTabsItem } from '@fastkit/vui';
import { PackageProvide } from '@@/package-loader';
import { VDocsPaging } from '~/components';
import { API_CATEGORIES } from './api/-shared';

export default defineComponent({
  setup() {
    const pkg = PackageProvide.use();
    pkg.useHead({
      title: 'API',
    });

    const tabsItems: VTabsItem[] = API_CATEGORIES.map((category) => ({
      label: () => (
        <span class="notranslate" style={{ textTransform: 'capitalize' }}>
          {category}
        </span>
      ),
      value: category,
    }));

    return () => (
      <div>
        <VHero>{`${pkg.displayName} API`}</VHero>
        <VTabs items={tabsItems} router={(value) => `/i18n/api/${value}/`} />
        <VPage />
        <VDocsPaging
          prev={{
            to: `/i18n/`,
            title: 'HOME',
          }}
        />
      </div>
    );
  },
});
