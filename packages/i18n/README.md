# @fastkit/i18n

サーバー/ブラウザーの実行環境に依存せず、アプリケーションを多言語にローカライズするための包括的なライブラリです。

## 特徴

- **ユニバーサル対応**: Node.js、ブラウザ環境で同じAPIを使用可能
- **型安全性**: TypeScript完全対応で型安全な翻訳システム
- **階層構造**: Space、Component、Locale の3層アーキテクチャ
- **Intl API統合**: ネイティブなブラウザ国際化機能をフル活用
- **フォールバック**: 階層的な翻訳フォールバック機構
- **非同期ローディング**: 動的な翻訳データ読み込み対応
- **カスタマイズ**: 柔軟なフォーマッター・ストレージシステム

## インストール

```bash
npm install @fastkit/i18n
# or
pnpm add @fastkit/i18n
```

## 基本的な使い方

### 1. 国際化スペースの定義

```typescript
import { defineI18nSpace } from '@fastkit/i18n';

// スペース定義（プロジェクト全体の言語設定）
const Space = defineI18nSpace({
  locales: [
    'ja',
    { name: 'en', formatLocales: ['en-US'] },
    { name: 'zh', formatLocales: ['zh-CN'] }
  ],
  baseLocale: 'ja',        // 基準言語
  defaultLocale: 'en',     // デフォルト言語
  fallbackLocale: 'ja'     // フォールバック言語
});
```

### 2. コンポーネントスキーマの定義

```typescript
// 翻訳データの型定義
interface Translations {
  greeting: string;
  farewell: string;
  itemCount: string;
}

// フォーマット定義
const dateTimeFormats = {
  short: { year: 'numeric', month: 'short', day: 'numeric' },
  long: { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    weekday: 'long'
  }
} as const;

const numberFormats = {
  currency: { style: 'currency', currency: 'JPY' },
  percent: { style: 'percent' }
} as const;

// スキーマ定義
const scheme = Space.defineScheme({
  translations: (t: Translations) => true,
  dateTimeFormats,
  numberFormats
});
```

### 3. ロケール別データの定義

```typescript
// 日本語
const ja = scheme.defineLocale.strict({
  translations: {
    greeting: 'こんにちは',
    farewell: 'さようなら',
    itemCount: '{count}個のアイテム'
  },
  dateTimeFormats: {
    short: { year: 'numeric', month: 'short', day: 'numeric' }
  },
  numberFormats: {
    currency: { style: 'currency', currency: 'JPY' }
  }
});

// 英語
const en = scheme.defineLocale.strict({
  translations: {
    greeting: 'Hello',
    farewell: 'Goodbye', 
    itemCount: '{count} items'
  },
  numberFormats: {
    currency: { style: 'currency', currency: 'USD' }
  }
});
```

### 4. コンポーネントの作成と使用

```typescript
// コンポーネント定義
const Component = scheme.defineComponent({
  locales: { ja, en }
});

// インスタンス作成
const i18n = Component.createInstance();

// 言語切り替え
await i18n.setLocale('ja');

// 翻訳取得
const greeting = i18n.t.greeting; // → 'こんにちは'

// パラメーター付き翻訳
const count = i18n.t.itemCount.replace('{count}', '5'); // → '5個のアイテム'

// 日時フォーマット
const date = i18n.d(new Date(), 'short'); // → '2024年1月15日'

// 数値フォーマット
const price = i18n.n(1500, 'currency'); // → '¥1,500'
```

## 高度な使用例

### 非同期ローディング

```typescript
const Component = scheme.defineComponent({
  locales: {
    ja: () => import('./locales/ja'),
    en: () => import('./locales/en'),
    zh: () => import('./locales/zh')
  }
});

const i18n = Component.createInstance();

// 言語切り替え時に自動ローディング
await i18n.setLocale('zh');
console.log(i18n.t.greeting); // 中国語の翻訳が表示
```

### 依存関係のあるコンポーネント

```typescript
// 共通コンポーネント
const CommonComponent = scheme.defineComponent({
  locales: { ja: commonJa, en: commonEn }
});

// 依存関係を持つスキーマ
const pageScheme = Space.defineScheme({
  translations: (t: PageTranslations) => true,
  dependencies: {
    common: CommonComponent
  }
});

const PageComponent = pageScheme.defineComponent({
  locales: { ja: pageJa, en: pageEn }
});

const pageI18n = PageComponent.createInstance();

// 依存コンポーネントにアクセス
const commonGreeting = pageI18n.common.t.greeting;
const pageTitle = pageI18n.t.title;
```

