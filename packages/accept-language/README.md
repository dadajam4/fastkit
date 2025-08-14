# @fastkit/accept-language

HTTPのAccept-Languageヘッダを解析し、品質順にソートする軽量なパーサライブラリ。多言語対応のWebアプリケーションで、クライアントが希望する言語を適切に判定するために使用します。

## 機能

- **Accept-Languageヘッダ解析**: HTTPヘッダの標準形式に完全対応
- **品質値ソート**: q値（品質値）に基づく優先順位付け
- **言語コード分析**: コード、スクリプト、地域の詳細解析
- **最適言語選択**: サポート言語リストから最適な言語を自動選択
- **緩い一致オプション**: 部分的な言語一致をサポート
- **TypeScript完全サポート**: 厳密な型定義による型安全性
- **軽量設計**: 依存関係を最小限に抑えた効率的な実装
- **エラーハンドリング**: 不正なヘッダへの堅牢な対応

## インストール

```bash
npm install @fastkit/accept-language
```

## 基本的な使用方法

### Accept-Languageヘッダの解析

```typescript
import { parse } from '@fastkit/accept-language'

// 典型的なAccept-Languageヘッダの解析
const acceptLanguage = 'en-US,en;q=0.9,ja;q=0.8,zh-CN;q=0.7'
const parsed = parse(acceptLanguage)

console.log(parsed)
// [
//   { code: 'en', script: null, region: 'US', quality: 1.0 },
//   { code: 'en', script: null, region: '', quality: 0.9 },
//   { code: 'ja', script: null, region: '', quality: 0.8 },
//   { code: 'zh', script: null, region: 'CN', quality: 0.7 }
// ]

// スクリプト付き言語コードの解析
const complexHeader = 'zh-Hans-CN;q=0.9,zh-Hant-TW;q=0.8,en;q=0.7'
const complexParsed = parse(complexHeader)

console.log(complexParsed)
// [
//   { code: 'zh', script: 'Hans', region: 'CN', quality: 0.9 },
//   { code: 'zh', script: 'Hant', region: 'TW', quality: 0.8 },
//   { code: 'en', script: null, region: '', quality: 0.7 }
// ]
```

### 最適な言語の選択

```typescript
import { pick } from '@fastkit/accept-language'

// サポートしている言語リスト
const supportedLanguages = ['en-US', 'ja-JP', 'zh-CN', 'fr-FR']

// クライアントのAccept-Languageヘッダ
const clientLanguages = 'ja;q=0.9,en-US;q=0.8,zh-CN;q=0.7'

// 最適な言語を選択
const bestLanguage = pick(supportedLanguages, clientLanguages)
console.log(bestLanguage) // 'ja-JP'

// 解析済みの言語配列からも選択可能
const parsedLanguages = parse(clientLanguages)
const bestFromParsed = pick(supportedLanguages, parsedLanguages)
console.log(bestFromParsed) // 'ja-JP'
```

### 緩い一致による言語選択

```typescript
import { pick } from '@fastkit/accept-language'

const supportedLanguages = ['en', 'ja', 'zh-CN']
const clientLanguages = 'en-US,ja-JP,zh-TW'

// 厳密な一致（デフォルト）
const strictMatch = pick(supportedLanguages, clientLanguages)
console.log(strictMatch) // null（完全一致なし）

// 緩い一致を有効化
const looseMatch = pick(supportedLanguages, clientLanguages, { loose: true })
console.log(looseMatch) // 'en'（言語コードのみで一致）
```

## 実用的な使用例

### Express.jsでの多言語対応

```typescript
import express from 'express'
import { pick } from '@fastkit/accept-language'

const app = express()

// サポートしている言語設定
const SUPPORTED_LANGUAGES = ['en-US', 'ja-JP', 'ko-KR', 'zh-CN']
const DEFAULT_LANGUAGE = 'en-US'

// 言語判定ミドルウェア
app.use((req, res, next) => {
  const acceptLanguage = req.headers['accept-language']
  
  // 最適な言語を判定
  const preferredLanguage = pick(
    SUPPORTED_LANGUAGES,
    acceptLanguage,
    { loose: true }
  ) || DEFAULT_LANGUAGE
  
  // リクエストに言語情報を追加
  req.locale = preferredLanguage
  res.locals.locale = preferredLanguage
  
  next()
})

// APIレスポンス例
app.get('/api/messages', (req, res) => {
  const messages = getLocalizedMessages(req.locale)
  res.json({
    locale: req.locale,
    messages
  })
})
```

