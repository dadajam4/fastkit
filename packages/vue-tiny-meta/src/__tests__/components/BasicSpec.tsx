import { defineComponent, SlotsType } from 'vue';

/**
 * Component comment
 */
export const BasicSpec = defineComponent({
  name: 'BasicSpec',
  props: {
    /** prop comment */
    msg: String,
  },
  slots: {} as SlotsType<{
    /** slot comment */
    customSlot?: (props: { message: string }) => any;
  }>,
  emits: {
    /** event comment */
    click: (ev: MouseEvent) => true,
  },
});
