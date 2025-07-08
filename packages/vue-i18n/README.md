# @fastkit/vue-i18n

Vue.jsアプリケーションに型安全で強力な国際化(i18n)機能を提供するライブラリ。@fastkit/i18nコアライブラリをベースに、Vue 3とVue Routerとのシームレスな統合を実現します。

## 機能

- **Vue 3完全統合**: Composition APIとOptions API両方をサポート
- **型安全性**: TypeScriptによる厳密な型定義とコンパイル時検証
- **Vue Router統合**: ルーティングベースの言語切り替えとナビゲーション
- **サーバーサイドレンダリング**: SSR環境での完全対応
- **柔軟なストラテジー**: カスタム言語検出・切り替え戦略
- **リアクティブストレージ**: Vueのリアクティブシステムと連携
- **階層化翻訳**: ネストした翻訳コンポーネントの管理
- **クライアント言語検出**: ブラウザ設定やAccept-Languageヘッダー対応
- **サブスペース**: コンポーネント単位の独立した翻訳スコープ
- **カスタムストレージ**: Cookie、LocalStorage、カスタムストレージ対応

## インストール

```bash
npm install @fastkit/vue-i18n @fastkit/i18n
```

## 基本的な使用方法

### 多言語スペースの定義

```typescript
// i18n/space.ts
import { defineI18nSpace } from '@fastkit/i18n'

// 利用可能な言語を定義
export type AppLocaleName = 'ja' | 'en' | 'es'

// ベース言語（開発言語）を指定
export type AppBaseLocale = 'ja'

// 翻訳コンポーネントの定義
export const AppComponents = {
  common: () => import('./common'),
  user: () => import('./user'),
  product: () => import('./product')
} as const

// 国際化スペースを作成
export const AppSpace = defineI18nSpace<AppLocaleName, AppBaseLocale>({
  locales: ['ja', 'en', 'es'],
  baseLocale: 'ja',
  components: AppComponents
})
```

### 翻訳リソースの作成

```typescript
// i18n/common.ts
import { defineI18nComponent } from '@fastkit/i18n'

export default defineI18nComponent({
  ja: {
    title: 'マイアプリケーション',
    navigation: {
      home: 'ホーム',
      about: '会社情報',
      contact: 'お問い合わせ'
    },
    buttons: {
      save: '保存',
      cancel: 'キャンセル',
      delete: '削除'
    },
    messages: {
      loading: '読み込み中...',
      success: '正常に処理されました',
      error: 'エラーが発生しました'
    }
  },
  en: {
    title: 'My Application',
    navigation: {
      home: 'Home',
      about: 'About',
      contact: 'Contact'
    },
    buttons: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete'
    },
    messages: {
      loading: 'Loading...',
      success: 'Successfully processed',
      error: 'An error occurred'
    }
  },
  es: {
    title: 'Mi Aplicación',
    navigation: {
      home: 'Inicio',
      about: 'Acerca de',
      contact: 'Contacto'
    },
    buttons: {
      save: 'Guardar',
      cancel: 'Cancelar',
      delete: 'Eliminar'
    },
    messages: {
      loading: 'Cargando...',
      success: 'Procesado exitosamente',
      error: 'Ocurrió un error'
    }
  }
})
```

### Vue.jsアプリケーションの設定

```typescript
// main.ts
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createVueI18n } from '@fastkit/vue-i18n'
import App from './App.vue'
import { AppSpace, AppComponents, type AppLocaleName, type AppBaseLocale } from './i18n/space'

// Vue I18nサービスを作成
const i18n = createVueI18n(AppSpace, {
  components: AppComponents,
  defaultLocale: 'ja'
})

// ルーターを作成
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/:locale(ja|en|es)?', component: () => import('./views/Home.vue') },
    { path: '/:locale(ja|en|es)?/about', component: () => import('./views/About.vue') }
  ]
})

// アプリケーション初期化
const app = createApp(App)

// I18nスペースをセットアップ
const { space, install } = i18n.setup()

// Vue.jsアプリケーションにインストール
app.use(router)
install(app)

// TypeScript型拡張
declare module 'vue' {
  interface ComponentCustomProperties {
    $i18n: typeof space
  }
}

app.mount('#app')
```

