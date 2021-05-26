import { defineComponent, PropType, ExtractPropTypes } from 'vue';
import { useScroller, UseScrollerSetting } from '../hooks';
import { ExtractPropInput } from '@fastkit/vue-utils';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface VScrollerSettings extends UseScrollerSetting {}

export const scrollerProps = {
  settings: {
    type: Object as PropType<VScrollerSettings | null>,
    default: null,
  },
};

export type VScrollerProps = ExtractPropInput<typeof scrollerProps>;

export type VScrollerResolvedProps = ExtractPropTypes<typeof scrollerProps>;

export const VScroller = defineComponent({
  name: 'VScroller',
  props: scrollerProps,
  setup(props, ctx) {
    const settings = props.settings || {};
    const scroller = useScroller({
      ...settings,
      el: settings.el || 'body',
    });
    return scroller;
  },
});
