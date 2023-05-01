import { defineComponent } from 'vue';
import { VHero } from '@fastkit/vui';
import { VDocsPaging, VTSDocsAnyMeta } from '~/components';
import { PackageProvide } from '@@/package-loader';
import { ApiMeta } from '../-shared';

export default defineComponent({
  setup() {
    const pkg = PackageProvide.use();
    pkg.useHead({
      title: 'API',
    });

    const meta = ApiMeta.use();

    return () => {
      return (
        <div>
          <VHero>{`${pkg.displayName} API`}</VHero>

          <VTSDocsAnyMeta value={meta.types.EVMeta} />

          <VDocsPaging
            prev={{
              to: `/ev/`,
              title: 'HOME',
            }}
          />
        </div>
      );
    };
  },
});