### カスタムストレージ

```typescript
import { createI18nObjectStorage } from '@fastkit/i18n';

// Redis ストレージの例
const redisStorage = createI18nObjectStorage({
  get: async (key) => {
    return await redis.get(key);
  },
  set: async (key, value) => {
    await redis.set(key, JSON.stringify(value));
  }
});

const Component = scheme.defineComponent({
  locales: { ja, en },
  storage: redisStorage
});
```

## API

### defineI18nSpace

国際化スペースを定義します。

```typescript
const Space = defineI18nSpace({
  locales: LocaleSource[],           // ロケール設定
  baseLocale: string,                // 基準言語
  defaultLocale?: string,            // デフォルト言語
  fallbackLocale?: FallbackConfig    // フォールバック設定
});
```

### Space.defineScheme

コンポーネントスキーマを定義します。

```typescript
const scheme = Space.defineScheme({
  translations: (t: T) => boolean,            // 翻訳型定義
  dateTimeFormats?: DateTimeFormats,          // 日時フォーマット
  relativeTimeFormats?: RelativeTimeFormats,  // 相対時間フォーマット  
  numberFormats?: NumberFormats,              // 数値フォーマット
  listFormats?: ListFormats,                  // リストフォーマット
  dependencies?: Dependencies                 // 依存コンポーネント
});
```

### scheme.defineLocale

ロケール固有データを定義します。

```typescript
const locale = scheme.defineLocale({
  translations: TranslationsData,     // 翻訳データ
  dateTimeFormats?: DateTimeFormats,  // 日時フォーマット
  numberFormats?: NumberFormats,      // 数値フォーマット
  // ...その他のフォーマット
});
```

### scheme.defineComponent

コンポーネントを定義します。

```typescript
const Component = scheme.defineComponent({
  locales: LocaleMap,          // ロケールマップ
  storage?: Storage,           // ストレージ設定
  strict?: boolean            // 厳密モード
});
```

### インスタンスAPI

#### 言語操作

```typescript
// 現在の言語取得
const currentLocale = i18n.locale;

// 言語切り替え
await i18n.setLocale('en');

// 利用可能言語一覧
const available = i18n.availableLocales;
```

#### 翻訳

```typescript
// 翻訳取得
const text = i18n.t.keyName;

// 翻訳関数（パラメーター対応）
const formatted = i18n.translate('keyName', { param: 'value' });
```

#### フォーマッター

```typescript
// 日時フォーマット
i18n.d(new Date())                    // デフォルト
i18n.d(new Date(), 'short')           // 名前付きフォーマット
i18n.d(new Date(), { year: '2-digit' }) // カスタムオプション

// 数値フォーマット
i18n.n(1234.56)                       // デフォルト
i18n.n(1234.56, 'currency')          // 通貨フォーマット
i18n.n(0.95, 'percent')              // パーセント

// 相対時間
i18n.rt(-2, 'day')                    // '2日前'

// リスト
i18n.l(['apple', 'banana', 'orange']) // 'apple、banana、orange'
```

## フォールバック機構

```typescript
const Space = defineI18nSpace({
  locales: ['ja', 'en', 'zh'],
  baseLocale: 'ja',
  fallbackLocale: {
    en: 'ja',      // 英語→日本語
    zh: ['en', 'ja'] // 中国語→英語→日本語
  }
});
```

翻訳が見つからない場合の検索順序：
1. 現在のロケール
2. 指定されたフォールバックロケール
3. ベースロケール

## TypeScript統合

```typescript
// 翻訳型の自動推論
interface AppTranslations {
  nav: {
    home: string;
    about: string;
    contact: string;
  };
  messages: {
    welcome: string;
    error: string;
  };
}

const scheme = Space.defineScheme({
  translations: (t: AppTranslations) => true
});

// 型安全な翻訳アクセス
const welcome = i18n.t.messages.welcome; // ✅ 型チェック
const invalid = i18n.t.invalid;          // ❌ コンパイルエラー
```

## 依存関係

- `@fastkit/helpers`: ヘルパーユーティリティ
- `@fastkit/tiny-logger`: ログ機能

## ドキュメント

詳細なドキュメントは[こちら](https://dadajam4.github.io/fastkit/i18n/)をご覧ください。

## ライセンス

MIT
