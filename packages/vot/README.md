# @fastkit/vot

🌐 English | [日本語](./README-ja.md)

Vueアプリケーションを構築するための包括的なオーケストレーションツール・フレームワーク。SSR (Server-Side Rendering)、静的サイト生成、プラグインシステム、開発サーバーなどの統合された開発体験を提供します。

## Features

- **SSR & 静的生成**: Server-Side Rendering と静的サイト生成の両方をサポート
- **統合開発サーバー**: Vite ベースの高速開発サーバー
- **プラグインシステム**: 拡張可能なプラグインアーキテクチャ
- **ファイルベースルーティング**: 自動的なページルート生成
- **TypeScript完全サポート**: 厳密な型定義による型安全性
- **Vue 3 + Vue Router 4**: 最新のVueエコシステム対応
- **Head管理**: Unheadによるメタタグ・SEO最適化
- **プロキシサポート**: 開発時のAPIプロキシ機能

## Installation

```bash
npm install @fastkit/vot
```

## CLI使用方法

```bash
# 開発サーバー起動
npx vot dev

# 本番ビルド
npx vot build

# 静的サイト生成
npx vot generate

# その他のオプション
npx vot --help
```

## 基本的な設定

### vot.config.ts

```typescript
import { defineVotConfig } from '@fastkit/vot/tool'

export default defineVotConfig({
  // アプリケーション設定
  app: {
    // アプリケーション名
    name: 'My Vue App',
    
    // ベースURL
    base: '/',
    
    // 出力ディレクトリ
    outDir: 'dist',
    
    // 開発サーバー設定
    dev: {
      port: 3000,
      host: 'localhost'
    }
  },

  // SSR設定
  ssr: {
    // SSRを有効にする
    enabled: true,
    
    // サーバーエントリーポイント
    ssrEntry: 'src/entry-server.ts',
    
    // プラグイン設定
    plugin: 'src/plugins/ssr.ts'
  },

  // ビルド設定
  build: {
    // クライアント用Vite設定
    clientOptions: {
      build: {
        sourcemap: true
      }
    },
    
    // サーバー用Vite設定
    serverOptions: {
      build: {
        minify: false
      }
    }
  },

  // Viteプラグイン
  vite: {
    plugins: [
      // カスタムプラグイン
    ]
  }
})
```

## エントリーポイントの設定

### src/main.ts (クライアント & サーバー共通)

```typescript
import { createVotApp } from '@fastkit/vot'
import { createHead } from '@unhead/vue'
import App from './App.vue'

// Votアプリケーションの作成
export const { createApp } = createVotApp({
  // メインコンポーネント
  App,
  
  // Vueアプリケーション設定
  async setupApp(ctx) {
    const { app, router } = ctx
    
    // Head管理の設定
    const head = createHead()
    app.use(head)
    
    // グローバルコンポーネントの登録
    // app.component('MyComponent', MyComponent)
    
    // プラグインの設定
    // app.use(myPlugin)
  },

  // ルーター設定
  async setupRouter(ctx) {
    const { router } = ctx
    
    // ルートガード設定
    router.beforeEach((to, from, next) => {
      // 認証チェックなど
      next()
    })
  },

  // プラグイン
  plugins: [
    // カスタムプラグイン
  ]
})
```

### src/entry-client.ts (クライアント用)

```typescript
import { createApp } from './main'

createApp().then(({ app, router }) => {
  // ルーターの準備完了まで待機
  router.isReady().then(() => {
    // DOMにマウント
    app.mount('#app')
  })
})
```

### src/entry-server.ts (サーバー用)

```typescript
import { createApp } from './main'
import type { VotServerRenderContext } from '@fastkit/vot/server'

export async function render(ctx: VotServerRenderContext) {
  const { app, router } = await createApp()
  
  // サーバーサイドでのルーティング
  await router.push(ctx.url)
  await router.isReady()
  
  return { app }
}
```

## プラグインシステム

### プラグインの作成

