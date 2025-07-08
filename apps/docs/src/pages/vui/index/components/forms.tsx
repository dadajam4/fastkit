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

    const input1 = ref('');
    const input2 = ref('');
    const checked = ref(true);

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
      input1,
      input2,
      checked,
    };
  },
  render() {
    const { items } = this;
    // return (
    //   <div>
    //     <VForm
    //       v-slots={{
    //         default: (form) => (
    //           <div>
    //             <div>
    //               <pre>
    //                 {JSON.stringify({
    //                   input1: this.input1,
    //                   input2: this.input2,
    //                 })}
    //               </pre>
    //             </div>
    //             <VTextField
    //               label="input1"
    //               v-model={this.input1}
    //               validationDeps={() => this.input2}
    //               required
    //               finalizers="trim"
    //             />
    //             <VTextField
    //               label="input2"
    //               v-model={this.input2}
    //               validationDeps={() => this.input1}
    //               required
    //             />
    //             <VCheckbox v-model={this.checked} required>
    //               check
    //             </VCheckbox>
    //             <VButton
    //               onClick={() => {
    //                 this.input1 = '';
    //                 this.input2 = '';
    //                 this.checked = false;
    //                 form.resetValidates();
    //               }}>
    //               リセット
    //             </VButton>
    //           </div>
    //         ),
    //       }}></VForm>
    //   </div>
    // );
    return (
      <div class="pg-docs-components-icons">
        <VHero>Forms</VHero>
        <DocsSection title="Basic">
          <VForm
            disabled={this.form1Sending}
            onSubmit={(form) => {
              this.submit1();
            }}
            v-slots={{
              default: (form) => (
                <>
                  <VButton
                    onClick={() => {
                      form.validateAndScroll();
                    }}>
                    あいうえお
                  </VButton>
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
                    finalizers="trim"
                    v-model={this.input1}
                    validationDeps={() => this.input2}
                  />
                  <VTextarea
                    label="ひとことコメント"
                    required
                    hint="これは入力ヒントテキストです。"
                    counter
                    maxlength="100"
                    v-model={this.input2}
                    finalizers="trim"
                    validationDeps={() => this.input1}
                  />

                  <VButton
                    onClick={() => {
                      this.input1 = '';
                      // this.input2 = '';

                      form.resetValidates();
                    }}>
                    resetValidates
                  </VButton>

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

                  <VSelect
                    label="居住地"
                    items={items}
                    required
                    clearable
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

                  <VButton
                    onClick={() => {
                      form.resetValidates();
                    }}
                    disabled={this.form1Sending}>
                    resetValidates
                  </VButton>
                </>
              ),
            }}></VForm>
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
                }}
                v-slots={{
                  default: (form) => (
                    <>
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
                        disabled={
                          this.form2Sending || this.disabled || form.invalid
                        }>
                        Send
                      </VButton>
                    </>
                  ),
                }}></VForm>
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
