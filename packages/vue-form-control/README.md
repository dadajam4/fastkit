# @fastkit/vue-form-control

Vueアプリケーションのためのフォームの基礎実装ライブラリです。バリデーション、マスク入力、セレクター機能などを提供します。

## 特徴

- **Composition API完全対応**: Vue 3の最新機能をフル活用
- **型安全性**: TypeScript完全対応で型安全なフォーム開発
- **バリデーション統合**: @fastkit/rulesとの連携による包括的検証
- **IMask統合**: 高度なマスク入力機能（imaskライブラリ連携）
- **セレクター機能**: ラジオボタン、チェックボックス、セレクトボックス統合
- **自動サイズ調整**: VTextareaAutosizeによる動的テキストエリア
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
import { useTextInputNodeControl } from '@fastkit/vue-form-control';
import { required, pattern } from '@fastkit/rules';

// 基本テキスト入力
const textControl = useTextInputNodeControl({
  value: '',
  rules: [required(), pattern(/^[a-zA-Z]+$/)]
});

// 電話番号マスク入力
const phoneControl = useTextInputNodeControl({
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
import { useFormSelectorControl } from '@fastkit/vue-form-control';
import { required } from '@fastkit/rules';

// ラジオボタン制御
const radioControl = useFormSelectorControl({
  value: '',
  items: [
    { value: 'option1', label: 'オプション1' },
    { value: 'option2', label: 'オプション2' },
    { value: 'option3', label: 'オプション3' }
  ],
  rules: [required()]
});

// チェックボックス制御（複数選択）
const checkboxControl = useFormSelectorControl({
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

### VTextareaAutosizeコンポーネント

自動サイズ調整機能付きのテキストエリアコンポーネントです。内容に応じて高さが動的に調整されます。

```vue
<template>
  <div>
    <!-- 基本的な自動サイズ調整テキストエリア -->
    <VTextareaAutosize
      v-model="content"
      placeholder="メッセージを入力してください..."
      :min-rows="3"
      :max-rows="10"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
    />

    <!-- プロパティ付きの例 -->
    <VTextareaAutosize
      v-model="comment"
      name="comment"
      autocomplete="off"
      :maxlength="500"
      :readonly="isReadonly"
      :disabled="isDisabled"
      placeholder="コメントを入力..."
      :min-rows="2"
      :max-rows="8"
      class="custom-textarea"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { VTextareaAutosize } from '@fastkit/vue-form-control';

const content = ref('');
const comment = ref('');
const isReadonly = ref(false);
const isDisabled = ref(false);

const handleInput = (event: Event) => {
  console.log('入力されました:', (event.target as HTMLTextAreaElement).value);
};

const handleFocus = (event: FocusEvent) => {
  console.log('フォーカスされました');
};

const handleBlur = (event: FocusEvent) => {
  console.log('フォーカスが外れました');
};
</script>

<style scoped>
.custom-textarea {
  width: 100%;
  padding: 12px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.5;
  resize: none;
  transition: border-color 0.2s ease;
}

.custom-textarea:focus {
  border-color: #007bff;
  outline: none;
}
</style>
```

#### VTextareaAutosizeの高度な使用例

```vue
<template>
  <div>
    <!-- チャットメッセージ入力 -->
    <div class="chat-input-container">
      <VTextareaAutosize
        ref="chatInput"
        v-model="message"
        placeholder="メッセージを入力... (Shift+Enterで改行、Enterで送信)"
        :min-rows="1"
        :max-rows="5"
        class="chat-input"
        @keydown="handleKeydown"
        @input="handleInput"
      />
      <button 
        :disabled="!message.trim()"
        @click="sendMessage"
        class="send-button"
      >
        送信
      </button>
    </div>

    <!-- 動的なフォームフィールド -->
    <div class="form-field">
      <label for="description">説明文</label>
      <VTextareaAutosize
        id="description"
        v-model="description"
        :min-rows="2"
        :max-rows="15"
        :maxlength="1000"
        placeholder="商品の詳細説明を入力してください..."
        class="description-input"
      />
      <div class="char-count">
        {{ description.length }}/1000文字
      </div>
    </div>

    <!-- JSONエディター風 -->
    <div class="json-editor">
      <label>JSON設定</label>
      <VTextareaAutosize
        v-model="jsonConfig"
        :min-rows="5"
        :max-rows="20"
        placeholder="JSON形式で設定を入力..."
        class="json-input"
        autocomplete="off"
        spellcheck="false"
      />
      <div v-if="jsonError" class="error">
        {{ jsonError }}
      </div>
      <div v-else class="success">
        ✓ 有効なJSON形式です
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { VTextareaAutosize, type VTextareaAutosizeRef } from '@fastkit/vue-form-control';

const chatInput = ref<VTextareaAutosizeRef>();
const message = ref('');
const description = ref('');
const jsonConfig = ref('{\n  "theme": "dark",\n  "autoSave": true\n}');

// JSON バリデーション
const jsonError = computed(() => {
  if (!jsonConfig.value.trim()) return null;
  
  try {
    JSON.parse(jsonConfig.value);
    return null;
  } catch (error) {
    return `JSON構文エラー: ${(error as Error).message}`;
  }
});

// チャット入力のキーボードハンドリング
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendMessage();
  }
};

const handleInput = (event: Event) => {
  // 入力時の処理（例：入力中表示の更新など）
  console.log('入力中...');
};

const sendMessage = () => {
  if (!message.value.trim()) return;
  
  // メッセージ送信処理
  console.log('メッセージ送信:', message.value);
  
  // 入力欄をクリア
  message.value = '';
  
  // フォーカスを戻す
  chatInput.value?.focus();
};

// JSON設定の自動フォーマット（オプション）
const formatJson = () => {
  try {
    const parsed = JSON.parse(jsonConfig.value);
    jsonConfig.value = JSON.stringify(parsed, null, 2);
  } catch (error) {
    // エラー時は何もしない
  }
};

// 説明文の文字数監視
watch(description, (newValue) => {
  if (newValue.length > 1000) {
    description.value = newValue.substring(0, 1000);
  }
});
</script>

<style scoped>
.chat-input-container {
  display: flex;
  gap: 8px;
  align-items: flex-end;
  padding: 16px;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  background: #f8f9fa;
}

.chat-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 6px;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.4;
  resize: none;
}

.send-button {
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}

.send-button:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.form-field {
  margin-bottom: 16px;
}

.form-field label {
  display: block;
  margin-bottom: 4px;
  font-weight: 500;
}

.description-input {
  width: 100%;
  padding: 12px;
  border: 2px solid #e1e5e9;
  border-radius: 6px;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.5;
  resize: none;
}

.char-count {
  text-align: right;
  font-size: 12px;
  color: #6c757d;
  margin-top: 4px;
}

.json-editor {
  margin-top: 24px;
}

.json-editor label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.json-input {
  width: 100%;
  padding: 12px;
  border: 2px solid #e1e5e9;
  border-radius: 6px;
  font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
  font-size: 13px;
  line-height: 1.4;
  resize: none;
  background: #f8f9fa;
}

.error {
  color: #dc3545;
  font-size: 12px;
  margin-top: 4px;
}

.success {
  color: #28a745;
  font-size: 12px;
  margin-top: 4px;
}
</style>
```

## 高度な使用例

### カスタムバリデーション

```typescript
import { useTextInputNodeControl } from '@fastkit/vue-form-control';
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

const emailControl = useTextInputNodeControl({
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
import { useTextInputNodeControl } from '@fastkit/vue-form-control';
import IMask from 'imask';

// 日付マスク
const dateControl = useTextInputNodeControl({
  value: '',
  mask: {
    mask: Date,
    pattern: 'YYYY-MM-DD',
    format: (date: Date) => date.toISOString().slice(0, 10),
    parse: (str: string) => new Date(str)
  }
});

// 通貨マスク
const currencyControl = useTextInputNodeControl({
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
const zipControl = useTextInputNodeControl({
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
    firstName: useTextInputNodeControl({
      value: '',
      rules: [required()]
    }),
    lastName: useTextInputNodeControl({
      value: '',
      rules: [required()]
    }),
    email: useTextInputNodeControl({
      value: '',
      rules: [required(), email()]
    })
  }),
  
  preferences: useFormGroup({
    newsletter: useFormSelectorControl({
      value: false,
      items: [
        { value: true, label: '購読する' },
        { value: false, label: '購読しない' }
      ]
    }),
    categories: useFormSelectorControl({
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

### useTextInputNodeControl

テキスト入力制御用composable。

```typescript
const control = useTextInputNodeControl({
  value: string,
  rules?: ValidationRule[],
  mask?: IMaskOptions,
  finalizers?: TextFinalizer[],
  validateTiming?: ValidateTiming[]
});
```

### useFormSelectorControl

セレクター制御用composable。

```typescript
const control = useFormSelectorControl({
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

### VTextareaAutosize

自動サイズ調整機能付きテキストエリアコンポーネント。

```typescript
interface VTextareaAutosizeRef {
  value: string;
  focus(opts?: FocusOptions): void;
  blur(): void;
}

// プロパティ
interface VTextareaAutosizeProps {
  modelValue?: string;           // v-model値
  minRows?: number | string;     // 最小行数（デフォルト: 1）
  maxRows?: number | string;     // 最大行数
  autocomplete?: string;         // オートコンプリート
  autofocus?: boolean;           // オートフォーカス
  disabled?: boolean;            // 無効状態
  readonly?: boolean;            // 読み取り専用
  required?: boolean;            // 必須フィールド
  name?: string;                 // フィールド名
  placeholder?: string;          // プレースホルダー
  maxlength?: number | string;   // 最大文字数
  minlength?: number | string;   // 最小文字数
  form?: string;                 // 関連するフォームID
}

// イベント
interface VTextareaAutosizeEmits {
  'update:modelValue': (value: string) => void;  // v-model更新
  input: (event: Event) => void;                 // 入力イベント
  focus: (event: FocusEvent) => void;            // フォーカスイベント
  blur: (event: FocusEvent) => void;             // ブラーイベント
}
```

**機能:**
- 内容に応じた自動的な高さ調整
- 最小・最大行数の制限
- ResizeObserverによるレスポンシブ対応
- デバウンス処理による高パフォーマンス
- 無限レンダリング防止機能
- 標準的なHTMLテキストエリア属性サポート

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

const control = useTextInputNodeControl({
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

const control = useTextInputNodeControl({
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
  useTextInputNodeControl,
  BUILTIN_TEXT_FINALIZERS 
} from '@fastkit/vue-form-control';

const control = useTextInputNodeControl({
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
