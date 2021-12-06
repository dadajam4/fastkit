import { defineComponent } from 'vue';
import {
  VButton,
  VIcon,
  ICON_NAMES,
  CONTROL_SIZES,
  useVui,
} from '@fastkit/vui';

export default defineComponent({
  setup() {
    const vui = useVui();
    const DEMO_ICONS = ICON_NAMES.slice(0, 10);
    return {
      ...vui.options.colorScheme,
      DEMO_ICONS,
    };
  },
  render() {
    const { variants, scopeNames } = this;
    return (
      <div>
        <h1>Components</h1>

        <h2>Icons</h2>
        <div>
          {this.DEMO_ICONS.map((icon) => (
            <VIcon key={icon} name={icon} />
          ))}
        </div>

        <h2>Buttons</h2>
        {variants.map((variant) => (
          <div key={variant}>
            <h3>{variant}</h3>
            <div>
              {scopeNames.map((color) => (
                <VButton key={color} color={color} variant={variant}>
                  {color}
                </VButton>
              ))}
            </div>
          </div>
        ))}

        <div>
          <h3>Sizings</h3>
          {CONTROL_SIZES.map((size) => (
            <VButton key={size} size={size}>
              Size: {size}
            </VButton>
          ))}
        </div>

        <div>
          <h3>Icons</h3>
          {this.DEMO_ICONS.map((icon, ci) => (
            <VButton
              key={icon}
              icon={icon}
              color={scopeNames[ci % scopeNames.length]}
            />
          ))}

          <h4>Sizings</h4>
          {CONTROL_SIZES.map((size, si) => {
            return (
              <div key={size}>
                <h4>{size}</h4>
                {this.DEMO_ICONS.map((icon, ci) => (
                  <VButton
                    key={icon}
                    size={size}
                    icon={icon}
                    variant={variants[si % variants.length]}
                    color={scopeNames[ci % scopeNames.length]}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    );
  },
});
