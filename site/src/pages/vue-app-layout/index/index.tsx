import { defineComponent } from 'vue';
import { VAppBody } from '@fastkit/vui';

export default defineComponent({
  setup() {
    return () => {
      return (
        <VAppBody center style={{ padding: '32px' }}>
          <h1 class="docs-theme-font">Vue App Layout</h1>

          <p>あいうえお</p>
          <p>あいうえお</p>
          <p>あいうえお</p>
          <p>あいうえお</p>
          <p>あいうえお</p>
          <p>あいうえお</p>
          <p>あいうえお</p>
          <p>あいうえお</p>
          <p>あいうえお</p>
          <p>あいうえお</p>
          <p>あいうえお</p>
          <p>あいうえお</p>
          <p>あいうえお</p>
          <p>あいうえお</p>
        </VAppBody>
      );
    };
  },
});
