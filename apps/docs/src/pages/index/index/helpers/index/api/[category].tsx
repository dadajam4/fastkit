import { defineComponent } from 'vue';
import { PackageProvide } from '@@/package-loader';
import { useMatchedCategory, prefetch } from './-shared';
import { VTSDocsAnyMeta } from '~/components';

export default defineComponent({
  prefetch,
  setup() {
    const category = useMatchedCategory().matched;
    if (!category) {
      throw new Error('missing matched category');
    }
    const pkg = PackageProvide.use();

    pkg.useHead({
      title: category.name,
    });

    return () => (
      <div>
        {category.types.map((meta, index) => (
          <VTSDocsAnyMeta key={`${index}:${meta.name}`} value={meta} />
        ))}
      </div>
    );
  },
});
