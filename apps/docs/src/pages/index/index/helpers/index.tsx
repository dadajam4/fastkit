import { defineComponent } from 'vue';
import { VPackageProvider } from 'virtual:package-provider:helpers';
import { VPage } from '@fastkit/vot';
import { prefetch, HelpersMeta } from './index/api/-shared';

export default defineComponent({
  prefetch,
  setup() {
    const { exports } = prefetch.inject();
    // eslint-disable-next-line no-new
    new HelpersMeta(exports);

    return () => (
      <VPackageProvider
        v-slots={{
          default: () => <VPage />,
        }}
      />
    );
  },
});
