import './VHero.scss';
import { defineComponent, PropType } from 'vue';
import { htmlAttributesPropOptions, defineSlots } from '@fastkit/vue-utils';
import { toScopeColorClass, ScopeName } from '@fastkit/vue-color-scheme';
import { VAppContainer } from '@fastkit/vue-app-layout';

const slots = defineSlots<{
  default?: () => void;
  adornment?: () => void;
}>();

export const VHero = defineComponent({
  name: 'VHero',
  props: {
    ...htmlAttributesPropOptions,
    color: {
      type: String as PropType<ScopeName>,
      default: 'primary',
    },
    tag: {
      type: String,
      default: 'header',
    },
    hTag: {
      type: String,
      default: 'h1',
    },
    ...slots(),
  },
  slots,
  setup(props, ctx) {
    return () => {
      const TagName = props.tag as 'header';
      const HTagName = props.hTag as 'h1';
      const adornment = ctx.slots.adornment?.();

      return (
        <VAppContainer pulled>
          <TagName class={['v-hero', toScopeColorClass(props.color)]}>
            <HTagName class="v-hero__title">{ctx.slots.default?.()}</HTagName>
            {adornment && <div class="v-hero__adornment">{adornment}</div>}
          </TagName>
        </VAppContainer>
      );
    };
  },
});