### コンポーネントでの使用

```vue
<template>
  <div>
    <h1>{{ $i18n.at.common.trans.title }}</h1>
    
    <nav>
      <router-link :to="localePath('/')">
        {{ $i18n.at.common.trans.navigation.home }}
      </router-link>
      <router-link :to="localePath('/about')">
        {{ $i18n.at.common.trans.navigation.about }}
      </router-link>
    </nav>
    
    <div class="language-switcher">
      <h3>言語切り替え</h3>
      <button
        v-for="locale in availableLocales"
        :key="locale"
        @click="changeLanguage(locale)"
        :class="{ active: currentLocale === locale }"
      >
        {{ getLocaleName(locale) }}
      </button>
    </div>
    
    <div class="actions">
      <button @click="save">
        {{ $i18n.at.common.trans.buttons.save }}
      </button>
      <button @click="cancel">
        {{ $i18n.at.common.trans.buttons.cancel }}
      </button>
    </div>
    
    <div v-if="isLoading" class="message">
      {{ $i18n.at.common.trans.messages.loading }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18nSpace } from '@fastkit/vue-i18n'

const router = useRouter()
const i18n = useI18nSpace()

const isLoading = ref(false)

// 現在の言語を取得
const currentLocale = computed(() => i18n.locale)

// 利用可能な言語リスト
const availableLocales = computed(() => i18n.availableLocales)

// 言語名の表示用マッピング
const getLocaleName = (locale: string) => {
  const names = {
    ja: '日本語',
    en: 'English',
    es: 'Español'
  }
  return names[locale as keyof typeof names] || locale
}

// 言語切り替え
const changeLanguage = async (locale: string) => {
  await i18n.setLocale(locale)
  // 現在のパスを新しい言語で更新
  const currentPath = router.currentRoute.value.path
  const newPath = currentPath.replace(/^\/[a-z]{2}/, `/${locale}`)
  router.push(newPath)
}

// ローカライズされたパスを生成
const localePath = (path: string) => {
  return `/${currentLocale.value}${path}`
}

// アクション例
const save = () => {
  isLoading.value = true
  // 保存処理...
  setTimeout(() => {
    isLoading.value = false
    alert(i18n.at.common.trans.messages.success)
  }, 1000)
}

const cancel = () => {
  // キャンセル処理...
}
</script>

<style scoped>
.language-switcher {
  margin: 20px 0;
}

.language-switcher button {
  margin: 0 8px;
  padding: 8px 16px;
  border: 1px solid #ccc;
  background: white;
  cursor: pointer;
}

.language-switcher button.active {
  background: #007acc;
  color: white;
}

.actions {
  margin: 20px 0;
}

.actions button {
  margin: 0 8px;
  padding: 10px 20px;
  border: none;
  background: #007acc;
  color: white;
  cursor: pointer;
  border-radius: 4px;
}

.message {
  padding: 12px;
  background: #f0f0f0;
  border-radius: 4px;
  margin: 20px 0;
}
</style>
```

## 実用的な使用例

### サブスペース（コンポーネント固有の翻訳）

```typescript
// components/UserProfile/i18n.ts
import { defineI18nComponent } from '@fastkit/i18n'

export default defineI18nComponent({
  ja: {
    profile: {
      title: 'プロフィール',
      name: '名前',
      email: 'メールアドレス',
      bio: '自己紹介',
      edit: '編集',
      save: '保存'
    },
    validation: {
      required: '{field}は必須です',
      email: '有効なメールアドレスを入力してください'
    }
  },
  en: {
    profile: {
      title: 'Profile',
      name: 'Name',
      email: 'Email',
      bio: 'Biography',
      edit: 'Edit',
      save: 'Save'
    },
    validation: {
      required: '{field} is required',
      email: 'Please enter a valid email address'
    }
  }
})
```

