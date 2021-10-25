import './Home.scss';
import { defineComponent, ref } from 'vue';
import {
  CONTROL_SIZES,
  ControlSize,
  VSwitch,
  VSelect,
  VOption,
  VTextField,
  VButton,
  VTextarea,
} from '@fastkit/vui';

const component = defineComponent({
  name: 'Page3View',
  setup() {
    return {
      size: ref<ControlSize>('md'),
      disabled: ref(false),
      select: ref([]),
      switch: ref(false),
      text: ref(''),
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
            v-model={this.size}
            items={CONTROL_SIZES.map((size) => ({
              value: size,
              label: size,
            }))}
          />

          <VSwitch name="xx-1" v-model={this.disabled}>
            disabled
          </VSwitch>
        </div>

        <div style={{ flex: '1 1 100%' }}>
          <VSwitch v-model={this.switch}>test</VSwitch>
          <VTextField
            size={this.size}
            disabled={this.disabled}
            v-model={this.text}></VTextField>
          <VButton>hello</VButton>
          <VSelect
            label="VSelect"
            required
            multiple
            placeholder="選択してください"
            variant="filled"
            v-model={this.select}
            size={this.size}
            disabled={this.disabled}
            style={{ width: '240px' }}>
            <VOption>選択してください</VOption>
            <VOption value="1">Value1</VOption>
            <VOption value="2">
              長いテキストが入ります。長いテキストが入ります。長いテキストが入ります。長いテキストが入ります。
              {/* <span
                style={{
                  display: 'block',
                }}>
                <span>Value2</span>
                <span style={{ color: '#f00' }}>だったり</span>
                <span>しますよーーーーーーーーーーーー</span>
              </span> */}
            </VOption>
            <VOption value="3">Value3</VOption>
          </VSelect>
          <div>{JSON.stringify(this.select)}</div>
          <VTextarea
            size={this.size}
            disabled={this.disabled}
            label="VTextarea"
            required
            rows="5"
            variant="outlined"
            autosize
          />
        </div>
      </div>
    );
  },
});

export default component;
