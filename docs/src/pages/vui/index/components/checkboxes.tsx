import { defineComponent, ref } from 'vue';
import {
  VHero,
  ControlSize,
  CONTROL_SIZES,
  VSwitch,
  ControlFieldVariant,
  VCheckbox,
  VCheckboxGroup,
  FormSelectorItemData,
  VSelect,
} from '@fastkit/vui';
import { range } from '@fastkit/helpers';
import { DocsSection } from '../../../-components';

export default defineComponent({
  setup() {
    const check1 = ref(false);
    const check2 = ref<string[]>([]);

    const size = ref<ControlSize>('md');
    const variant = ref<ControlFieldVariant>('flat');
    const disabled = ref(false);
    const readonly = ref(false);
    const stacked = ref(false);
    const items: FormSelectorItemData[] = range(5, 1).map((i) => ({
      value: String(i),
      label: `アイテム${i}`,
    }));

    return {
      check1,
      check2,
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
        <VHero>Checkboxes</VHero>
        <DocsSection title="Basic">
          <h3>Single</h3>
          <VCheckbox required v-model={this.check1}>
            Check!!!
          </VCheckbox>
          <div>
            <code>{JSON.stringify(this.check1)}</code>
          </div>

          <VCheckboxGroup
            label="遠足のおやつ"
            required
            hint="これは入力ヒントテキストです。"
            stacked={false}
            items={items}
            v-model={this.check2}
          />
          <div>
            <code>{JSON.stringify(this.check2)}</code>
          </div>
        </DocsSection>

        <DocsSection title="Styles">
          <div class="pg-columns">
            <div class="pg-columns__main">
              <VCheckboxGroup
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