```typescript
import { createVotPlugin } from '@fastkit/vot'
import type { VuePageControl } from '@fastkit/vue-page'

// シンプルなプラグイン
export const mySimplePlugin = createVotPlugin((ctx: VuePageControl) => {
  // プラグイン初期化処理
  console.log('Plugin initialized:', ctx.app)
})

// フックを使用したプラグイン
export const myAdvancedPlugin = createVotPlugin({
  setup(ctx: VuePageControl) {
    // セットアップ処理
    console.log('Advanced plugin setup')
  },
  
  // ルーター設定前のフック
  beforeRouterSetup(params) {
    console.log('Before router setup:', params)
  },
  
  // ルーター設定後のフック
  afterRouterSetup(params) {
    console.log('After router setup:', params)
  }
})
```

### プラグインの使用

```typescript
import { createVotApp } from '@fastkit/vot'
import { mySimplePlugin, myAdvancedPlugin } from './plugins'

export const { createApp } = createVotApp({
  // プラグインの登録
  plugins: [
    mySimplePlugin,
    myAdvancedPlugin
  ]
})
```

## ページコンポーネント

### src/pages/index.vue

```vue
<template>
  <div>
    <h1>{{ title }}</h1>
    <p>{{ description }}</p>
  </div>
</template>

<script setup lang="ts">
import { useHead } from '@unhead/vue'

// ページメタデータ
useHead({
  title: 'ホームページ',
  meta: [
    { name: 'description', content: 'サイトのホームページです' }
  ]
})

// ページデータ
const title = 'ようこそ'
const description = 'Votフレームワークへようこそ！'
</script>
```

### 動的ルート: src/pages/users/[id].vue

```vue
<template>
  <div>
    <h1>ユーザー: {{ user?.name }}</h1>
    <p>{{ user?.email }}</p>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { ref, onMounted } from 'vue'

const route = useRoute()
const user = ref<{ name: string; email: string } | null>(null)

onMounted(async () => {
  // ユーザーデータの取得
  const response = await fetch(`/api/users/${route.params.id}`)
  user.value = await response.json()
})
</script>
```

## 開発サーバーのカスタマイズ

### src/server/dev.ts

```typescript
import type { VotConfigureServerFn } from '@fastkit/vot'
import express from 'express'

export const configureServer: VotConfigureServerFn = ({ use }) => {
  // APIエンドポイントの追加
  const apiRouter = express.Router()
  
  apiRouter.get('/users/:id', (req, res) => {
    res.json({
      id: req.params.id,
      name: `User ${req.params.id}`,
      email: `user${req.params.id}@example.com`
    })
  })
  
  use('/api', apiRouter)
  
  // 静的ファイルの配信
  use('/uploads', express.static('uploads'))
  
  // クリーンアップ関数を返す
  return () => {
    console.log('Development server cleanup')
  }
}
```

## 静的サイト生成

### generate設定

```typescript
// vot.config.ts
export default defineVotConfig({
  generate: {
    // 生成するルート
    routes: [
      '/',
      '/about',
      '/users/1',
      '/users/2'
    ],
    
    // 動的ルート生成
    async generateRoutes() {
      const users = await fetchUsers()
      return users.map(user => `/users/${user.id}`)
    },
    
    // 出力ディレクトリ
    outDir: 'dist-static'
  }
})
```

### 生成実行

```bash
# 静的サイト生成
npx vot generate

# 特定のルートのみ生成
npx vot generate --routes="/" "/about"
```

## Advanced Usage Examples

### 認証プラグイン

```typescript
import { createVotPlugin } from '@fastkit/vot'
import { ref, provide } from 'vue'

export const authPlugin = createVotPlugin({
  setup(ctx) {
    const user = ref(null)
    const isAuthenticated = computed(() => !!user.value)
    
    // 認証状態をプロバイド
    provide('auth', {
      user: readonly(user),
      isAuthenticated: readonly(isAuthenticated),
      login: async (credentials) => {
        // ログイン処理
        const response = await fetch('/api/login', {
          method: 'POST',
          body: JSON.stringify(credentials)
        })
        user.value = await response.json()
      },
      logout: () => {
        user.value = null
      }
    })
  },
  
  afterRouterSetup({ router }) {
    // 認証が必要なルートの保護
    router.beforeEach((to, from, next) => {
      if (to.meta.requiresAuth && !user.value) {
        next('/login')
      } else {
        next()
      }
    })
  }
})
```

### 国際化プラグイン

