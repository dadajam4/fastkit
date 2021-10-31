import { defineComponent } from 'vue';

export const VTest = defineComponent({
  name: 'VTest',
  render() {
    return (
      <input
        type="checkbox"
        onChange={(ev) => {
          console.log(ev);
        }}
      />
    );
  },
});
