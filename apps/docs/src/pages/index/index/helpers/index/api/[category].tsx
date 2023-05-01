import { defineComponent } from 'vue';
import { useMatchedCategory, prefetch } from './-shared';
import { PackageProvide } from '@@/package-loader';
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

    return () => {
      return (
        <div>
          {category.types.map((meta, index) => {
            return (
              <VTSDocsAnyMeta key={`${index}:${meta.name}`} value={meta} />
            );
          })}
        </div>
      );
    };
  },
});
