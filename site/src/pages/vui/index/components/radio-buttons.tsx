import { defineComponent, ref } from 'vue';
import {
  VHero,
  ControlSize,
  CONTROL_SIZES,
  VSwitch,
  ControlFieldVariant,
  VRadioGroup,
  FormSelectorItem,
  VSelect,
} from '@fastkit/vui';
import { range } from '@fastkit/helpers';
import { DocsSection } from '../../../-components';

export default defineComponent({
  setup() {
    const radio1 = ref<string | null>(null);

    const size = ref<ControlSize>('md');
    const variant = ref<ControlFieldVariant>('flat');
    const disabled = ref(false);
    const readonly = ref(false);
    const stacked = ref(false);
    const items: FormSelectorItem[] = range(5, 1).map((i) => ({
      value: String(i),
      label: `アイテム${i}`,
    }));

    return {
      radio1,
      items,
      size,
      variant,
      disabled,
      readonly,
      stacked,
    };
  },
  render() {
    const { items } = this;
    return (
      <div class="pg-docs-components-icons">
        <VHero>Radio buttons</VHero>
        <DocsSection title="Basic">
          <h3>Single</h3>
          <VRadioGroup
            label="遠足のおやつ"
            required
            hint="これは入力ヒントテキストです。"
            stacked={false}
            items={items}
            v-model={this.radio1}
          />
          <div>
            <code>{JSON.stringify(this.radio1)}</code>
          </div>
        </DocsSection>

        <DocsSection title="Styles">
          <div class="pg-columns">
            <div class="pg-columns__main">
              <VRadioGroup
                items={items}
                required
                hint="これは入力ヒントテキストです。"
                size={this.size}
                disabled={this.disabled}
                readonly={this.readonly}
                stacked={this.stacked}
              />
            </div>
            <div class="pg-columns__sub">
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
              <VSwitch size="sm" v-model={this.readonly}>
                Readonly
              </VSwitch>
              <VSwitch size="sm" v-model={this.stacked}>
                Stacked
              </VSwitch>
            </div>
          </div>
        </DocsSection>
      </div>
    );
  },
});
