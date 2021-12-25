import { defineComponent } from 'vue';
import { VHero, VButton } from '@fastkit/vui';

export default defineComponent({
  render() {
    return (
      <div>
        <VHero
          v-slots={{
            adornment: () => <VButton>hoge</VButton>,
          }}>
          Components
        </VHero>
      </div>
    );
  },
});
