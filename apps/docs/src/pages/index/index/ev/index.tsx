import { defineComponent } from 'vue';
import { VPackageProvider } from 'virtual:package-provider:ev';
import { VPage } from '@fastkit/vot';
import { ApiMeta } from './-shared';

export default defineComponent({
  prefetch: ApiMeta.prefetch,
  setup() {
    // eslint-disable-next-line no-new
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
