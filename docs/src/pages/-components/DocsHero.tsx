import './DocsHero.scss';
import { defineComponent, PropType } from 'vue';
import {
  renderSlotOrEmpty,
  ScopeName,
  toScopeColorClass,
  VAppContainer,
} from '@fastkit/vui';

export const DocsHero = defineComponent({
  name: 'DocsHero',
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
          <TagName class={['v-docs-hero', toScopeColorClass(props.color)]}>
            <HTagName class="v-docs-hero__title">
              {renderSlotOrEmpty(ctx.slots, 'default')}
            </HTagName>
          </TagName>
        </VAppContainer>
      );
    };
  },
});
