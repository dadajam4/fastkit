import './VHero.scss';
import { defineComponent, PropType } from 'vue';
import {
  renderSlotOrEmpty,
  htmlAttributesPropOptions,
  defineSlotsProps,
} from '@fastkit/vue-utils';
import { toScopeColorClass, ScopeName } from '@fastkit/vue-color-scheme';
import { VAppContainer } from '@fastkit/vue-app-layout';

// Adornment

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
    ...defineSlotsProps<{
      default: void;
      adornment: void;
    }>(),
  },
  setup(props, ctx) {
    return () => {
      const TagName = props.tag as 'header';
      const HTagName = props.hTag as 'h1';
      const adornment = renderSlotOrEmpty(ctx.slots, 'adornment');

      return (
        <VAppContainer pulled>
          <TagName class={['v-hero', toScopeColorClass(props.color)]}>
            <HTagName class="v-hero__title">
              {renderSlotOrEmpty(ctx.slots, 'default')}
            </HTagName>
            {adornment && <div class="v-hero__adornment">{adornment}</div>}
          </TagName>
        </VAppContainer>
      );
    };
  },
});
