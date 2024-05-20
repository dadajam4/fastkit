import { defineComponent } from 'vue';
import { VPackageProvider } from 'virtual:package-provider:vue-scoped-loading';
import { PackageProvide } from '@@/package-loader';
import { VTSDocsAnyMeta } from '~/components';
import { ApiMeta } from '../-shared';
// import { PkgI18nSubSpace } from '../index';

export default defineComponent({
  setup() {
    const pkg = PackageProvide.use();
    pkg.useHead();
    // const _pkgI18n = PkgI18nSubSpace.use();
    const meta = new ApiMeta();

    return () => (
      <VPackageProvider
        v-slots={{
          // eslint-disable-next-line no-shadow
          default: ({ pkg }) => (
            <>
              {pkg.renderHeader()}

              <VTSDocsAnyMeta value={meta.types.useLoadingMeta} />
              <VTSDocsAnyMeta value={meta.types.LoadingScopeMeta} />
              <VTSDocsAnyMeta value={meta.types.LoadingRequestMeta} />
              <VTSDocsAnyMeta value={meta.types.LoadingRequestOptionsMeta} />
            </>
          ),
        }}
      />
    );
  },
});
