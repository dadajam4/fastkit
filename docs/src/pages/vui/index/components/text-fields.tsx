import { defineComponent, ref } from 'vue';
import {
  VHero,
  VTextField,
  ControlSize,
  CONTROL_SIZES,
  VSwitch,
  CONTROL_FIELD_VARIANTS,
  ControlFieldVariant,
  VSelect,
  TEXT_INPUT_TYPES,
  TextInputType,
  VIcon,
  VNumberField,
} from '@fastkit/vui';
import { DocsSection } from '../../../-components';

export default defineComponent({
  setup() {
    const text1 = ref('');

    const size = ref<ControlSize>('md');
    const variant = ref<ControlFieldVariant>('flat');
    const disabled = ref(false);
    const readonly = ref(false);
    const typedInputs = ref<{ [K in TextInputType]?: string }>({});
    const num = ref<number | null>(100);

    return {
      text1,
      size,
      variant,
      disabled,
      readonly,
      typedInputs,
      num,
    };
  },
  render() {
    return (
      <div class="pg-docs-components-icons">
        <VHero>Text fields</VHero>
        <DocsSection title="Basic">
          <div>{`${typeof this.num} ${this.num}`}</div>
          <button
            type="button"
            onClick={(ev) => {
              this.text1 = 'あああ';
            }}>
            xxxxx
          </button>
          <VNumberField label="数字入力" v-model={this.num} />

          <VTextField
            label="氏名"
            v-model={this.text1}
            required
            hint="これは入力ヒントテキストです。"
            counter
            maxlength="10"
            endAdornment={<VIcon name="mdi-access-point"></VIcon>}
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

        <DocsSection title="Types">
          {TEXT_INPUT_TYPES.map((type) => (
            <div>
              <VTextField
                label={type}
                type={type}
                v-model={this.typedInputs[type]}
                required
                hint="This is hint."
              />
              <div>{this.typedInputs[type]}</div>
            </div>
          ))}
        </DocsSection>

        <DocsSection title="Styles">
          <div class="pg-columns">
            <div class="pg-columns__main">
              {CONTROL_FIELD_VARIANTS.map((variant) => (
                <VTextField
                  label={variant}
                  required
                  placeholder="プレースホルダー"
                  hint="これは入力ヒントテキストです。"
                  counter
                  maxlength="10"
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