```vue
<!-- components/UserProfile/UserProfile.vue -->
<template>
  <div class="user-profile">
    <h2>{{ subSpace.at.UserProfile.trans.profile.title }}</h2>
    
    <form @submit.prevent="handleSubmit">
      <div class="field">
        <label>{{ subSpace.at.UserProfile.trans.profile.name }}</label>
        <input 
          v-model="form.name" 
          :placeholder="subSpace.at.UserProfile.trans.profile.name"
        />
        <span v-if="errors.name" class="error">
          {{ subSpace.at.UserProfile.trans.validation.required.replace('{field}', subSpace.at.UserProfile.trans.profile.name) }}
        </span>
      </div>
      
      <div class="field">
        <label>{{ subSpace.at.UserProfile.trans.profile.email }}</label>
        <input 
          v-model="form.email" 
          type="email"
          :placeholder="subSpace.at.UserProfile.trans.profile.email"
        />
        <span v-if="errors.email" class="error">
          {{ subSpace.at.UserProfile.trans.validation.email }}
        </span>
      </div>
      
      <button type="submit">
        {{ subSpace.at.UserProfile.trans.profile.save }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { createVueI18n } from '@fastkit/vue-i18n'
import { AppSpace } from '../../i18n/space'
import UserProfileI18n from './i18n'

// サブスペースを定義
const i18n = createVueI18n(AppSpace, {
  components: { UserProfile: UserProfileI18n }
})

const SubSpace = i18n.defineSubSpace({ UserProfile: UserProfileI18n })

const subSpace = SubSpace.use()

const form = reactive({
  name: '',
  email: ''
})

const errors = ref<{ name?: boolean; email?: boolean }>({})

const handleSubmit = () => {
  errors.value = {}
  
  if (!form.name) errors.value.name = true
  if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) errors.value.email = true
  
  if (!Object.keys(errors.value).length) {
    console.log('Profile saved:', form)
  }
}
</script>
```

### Vue Router統合戦略

```typescript
// i18n/router-strategy.ts
import { defineVueI18nStrategy } from '@fastkit/vue-i18n'

export const routerStrategy = defineVueI18nStrategy({
  // ルートパスから言語を検出
  detectLocaleFromRoute: (route) => {
    const segments = route.path.split('/').filter(Boolean)
    const locale = segments[0]
    return ['ja', 'en', 'es'].includes(locale) ? locale : null
  },
  
  // 言語変更時のルート更新
  updateRouteOnLocaleChange: async (to, locale, router) => {
    const segments = to.path.split('/').filter(Boolean)
    const currentLocale = segments[0]
    
    if (['ja', 'en', 'es'].includes(currentLocale)) {
      segments[0] = locale
    } else {
      segments.unshift(locale)
    }
    
    const newPath = '/' + segments.join('/')
    await router.push(newPath)
  },
  
  // 初期言語の決定
  getInitialLocale: (availableLocales, clientLanguage) => {
    // クライアント言語を優先し、サポートしていない場合はデフォルト言語
    if (clientLanguage && availableLocales.includes(clientLanguage)) {
      return clientLanguage
    }
    return 'ja' // デフォルト言語
  }
})

// メインアプリケーションで使用
const i18n = createVueI18n(AppSpace, {
  components: AppComponents,
  strategy: routerStrategy
})
```

### SSR（サーバーサイドレンダリング）対応

```typescript
// server/i18n-setup.ts
import { createVueI18n } from '@fastkit/vue-i18n'
import { AppSpace, AppComponents } from '../shared/i18n/space'

export function createI18nForSSR(
  acceptLanguage?: string,
  initialPath?: string
) {
  return createVueI18n(AppSpace, {
    components: AppComponents,
    client: {
      // Accept-Languageヘッダーから言語を検出
      getClientLanguage: (availableLocales) => {
        if (!acceptLanguage) return null
        
        // Accept-Languageヘッダーをパース
        const languages = acceptLanguage
          .split(',')
          .map(lang => lang.split(';')[0].trim())
          .map(lang => lang.split('-')[0]) // 地域コードを除去
        
        // サポートしている言語を優先順位順で検索
        for (const lang of languages) {
          if (availableLocales.includes(lang)) {
            return lang
          }
        }
        
        return null
      },
      
      // SSR時のリダイレクト処理
      serverRedirect: (redirectTo) => {
        // Express.jsの例
        if (typeof globalThis !== 'undefined' && globalThis.ssrContext) {
          globalThis.ssrContext.redirect = redirectTo
        }
      },
      
      // 初期パスの設定
      initialPath: () => initialPath
    }
  })
}
```

