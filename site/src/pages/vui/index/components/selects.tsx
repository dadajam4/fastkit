import { defineComponent, ref } from 'vue';
import {
  VHero,
  ControlSize,
  CONTROL_SIZES,
  VSwitch,
  CONTROL_FIELD_VARIANTS,
  ControlFieldVariant,
  VSelect,
  FormSelectorItem,
  RawFormSelectorItems,
} from '@fastkit/vui';
import { range } from '@fastkit/helpers';
import { DocsSection } from '../../../-components';

export default defineComponent({
  setup() {
    const select1 = ref<string | null>(null);
    const select2 = ref<string[]>(['3', '5']);

    const size = ref<ControlSize>('md');
    const variant = ref<ControlFieldVariant>('flat');
    const disabled = ref(false);
    const readonly = ref(false);
    const items: FormSelectorItem[] = range(10, 1).map((i) => ({
      value: String(i),
      label: `アイテム${i}`,
    }));
    const asyncItems: RawFormSelectorItems = () => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          resolve([
            ...items,
            {
              id: 'group-1',
              label: 'Group1',
              items: range(5, 11).map((i) => ({
                value: String(i),
                label: `アイテム${i}`,
                disabled: i % 2 === 0,
              })),
            },
            {
              id: 'group-2',
              label: 'Group2',
              items: range(5, 16).map((i) => ({
                value: String(i),
                label: `アイテム${i}`,
                disabled: i % 2 === 0,
              })),
              disabled: true,
            },
          ]);
          // reject(new Error('jjj'));
        }, 3000);
      });
    };

    return {
      select1,
      select2,
      items,
      asyncItems,
      size,
      variant,
      disabled,
      readonly,
    };
  },
  render() {
    const { items, asyncItems } = this;
    return (
      <div class="pg-docs-components-icons">
        <VHero>Selects</VHero>
        <DocsSection title="Basic">
          <VSelect
            label="コメント"
            v-model={this.select1}
            items={items}
            required
            clearable
            hint="これは入力ヒントテキストです。"
            v-slots={
              {
                error: (error: any) => {
                  if (error.name === 'required') {
                    return '必須項目です。';
                  }
                },
              } as any
            }
          />
        </DocsSection>

        <DocsSection title="Multiple">
          <VSelect
            label="コメント"
            v-model={this.select2}
            items={asyncItems}
            multiple
            required
            clearable
            hint="これは入力ヒントテキストです。"
            v-slots={
              {
                error: (error: any) => {
                  if (error.name === 'required') {
                    return '必須項目です。';
                  }
                },
              } as any
            }
          />
        </DocsSection>

        <DocsSection title="Styles">
          <div class="pg-columns">
            <div class="pg-columns__main">
              {CONTROL_FIELD_VARIANTS.map((variant) => (
                <VSelect
                  label={variant}
                  items={items}
                  required
                  placeholder="プレースホルダー"
                  hint="これは入力ヒントテキストです。"
                  size={this.size}
                  disabled={this.disabled}
                  readonly={this.readonly}
                  variant={variant}
                />
              ))}
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
            </div>
          </div>
        </DocsSection>
      </div>
    );
  },
});
