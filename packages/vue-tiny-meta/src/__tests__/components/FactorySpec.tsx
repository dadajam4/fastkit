import { defineComponent, SlotsType } from 'vue';

function createComponent() {
  return defineComponent({
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
}

/**
 * Component comment
 *
 * @vue-tiny-meta
 */
export const FactorySpec = createComponent();
