import './DocsSection.scss';

import { defineComponent } from 'vue';
import { VCard, VCardContent } from '@fastkit/vui';

export const DocsSection = defineComponent({
  name: 'DocsSection',
  props: {
    title: String,
  },
  setup(props, ctx) {
    return () => (
      <VCard class="docs-section" tag="section">
        <VCardContent>
          <h2 class="docs-section__title">{props.title}</h2>
          <div class="docs-section__body">{ctx.slots.default?.()}</div>
        </VCardContent>
      </VCard>
    );
  },
});
