import { defineComponent, ref } from 'vue';
import {
  VHero,
  VTextarea,
  ControlSize,
  CONTROL_SIZES,
  VSwitch,
  VSwitchGroup,
  ControlFieldVariant,
  VSelect,
  VForm,
  FormSelectorItemData,
  VCheckbox,
  VCheckboxGroup,
  VTextField,
  VButton,
  useVueStack,
} from '@fastkit/vui';
import { range } from '@fastkit/helpers';
import { DocsSection } from '../../../-components';

export default defineComponent({
  setup() {
    const size = ref<ControlSize>('md');
    const variant = ref<ControlFieldVariant>('flat');
    const disabled = ref(false);
    const readonly = ref(false);
    const form1Sending = ref(false);
    const form2Sending = ref(false);
    const items: FormSelectorItemData[] = range(5, 1).map((i) => ({
      value: String(i),
      label: `アイテム${i}`,
    }));
    const stack = useVueStack();

    async function submit1() {
      if (form1Sending.value) return;
      form1Sending.value = true;
      await new Promise((resolve) => setTimeout(resolve, 2000));
      form1Sending.value = false;
      stack.snackbar('送信しました。');
    }

    async function submit2() {
      if (form2Sending.value) return;
      form2Sending.value = true;
      await new Promise((resolve) => setTimeout(resolve, 2000));
      form2Sending.value = false;
      stack.snackbar('送信しました。');
    }

    return {
      size,
      variant,
      disabled,
      readonly,
      items,
      submit1,
      submit2,
      form1Sending,
      form2Sending,
    };
  },
  render() {
    const { items } = this;
    return (
      <div class="pg-docs-components-icons">
        <VHero>Forms</VHero>
        <DocsSection title="Basic">
          <VForm
            disabled={this.form1Sending}
            onSubmit={(form) => {
              this.submit1();
            }}>
            <VTextField
              label="氏名"
              required
              hint="これは入力ヒントテキストです。"
              counter
              maxlength="10"
            />

            <VTextarea
              label="ひとことコメント"
              required
              hint="これは入力ヒントテキストです。"
              counter
              maxlength="100"
            />

            <VSelect
              label="居住地"
              items={items}
              required
              hint="これは入力ヒントテキストです。"
            />

            <VCheckboxGroup
              label="趣味"
              required
              hint="これは入力ヒントテキストです。"
              stacked={false}
              items={items}
            />

            <VSwitchGroup
              label="持ち物"
              required
              hint="これは入力ヒントテキストです。"
              stacked={false}
              items={items}
            />

            <div style={{ margin: '20px 0' }}>
              <VCheckbox required>利用規約に同意する</VCheckbox>
            </div>

            <VButton
              color="accent"
              endIcon="mdi-send"
              type="submit"
              loading={this.form1Sending}
              disabled={this.form1Sending}>
              Send
            </VButton>
          </VForm>
        </DocsSection>

        <DocsSection title="Styles">
          <div class="pg-columns">
            <div class="pg-columns__main">
              <VForm
                disabled={this.form2Sending || this.disabled}
                size={this.size}
                readonly={this.readonly}
                onSubmit={(form) => {
                  this.submit2();
                }}>
                <VTextField
                  label="氏名"
                  required
                  hint="これは入力ヒントテキストです。"
                  counter
                  maxlength="10"
                />

                <VTextarea
                  label="ひとことコメント"
                  required
                  hint="これは入力ヒントテキストです。"
                  counter
                  maxlength="100"
                />

                <VSelect
                  label="居住地"
                  items={items}
                  required
                  hint="これは入力ヒントテキストです。"
                />

                <VCheckboxGroup
                  label="趣味"
                  required
                  hint="これは入力ヒントテキストです。"
                  stacked={false}
                  items={items}
                />

                <VSwitchGroup
                  label="持ち物"
                  required
                  hint="これは入力ヒントテキストです。"
                  stacked={false}
                  items={items}
                />

                <div style={{ margin: '20px 0' }}>
                  <VCheckbox required>利用規約に同意する</VCheckbox>
                </div>

                <VButton
                  color="accent"
                  endIcon="mdi-send"
                  type="submit"
                  loading={this.form2Sending}
                  disabled={this.form2Sending || this.disabled}>
                  Send
                </VButton>
              </VForm>
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