### Next.jsでの国際化

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { pick } from '@fastkit/accept-language'

const SUPPORTED_LOCALES = ['en', 'ja', 'ko', 'zh']
const DEFAULT_LOCALE = 'en'

export function middleware(request: NextRequest) {
  // Accept-Languageヘッダから最適な言語を選択
  const acceptLanguage = request.headers.get('accept-language')
  const preferredLocale = pick(
    SUPPORTED_LOCALES,
    acceptLanguage,
    { loose: true }
  ) || DEFAULT_LOCALE
  
  // パスに言語コードが含まれていない場合はリダイレクト
  const pathname = request.nextUrl.pathname
  if (!SUPPORTED_LOCALES.some(locale => pathname.startsWith(`/${locale}`))) {
    const url = request.nextUrl.clone()
    url.pathname = `/${preferredLocale}${pathname}`
    return NextResponse.redirect(url)
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}
```

### Vue.jsアプリケーションでの言語自動設定

```typescript
// plugins/i18n.ts
import { createI18n } from 'vue-i18n'
import { pick } from '@fastkit/accept-language'

// ブラウザの言語設定を取得
const browserLanguages = navigator.language || navigator.languages?.[0]
const supportedLocales = ['en-US', 'ja-JP', 'ko-KR']

// 最適な言語を自動選択
const defaultLocale = pick(
  supportedLocales,
  browserLanguages,
  { loose: true }
) || 'en-US'

export const i18n = createI18n({
  legacy: false,
  locale: defaultLocale,
  fallbackLocale: 'en-US',
  messages: {
    'en-US': enMessages,
    'ja-JP': jaMessages,
    'ko-KR': koMessages
  }
})
```

### カスタム言語判定関数

```typescript
import { parse, pick, type ParsedLanguage } from '@fastkit/accept-language'

class LanguageDetector {
  private supportedLanguages: string[]
  private fallbackLanguage: string

  constructor(
    supportedLanguages: string[],
    fallbackLanguage: string
  ) {
    this.supportedLanguages = supportedLanguages
    this.fallbackLanguage = fallbackLanguage
  }

  /**
   * 最適な言語を判定（複数の戦略を組み合わせ）
   */
  detectBestLanguage(
    acceptLanguageHeader?: string | null,
    userPreference?: string,
    sessionLanguage?: string
  ): string {
    // 1. ユーザー設定を最優先
    if (userPreference && this.isSupported(userPreference)) {
      return userPreference
    }

    // 2. セッション言語を次に考慮
    if (sessionLanguage && this.isSupported(sessionLanguage)) {
      return sessionLanguage
    }

    // 3. Accept-Languageヘッダから判定
    if (acceptLanguageHeader) {
      const detected = pick(
        this.supportedLanguages,
        acceptLanguageHeader,
        { loose: true }
      )
      if (detected) return detected
    }

    // 4. フォールバック言語を返す
    return this.fallbackLanguage
  }

  /**
   * 詳細な言語分析
   */
  analyzeLanguagePreferences(acceptLanguageHeader: string) {
    const parsed = parse(acceptLanguageHeader)
    
    return {
      languages: parsed,
      hasHighQuality: parsed.some(lang => lang.quality >= 0.8),
      primaryLanguage: parsed[0]?.code,
      supportedMatches: parsed.filter(lang => 
        this.supportedLanguages.some(supported => 
          supported.toLowerCase().startsWith(lang.code.toLowerCase())
        )
      )
    }
  }

  private isSupported(language: string): boolean {
    return this.supportedLanguages.includes(language)
  }
}

// 使用例
const detector = new LanguageDetector(
  ['en-US', 'ja-JP', 'ko-KR', 'zh-CN'],
  'en-US'
)

const bestLanguage = detector.detectBestLanguage(
  'ja;q=0.9,en-US;q=0.8,ko;q=0.7',
  undefined, // ユーザー設定なし
  'zh-CN'    // セッション言語
)

console.log(bestLanguage) // 'zh-CN'
```

## API仕様

### `parse(acceptLanguage)`

Accept-Languageヘッダ文字列を解析し、品質順にソートされた言語配列を返します。

**パラメータ:**
- `acceptLanguage` (string | null | undefined): Accept-Languageヘッダ文字列

**戻り値:**
- `ParsedLanguage[]`: 解析された言語の配列

```typescript
interface ParsedLanguage {
  code: string;        // 言語コード（例: 'en', 'ja'）
  script: string | null; // スクリプト（例: 'Hans', 'Hant'）
  region: string;      // 地域コード（例: 'US', 'JP'）
  quality: number;     // 品質値（0.0-1.0）
}
```

### `pick(supportedLanguages, acceptLanguages, options?)`

サポートしている言語リストから、クライアントの希望に最も適した言語を選択します。

**パラメータ:**
- `supportedLanguages` (string[] | readonly string[]): サポートしている言語のリスト
- `acceptLanguages` (string | ParsedLanguage[] | null | undefined): Accept-Languageヘッダまたは解析済み言語配列
- `options` (PickOptions, optional): 選択オプション

**戻り値:**
- `string | null`: 最適な言語（見つからない場合は null）

```typescript
interface PickOptions {
  loose?: boolean; // 緩い一致を許可するか（デフォルト: false）
}
```

## 高度な使用例

### 地域特有の言語処理

```typescript
import { parse, pick } from '@fastkit/accept-language'

// 地域別の言語バリエーション
const regionalLanguages = {
  'zh-CN': '简体中文',  // 中国（簡体字）
  'zh-TW': '繁體中文',  // 台湾（繁体字）
  'zh-HK': '繁體中文',  // 香港（繁体字）
  'en-US': 'English (US)',
  'en-GB': 'English (UK)',
  'pt-BR': 'Português (Brasil)',
  'pt-PT': 'Português (Portugal)'
}

function getRegionalLanguage(acceptLanguage: string) {
  const supportedLanguages = Object.keys(regionalLanguages)
  
  // 厳密な一致を先に試行
  let selected = pick(supportedLanguages, acceptLanguage)
  
  if (!selected) {
    // 緩い一致で再試行
    selected = pick(supportedLanguages, acceptLanguage, { loose: true })
  }
  
  return selected ? {
    code: selected,
    name: regionalLanguages[selected as keyof typeof regionalLanguages],
    isExactMatch: !parse(acceptLanguage).some(lang => 
      `${lang.code}-${lang.region}` === selected
    )
  } : null
}
```

### パフォーマンス最適化

```typescript
import { parse, pick } from '@fastkit/accept-language'

class OptimizedLanguageDetector {
  private cache = new Map<string, string | null>()
  private readonly maxCacheSize = 1000

  constructor(
    private supportedLanguages: readonly string[],
    private defaultLanguage: string
  ) {}

  detectLanguage(acceptLanguageHeader: string): string {
    // キャッシュから検索
    const cached = this.cache.get(acceptLanguageHeader)
    if (cached !== undefined) {
      return cached || this.defaultLanguage
    }

    // 新しい判定を実行
    const detected = pick(
      this.supportedLanguages,
      acceptLanguageHeader,
      { loose: true }
    )

    // キャッシュサイズ制限
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }

    // 結果をキャッシュ
    this.cache.set(acceptLanguageHeader, detected)
    
    return detected || this.defaultLanguage
  }

  clearCache(): void {
    this.cache.clear()
  }
}
```

## 注意事項

### ブラウザ対応

- モダンブラウザすべてでサポート
- Internet Explorer 11以降で動作
- Node.js環境での使用を推奨

### パフォーマンス考慮事項

- 解析処理は軽量ですが、大量のリクエストでは結果のキャッシュを推奨
- 長いAccept-Languageヘッダの処理時間は言語数に比例
- メモリ使用量は処理する言語数によって決まる

### セキュリティ

- 入力値の検証は内部で実行される
- 不正なヘッダ値に対する堅牢な処理
- XSS攻撃につながる可能性のある値は自動的に除外

## ライセンス

MIT

## 関連パッケージ

- [@fastkit/i18n](../i18n/README.md): 多言語化フレームワーク
- [@fastkit/vue-i18n](../vue-i18n/README.md): Vue.js用多言語化ツール
- [@fastkit/helpers](../helpers/README.md): 基本的なユーティリティ関数