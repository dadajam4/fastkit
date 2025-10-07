import { defineComponent, SlotsType } from 'vue';

function createComponent() {
  return defineComponent({
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
}

/**
 * Component comment
 *
 * @vue-tiny-meta
 */
export const FactorySpec = createComponent();
