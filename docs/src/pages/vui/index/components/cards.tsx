import { defineComponent } from 'vue';
import {
  VHero,
  useVui,
  VCard,
  VCardContent,
  VCardActions,
  VButton,
} from '@fastkit/vui';
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
        <VHero>Cards</VHero>

        <DocsSection title="Basic">
          <VCard>
            <VCardContent>Hello world</VCardContent>
          </VCard>
        </DocsSection>

        <DocsSection title="With actions">
          <VCard>
            <VCardContent>Hello world</VCardContent>
            <VCardActions>
              <VButton size="sm" color="accent" endIcon="mdi-book">
                Book
              </VButton>
              <VButton size="sm" endIcon="mdi-cancel">
                Cancel
              </VButton>
              <VButton
                size="sm"
                color="primary"
                endIcon="mdi-send"
                spacer="left">
                Book
              </VButton>
            </VCardActions>
          </VCard>
        </DocsSection>

        <DocsSection title="Colors">
          <div>
            {this.colors.map((color) => (
              <VCard color={color} style={{ marginTop: '10px' }}>
                <VCardContent>Hello world</VCardContent>
              </VCard>
            ))}
          </div>
        </DocsSection>
      </div>
    );
  },
});
