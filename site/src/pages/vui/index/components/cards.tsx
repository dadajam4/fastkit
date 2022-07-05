import { defineComponent, ref } from 'vue';
import {
  VHero,
  useVui,
  VCard,
  VCardContent,
  VCardActions,
  VButton,
  VCheckbox,
} from '@fastkit/vui';
import { DocsSection } from '../../../-components';

export default defineComponent({
  setup() {
    const vui = useVui();

    const colors = vui.options.colorScheme.scopeNames;
    const disabled = ref(false);

    return {
      colors,
      disabled,
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

        <DocsSection title="Link & Clickable">
          <div>
            <VCheckbox v-model={this.disabled}>disabled</VCheckbox>

            <VCard
              class="my-2"
              href="https://google.com"
              target="_blank"
              disabled={this.disabled}>
              <VCardContent>This is link</VCardContent>
            </VCard>

            <VCard
              class="my-2"
              color="primary"
              onClick={(ev) => {
                console.log(ev);
              }}
              disabled={this.disabled}>
              <VCardContent>Clickable</VCardContent>
            </VCard>
          </div>
        </DocsSection>
      </div>
    );
  },
});
