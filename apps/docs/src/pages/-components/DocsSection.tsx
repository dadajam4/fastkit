import './DocsSection.scss';

import { defineComponent } from 'vue';
import { renderSlotOrEmpty, VCard, VCardContent } from '@fastkit/vui';

export const DocsSection = defineComponent({
  name: 'DocsSection',
  props: {
    title: String,
  },
  setup(props, ctx) {
    return () => {
      return (
        <VCard class="docs-section" tag="section">
          <VCardContent>
            <h2 class="docs-section__title">{props.title}</h2>
            <div class="docs-section__body">
              {renderSlotOrEmpty(ctx.slots, 'default')}
            </div>
          </VCardContent>
        </VCard>
      );
    };
  },
});
