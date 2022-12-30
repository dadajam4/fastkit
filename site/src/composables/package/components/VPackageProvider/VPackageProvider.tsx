import { defineComponent, PropType } from 'vue';
import { PackageInfo } from '../../schemes';
import { PackageProvide } from '../../package-provide';
import { defineSlotsProps } from '@fastkit/vue-utils';

export const VPackageProvider = defineComponent({
  name: 'VPackageProvider',
  props: {
    value: {
      type: Object as PropType<PackageInfo>,
      default: () => null,
    },
    ...defineSlotsProps<{
      default: { pkg: PackageProvide };
    }>(),
  },
  setup(props, ctx) {
    const pkg = new PackageProvide(props.value).provide();
    const payload = { pkg };

    return () => {
      return (
        <div class="v-package-provider">{ctx.slots?.default?.(payload)}</div>
      );
    };
  },
});
