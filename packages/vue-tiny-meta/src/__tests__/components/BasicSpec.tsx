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
  emits: {
    /** event comment */
    click: (ev: PointerEvent) => true,
  },
  slots: {} as SlotsType<{
    /** slot comment */
    customSlot?: (props: { message: string }) => any;
  }>,
});
