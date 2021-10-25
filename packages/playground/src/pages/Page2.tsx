import './Home.scss';
import { defineComponent, ref } from 'vue';
import {
  VForm,
  VCheckbox,
  VTextField,
  VCheckboxGroup,
  CONTROL_SIZES,
  ControlSize,
  VRadioGroup,
  VSwitch,
  VSwitchGroup,
  VIcon,
  VSelect,
  VOption,
  VTextarea,
  VButton,
  // ICON_NAMES,
} from '@fastkit/vui';
import { RouterLink } from 'vue-router';

const component = defineComponent({
  name: 'Page2View',
  setup() {
    return {
      size: ref<ControlSize>('md'),
      disabled: ref(false),
      readonly: ref(false),
      count: ref(0),
      stackActive: ref(false),
      persistent: ref(false),
      check: ref(false),
      text: ref<string>(''),
      checkGroup: ref<string[]>(['2']),
      radioGroup: ref<string>('2'),
      switch: ref(false),
      switchGroup: ref<string[]>(['2']),
      fontSize: ref(16),
      select: ref('2'),
      textarea: ref(''),
    };
  },
  render() {
    return (
      <div
        style={{
          padding: '0 20px',
          display: 'flex',
          width: '100%',
          position: 'relative',
          alignItems: 'baseline',
        }}>
        <div
          style={{
            flex: '0 0 140px',
            padding: '20px 20px 20px 0',
            position: 'sticky',
            top: 'var(--v-app-layout-drawer-top)',
          }}>
          <VSelect
            label="size"
            name="size"
            v-model={this.size}
            items={CONTROL_SIZES.map((size) => ({
              value: size,
              label: size,
            }))}
          />

          <VSwitch v-model={this.disabled}>disabled</VSwitch>

          <VSwitch v-model={this.readonly}>readonly</VSwitch>
        </div>

        <div style={{ flex: '1 1 100%' }}>
          <VForm
            size={this.size}
            disabled={this.disabled}
            readonly={this.readonly}
            action={async (ctx) => {
              console.log(ctx.event);
              await new Promise((resolve) => setTimeout(resolve, 3000));
            }}
            onSubmit={(form, ev) => {
              console.log('onSubmit', form);
              // form.lock(async (ctx) => {
              //   await new Promise((resolve) => setTimeout(resolve, 3000));
              // });
            }}
            v-slots={{
              default: (form) => {
                return (
                  <>
                    <VTextarea
                      label="VTextarea"
                      required
                      variant="outlined"
                      // rows="5"
                      autosize
                      // autosize={{
                      //   maxRows: 5,
                      // }}
                      maxlength="50"
                      counter
                      limit
                      v-model={this.textarea}
                    />
                    <VSelect
                      label="VSelect"
                      required
                      variant="filled"
                      v-model={this.select}
                      name="select1"
                      style={{ width: '240px' }}>
                      <VOption>選択してください</VOption>
                      <VOption value="1">Value1</VOption>
                      <VOption value="2">Value2</VOption>
                      <VOption value="3">Value3</VOption>
                    </VSelect>
                    <div>{JSON.stringify(this.select)}</div>

                    <VSwitch v-model={this.switch} name="xx-2">
                      Switch
                    </VSwitch>

                    <div>
                      <VCheckbox
                        name="xxx"
                        value="1"
                        v-model={this.check}
                        required>
                        チェックボックス
                      </VCheckbox>
                      <div>{JSON.stringify(this.check)}</div>
                    </div>

                    <VTextField
                      label="Flat"
                      hint={() => 'This is flat.'}
                      required
                      placeholder="Placeholder"
                      endAdornment={
                        <VIcon
                          name="stamper-off"
                          onClick={(ev) => {
                            console.log('ev', ev);
                          }}
                        />
                      }
                    />
                    <VTextField
                      label="Filled"
                      hint={() => 'This is filled.'}
                      required
                      startAdornment="https://"
                      endAdornment={<VIcon name="bell" />}
                      variant="filled"></VTextField>
                    <VTextField
                      label="Outlined"
                      hint={() => 'This is outlined.'}
                      required
                      counter
                      maxlength="10"
                      variant="outlined"></VTextField>

                    <VTextField
                      label="ラベル"
                      hint={() => 'ヒント'}
                      name="fuga"
                      v-model={this.text}
                      required
                      mask={'+{7}(000)000-00-00'}>
                      テキスト
                    </VTextField>
                    <div>{JSON.stringify(this.text)}</div>

                    <VCheckboxGroup
                      label="Checkbox Group"
                      v-model={this.checkGroup}
                      items={[
                        {
                          value: '1',
                          label: 'Value1',
                        },
                        {
                          value: '2',
                          label: 'Value2',
                        },
                        {
                          value: '3',
                          label: (hoge) => {
                            return `Value3(${hoge.valid})`;
                          },
                          disabled: true,
                        },
                      ]}
                      required>
                      {/* <VCheckbox value="1">Value1</VCheckbox>
          <VCheckbox value="2">Value2</VCheckbox>
          <VCheckbox value="3">Value3</VCheckbox>
          <VCheckbox value="4">
            長いvalueが入ります。長いvalueが入ります。長いvalueが入ります。長いvalueが入ります。長いvalueが入ります。長いvalueが入ります。長いvalueが入ります。長いvalueが入ります。長いvalueが入ります。
          </VCheckbox> */}
                    </VCheckboxGroup>
                    <div>{JSON.stringify(this.checkGroup)}</div>

                    <VRadioGroup
                      label="Radio Group"
                      v-model={this.radioGroup}
                      required
                      name="radio"
                      items={[
                        {
                          value: '1',
                          label: 'Value1',
                        },
                        {
                          value: '2',
                          label: 'Value2',
                        },
                        {
                          value: '3',
                          label: (hoge) => {
                            return `Value3(${hoge.valid})`;
                          },
                          disabled: true,
                        },
                      ]}></VRadioGroup>
                    <div>{JSON.stringify(this.radioGroup)}</div>

                    <VSwitchGroup
                      label="Checkbox Group"
                      v-model={this.switchGroup}
                      multiple
                      items={[
                        {
                          value: '1',
                          label: 'Value1',
                        },
                        {
                          value: '2',
                          label: 'Value2',
                          // disabled: true,
                        },
                        {
                          value: '3',
                          label: (hoge) => {
                            return `Value3(${hoge.valid})`;
                          },
                          disabled: true,
                        },
                      ]}
                      required>
                      {/* <VCheckbox value="1">Value1</VCheckbox>
          <VCheckbox value="2">Value2</VCheckbox>
          <VCheckbox value="3">Value3</VCheckbox>
          <VCheckbox value="4">
            長いvalueが入ります。長いvalueが入ります。長いvalueが入ります。長いvalueが入ります。長いvalueが入ります。長いvalueが入ります。長いvalueが入ります。長いvalueが入ります。長いvalueが入ります。
          </VCheckbox> */}
                    </VSwitchGroup>
                    <div>{JSON.stringify(this.switchGroup)}</div>

                    <VButton type="submit" disabled={form.isDisabled}>
                      送信
                    </VButton>
                  </>
                );
              },
            }}></VForm>

          <hr />
          <RouterLink to="/">Home</RouterLink>
          <RouterLink to="/page2">page2</RouterLink>
        </div>
      </div>
    );
  },
});

export default component;
