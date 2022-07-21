import { defineComponent } from 'vue';
import { VPage } from '@fastkit/vui';
import { VDocsLayout } from '~/components';

export default defineComponent({
  render() {
    return (
      <VDocsLayout home="/getting-started" title="HOME">
        <VPage />
      </VDocsLayout>
    );
  },
});
