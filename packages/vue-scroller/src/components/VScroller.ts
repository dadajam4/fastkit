/* eslint-disable @typescript-eslint/ban-types */
import { defineComponent, PropType } from 'vue';
import { useScroller, UseScrollerSetting } from '../hooks';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface VScrollerSettings extends UseScrollerSetting {}

export interface VScrollerProps {
  settings?: VScrollerSettings | null;
}

export const VScroller = defineComponent({
  name: 'VScroller',
  props: {
    settings: {
      type: Object as PropType<VScrollerSettings | null>,
      default: null,
    },
  },
  setup(props, ctx) {
    const settings = props.settings || {};
    const scroller = useScroller({
      ...settings,
      el: settings.el || 'body',
    });
    return scroller;
  },
});