### Cookieストレージの実装

```typescript
// utils/cookie-storage.ts
import { StrategyStorage } from '@fastkit/vue-i18n'

export class CookieStorage implements StrategyStorage {
  get(key: string): string | null {
    if (typeof document === 'undefined') return null
    
    const cookies = document.cookie.split(';')
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=')
      if (name === key) {
        return decodeURIComponent(value)
      }
    }
    return null
  }
  
  set(key: string, value: string): void {
    if (typeof document === 'undefined') return
    
    const expires = new Date()
    expires.setFullYear(expires.getFullYear() + 1) // 1年間有効
    
    document.cookie = `${key}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/`
  }
}

// 使用例
const i18n = createVueI18n(AppSpace, {
  components: AppComponents,
  client: {
    strategyStorage: new CookieStorage()
  }
})
```

### 動的翻訳の読み込み

```typescript
// composables/useAsyncTranslation.ts
import { ref, watch } from 'vue'
import { useI18nSpace } from '@fastkit/vue-i18n'

export function useAsyncTranslation<T>(
  loader: (locale: string) => Promise<T>
) {
  const i18n = useI18nSpace()
  const data = ref<T | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)
  
  const load = async (locale?: string) => {
    const targetLocale = locale || i18n.locale
    loading.value = true
    error.value = null
    
    try {
      data.value = await loader(targetLocale)
    } catch (err) {
      error.value = err as Error
    } finally {
      loading.value = false
    }
  }
  
  // 言語変更時に自動再読み込み
  watch(() => i18n.locale, load, { immediate: true })
  
  return {
    data,
    loading,
    error,
    reload: () => load()
  }
}

// 使用例
export default {
  setup() {
    const { data: productCategories, loading } = useAsyncTranslation(
      async (locale) => {
        const response = await fetch(`/api/categories?locale=${locale}`)
        return response.json()
      }
    )
    
    return {
      productCategories,
      loading
    }
  }
}
```

## API仕様

### `createVueI18n(Space, options?)`

Vue.jsアプリケーション用の国際化サービスを作成します。

**パラメータ:**
- `Space` (I18nSpaceStatic): 国際化スペース定義
- `options` (VueI18nSpaceOptions, optional): 初期化オプション

**戻り値:**
- `VueI18n`: Vue I18nサービスインスタンス

```typescript
interface VueI18nSpaceOptions {
  components?: I18nDependencies;          // 翻訳コンポーネントマッピング
  defaultLocale?: string;                 // デフォルト言語
  strategy?: VueI18nStrategyFactory;      // 言語切り替え戦略
  client?: VueI18nClientSettings;         // クライアント設定
  storage?: I18nStorageFactory;           // ストレージファクトリー
}

interface VueI18n {
  Space: I18nSpaceStatic;                 // スペース定義
  setup(): { space: I18nSpace; install: (app: App) => void };
  use(): I18nSpace;                       // 現在のスペースを取得
  defineSubSpace(components): SubSpaceProvider;
  setupRouter(router: Router): void;      // ルーター初期化
  extendRouterOptions(options: RouterOptions): void;
}
```

### `useI18nSpace()`

現在の国際化スペースを取得するComposition API関数。

```typescript
function useI18nSpace(): I18nSpace

interface I18nSpace {
  locale: string;                         // 現在の言語
  availableLocales: string[];             // 利用可能な言語リスト
  at: ComponentTranslations;              // 翻訳アクセサー
  setLocale(locale: string): Promise<void>; // 言語変更
  isLocaleAvailable(locale: string): boolean;
}
```

