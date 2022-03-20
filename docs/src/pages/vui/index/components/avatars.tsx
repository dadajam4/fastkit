import { defineComponent, ref } from 'vue';
import {
  VHero,
  useVui,
  VAvatar,
  AVATAR_SIZES,
  AvatarSize,
  VSelect,
  ColorVariant,
  ScopeName,
  VSwitch,
  VTextField,
  VIcon,
} from '@fastkit/vui';
import { DocsSection } from '../../../-components';

export default defineComponent({
  setup() {
    const vui = useVui();

    const colors = vui.options.colorScheme.scopeNames;
    // const disabled = ref(false);
    const text = ref('MJ');
    const tile = ref(false);
    const rounded = ref(false);
    const variants = vui.options.colorScheme.variants;
    const color = ref<ScopeName>();
    const size = ref<AvatarSize>();
    const variant = ref<ColorVariant>();
    return () => (
      <div>
        <VHero>Avatars</VHero>

        <DocsSection title="Usage">
          <div class="pg-columns">
            <div class="pg-columns__main">
              <VAvatar
                color={color.value}
                variant={variant.value}
                size={size.value}
                tile={tile.value}
                rounded={rounded.value}>
                {text.value}
              </VAvatar>
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
                items={AVATAR_SIZES.map((value) => ({
                  value,
                  label: value,
                }))}
              />

              <VTextField size="sm" v-model={text.value} />

              <VSwitch size="sm" v-model={tile.value}>
                tile
              </VSwitch>

              <VSwitch size="sm" v-model={rounded.value}>
                rounded
              </VSwitch>
            </div>
          </div>
        </DocsSection>

        <DocsSection title="With Image">
          <VAvatar>
            <img src="/dummy-boy_1.png" alt="" />
          </VAvatar>
          <VAvatar src="/dummy-boy_1.png" variant="plain" />
        </DocsSection>

        <DocsSection title="With Actions (Routing & Click)">
          <VAvatar to="/vui">
            <VIcon name="mdi-abacus" />
          </VAvatar>
          <VAvatar
            src="/dummy-boy_1.png"
            variant="plain"
            onClick={() => {
              vui.alert('Clicked !!');
            }}
          />
        </DocsSection>
      </div>
    );
  },
});