```typescript
import { createVotPlugin } from '@fastkit/vot'
import { createI18n } from 'vue-i18n'

export const i18nPlugin = createVotPlugin({
  setup(ctx) {
    const i18n = createI18n({
      locale: 'ja',
      fallbackLocale: 'en',
      messages: {
        ja: {
          hello: 'こんにちは',
          welcome: 'ようこそ'
        },
        en: {
          hello: 'Hello',
          welcome: 'Welcome'
        }
      }
    })
    
    ctx.app.use(i18n)
  }
})
```

### 状態管理プラグイン

```typescript
import { createVotPlugin } from '@fastkit/vot'
import { createPinia } from 'pinia'

export const storePlugin = createVotPlugin({
  setup(ctx) {
    const pinia = createPinia()
    ctx.app.use(pinia)
  }
})
```

## パフォーマンス最適化

### プリロード設定

```typescript
// vot.config.ts
export default defineVotConfig({
  build: {
    clientOptions: {
      build: {
        rollupOptions: {
          output: {
            manualChunks: {
              vendor: ['vue', 'vue-router'],
              ui: ['@headlessui/vue', '@heroicons/vue']
            }
          }
        }
      }
    }
  }
})
```

### レイジーローディング

```typescript
// src/router/routes.ts
import { defineAsyncComponent } from 'vue'

export default [
  {
    path: '/heavy-page',
    component: defineAsyncComponent(() => import('../pages/HeavyPage.vue'))
  }
]
```

## デバッグとテスト

### 開発モードでのデバッグ

```typescript
// vot.config.ts
export default defineVotConfig({
  dev: {
    // ソースマップを有効にする
    sourcemap: true,
    
    // Hot Module Replacement
    hmr: true,
    
    // デバッグログ
    logLevel: 'info'
  }
})
```

### E2Eテスト統合

```typescript
// tests/e2e/basic.spec.ts
import { test, expect } from '@playwright/test'

test('ホームページが正しく表示される', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('h1')).toContainText('ようこそ')
})
```

## API リファレンス

### createVotApp

```typescript
function createVotApp(options: VotAppOptions): { createApp: () => Promise<VotAppInstance> }
```

メインのVotアプリケーションを作成します。

### createVotPlugin

```typescript
function createVotPlugin(plugin: RawVotPlugin): VotPlugin
```

Votプラグインを作成します。

### defineVotConfig

```typescript
function defineVotConfig(config: VotConfig): VotConfig
```

Vot設定を定義します。

### 主要な型定義

```typescript
interface VotAppOptions {
  App: Component
  setupApp?(ctx: VuePageControl): Promise<void> | void
  setupRouter?(ctx: VuePageControl): Promise<void> | void
  plugins?: RawVotPlugin[]
}

interface VotConfig {
  app?: AppConfig
  ssr?: SsrOptions
  build?: BuildOptions
  generate?: GenerateOptions
  vite?: ViteConfig
}
```

## CLIコマンド

| コマンド | 説明 |
|----------|------|
| `vot dev` | 開発サーバーを起動 |
| `vot build` | 本番用にビルド |
| `vot generate` | 静的サイトを生成 |
| `vot preview` | ビルド結果をプレビュー |

### CLIオプション

```bash
# ポート指定
vot dev --port 8080

# ホスト指定
vot dev --host 0.0.0.0

# 設定ファイル指定
vot build --config vot.prod.config.ts

# ログレベル指定
vot dev --log-level debug
```

## ディレクトリ構造

```
my-vot-app/
├── src/
│   ├── pages/           # ページコンポーネント
│   ├── components/      # 再利用可能コンポーネント
│   ├── layouts/         # レイアウトコンポーネント
│   ├── plugins/         # Votプラグイン
│   ├── server/          # サーバー設定
│   ├── main.ts          # メインエントリー
│   ├── entry-client.ts  # クライアントエントリー
│   └── entry-server.ts  # サーバーエントリー
├── vot.config.ts        # Vot設定
└── package.json
```

## Related Packages

- `@fastkit/vue-page` - Vue ページ管理システム
- `@fastkit/vue-utils` - Vue ユーティリティ関数
- `@fastkit/helpers` - ヘルパー関数
- `vite` - ビルドツール
- `vue` - Vue.js フレームワーク
- `vue-router` - Vue Router
- `@unhead/vue` - Head 管理

## License

MIT
