import { defineComponent } from 'vue';
import { PackageProvide } from '@@/package-loader';
import { i18n } from '@@/i18n';
import { VDocsSection, VCode, VDocsPaging } from '~/components';
import { pkg } from '../-i18n';
import { HelpersMeta } from './api/-shared';

const PkgI18nSubSpace = i18n.defineSubSpace({ pkg });

export default defineComponent({
  i18n: PkgI18nSubSpace,
  // prefetch,
  setup() {
    const meta = HelpersMeta.use();
    // const { names } = prefetch.inject();
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
            to: `/helpers/api/${meta.names[0]}/`,
            title: 'API',
          }}
        />
      </div>
    );
  },
});
