import { defineComponent, PropType } from 'vue';
import { PackageInfo } from '../../schemes';
import { PackageProvide } from '../../package-provide';

export const VPackageProvider = defineComponent({
  name: 'VPackageProvider',
  props: {
    value: {
      type: Object as PropType<PackageInfo>,
      required: true,
    },
  },
  setup(props, ctx) {
    new PackageProvide(props.value).provide();

    return () => {
      return <div class="v-package-provider">{ctx.slots?.default?.()}</div>;
    };
  },
});
