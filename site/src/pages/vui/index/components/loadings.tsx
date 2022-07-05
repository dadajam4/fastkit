import { defineComponent } from 'vue';
import {
  VHero,
  useVui,
  VProgressCircular,
  VProgressLinear,
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
        <VHero>Loadings</VHero>
        <DocsSection title="Progress circular">
          <VProgressCircular indeterminate />
        </DocsSection>

        <DocsSection title="Progress circular">
          <VProgressLinear indeterminate active />
        </DocsSection>

        <DocsSection title="Colors">
          <div>
            {this.colors.map((color) => (
              <VProgressCircular indeterminate color={color} />
            ))}
          </div>
          <div>
            {this.colors.map((color) => (
              <VProgressLinear indeterminate active color={color} />
            ))}
          </div>
        </DocsSection>
      </div>
    );
  },
});
