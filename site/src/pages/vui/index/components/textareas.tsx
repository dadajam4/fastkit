import { defineComponent, ref } from 'vue';
import {
  VHero,
  VTextarea,
  ControlSize,
  CONTROL_SIZES,
  VSwitch,
  CONTROL_FIELD_VARIANTS,
  ControlFieldVariant,
  VSelect,
} from '@fastkit/vui';
import { DocsSection } from '../../../-components';

export default defineComponent({
  setup() {
    const text1 = ref('');

    const size = ref<ControlSize>('md');
    const variant = ref<ControlFieldVariant>('flat');
    const disabled = ref(false);
    const readonly = ref(false);

    return {
      text1,
      size,
      variant,
      disabled,
      readonly,
    };
  },
  render() {
    return (
      <div class="pg-docs-components-icons">
        <VHero>Textareas</VHero>
        <DocsSection title="Basic">
          <VTextarea
            label="コメント"
            v-model={this.text1}
            required
            hint="これは入力ヒントテキストです。"
            counter
            maxlength="100"
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
                <VTextarea
                  label={variant}
                  required
                  placeholder="プレースホルダー"
                  hint="これは入力ヒントテキストです。"
                  counter
                  maxlength="100"
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

        <DocsSection title="Auto sizing">
          <VTextarea
            label="コメント"
            autosize
            required
            hint="これは入力ヒントテキストです。"
            counter
            maxlength="100"
          />

          <VTextarea
            label="コメント"
            autosize={{
              minRows: 3,
              maxRows: 10,
            }}
            required
            hint="これは入力ヒントテキストです。"
            counter
            maxlength="100"
          />
        </DocsSection>
      </div>
    );
  },
});
