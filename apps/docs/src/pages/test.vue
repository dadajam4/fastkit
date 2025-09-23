<script lang="ts" setup>
import { ref } from 'vue';

import {
  VSwitch,
  VButton,
  VDisabledReason,
  VTextField,
  VCheckbox,
  VCheckboxGroup,
} from '@fastkit/vui';

const disabled = ref(false);
</script>

<template>
  <div style="padding: 20px">
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
