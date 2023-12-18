import { defineComponent } from 'vue';

/**
 * Component comment
 *
 * @vue-tiny-meta
 */
export const FunctionalSpec = defineComponent(
  (_props: {
    /** prop comment */
    hoge: number;
    /** prop comment */
    fuga?: boolean;
  }) => {
    return () => undefined;
  },
  {
    emits: ['click'],
  },
);
