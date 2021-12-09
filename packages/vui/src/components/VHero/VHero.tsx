import './VHero.scss';
import { defineComponent, PropType } from 'vue';
import { renderSlotOrEmpty } from '@fastkit/vue-utils';
import { toScopeColorClass, ScopeName } from '@fastkit/vue-color-scheme';
import { VAppContainer } from '@fastkit/vue-app-layout';

export const VHero = defineComponent({
  name: 'VHero',
  props: {
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
  },
  setup(props, ctx) {
    return () => {
      const TagName = props.tag as 'header';
      const HTagName = props.hTag as 'h1';

      return (
        <VAppContainer pulled>
          <TagName class={['v-hero', toScopeColorClass(props.color)]}>
            <HTagName class="v-hero__title">
              {renderSlotOrEmpty(ctx.slots, 'default')}
            </HTagName>
          </TagName>
        </VAppContainer>
      );
    };
  },
});
