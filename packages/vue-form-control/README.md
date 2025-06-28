# @fastkit/vue-form-control

Vueアプリケーションのためのフォームの基礎実装ライブラリです。バリデーション、マスク入力、セレクター機能などを提供します。

## 特徴

- **Composition API完全対応**: Vue 3の最新機能をフル活用
- **型安全性**: TypeScript完全対応で型安全なフォーム開発
- **バリデーション統合**: @fastkit/rulesとの連携による包括的検証
- **IMask統合**: 高度なマスク入力機能（imaskライブラリ連携）
- **セレクター機能**: ラジオボタン、チェックボックス、セレクトボックス統合
- **リアルタイム検証**: 入力中のリアルタイムバリデーション
- **カスタマイズ可能**: 柔軟なコントロール拡張とカスタマイズ

## インストール

```bash
npm install @fastkit/vue-form-control
# or
pnpm add @fastkit/vue-form-control
```

## 基本的な使い方

### プラグイン設定

```typescript
import { createApp } from 'vue';
import { installVueFormPlugin } from '@fastkit/vue-form-control';

const app = createApp(App);

// フォームプラグインをインストール
installVueFormPlugin(app, {
  // オプション設定
});
```

### シンプルなフォーム

```vue
<template>
  <form @submit="form.submit">
    <!-- テキスト入力 -->
    <input 
      v-model="form.name.value"
      :class="{ error: form.name.invalid }"
      @blur="form.name.validate()"
    />
    <div v-if="form.name.invalid">{{ form.name.errorMessage }}</div>

    <!-- 数値入力 -->
    <input 
      type="number"
      v-model.number="form.age.value"
      :class="{ error: form.age.invalid }"
    />

    <!-- セレクト -->
    <select v-model="form.category.value">
      <option value="">選択してください</option>
      <option value="a">カテゴリA</option>
      <option value="b">カテゴリB</option>
    </select>

    <button type="submit" :disabled="form.invalid">送信</button>
  </form>
</template>

<script setup lang="ts">
import { useForm } from '@fastkit/vue-form-control';
import { required, minLength, between } from '@fastkit/rules';

// フォーム定義
const form = useForm({
  name: {
    value: '',
    rules: [required(), minLength(2)]
  },
  age: {
    value: 0,
    rules: [required(), between(0, 120)]
  },
  category: {
    value: '',
    rules: [required()]
  }
}, {
  onSubmit: async (values) => {
    console.log('Submit:', values);
    // API送信処理
    await api.submit(values);
  }
});
</script>
```

### テキスト入力コントロール

```vue
<template>
  <div>
    <!-- 基本的なテキスト入力 -->
    <input 
      v-model="textControl.value"
      @input="textControl.handleInput"
      @blur="textControl.handleBlur"
    />
    
    <!-- マスク入力 -->
    <input 
      v-model="phoneControl.value"
      v-imask="phoneControl.maskOptions"
      @input="phoneControl.handleMaskInput"
    />
    
    <!-- バリデーション表示 -->
    <div v-if="textControl.invalid" class="error">
      {{ textControl.errorMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useTextInputControl } from '@fastkit/vue-form-control';
import { required, pattern } from '@fastkit/rules';

// 基本テキスト入力
const textControl = useTextInputControl({
  value: '',
  rules: [required(), pattern(/^[a-zA-Z]+$/)]
});

// 電話番号マスク入力
const phoneControl = useTextInputControl({
  value: '',
  mask: '000-0000-0000',
  rules: [required()]
});
</script>
```

### セレクターコントロール

```vue
<template>
  <div>
    <!-- ラジオボタン -->
    <div v-for="item in radioItems" :key="item.value">
      <label>
        <input 
          type="radio"
          :value="item.value"
          v-model="radioControl.value"
          @change="radioControl.handleChange"
        />
        {{ item.label }}
      </label>
    </div>

    <!-- チェックボックス（複数選択） -->
    <div v-for="item in checkboxItems" :key="item.value">
      <label>
        <input 
          type="checkbox"
          :value="item.value"
          v-model="checkboxControl.value"
          @change="checkboxControl.handleChange"
        />
        {{ item.label }}
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSelectorControl } from '@fastkit/vue-form-control';
import { required } from '@fastkit/rules';

// ラジオボタン制御
const radioControl = useSelectorControl({
  value: '',
  items: [
    { value: 'option1', label: 'オプション1' },
    { value: 'option2', label: 'オプション2' },
    { value: 'option3', label: 'オプション3' }
  ],
  rules: [required()]
});

// チェックボックス制御（複数選択）
const checkboxControl = useSelectorControl({
  value: [] as string[],
  multiple: true,
  items: [
    { value: 'item1', label: 'アイテム1' },
    { value: 'item2', label: 'アイテム2' },
    { value: 'item3', label: 'アイテム3' }
  ]
});
</script>
```

## 高度な使用例

### カスタムバリデーション

```typescript
import { useTextInputControl } from '@fastkit/vue-form-control';
import { required } from '@fastkit/rules';

// カスタムバリデーション関数
const uniqueEmail = (value: string) => {
  return new Promise((resolve) => {
    // API呼び出しでメール重複チェック
    api.checkEmailUnique(value).then(isUnique => {
      resolve(isUnique ? true : 'このメールアドレスは既に使用されています');
    });
  });
};

const emailControl = useTextInputControl({
  value: '',
  rules: [
    required(),
    uniqueEmail  // 非同期バリデーション
  ],
  validateTiming: ['blur', 'change']  // バリデーションタイミング
});
```

