import { defineComponent } from 'vue';
import { VPackageProvider } from 'virtual:package-provider:i18n';
import { VPage } from '@fastkit/vot';

export default defineComponent({
  setup() {
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
