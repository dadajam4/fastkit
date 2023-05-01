import { defineComponent } from 'vue';
import { VPackageProvider } from 'virtual:package-provider:ev';
import { VPage } from '@fastkit/vot';
import { ApiMeta } from './-shared';

export default defineComponent({
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
