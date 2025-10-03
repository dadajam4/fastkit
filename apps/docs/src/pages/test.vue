<script lang="ts" setup>
import { ref, useTemplateRef } from 'vue';

import {
  VForm,
  VSwitch,
  VButton,
  VDisabledReason,
  VTextField,
  VCheckbox,
  VCheckboxGroup,
  useVui,
} from '@fastkit/vui';

const disabled = ref(false);

const vui = useVui();
const form = useTemplateRef('form');
const input1 = ref('');
const input2 = ref('');

const handleSubmit = () => {
  vui.snackbar('submit !!!');
};

const handleReset = async () => {
  input1.value = '';
  input2.value = '';
  form.value?.control.resetValidates();
};
</script>

<template>
  <div style="padding: 20px">
    <div>
      <VForm ref="form" :action="handleSubmit">
        <VTextField
          v-model="input1"
          label="Text1"
          finalizers="trim"
          required
          validate-timing="always"
          :validation-deps="() => input2" />
        <VTextField
          v-model="input2"
          label="Text2"
          finalizers="trim"
          required
          validate-timing="always"
          :validation-deps="() => input1" />
        <div>
          <VButton @click="handleReset">reset</VButton>
          <VButton type="submit">submit</VButton>
        </div>
      </VForm>
    </div>

    <VSwitch v-model="disabled">disabled</VSwitch>
    <div style="max-width: 320px; margin-top: 32px">
      <VButton :disabled="disabled" disabled-reason="非活性理由です">
        通常ボタン
      </VButton>
      <VButton
        :disabled="disabled"
        href="https://www.google.com/"
        disabled-reason="非活性理由です">
        リンクボタン
      </VButton>
      <VDisabledReason reason="非活性理由です">
        <VButton :disabled="disabled">ボタン3</VButton>
      </VDisabledReason>

      <VDisabledReason reason="非活性理由です">
        <VTextField label="ラベル" :disabled="disabled" />
      </VDisabledReason>

      <VDisabledReason reason="非活性理由です">
        <VCheckbox :disabled="disabled">単一チェックボックス</VCheckbox>
      </VDisabledReason>

      <VDisabledReason reason="非活性理由です">
        <VCheckboxGroup
          label="チェックボックスグループ"
          :disabled="disabled"
          :items="[
            {
              label: '項目1',
              value: 1,
            },
            {
              label: '項目2',
              value: 2,
            },
          ]" />
      </VDisabledReason>
    </div>
  </div>
</template>
