import { defineComponent } from 'vue';
import { VHero, useVui, VBreadcrumbs } from '@fastkit/vui';
import { DocsSection } from '../../../-components';

export default defineComponent({
  setup() {
    const vui = useVui();

    const colors = vui.options.colorScheme.scopeNames;

    return {
      colors,
    };
  },
  render() {
    return (
      <div class="pg-docs-components-buttons">
        <VHero>Breadcrumbs</VHero>

        <VBreadcrumbs
          items={[
            { text: 'Documents', to: '/vui' },
            { text: 'Components' },
            { text: 'Breadcrumbs', to: '/vui/components/breadcrumbs' },
          ]}
        />

        <DocsSection title="Basic">
          <VBreadcrumbs
            items={[
              { text: 'Documents', to: '/vui', icon: 'mdi-home' },
              { text: 'Components' },
              { text: 'Breadcrumbs', to: '/vui/components/breadcrumbs' },
            ]}
          />
        </DocsSection>
      </div>
    );
  },
});
