import { defineComponent } from 'vue';
import { VPackageProvider } from 'virtual:package-provider:universal-logger';
import { i18n } from '@@/i18n';
import { VPage } from '@fastkit/vot';
import { pkg } from './-i18n';
import { ApiMeta } from './-shared';

export const PkgI18nSubSpace = i18n.defineSubSpace({ pkg });

export default defineComponent({
  i18n: PkgI18nSubSpace,
  prefetch: ApiMeta.prefetch,
  setup() {
    new ApiMeta();

    return () => (
      <VPackageProvider
        v-slots={{
          default: () => <VPage />,
        }}
      />
    );
  },
});
