import { defineComponent } from 'vue';
import { PackageProvide } from '@@/package-loader';
import { VTSDocsAnyMeta } from '~/components';
import { metaPrefetch, createBreadcrumbs } from './-shared';

const title = 'Component';

export default defineComponent({
  prefetch: metaPrefetch,
  setup() {
    const pkg = PackageProvide.use();

    pkg.useHead({
      title,
    });

    const { ComponentStaticMeta, ComponentMeta } = metaPrefetch.inject().types;

    return () => (
      <div>
        {createBreadcrumbs(title)}

        <VTSDocsAnyMeta value={ComponentStaticMeta} />
        <VTSDocsAnyMeta value={ComponentMeta} />
      </div>
    );
  },
});
