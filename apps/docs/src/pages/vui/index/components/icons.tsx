import { defineComponent } from 'vue';
import { VHero, ICON_NAMES, VIcon } from '@fastkit/vui';
import { DocsSection } from '../../../-components';

export default defineComponent({
  setup() {
    const icons = ICON_NAMES;

    return {
      icons,
    };
  },
  render() {
    return (
      <div class="pg-docs-components-icons">
        <VHero>Icons</VHero>
        <DocsSection title="Icons">
          {this.icons.map((icon) => (
            <div>
              <VIcon key={icon} name={icon} />
              {icon}
            </div>
          ))}
        </DocsSection>
      </div>
    );
  },
});