### `defineVueI18nStrategy(strategy)`

カスタム言語切り替え戦略を定義します。

```typescript
interface VueI18nStrategy {
  detectLocaleFromRoute?(route: RouteLocation): string | null;
  updateRouteOnLocaleChange?(
    route: RouteLocation, 
    locale: string, 
    router: Router
  ): Promise<void>;
  getInitialLocale?(
    availableLocales: string[], 
    clientLanguage?: string
  ): string;
  setupRouter?(router: Router): void;
  extendRouterOptions?(options: RouterOptions): void;
}
```

## 高度な使用例

### マルチテナント対応

```typescript
// multi-tenant-i18n.ts
import { createVueI18n } from '@fastkit/vue-i18n'
import { ref, computed } from 'vue'

interface TenantConfig {
  id: string
  supportedLocales: string[]
  defaultLocale: string
  components: any
}

export function createMultiTenantI18n(tenants: Record<string, TenantConfig>) {
  const currentTenant = ref<string>('')
  
  const i18nInstances = computed(() => {
    return Object.fromEntries(
      Object.entries(tenants).map(([id, config]) => [
        id,
        createVueI18n(config.space, {
          components: config.components,
          defaultLocale: config.defaultLocale
        })
      ])
    )
  })
  
  const currentI18n = computed(() => {
    return i18nInstances.value[currentTenant.value]
  })
  
  return {
    setTenant: (tenantId: string) => {
      currentTenant.value = tenantId
    },
    getCurrentI18n: () => currentI18n.value,
    getTenantI18n: (tenantId: string) => i18nInstances.value[tenantId]
  }
}
```

### プラグイン式翻訳拡張

```typescript
// plugins/i18n-formatter.ts
import { I18nSpace } from '@fastkit/vue-i18n'

export interface FormatPluginOptions {
  currency?: {
    code: string
    locale?: string
  }
  date?: {
    locale?: string
    format?: Intl.DateTimeFormatOptions
  }
}

export function createFormatPlugin(options: FormatPluginOptions = {}) {
  return {
    install(space: I18nSpace) {
      // 通貨フォーマット
      space.addFormatter('currency', (value: number) => {
        const { code = 'USD', locale } = options.currency || {}
        return new Intl.NumberFormat(locale || space.locale, {
          style: 'currency',
          currency: code
        }).format(value)
      })
      
      // 日付フォーマット
      space.addFormatter('date', (value: Date | string) => {
        const { locale, format } = options.date || {}
        const date = typeof value === 'string' ? new Date(value) : value
        return new Intl.DateTimeFormat(
          locale || space.locale, 
          format || { year: 'numeric', month: 'long', day: 'numeric' }
        ).format(date)
      })
      
      // 相対時間フォーマット
      space.addFormatter('relativeTime', (value: Date | string) => {
        const date = typeof value === 'string' ? new Date(value) : value
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
        
        const rtf = new Intl.RelativeTimeFormat(space.locale)
        return rtf.format(-diffDays, 'day')
      })
    }
  }
}
```

## 注意事項

### パフォーマンス考慮事項

- 翻訳コンポーネントは動的インポートを使用して遅延読み込み
- 大きな翻訳ファイルは分割して必要な部分のみ読み込み
- キャッシュ戦略を適切に設定してネットワーク要求を最小限に

### SSR/SSG対応

- サーバー側で言語検出を適切に実装
- ハイドレーション時の言語不整合を回避
- SEO用のhreflang属性を適切に設定

### アクセシビリティ

- lang属性を動的に更新
- 右から左へ（RTL）の言語に対応
- スクリーンリーダー向けの言語切り替え通知

## ライセンス

MIT

## 関連パッケージ

- [@fastkit/i18n](../i18n/README.md): コア国際化ライブラリ
- [@fastkit/accept-language](../accept-language/README.md): Accept-Languageヘッダー解析
- [@fastkit/vue-utils](../vue-utils/README.md): Vue.jsユーティリティ関数