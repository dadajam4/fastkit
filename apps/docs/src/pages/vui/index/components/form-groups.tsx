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
  VFormGroup,
  FormSelectorItem,
  VCheckbox,
  VCheckboxGroup,
  VTextField,
  VButton,
  useVui,
  VRadioGroup,
} from '@fastkit/vui';
import { range } from '@fastkit/helpers';
import { DocsSection } from '../../../-components';

const DYNAMIC_KEYS = ['k1', 'k2'] as const;

export default defineComponent({
  setup() {
    const size = ref<ControlSize>('md');
    const variant = ref<ControlFieldVariant>('flat');
    const disabled = ref(false);
    const readonly = ref(false);
    const form1Sending = ref(false);
    const form2Sending = ref(false);
    const dynamicKey = ref<(typeof DYNAMIC_KEYS)[number]>(DYNAMIC_KEYS[0]);
    const dynamicInput = ref({
      k1: '',
      k2: '',
    });
    const items: FormSelectorItem[] = range(5, 1).map((i) => ({
      value: String(i),
      label: `アイテム${i}`,
    }));
    const vui = useVui();
    const checks1 = ref(['1', '2']);

    async function submit1() {
      if (form1Sending.value) return;
      form1Sending.value = true;
      await new Promise((resolve) => setTimeout(resolve, 2000));
      form1Sending.value = false;
      vui.snackbar('送信しました。');
    }

    async function submit2() {
      if (form2Sending.value) return;
      form2Sending.value = true;
      await new Promise((resolve) => setTimeout(resolve, 2000));
      form2Sending.value = false;
      vui.snackbar('送信しました。');
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
      dynamicKey,
      dynamicInput,
      checks1,
    };
  },
  render() {
    const { items } = this;
    return (
      <div class="pg-docs-components-icons">
        <VHero>Forms</VHero>
        <DocsSection title="Basic">
          <VFormGroup
            collectErrorMessages
            disabled={this.form1Sending}
            v-slots={{
              default: (form) => (
                <>
                  {/* <VButton
                    onClick={() => {
                      form.validateAndScroll();
                    }}>
                    あいうえお
                  </VButton> */}
                  <VRadioGroup
                    label="公開状態"
                    items={[
                      {
                        value: '1',
                        label: '非公開',
                      },
                      {
                        value: '2',
                        label: '公開',
                      },
                    ]}
                  />

                  <VButton color="base">保存</VButton>
                  <VButton color="primary">繁栄</VButton>

                  <div>{form.invalidChildren.length}</div>
                  <VButton
                    onClick={() => {
                      this.$vui.snackbar({
                        content: 'An Error has Ocured hoge is [Number].',
                        timeout: 0,
                        color: 'error',
                      });
                    }}>
                    Snack
                  </VButton>
                  <VTextField
                    // label={() => <>氏名 *</>}
                    label="氏名"
                    requiredChip={false}
                    hint="10文字以内で入力してほしい！"
                    // hinttip="氏名を入力とは"
                    required
                    counter={10}
                  />

                  <VSelect
                    label="Dynamic input key"
                    hint="これは入力ヒントテキストです。"
                    hinttip
                    items={DYNAMIC_KEYS.map((key) => ({
                      value: key,
                      label: key,
                    }))}
                    v-model={this.dynamicKey}
                  />
                  <VTextField
                    key={this.dynamicKey}
                    label={`Dynamic input - ${this.dynamicKey}`}
                    required
                    hint="これは入力ヒントテキストです。"
                    counter
                    maxlength="10"
                    v-model={this.dynamicInput[this.dynamicKey]}
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
                    v-model={this.checks1}
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
                </>
              ),
            }}
          />
        </DocsSection>

        <DocsSection title="Styles">
          <div class="pg-columns">
            <div class="pg-columns__main">
              <VFormGroup
                disabled={this.form2Sending || this.disabled}
                size={this.size}
                readonly={this.readonly}
                collectErrorMessages
                v-slots={{
                  default: (group) => (
                    <>
                      {group.errorMessages.length > 0 && (
                        <ul>
                          {group.errorMessages.map((message) => (
                            <li key={message.key}>{message.render()}</li>
                          ))}
                        </ul>
                      )}
                      <VTextField
                        label="氏名"
                        required
                        showOwnErrors={false}
                        hint="これは入力ヒントテキストです。"
                        counter
                        maxlength="10"
                        v-slots={{
                          'error:required': (err) =>
                            '氏名が入力されていません。',
                        }}
                      />

                      <VTextarea
                        label="ひとことコメント"
                        required
                        hint="これは入力ヒントテキストです。"
                        counter
                        maxlength="100"
                        v-slots={{
                          'error:required': (err) =>
                            'コメントが入力されていません。',
                        }}
                      />

                      <VSelect
                        label="居住地"
                        items={items}
                        required
                        hint="これは入力ヒントテキストです。"
                        v-slots={{
                          'error:required': (err) =>
                            '居住地が選択されていません',
                        }}
                      />

                      <VCheckboxGroup
                        label="趣味（自分でエラーを表示する）"
                        required
                        hint="これは入力ヒントテキストです。"
                        stacked={false}
                        items={items}
                        showOwnErrors
                        v-slots={{
                          'error:required': (err) => '趣味が選択されていません',
                        }}
                      />

                      <VSwitchGroup
                        label="持ち物"
                        required
                        hint="これは入力ヒントテキストです。"
                        stacked={false}
                        items={items}
                        v-slots={{
                          'error:required': (err) =>
                            '持ち物が選択されていません',
                        }}
                      />

                      <div style={{ margin: '20px 0' }}>
                        <VCheckbox required>利用規約に同意する</VCheckbox>
                      </div>

                      <VButton
                        color="accent"
                        endIcon="mdi-send"
                        type="button"
                        loading={this.form2Sending}
                        onClick={() => {
                          group.validateAndScroll();
                        }}
                        disabled={
                          this.form2Sending || this.disabled || group.invalid
                        }>
                        Send
                      </VButton>
                    </>
                  ),
                }}
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
            </div>
          </div>
        </DocsSection>
      </div>
    );
  },
});
