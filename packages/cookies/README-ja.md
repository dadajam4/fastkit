# @fastkit/cookies

🌐 [English](https://github.com/dadajam4/fastkit/blob/main/packages/cookies/README.md) | 日本語

サーバーとブラウザの両方でユニバーサルにCookieヘッダーを制御するためのヘルパーライブラリ。TypeScriptファーストで設計され、Node.jsサーバー環境とブラウザ環境の両方で一貫したAPIを提供します。

## 機能

- **ユニバーサルAPI**: サーバー（Node.js）とブラウザで統一されたCookie操作インターフェース
- **TypeScript完全サポート**: 厳密な型定義による型安全性
- **イベントドリブン**: Cookie変更時のリアルタイム通知機能
- **自動コンテキスト検出**: 実行環境に応じた自動的なコンテキスト設定
- **セキュアCookie対応**: HttpOnly、Secure、SameSite等のセキュリティオプション完全サポート
- **重複防止**: サーバー環境での重複したSet-Cookieヘッダーの自動排除
- **エラーハンドリング**: 適切なエラー処理と警告メッセージ
- **軽量設計**: 最小限の依存関係で高いパフォーマンス

## インストール

```bash
npm install @fastkit/cookies
```

## 基本的な使用方法

### ブラウザでの基本操作

```typescript
import { Cookies } from '@fastkit/cookies'

// ブラウザ環境では自動的にdocumentコンテキストを使用
const cookies = new Cookies()

// Cookieの設定
cookies.set('username', 'john_doe')
cookies.set('theme', 'dark', {
  expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30日後
  path: '/',
  secure: true,
  sameSite: 'strict'
})

// Cookieの取得
const username = cookies.get('username') // 'john_doe'
const theme = cookies.get('theme') // 'dark'

// Cookieの削除
cookies.delete('username')

// 全Cookieの確認
console.log(cookies.bucket) // 現在の全Cookie
```

### サーバー（Node.js）での使用

```typescript
import { Cookies } from '@fastkit/cookies'
import type { IncomingMessage, ServerResponse } from 'http'

// Express.jsでの使用例
app.get('/api/user', (req: IncomingMessage, res: ServerResponse) => {
  const cookies = new Cookies({ req, res })

  // リクエストからCookieを読み取り
  const sessionId = cookies.get('session_id')

  if (!sessionId) {
    // 新しいセッションIDを生成して設定
    const newSessionId = generateSessionId()
    cookies.set('session_id', newSessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24時間
    })
  }

  // ユーザー設定のCookieを設定
  cookies.set('last_visit', new Date().toISOString(), {
    expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1年後
  })

  res.end('Cookie設定完了')
})
```

### Next.jsでの使用例

```typescript
// pages/api/auth/login.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { Cookies } from '@fastkit/cookies'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const cookies = new Cookies({ req, res })

  if (req.method === 'POST') {
    const { username, password } = req.body

    // 認証処理（仮）
    if (authenticate(username, password)) {
      // 認証トークンをCookieに設定
      cookies.set('auth_token', generateToken(username), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7日間
      })

      // ユーザー設定をCookieに保存
      cookies.set('user_prefs', JSON.stringify({
        theme: 'light',
        language: 'ja'
      }), {
        expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1年間
      })

      res.status(200).json({ success: true })
    } else {
      res.status(401).json({ error: 'Invalid credentials' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}

function authenticate(username: string, password: string): boolean {
  // 実際の認証ロジック
  return username === 'admin' && password === 'password'
}

function generateToken(username: string): string {
  // 実際のトークン生成ロジック
  return `token_${username}_${Date.now()}`
}
```

## 高度な使用例

### Cookie変更のリアルタイム監視

```typescript
import { Cookies } from '@fastkit/cookies'

const cookies = new Cookies()

// Cookie変更イベントのリスナー登録
cookies.on('change', (event) => {
  console.log(`Cookie "${event.name}" changed:`, event.value)

  // 特定のCookieの変更を監視
  if (event.name === 'theme') {
    updateTheme(event.value)
  }

  if (event.name === 'language') {
    updateLanguage(event.value)
  }
})

// テーマ変更処理
function updateTheme(theme: string | undefined) {
  if (theme) {
    document.body.className = `theme-${theme}`
    console.log(`テーマを ${theme} に変更しました`)
  }
}

// 言語変更処理
function updateLanguage(language: string | undefined) {
  if (language) {
    document.documentElement.lang = language
    console.log(`言語を ${language} に変更しました`)
  }
}

// 動的なCookie設定
cookies.set('theme', 'dark')  // changeイベントが発生
cookies.set('language', 'ja') // changeイベントが発生
```

### カスタムCookieユーティリティクラス

```typescript
import { Cookies } from '@fastkit/cookies'
import type { CookiesContext, CookieSerializeOptions } from '@fastkit/cookies'

interface UserPreferences {
  theme: 'light' | 'dark'
  language: string
  timezone: string
  notifications: boolean
}

interface SessionData {
  userId: string
  role: string
  permissions: string[]
}

class CookieManager {
  private cookies: Cookies

  constructor(context?: CookiesContext) {
    this.cookies = new Cookies(context)
  }

  // ユーザー設定の管理
  setUserPreferences(prefs: UserPreferences) {
    const options: CookieSerializeOptions = {
      expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1年間
      path: '/',
      sameSite: 'strict'
    }

    this.cookies.set('user_prefs', JSON.stringify(prefs), options)
  }

  getUserPreferences(): UserPreferences | null {
    const prefsStr = this.cookies.get('user_prefs')
    if (!prefsStr) return null

    try {
      return JSON.parse(prefsStr) as UserPreferences
    } catch (error) {
      console.error('ユーザー設定の解析エラー:', error)
      return null
    }
  }

  // セッション管理
  setSession(sessionData: SessionData) {
    const options: CookieSerializeOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000 // 24時間
    }

    this.cookies.set('session', JSON.stringify(sessionData), options)
  }

  getSession(): SessionData | null {
    const sessionStr = this.cookies.get('session')
    if (!sessionStr) return null

    try {
      return JSON.parse(sessionStr) as SessionData
    } catch (error) {
      console.error('セッションデータの解析エラー:', error)
      return null
    }
  }

  clearSession() {
    this.cookies.delete('session')
  }

  // CSRF トークン管理
  setCSRFToken(token: string) {
    this.cookies.set('csrf_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    })
  }

  getCSRFToken(): string | undefined {
    return this.cookies.get('csrf_token')
  }

  // 同意Cookie管理
  setConsent(accepted: boolean) {
    this.cookies.set('cookie_consent', accepted.toString(), {
      expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1年間
      path: '/',
      sameSite: 'strict'
    })
  }

  getConsent(): boolean | null {
    const consent = this.cookies.get('cookie_consent')
    if (consent === undefined) return null
    return consent === 'true'
  }

  // 追跡無効化
  setTrackingPreference(enabled: boolean) {
    this.cookies.set('tracking_enabled', enabled.toString(), {
      expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      path: '/',
      sameSite: 'strict'
    })
  }

  isTrackingEnabled(): boolean {
    const tracking = this.cookies.get('tracking_enabled')
    return tracking === 'true'
  }

  // 全Cookie削除（ログアウト時など）
  clearAllCookies() {
    const cookieNames = Object.keys(this.cookies.bucket)
    cookieNames.forEach(name => {
      this.cookies.delete(name)
    })
  }
}

// 使用例
const cookieManager = new CookieManager()

// ユーザー設定の保存
cookieManager.setUserPreferences({
  theme: 'dark',
  language: 'ja',
  timezone: 'Asia/Tokyo',
  notifications: true
})

// セッション作成
cookieManager.setSession({
  userId: 'user123',
  role: 'admin',
  permissions: ['read', 'write', 'delete']
})

// Cookie同意の処理
if (cookieManager.getConsent() === null) {
  // 同意確認ダイアログを表示
  showConsentDialog().then(accepted => {
    cookieManager.setConsent(accepted)
  })
}
```

### Express.jsミドルウェアでの統合

```typescript
import express from 'express'
import { Cookies } from '@fastkit/cookies'
import type { Request, Response, NextFunction } from 'express'

// Cookiesインスタンスをリクエストオブジェクトに追加
declare global {
  namespace Express {
    interface Request {
      cookies: Cookies
    }
  }
}

// Cookiesミドルウェア
export function cookiesMiddleware(req: Request, res: Response, next: NextFunction) {
  req.cookies = new Cookies({ req, res })
  next()
}

// アプリケーション設定
const app = express()

app.use(cookiesMiddleware)

// 認証が必要なルートの保護
app.use('/protected', (req: Request, res: Response, next: NextFunction) => {
  const sessionToken = req.cookies.get('session_token')

  if (!sessionToken || !isValidToken(sessionToken)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  next()
})

// ログイン エンドポイント
app.post('/auth/login', async (req: Request, res: Response) => {
  const { username, password } = req.body

  try {
    const user = await authenticateUser(username, password)

    if (user) {
      const sessionToken = generateSessionToken(user.id)

      // セッションCookieを設定
      req.cookies.set('session_token', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 24時間
      })

      // ユーザー情報Cookieを設定
      req.cookies.set('user_info', JSON.stringify({
        id: user.id,
        name: user.name,
        role: user.role
      }), {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7日間
      })

      res.json({ success: true, user })
    } else {
      res.status(401).json({ error: 'Invalid credentials' })
    }
  } catch (error) {
    console.error('ログインエラー:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// ログアウト エンドポイント
app.post('/auth/logout', (req: Request, res: Response) => {
  // セッション関連のCookieを削除
  req.cookies.delete('session_token')
  req.cookies.delete('user_info')

  res.json({ success: true })
})

// 保護されたリソース
app.get('/protected/profile', (req: Request, res: Response) => {
  const userInfo = req.cookies.get('user_info')

  if (userInfo) {
    try {
      const user = JSON.parse(userInfo)
      res.json({ user })
    } catch (error) {
      res.status(400).json({ error: 'Invalid user data' })
    }
  } else {
    res.status(401).json({ error: 'User not found' })
  }
})

async function authenticateUser(username: string, password: string) {
  // 実際の認証ロジック
  // データベースからユーザーを検索し、パスワードを検証
  return { id: '123', name: username, role: 'user' }
}

function generateSessionToken(userId: string): string {
  // 実際のトークン生成ロジック
  return `session_${userId}_${Date.now()}`
}

function isValidToken(token: string): boolean {
  // 実際のトークン検証ロジック
  return token.startsWith('session_')
}

app.listen(3000, () => {
  console.log('サーバーが起動しました: http://localhost:3000')
})
```

## Cookie設定オプション

### 基本オプション

```typescript
import { Cookies } from '@fastkit/cookies'

const cookies = new Cookies()

// 基本的な設定
cookies.set('simple_cookie', 'value')

// 詳細な設定
cookies.set('advanced_cookie', 'value', {
  // 有効期限（日付指定）
  expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7日後

  // 有効期限（秒数指定）
  maxAge: 60 * 60 * 24 * 7, // 7日間（秒）

  // パス指定
  path: '/admin', // /adminパス以下でのみ有効

  // ドメイン指定
  domain: '.example.com', // example.comとそのサブドメインで有効

  // HTTPS必須
  secure: true,

  // JavaScript からアクセス不可（サーバーのみ）
  httpOnly: true,

  // SameSite属性（CSRF攻撃防止）
  sameSite: 'strict' // 'strict' | 'lax' | 'none'
})
```

### SameSite属性の詳細

```typescript
// Strict: 同一サイトからのリクエストでのみCookieを送信
cookies.set('strict_cookie', 'value', { sameSite: 'strict' })

// Lax: 同一サイト + 安全なクロスサイトナビゲーション（GET）でCookieを送信
cookies.set('lax_cookie', 'value', { sameSite: 'lax' })

// None: すべてのクロスサイトリクエストでCookieを送信（secureが必須）
cookies.set('none_cookie', 'value', {
  sameSite: 'none',
  secure: true // sameSite: 'none'の場合は必須
})
```

## API仕様

### `Cookies`クラス

```typescript
class Cookies extends EV<CookiesEventMap> {
  constructor(ctx?: CookiesContext, options?: CookiesOptions)

  // Cookie操作
  get(name: string): string | undefined
  set(name: string, value: string, options?: CookieSerializeOptions): void
  delete(name: string, options?: CookieSerializeOptions): void

  // Cookieの解析
  parse(options?: CookieParseOptions): CookiesBucket

  // プロパティ
  readonly ctx: CookiesContext
  readonly options?: CookiesOptions
  readonly bucket: CookiesBucket  // 現在のCookie一覧
}
```

### 型定義

```typescript
// コンテキスト型
type CookiesContext = CookiesBrowserContext | CookiesServerContext

interface CookiesBrowserContext extends Document {}

interface CookiesServerContext {
  req?: IncomingMessage
  res?: ServerResponse
}

// Cookie格納型
type CookiesBucket = Record<string, string>

// イベント型
interface OnCookiesChangeEvent {
  name: string
  value: string | undefined
}

interface CookiesEventMap {
  change: OnCookiesChangeEvent
}

// オプション型
interface CookiesOptions extends CookieParseOptions {
  bucket?: CookiesBucket
}

// Cookieシリアライズオプション
interface CookieSerializeOptions {
  expires?: Date
  maxAge?: number
  path?: string
  domain?: string
  secure?: boolean
  httpOnly?: boolean
  sameSite?: 'strict' | 'lax' | 'none' | boolean
  encode?: (value: string) => string
}
```

### ヘルパー関数

```typescript
// コンテキスト判定
function isCookiesBrowserContext(source: any): source is CookiesBrowserContext
function isIncomingMessage(source: any): source is IncomingMessage
function isServerResponse(source: any): source is ServerResponse

// Cookie操作
function createCookie(name: string, value: string, options?: CookieSerializeOptions): Cookie
function areCookiesEqual(a: Cookie, b: Cookie): boolean
```

## 注意事項

### ブラウザ制限
- ブラウザではhttpOnlyオプションは使用不可
- Cookieサイズ制限（4KB程度）に注意
- ドメインあたりのCookie数制限に注意

### サーバー環境
- レスポンス送信後のCookie設定は警告が表示
- 重複したSet-Cookieヘッダーは自動的に排除
- HTTPSでない場合はsecureオプションを使用しない

### セキュリティ
- 機密情報はhttpOnlyとsecureオプションを使用
- CSRF攻撃防止にはsameSite属性を適切に設定
- XSS攻撃対策として入力値の検証とサニタイゼーションを実施

### パフォーマンス
- Cookie数とサイズを最小限に抑制
- 頻繁な更新によるパフォーマンス影響を考慮
- 大きなデータはCookieではなくセッションストレージを使用

## ライセンス

MIT

## 関連パッケージ

- [@fastkit/ev](../ev/README.md): イベントエミッター基盤
- [@fastkit/helpers](../helpers/README.md): 基本的なユーティリティ関数
- [@fastkit/tiny-logger](../tiny-logger/README.md): ログ出力機能
