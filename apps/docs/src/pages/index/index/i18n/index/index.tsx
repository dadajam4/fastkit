import { defineComponent } from 'vue';
import { PackageProvide } from '@@/package-loader';
import { i18n } from '@@/i18n';
import { VDocsSection, VCode, VDocsPaging } from '~/components';
import { pkg } from '../-i18n';
import { API_CATEGORIES } from './api/-shared';

const PkgI18nSubSpace = i18n.defineSubSpace({ pkg });

export default defineComponent({
  i18n: PkgI18nSubSpace,
  setup() {
    // eslint-disable-next-line no-shadow
    const pkg = PackageProvide.use();
    pkg.useHead();
    const pkgI18n = PkgI18nSubSpace.use();
    const { common } = pkgI18n.at;

    return () => (
      <div>
        {pkg.renderHeader()}
        <VDocsSection title={common.t.usage}>
          <VCode language="ts">{`// ${common.t.docIsInPreparation}`}</VCode>
        </VDocsSection>

        <VDocsPaging
          next={{
            to: `/i18n/api/${API_CATEGORIES[0]}/`,
            title: 'API',
          }}
        />
      </div>
    );
  },
});
