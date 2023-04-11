import { defineComponent } from 'vue';
import { useVui } from '@fastkit/vui';

export default defineComponent({
  setup() {
    const vui = useVui();

    return () => {
      return (
        <div>
          <h1>Here is {vui.location.currentRoute.params.childId}</h1>
        </div>
      );
    };
  },
});
