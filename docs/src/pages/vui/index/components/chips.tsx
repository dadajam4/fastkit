import { defineComponent, ref } from 'vue';
import {
  VHero,
  useVui,
  VChip,
  CHIP_SIZES,
  ChipSize,
  VSelect,
  ColorVariant,
  ScopeName,
  VSwitch,
  VTextField,
  VAvatar,
} from '@fastkit/vui';
import { DocsSection } from '../../../-components';

export default defineComponent({
  setup() {
    const vui = useVui();

    const colors = vui.options.colorScheme.scopeNames;
    // const disabled = ref(false);
    const text = ref('Chip Component');
    const label = ref(false);
    const variants = vui.options.colorScheme.variants;
    const color = ref<ScopeName>();
    const size = ref<ChipSize>();
    const variant = ref<ColorVariant>();
    return () => (
      <div>
        <VHero>Chips</VHero>
        <DocsSection title="Usage">
          <div class="pg-columns">
            <div class="pg-columns__main">
              <VChip
                color={color.value}
                variant={variant.value}
                size={size.value}
                label={label.value}>
                {text.value}
              </VChip>
            </div>
            <div class="pg-columns__sub">
              <VSelect
                label="color"
                size="sm"
                v-model={color.value}
                items={colors.map((value) => ({
                  value,
                  label: value,
                }))}
              />

              <VSelect
                label="variant"
                size="sm"
                v-model={variant.value}
                items={variants.map((value) => ({
                  value,
                  label: value,
                }))}
              />

              <VSelect
                label="size"
                size="sm"
                v-model={size.value}
                items={CHIP_SIZES.map((value) => ({
                  value,
                  label: value,
                }))}
              />

              <VTextField size="sm" v-model={text.value} />

              <VSwitch size="sm" v-model={label.value}>
                label
              </VSwitch>
            </div>
          </div>
        </DocsSection>

        <DocsSection title="With Icons">
          <VChip class="m-1" startIcon="mdi-account-circle" color="secondary">
            Mike
          </VChip>
          <VChip class="m-1" endIcon="mdi-star" color="warning">
            Mike
          </VChip>
          <VChip class="m-1" endIcon="mdi-cake-variant" color="info">
            1 Year
          </VChip>
          <VChip
            class="m-1"
            startIcon={() => <VAvatar>1</VAvatar>}
            color="info">
            Years
          </VChip>
          <VChip
            class="m-1"
            startIcon="mdi-check-circle"
            endIcon="mdi-close-circle"
            color="success">
            Confirmed
          </VChip>
          <VChip
            class="m-1"
            startIcon="mdi-check-circle"
            endIcon="mdi-trash-can"
            color="success">
            Confirmed
          </VChip>
        </DocsSection>

        <DocsSection title="With Actions (Routing & Click)">
          <VChip to="/vui">Hello world</VChip>
          <VChip
            variant="plain"
            onClick={() => {
              vui.alert('Clicked !!');
            }}>
            Hello world
          </VChip>
        </DocsSection>
      </div>
    );
  },
});
