# @fastkit/rules

🌐 [English](https://github.com/dadajam4/fastkit/blob/main/packages/rules/README.md) | 日本語

サーバーとブラウザの両方で動作するユニバーサルなバリデーションライブラリです。TypeScriptで構築され、型安全性と柔軟性を重視したバリデーションシステムを提供します。

## 特徴

- **ユニバーサル対応**: サーバーサイド・クライアントサイド共通のコード
- **TypeScript完全対応**: 厳密な型安全性とIntelliSenseサポート
- **非同期バリデーション**: Promiseベースの非同期処理対応
- **ネストバリデーション**: 深いオブジェクト構造の検証
- **カスタムルール**: 柔軟なカスタムバリデーションルール作成
- **Vue.js統合**: @fastkit/vue-form-controlとのシームレス連携
- **豊富な組み込みルール**: 30以上の実用的なバリデーションルール
- **詳細なエラー情報**: 構造化されたエラーレポート
- **国際化対応**: 多言語エラーメッセージサポート
- **軽量設計**: 最小限の依存関係

## インストール

```bash
npm install @fastkit/rules
# or
pnpm add @fastkit/rules
```

## 基本的な使い方

### シンプルなバリデーション

```typescript
import { validate, required, email, maxLength } from '@fastkit/rules';

// 単一ルールでの検証
const result1 = await validate('', required);
console.log(result1); // ValidationError オブジェクト

const result2 = await validate('test@example.com', email);
console.log(result2); // null (成功)

// 複数ルールでの検証
const result3 = await validate('user@example.com', [
  required,
  email,
  maxLength(50)
]);
console.log(result3); // null (全て成功) または ValidationError
```

### Vue.js フォームとの統合

```vue
<template>
  <form @submit.prevent="handleSubmit">
    <VTextField
      v-model="form.email.value"
      label="メールアドレス"
      :rules="[required, email]"
      :invalid="form.email.invalid"
      :error-message="form.email.errorMessage"
    />

    <VTextField
      v-model="form.password.value"
      label="パスワード"
      type="password"
      :rules="[required, minLength(8)]"
      :invalid="form.password.invalid"
      :error-message="form.password.errorMessage"
    />

    <VButton
      type="submit"
      :disabled="form.invalid"
      color="primary"
    >
      ログイン
    </VButton>
  </form>
</template>

<script setup lang="ts">
import { useForm } from '@fastkit/vue-form-control';
import { required, email, minLength } from '@fastkit/rules';

const form = useForm({
  email: {
    value: '',
    rules: [required, email]
  },
  password: {
    value: '',
    rules: [required, minLength(8)]
  }
}, {
  onSubmit: async (values) => {
    console.log('送信データ:', values);
    // API呼び出し処理
  }
});
</script>
```

## 組み込みバリデーションルール

### 基本ルール

#### required - 必須チェック

```typescript
import { required } from '@fastkit/rules';

// 空でない値が必要
await validate('', required); // エラー
await validate('text', required); // OK
await validate(0, required); // OK
await validate(false, required); // OK
await validate([], required); // エラー (空配列)
await validate([1], required); // OK
```

#### email - メール形式チェック

```typescript
import { email } from '@fastkit/rules';

await validate('user@example.com', email); // OK
await validate('invalid-email', email); // エラー

// 複数メール対応
await validate('user1@example.com,user2@example.com', email); // OK
```

#### pattern - 正規表現チェック

```typescript
import { pattern } from '@fastkit/rules';

const phoneRule = pattern(/^\d{3}-\d{4}-\d{4}$/);
await validate('090-1234-5678', phoneRule); // OK
await validate('invalid-phone', phoneRule); // エラー

// カスタムメッセージ付き
const customPattern = pattern({
  pattern: /^[A-Z]+$/,
  message: '大文字のアルファベットのみ使用できます'
});
```

### 文字列・数値ルール

#### length - 長さチェック

```typescript
import { length, minLength, maxLength } from '@fastkit/rules';

// 正確な長さ
await validate('hello', length(5)); // OK
await validate('hello', length(3)); // エラー

// 最小長
await validate('abc', minLength(2)); // OK
await validate('a', minLength(2)); // エラー

// 最大長
await validate('hello', maxLength(10)); // OK
await validate('very long text here', maxLength(10)); // エラー

// 範囲指定
await validate('test', length({ min: 2, max: 6 })); // OK
```

#### numeric - 数値チェック

```typescript
import { numeric, between, greaterThan, lessThan } from '@fastkit/rules';

// 数値形式チェック
await validate('123', numeric); // OK
await validate('123.45', numeric); // OK
await validate('abc', numeric); // エラー

// 範囲チェック
await validate(25, between({ min: 18, max: 65 })); // OK
await validate(10, between({ min: 18, max: 65 })); // エラー

// 比較
await validate(10, greaterThan(5)); // OK
await validate(3, greaterThan(5)); // エラー
await validate(3, lessThan(5)); // OK
```

### 特殊な形式チェック

#### url - URL形式チェック

```typescript
import { url } from '@fastkit/rules';

await validate('https://example.com', url); // OK
await validate('http://localhost:3000', url); // OK
await validate('invalid-url', url); // エラー
```

#### date - 日付チェック

```typescript
import { date } from '@fastkit/rules';

await validate('2023-12-25', date); // OK
await validate('2023/12/25', date); // OK
await validate(new Date(), date); // OK
await validate('invalid-date', date); // エラー
```

#### alphaSpaces - 英字＋スペースチェック

```typescript
import { alphaSpaces } from '@fastkit/rules';

await validate('John Doe', alphaSpaces); // OK
await validate('John123', alphaSpaces); // エラー
```

#### kana - カナ文字チェック

```typescript
import { kana } from '@fastkit/rules';

await validate('タナカタロウ', kana); // OK (カタカナ)
await validate('たなかたろう', kana); // OK (ひらがな)
await validate('田中太郎', kana); // エラー (漢字)
```

## ネストバリデーション

### 配列バリデーション

```typescript
import { each, required, maxLength } from '@fastkit/rules';

// 配列の各要素をバリデーション
const arrayRule = each({
  rules: [required, maxLength(10)],
  skipIfEmpty: true // 空配列はスキップ
});

await validate(['hello', 'world'], arrayRule); // OK
await validate(['hello', ''], arrayRule); // エラー (空要素)
await validate(['hello', 'very long text'], arrayRule); // エラー (長すぎる)

// インデックス付きエラー情報取得
const result = await validate(['', 'valid'], arrayRule);
if (result) {
  console.log(result.children[0].path); // 0 (エラーのインデックス)
}
```

### オブジェクトバリデーション

```typescript
import { fields, required, email, minLength } from '@fastkit/rules';

interface User {
  name: string;
  email: string;
  profile: {
    bio: string;
    age: number;
  };
}

// オブジェクトフィールドバリデーション
const userRule = fields<User>({
  rules: {
    name: [required, maxLength(50)],
    email: [required, email],
    profile: fields({
      rules: {
        bio: maxLength(200),
        age: [required, between({ min: 0, max: 120 })]
      }
    })
  }
});

const userData = {
  name: '田中太郎',
  email: 'tanaka@example.com',
  profile: {
    bio: 'エンジニアです',
    age: 30
  }
};

const result = await validate(userData, userRule);
// result は null (成功) または ネストしたエラー情報
```

## カスタムバリデーションルール

### 基本的なカスタムルール作成

```typescript
import { createRule } from '@fastkit/rules';

// シンプルなカスタムルール
const evenNumber = createRule({
  name: 'evenNumber',
  validate: (value) => {
    const num = Number(value);
    return !isNaN(num) && num % 2 === 0;
  },
  message: '偶数を入力してください'
});

await validate(4, evenNumber); // OK
await validate(3, evenNumber); // エラー

// 動的メッセージ
const minimumAge = createRule<{ age: number }>({
  name: 'minimumAge',
  validate: (value, constraints) => {
    const age = Number(value);
    return age >= constraints.age;
  },
  message: (value, { constraints }) =>
    `${constraints.age}歳以上である必要があります`,
  constraints: { age: 18 }
});

// 制約をカスタマイズして使用
const adultAge = minimumAge.fork({ constraints: { age: 20 } });
```

### 非同期バリデーション

```typescript
// 非同期APIを使ったバリデーション
const uniqueEmail = createRule({
  name: 'uniqueEmail',
  validate: async (value) => {
    if (!value) return true; // 空値は他のルールに任せる

    try {
      const response = await fetch(`/api/check-email?email=${value}`);
      const data = await response.json();
      return data.isUnique;
    } catch (error) {
      // ネットワークエラーは成功とみなす
      return true;
    }
  },
  message: 'このメールアドレスは既に使用されています'
});

// 使用例
const emailRules = [required, email, uniqueEmail];
await validate('user@example.com', emailRules);
```

### 関数型ルール

```typescript
// 簡単な関数型ルール
const notEmpty = (value: any) => {
  if (!value || (Array.isArray(value) && value.length === 0)) {
    return '空にできません';
  }
  return true;
};

// 条件付きルール
const conditionalRequired = (value: any, _constraints: any, context: any) => {
  // contextから他のフィールドの値を参照可能
  if (context.type === 'business' && !value) {
    return '企業の場合は必須です';
  }
  return true;
};
```

## 高度な使用例

### フォーム全体のバリデーション

```typescript
import { validate, fields, required, email, minLength, pattern } from '@fastkit/rules';

interface RegistrationForm {
  personal: {
    firstName: string;
    lastName: string;
    email: string;
  };
  account: {
    username: string;
    password: string;
    confirmPassword: string;
  };
  terms: boolean;
}

// パスワード確認ルール
const confirmPassword = createRule({
  name: 'confirmPassword',
  validate: (value, _constraints, context) => {
    return value === context.account.password;
  },
  message: 'パスワードが一致しません'
});

// フォーム全体のルール定義
const registrationRule = fields<RegistrationForm>({
  rules: {
    personal: fields({
      rules: {
        firstName: [required, maxLength(50)],
        lastName: [required, maxLength(50)],
        email: [required, email]
      }
    }),
    account: fields({
      rules: {
        username: [
          required,
          minLength(3),
          maxLength(20),
          pattern(/^[a-zA-Z0-9_]+$/)
        ],
        password: [required, minLength(8)],
        confirmPassword: [required, confirmPassword]
      }
    }),
    terms: (value) => value === true ? true : '利用規約に同意してください'
  }
});

// バリデーション実行
const formData: RegistrationForm = {
  personal: {
    firstName: '太郎',
    lastName: '田中',
    email: 'taro@example.com'
  },
  account: {
    username: 'taro123',
    password: 'password123',
    confirmPassword: 'password123'
  },
  terms: true
};

const errors = await validate(formData, registrationRule);
if (errors) {
  // エラーを階層構造で取得
  console.log('個人情報エラー:', errors.children?.personal);
  console.log('アカウント情報エラー:', errors.children?.account);
}
```

### 条件付きバリデーション

```typescript
import { validateIf, required, pattern } from '@fastkit/rules';

// 条件に応じてバリデーションを実行
const businessPhoneRule = validateIf(
  (value, _constraints, context) => context.accountType === 'business',
  [required, pattern(/^\d{2,4}-\d{2,4}-\d{4}$/)]
);

const formRule = fields({
  rules: {
    accountType: required,
    businessPhone: businessPhoneRule, // 企業の場合のみ必須
    personalEmail: validateIf(
      (value, _constraints, context) => context.accountType === 'personal',
      [required, email]
    )
  }
});
```

### バッチバリデーション

```typescript
// 複数の値を一括でバリデーション
const batchValidate = async (data: Record<string, any>, rules: Record<string, any[]>) => {
  const results: Record<string, any> = {};

  for (const [key, value] of Object.entries(data)) {
    if (rules[key]) {
      results[key] = await validate(value, rules[key]);
    }
  }

  return results;
};

// 使用例
const userData = {
  name: '田中太郎',
  email: 'invalid-email',
  age: 25
};

const userRules = {
  name: [required, maxLength(50)],
  email: [required, email],
  age: [required, between({ min: 0, max: 120 })]
};

const results = await batchValidate(userData, userRules);
console.log(results);
// {
//   name: null,           // 成功
//   email: ValidationError,  // エラー
//   age: null            // 成功
// }
```

### カスタムエラーメッセージプロバイダー

```typescript
// 国際化対応のメッセージプロバイダー
const createI18nRule = (baseRule: any, messages: Record<string, string>) => {
  return baseRule.fork({
    message: (value: any, { constraints }: any, context: any) => {
      const locale = context.locale || 'ja';
      return messages[locale] || messages['ja'];
    }
  });
};

// 多言語対応ルール
const requiredI18n = createI18nRule(required, {
  'ja': 'この項目は必須です',
  'en': 'This field is required',
  'ko': '이 필드는 필수입니다'
});

const emailI18n = createI18nRule(email, {
  'ja': '有効なメールアドレスを入力してください',
  'en': 'Please enter a valid email address',
  'ko': '유효한 이메일 주소를 입력하세요'
});
```

## Vue.js での実践的な使用例

### リアルタイムバリデーション

```vue
<template>
  <div class="registration-form">
    <h2>ユーザー登録</h2>

    <!-- 基本情報 -->
    <fieldset>
      <legend>基本情報</legend>

      <VTextField
        v-model="form.firstName.value"
        label="名前"
        :rules="nameRules"
        :invalid="form.firstName.invalid"
        :error-message="form.firstName.errorMessage"
        validate-on="blur"
      />

      <VTextField
        v-model="form.lastName.value"
        label="姓"
        :rules="nameRules"
        :invalid="form.lastName.invalid"
        :error-message="form.lastName.errorMessage"
        validate-on="blur"
      />

      <VTextField
        v-model="form.email.value"
        label="メールアドレス"
        type="email"
        :rules="emailRules"
        :invalid="form.email.invalid"
        :error-message="form.email.errorMessage"
        validate-on="change"
        :loading="form.email.validating"
      />
    </fieldset>

    <!-- アカウント情報 -->
    <fieldset>
      <legend>アカウント情報</legend>

      <VTextField
        v-model="form.username.value"
        label="ユーザー名"
        :rules="usernameRules"
        :invalid="form.username.invalid"
        :error-message="form.username.errorMessage"
        hint="3-20文字の英数字とアンダースコア"
      />

      <VTextField
        v-model="form.password.value"
        label="パスワード"
        type="password"
        :rules="passwordRules"
        :invalid="form.password.invalid"
        :error-message="form.password.errorMessage"
        hint="8文字以上"
      />

      <VTextField
        v-model="form.confirmPassword.value"
        label="パスワード確認"
        type="password"
        :rules="confirmPasswordRules"
        :invalid="form.confirmPassword.invalid"
        :error-message="form.confirmPassword.errorMessage"
      />
    </fieldset>

    <!-- 利用規約 -->
    <VCheckbox
      v-model="form.terms.value"
      :rules="[required]"
      :invalid="form.terms.invalid"
    >
      <a href="/terms" target="_blank">利用規約</a>に同意する
    </VCheckbox>

    <!-- 送信ボタン -->
    <VButton
      type="submit"
      color="primary"
      size="lg"
      :disabled="form.invalid || submitting"
      :loading="submitting"
      @click="handleSubmit"
    >
      登録する
    </VButton>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useForm } from '@fastkit/vue-form-control';
import {
  required, email, minLength, maxLength, pattern,
  createRule
} from '@fastkit/rules';

const submitting = ref(false);

// カスタムバリデーションルール
const uniqueEmail = createRule({
  name: 'uniqueEmail',
  validate: async (value) => {
    if (!value) return true;
    const response = await fetch(`/api/check-email?email=${value}`);
    const data = await response.json();
    return data.isUnique;
  },
  message: 'このメールアドレスは既に使用されています'
});

const uniqueUsername = createRule({
  name: 'uniqueUsername',
  validate: async (value) => {
    if (!value) return true;
    const response = await fetch(`/api/check-username?username=${value}`);
    const data = await response.json();
    return data.isUnique;
  },
  message: 'このユーザー名は既に使用されています'
});

// バリデーションルール定義
const nameRules = [required, maxLength(50)];
const emailRules = [required, email, uniqueEmail];
const usernameRules = [
  required,
  minLength(3),
  maxLength(20),
  pattern(/^[a-zA-Z0-9_]+$/),
  uniqueUsername
];
const passwordRules = [required, minLength(8)];

// フォーム定義
const form = useForm({
  firstName: { value: '', rules: nameRules },
  lastName: { value: '', rules: nameRules },
  email: { value: '', rules: emailRules },
  username: { value: '', rules: usernameRules },
  password: { value: '', rules: passwordRules },
  confirmPassword: {
    value: '',
    rules: [
      required,
      (value) => {
        if (value !== form.password.value) {
          return 'パスワードが一致しません';
        }
        return true;
      }
    ]
  },
  terms: { value: false, rules: [required] }
}, {
  onSubmit: async (values) => {
    submitting.value = true;
    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });

      if (response.ok) {
        // 登録成功
        alert('登録が完了しました');
      } else {
        // サーバーエラー
        alert('登録に失敗しました');
      }
    } finally {
      submitting.value = false;
    }
  }
});

// パスワード確認ルールを動的に更新
const confirmPasswordRules = computed(() => [
  required,
  (value: string) => {
    if (value !== form.password.value) {
      return 'パスワードが一致しません';
    }
    return true;
  }
]);

const handleSubmit = () => {
  form.submit();
};
</script>

<style scoped>
.registration-form {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
}

fieldset {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

legend {
  font-weight: bold;
  padding: 0 0.5rem;
}
</style>
```

## エラーハンドリング

### ValidationError構造

```typescript
interface ValidationError {
  $$symbol: 'ValidationError';
  name: string;           // ルール名
  message: string;        // エラーメッセージ
  value?: any;           // 検証失敗した値
  path?: string | number; // フィールドパス
  fullPath?: string;     // 完全なパス（ネスト含む）
  children?: ValidationError[]; // 子要素のエラー
  constraints?: any;     // ルールの制約
}

// エラー情報の活用例
const errors = await validate(formData, formRules);
if (errors) {
  // フィールド別エラー処理
  if (errors.children?.email) {
    console.log('メールエラー:', errors.children.email.message);
  }

  // 全エラーメッセージ取得
  const allErrors = collectAllErrors(errors);
  allErrors.forEach(error => {
    console.log(`${error.fullPath}: ${error.message}`);
  });
}

// エラー収集ヘルパー関数
function collectAllErrors(error: ValidationError): ValidationError[] {
  const errors = [error];
  if (error.children) {
    Object.values(error.children).forEach(childError => {
      if (childError) {
        errors.push(...collectAllErrors(childError));
      }
    });
  }
  return errors;
}
```

## パフォーマンス最適化

### バリデーション戦略

```typescript
// 早期終了戦略（最初のエラーで停止）
const result1 = await validate(value, rules); // デフォルト

// 全ルール実行戦略（全エラー収集）
const result2 = await validate(value, rules, { forceAll: true });

// 非同期ルールの並列実行
const asyncRules = [asyncRule1, asyncRule2, asyncRule3];
const result3 = await validate(value, asyncRules, {
  parallel: true  // 並列実行でパフォーマンス向上
});
```

### バリデーションキャッシュ

```typescript
// 結果をキャッシュして重複チェックを避ける
const memoizedValidate = (() => {
  const cache = new Map();

  return async (value: any, rules: any[]) => {
    const key = JSON.stringify({ value, rules: rules.map(r => r.name) });

    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = await validate(value, rules);
    cache.set(key, result);

    // キャッシュサイズ制限
    if (cache.size > 1000) {
      const firstKey = cache.keys().next().value;
      cache.delete(firstKey);
    }

    return result;
  };
})();
```

## テストパターン

### ユニットテスト例

```typescript
import { describe, test, expect } from 'vitest';
import { validate, required, email, minLength } from '@fastkit/rules';

describe('Validation Rules', () => {
  describe('required', () => {
    test('空値でエラー', async () => {
      const result = await validate('', required);
      expect(result).toBeTruthy();
      expect(result?.name).toBe('required');
    });

    test('値があれば成功', async () => {
      const result = await validate('test', required);
      expect(result).toBeNull();
    });
  });

  describe('email', () => {
    test('有効なメールで成功', async () => {
      const result = await validate('user@example.com', email);
      expect(result).toBeNull();
    });

    test('無効なメールでエラー', async () => {
      const result = await validate('invalid-email', email);
      expect(result).toBeTruthy();
      expect(result?.name).toBe('email');
    });
  });

  describe('複合ルール', () => {
    test('全てのルールが成功', async () => {
      const result = await validate('user@example.com', [
        required,
        email,
        minLength(5)
      ]);
      expect(result).toBeNull();
    });

    test('いずれかのルールでエラー', async () => {
      const result = await validate('a@b.c', [
        required,
        email,
        minLength(10)
      ]);
      expect(result).toBeTruthy();
      expect(result?.name).toBe('minLength');
    });
  });
});
```

## 依存関係

```json
{
  "dependencies": {
    "@fastkit/helpers": "ユーティリティ関数"
  },
  "peerDependencies": {},
  "devDependencies": {
    "typescript": "^5.5.0",
    "vitest": "^1.0.0"
  }
}
```

## ドキュメント

詳細なドキュメントは[こちら](https://dadajam4.github.io/fastkit/rules/)をご覧ください。

## ライセンス

MIT