### IMaskによるマスク入力

```typescript
import { useTextInputControl } from '@fastkit/vue-form-control';
import IMask from 'imask';

// 日付マスク
const dateControl = useTextInputControl({
  value: '',
  mask: {
    mask: Date,
    pattern: 'YYYY-MM-DD',
    format: (date: Date) => date.toISOString().slice(0, 10),
    parse: (str: string) => new Date(str)
  }
});

// 通貨マスク
const currencyControl = useTextInputControl({
  value: '',
  mask: {
    mask: Number,
    scale: 2,
    signed: false,
    thousandsSeparator: ',',
    padFractionalZeros: true,
    radix: '.'
  }
});

// 郵便番号マスク
const zipControl = useTextInputControl({
  value: '',
  mask: '000-0000'
});
```

### フォームグループ

```vue
<script setup lang="ts">
import { useFormGroup } from '@fastkit/vue-form-control';
import { required, email } from '@fastkit/rules';

// ネストしたフォーム構造
const userForm = useFormGroup({
  personal: useFormGroup({
    firstName: useTextInputControl({
      value: '',
      rules: [required()]
    }),
    lastName: useTextInputControl({
      value: '',
      rules: [required()]
    }),
    email: useTextInputControl({
      value: '',
      rules: [required(), email()]
    })
  }),
  
  preferences: useFormGroup({
    newsletter: useSelectorControl({
      value: false,
      items: [
        { value: true, label: '購読する' },
        { value: false, label: '購読しない' }
      ]
    }),
    categories: useSelectorControl({
      value: [] as string[],
      multiple: true,
      items: [
        { value: 'tech', label: 'テクノロジー' },
        { value: 'business', label: 'ビジネス' },
        { value: 'lifestyle', label: 'ライフスタイル' }
      ]
    })
  })
});

// フォーム全体の値取得
const formValues = computed(() => userForm.value);

// フォーム全体のバリデーション
const isFormValid = computed(() => userForm.valid);
</script>
```

## API

### useForm

フォーム全体を管理するcomposable。

```typescript
const form = useForm(fields, options);
```

**パラメーター:**
- `fields`: フィールド定義オブジェクト
- `options`: フォームオプション

**戻り値:**
- フォームコントロールインスタンス

### useTextInputControl

テキスト入力制御用composable。

```typescript
const control = useTextInputControl({
  value: string,
  rules?: ValidationRule[],
  mask?: IMaskOptions,
  finalizers?: TextFinalizer[],
  validateTiming?: ValidateTiming[]
});
```

### useSelectorControl

セレクター制御用composable。

```typescript
const control = useSelectorControl({
  value: any,
  items: SelectorItem[],
  multiple?: boolean,
  rules?: ValidationRule[]
});
```

### useFormGroup

フォームグループ制御用composable。

```typescript
const group = useFormGroup(controls);
```

## バリデーション

### 基本ルール（@fastkit/rules連携）

```typescript
import { 
  required, 
  email, 
  minLength, 
  maxLength, 
  pattern,
  between 
} from '@fastkit/rules';

const control = useTextInputControl({
  value: '',
  rules: [
    required(),
    email(),
    minLength(5),
    maxLength(100),
    pattern(/^[a-zA-Z0-9]+$/),
    between(1, 999)
  ]
});
```

### カスタムルール

```typescript
const customRule = (value: any) => {
  if (value !== 'expected') {
    return '期待される値ではありません';
  }
  return true;
};

const control = useTextInputControl({
  value: '',
  rules: [required(), customRule]
});
```

## IMask統合

### 基本マスク

```typescript
// 電話番号
mask: '000-0000-0000'

// 郵便番号
mask: '000-0000'

// クレジットカード
mask: '0000 0000 0000 0000'
```

### 高度なマスク

```typescript
// 日付
mask: {
  mask: Date,
  pattern: 'YYYY-MM-DD',
  blocks: {
    YYYY: { mask: '0000' },
    MM: { mask: '00' },
    DD: { mask: '00' }
  }
}

// 数値
mask: {
  mask: Number,
  scale: 2,
  thousandsSeparator: ',',
  padFractionalZeros: true
}
```

## テキストファイナライザー

```typescript
import { 
  useTextInputControl,
  BUILTIN_TEXT_FINALIZERS 
} from '@fastkit/vue-form-control';

const control = useTextInputControl({
  value: '',
  finalizers: [
    BUILTIN_TEXT_FINALIZERS.trim,      // 前後空白除去
    BUILTIN_TEXT_FINALIZERS.upper,     // 大文字変換
    BUILTIN_TEXT_FINALIZERS.removeSpace, // 全空白除去
    // カスタムファイナライザー
    (value) => value.replace(/[^\w]/g, '')
  ]
});
```

## 依存関係

- `vue`: ^3.4.0 (Peer Dependency)
- `@fastkit/rules`: バリデーションルール
- `@fastkit/helpers`: ヘルパーユーティリティ
- `@fastkit/vue-utils`: Vue用ユーティリティ
- `imask`: マスク入力ライブラリ

## ドキュメント

詳細なドキュメントは[こちら](https://dadajam4.github.io/fastkit/vue-form-control/)をご覧ください。

## ライセンス

MIT
