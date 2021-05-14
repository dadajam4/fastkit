import { defineComponent } from 'vue';

export const VStackContext = defineComponent({
  name: 'VStackContext',
  props: {
    hello: {
      type: String,
      default: '',
    },
  },
  render() {
    const { default: defaultSlot } = this.$slots;
    return <>{defaultSlot && defaultSlot()}</>;
  },
});
