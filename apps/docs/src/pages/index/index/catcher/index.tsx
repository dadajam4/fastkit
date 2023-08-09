import { defineComponent } from 'vue';
import { VPackageProvider } from 'virtual:package-provider:catcher';
import { i18n } from '@@/i18n';
import { pkg } from './-i18n';
import { ApiMeta } from './-shared';
import { VPage } from '@fastkit/vot';

export const PkgI18nSubSpace = i18n.defineSubSpace({ pkg });

export default defineComponent({
  i18n: PkgI18nSubSpace,
  prefetch: ApiMeta.prefetch,
  setup() {
    new ApiMeta();

    return () => {
      return (
        <VPackageProvider
          v-slots={{
            default: () => <VPage />,
          }}
        />
      );
    };
  },
});
