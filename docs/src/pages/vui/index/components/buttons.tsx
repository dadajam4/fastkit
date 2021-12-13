import { defineComponent, ref } from 'vue';
import {
  VHero,
  VButton,
  useVueStack,
  useVui,
  CONTROL_SIZES,
  ControlSize,
  ColorVariant,
  VTextField,
  VSelect,
  VSwitch,
  ICON_NAMES,
} from '@fastkit/vui';
import { DocsSection } from '../../../-components';

export default defineComponent({
  setup() {
    const vui = useVui();
    const stack = useVueStack();
    const size = ref<ControlSize>('md');
    const variant = ref<ColorVariant>('contained');
    const disabled = ref(false);
    const rounded = ref(false);
    const loading = ref(false);
    const text = ref('');

    const colors = vui.options.colorScheme.scopeNames;
    const variants = vui.options.colorScheme.variants;
    const icons = ICON_NAMES.slice(100, 120);

    return {
      stack,
      text,
      size,
      variant,
      disabled,
      rounded,
      loading,
      colors,
      variants,
      icons,
    };
  },
  render() {
    return (
      <div class="pg-docs-components-buttons">
        <VHero>Buttons</VHero>
        <DocsSection title="Basic">
          <VButton
            startIcon="mdi-cursor-default-click"
            color="info"
            onClick={(ev) => {
              this.stack.alert('Clicked!!');
            }}>
            Button
          </VButton>
          <VButton
            href="https://google.com"
            target="_blank"
            startIcon="mdi-google"
            color="info">
            Google
          </VButton>
          <VButton color="info" to="/vui">
            Home
          </VButton>
        </DocsSection>

        <DocsSection title="Styles">
          <div class="pg-columns">
            <div class="pg-columns__main">
              {this.colors.map((color) => (
                <VButton
                  key={color}
                  color={color}
                  size={this.size}
                  variant={this.variant}
                  disabled={this.disabled}
                  rounded={this.rounded}
                  loading={this.loading}>
                  {this.text || color}
                </VButton>
              ))}
            </div>
            <div class="pg-columns__sub">
              <VTextField label="Text" size="sm" v-model={this.text} />
              <VSelect
                label="color"
                size="sm"
                v-model={this.variant}
                items={this.variants.map((value) => ({
                  value,
                  label: value,
                }))}
              />
              <VSelect
                label="size"
                size="sm"
                v-model={this.size}
                items={CONTROL_SIZES.map((value) => ({
                  value,
                  label: value,
                }))}
              />
              <VSwitch size="sm" v-model={this.disabled}>
                Disabled
              </VSwitch>
              <VSwitch size="sm" v-model={this.loading}>
                Loading
              </VSwitch>
              <VSwitch size="sm" v-model={this.rounded}>
                Rounded
              </VSwitch>
            </div>
          </div>
        </DocsSection>

        <DocsSection title="Icon & Text">
          <VButton startIcon="mdi-search-web" color="info">
            Search
          </VButton>
          <VButton endIcon="mdi-send" color="accent">
            Send
          </VButton>
        </DocsSection>

        <DocsSection title="Icon Button">
          {this.icons.map((icon, i) => {
            const color = this.colors[i % this.colors.length];
            const size = CONTROL_SIZES[i % CONTROL_SIZES.length];
            const variant = this.variants[i % this.variants.length];
            return (
              <VButton
                key={icon}
                icon={icon}
                color={color}
                variant={variant}
                size={size}
              />
            );
          })}
        </DocsSection>
      </div>
    );
  },
});
