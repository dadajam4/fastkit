# @fastkit/vue-page

🌐 [English](https://github.com/dadajam4/fastkit/blob/main/packages/vue-page/README.md) | 日本語

Vueアプリケーションのルーティングをより便利にコントロールするためのミドルウェア。データのプリフェッチ、エラーハンドリング、ページ状態管理、プログレス表示などの高度なルーティング機能を提供します。

## 機能

- **データプリフェッチ**: ページ遷移前の自動データ取得
- **エラーハンドリング**: 統一されたエラーページ表示システム
- **プログレス表示**: ページローディング状態の可視化
- **状態管理**: ページ間でのデータ共有と管理
- **SSR対応**: サーバーサイドレンダリング完全対応
- **クエリ監視**: URLクエリパラメータの変更監視
- **ミドルウェア**: ページアクセス前の処理実行
- **TypeScript完全サポート**: 厳密な型定義による型安全性

## インストール

```bash
npm install @fastkit/vue-page
```

## 基本的な使用方法

### アプリケーションの設定

```typescript
// main.ts
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { VuePageControl } from '@fastkit/vue-page'
import App from './App.vue'

const app = createApp(App)

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // ルート定義
  ]
})

// VuePageControl の設定
const pageControl = new VuePageControl({
  app,
  router,

  // エラーページコンポーネント
  errorComponent: () => import('./components/ErrorPage.vue'),

  // グローバルローディング設定
  loading: {
    component: () => import('./components/Loading.vue'),
    delay: 200
  }
})

app.use(router)
app.mount('#app')
```

### ルートコンポーネントの設定

```vue
<!-- App.vue -->
<template>
  <div class="app">
    <!-- ページプログレス表示 -->
    <VPageProgress />

    <!-- ページルート -->
    <VPageRoot>
      <router-view />
    </VPageRoot>
  </div>
</template>

<script setup lang="ts">
import { VPageProgress, VPageRoot } from '@fastkit/vue-page'
</script>
```

## データプリフェッチ

### 基本的なプリフェッチ

```vue
<!-- UserProfile.vue -->
<template>
  <div class="user-profile">
    <h1>{{ user.name }}</h1>
    <p>{{ user.email }}</p>
  </div>
</template>

<script setup lang="ts">
import { definePageOptions } from '@fastkit/vue-page'

// ページデータの定義
const user = ref(null)

// プリフェッチ関数の定義
definePageOptions({
  async prefetch({ route, pageControl }) {
    // ユーザーIDをルートパラメータから取得
    const userId = route.params.id

    // APIからユーザーデータを取得
    const response = await fetch(`/api/users/${userId}`)
    const userData = await response.json()

    // リアクティブな状態に設定
    user.value = userData

    return {
      user: userData
    }
  }
})
</script>
```

### 条件付きプリフェッチ

```vue
<script setup lang="ts">
import { definePageOptions, useVuePageControl } from '@fastkit/vue-page'

definePageOptions({
  async prefetch({ route, pageControl, isClient, isServer }) {
    // クライアントサイドでのみ実行
    if (isClient) {
      const analytics = await import('./analytics')
      analytics.trackPageView(route.path)
    }

    // サーバーサイドでのみ実行
    if (isServer) {
      const seoData = await generateSEOData(route)
      return { seoData }
    }

    // 認証状態に基づく条件分岐
    const { user } = pageControl.state
    if (user.isAuthenticated) {
      const privateData = await fetchPrivateData()
      return { privateData }
    }

    return {}
  }
})
</script>
```

### 依存関係のあるプリフェッチ

```vue
<script setup lang="ts">
definePageOptions({
  async prefetch({ route, pageControl }) {
    // 順次実行
    const category = await fetchCategory(route.params.categoryId)
    const products = await fetchProducts(category.id)
    const reviews = await fetchReviews(products.map(p => p.id))

    return {
      category,
      products,
      reviews
    }
  },

  // 並行実行
  async prefetch({ route }) {
    const [category, tags, brands] = await Promise.all([
      fetchCategory(route.params.categoryId),
      fetchTags(),
      fetchBrands()
    ])

    return {
      category,
      tags,
      brands
    }
  }
})
</script>
```

## エラーハンドリング

### カスタムエラーページ

```vue
<!-- ErrorPage.vue -->
<template>
  <div class="error-page">
    <h1>{{ errorTitle }}</h1>
    <p>{{ errorMessage }}</p>
    <button @click="retry">再試行</button>
    <router-link to="/">ホームに戻る</router-link>
  </div>
</template>

<script setup lang="ts">
import { useVuePageControl } from '@fastkit/vue-page'

const pageControl = useVuePageControl()
const error = computed(() => pageControl.error)

const errorTitle = computed(() => {
  if (!error.value) return 'エラー'

  switch (error.value.statusCode) {
    case 404: return 'ページが見つかりません'
    case 403: return 'アクセスが拒否されました'
    case 500: return 'サーバーエラー'
    default: return 'エラーが発生しました'
  }
})

const errorMessage = computed(() => {
  return error.value?.message || '予期しないエラーが発生しました'
})

const retry = () => {
  pageControl.reload()
}
</script>
```

### プリフェッチエラーの処理

```vue
<script setup lang="ts">
definePageOptions({
  async prefetch({ route }) {
    try {
      const data = await fetchData(route.params.id)
      return { data }
    } catch (error) {
      // カスタムエラーを投げる
      if (error.status === 404) {
        throw new VuePageControlError('データが見つかりません', 404)
      }

      // エラーを再スロー
      throw error
    }
  },

  // エラー時のフォールバック
  onError({ error, route, pageControl }) {
    console.error('プリフェッチエラー:', error)

    // デフォルトデータを返す
    return {
      data: getDefaultData()
    }
  }
})
</script>
```

## ページ状態管理

### グローバル状態の管理

```typescript
// pageControl.ts
import { VuePageControl } from '@fastkit/vue-page'

export const pageControl = new VuePageControl({
  // 初期状態
  initialState: {
    user: null,
    theme: 'light',
    locale: 'ja'
  },

  // 状態の永続化
  persistentKeys: ['theme', 'locale']
})

// 状態の更新
pageControl.setState({
  user: {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com'
  }
})

// 状態の取得
const user = pageControl.getState('user')
const theme = pageControl.getState('theme')
```

### ページ固有の状態

```vue
<script setup lang="ts">
import { usePageState } from '@fastkit/vue-page'

// ページ固有の状態
const pageState = usePageState({
  selectedTab: 'overview',
  searchQuery: '',
  filterOptions: {}
})

// 状態の更新
const updateTab = (tab: string) => {
  pageState.selectedTab = tab
}

// 状態の監視
watch(() => pageState.searchQuery, (query) => {
  performSearch(query)
})
</script>
```

## ミドルウェア

### 認証ミドルウェア

```typescript
// middleware/auth.ts
import { VuePageControlMiddlewareFn } from '@fastkit/vue-page'

export const authMiddleware: VuePageControlMiddlewareFn = async ({
  route,
  pageControl,
  redirect
}) => {
  const user = pageControl.getState('user')

  // 認証が必要なページかチェック
  if (route.meta.requiresAuth && !user) {
    // ログインページにリダイレクト
    return redirect('/login', {
      query: { redirect: route.fullPath }
    })
  }

  // 管理者権限が必要かチェック
  if (route.meta.requiresAdmin && !user?.isAdmin) {
    throw new VuePageControlError('管理者権限が必要です', 403)
  }
}
```

### ページアクセスログ

```typescript
// middleware/analytics.ts
export const analyticsMiddleware: VuePageControlMiddlewareFn = async ({
  route,
  pageControl
}) => {
  // ページビューをトラッキング
  if (typeof window !== 'undefined') {
    gtag('config', 'GA_MEASUREMENT_ID', {
      page_title: route.meta.title,
      page_location: window.location.href
    })
  }

  // ユーザー行動を記録
  const user = pageControl.getState('user')
  if (user) {
    await trackUserPageVisit(user.id, route.path)
  }
}
```

### ミドルウェアの登録

```typescript
// router/index.ts
import { authMiddleware, analyticsMiddleware } from './middleware'

const pageControl = new VuePageControl({
  // グローバルミドルウェア
  middleware: [
    authMiddleware,
    analyticsMiddleware
  ]
})

// ルート固有のミドルウェア
const routes = [
  {
    path: '/admin',
    component: AdminPage,
    meta: {
      requiresAuth: true,
      requiresAdmin: true,
      middleware: [adminMiddleware]
    }
  }
]
```

## プログレス表示

### カスタムプログレス

```vue
<!-- CustomProgress.vue -->
<template>
  <div
    v-if="isProgressing"
    class="page-progress"
    :class="{ 'progress-error': hasError }"
  >
    <div
      class="progress-bar"
      :style="{ width: `${progress}%` }"
    ></div>
    <div class="progress-message">
      {{ progressMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useVuePageControl } from '@fastkit/vue-page'

const pageControl = useVuePageControl()

const isProgressing = computed(() => pageControl.isProgressing)
const hasError = computed(() => !!pageControl.error)
const progress = computed(() => pageControl.progress)

const progressMessage = computed(() => {
  if (hasError.value) return 'エラーが発生しました'
  if (isProgressing.value) return 'ページを読み込み中...'
  return ''
})
</script>

<style scoped>
.page-progress {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: rgba(0, 0, 0, 0.1);
  z-index: 9999;
}

.progress-bar {
  height: 100%;
  background: #3b82f6;
  transition: width 0.3s ease;
}

.progress-error .progress-bar {
  background: #ef4444;
}
</style>
```

## SSR対応

### サーバーサイドでの設定

```typescript
// server.ts
import { VuePageControl } from '@fastkit/vue-page/server'

export async function renderPage(url: string) {
  const pageControl = new VuePageControl({
    // サーバーサイド設定
    ssrContext: {
      url,
      userAgent: req.headers['user-agent']
    }
  })

  // プリフェッチの実行
  await pageControl.prefetchRoute(url)

  // アプリケーションのレンダリング
  const html = await renderToString(app)

  // 状態の抽出
  const state = pageControl.extractState()

  return {
    html,
    state
  }
}
```

### クライアントサイドでの復元

```typescript
// entry-client.ts
import { VuePageControl } from '@fastkit/vue-page'

// サーバーから渡された状態を復元
const initialState = window.__INITIAL_STATE__

const pageControl = new VuePageControl({
  initialState,

  // ハイドレーション設定
  hydration: true
})

// アプリケーションをマウント
app.mount('#app')
```

## 高度な使用例

### 動的ルーティング

```vue
<script setup lang="ts">
definePageOptions({
  async prefetch({ route, pageControl, redirect }) {
    const slug = route.params.slug

    // スラッグから実際のページを解決
    const page = await resolvePageBySlug(slug)

    if (!page) {
      throw new VuePageControlError('ページが見つかりません', 404)
    }

    // 動的にコンポーネントを決定
    if (page.type === 'product') {
      return redirect(`/products/${page.id}`)
    }

    return { page }
  }
})
</script>
```

### キャッシュ戦略

```vue
<script setup lang="ts">
definePageOptions({
  async prefetch({ route, pageControl }) {
    const cacheKey = `page:${route.path}`

    // キャッシュから取得を試行
    let data = pageControl.cache.get(cacheKey)

    if (!data) {
      // APIから取得
      data = await fetchPageData(route.params.id)

      // キャッシュに保存（5分間）
      pageControl.cache.set(cacheKey, data, 5 * 60 * 1000)
    }

    return { data }
  },

  // ページ離脱時のクリーンアップ
  onLeave({ pageControl }) {
    // リソースの解放
    pageControl.cache.clear()
  }
})
</script>
```

### リアルタイム更新

```vue
<script setup lang="ts">
import { useVuePageControl } from '@fastkit/vue-page'

const pageControl = useVuePageControl()
const data = ref(null)

definePageOptions({
  async prefetch({ route }) {
    data.value = await fetchData(route.params.id)
    return { data: data.value }
  },

  // ページマウント後の処理
  onMounted({ route }) {
    // WebSocket接続
    const ws = new WebSocket(`ws://localhost/updates/${route.params.id}`)

    ws.onmessage = (event) => {
      const update = JSON.parse(event.data)

      // データを更新
      data.value = { ...data.value, ...update }

      // 状態を同期
      pageControl.setState({ data: data.value })
    }

    // クリーンアップの登録
    pageControl.onCleanup(() => {
      ws.close()
    })
  }
})
</script>
```

## API リファレンス

### VuePageControl

```typescript
class VuePageControl {
  constructor(options: VuePageControlOptions)

  // 状態管理
  getState<T>(key: string): T
  setState(state: Record<string, any>): void

  // ナビゲーション
  push(location: RouteLocationRaw): Promise<void>
  replace(location: RouteLocationRaw): Promise<void>
  go(delta: number): void
  back(): void
  forward(): void

  // プリフェッチ
  prefetch(location: RouteLocationRaw): Promise<any>

  // エラーハンドリング
  error: Ref<VuePageControlError | null>
  clearError(): void

  // プログレス
  isProgressing: Ref<boolean>
  progress: Ref<number>

  // クリーンアップ
  onCleanup(fn: () => void): void
}
```

### definePageOptions

```typescript
interface PageOptions {
  prefetch?: VuePagePrefetchFn
  middleware?: VuePageControlMiddlewareFn[]
  watchQuery?: WatchQueryOption
  key?: VuePageKeyOverride
  loading?: boolean | LoadingOptions
  onError?: (context: ErrorContext) => any
  onMounted?: (context: MountedContext) => void
  onLeave?: (context: LeaveContext) => void
}

function definePageOptions(options: PageOptions): void
```

### コンポーネント

- `VPageRoot`: ページルートコンテナ
- `VPageProgress`: プログレス表示
- `VErrorPage`: デフォルトエラーページ
- `VPage`: ページラッパー
- `VPageLink`: ページリンク

## 関連パッケージ

- `@fastkit/vue-utils` - Vue ユーティリティ関数
- `@fastkit/cookies` - Cookie 管理
- `@fastkit/ev` - イベントシステム
- `@fastkit/helpers` - ヘルパー関数
- `@fastkit/tiny-logger` - ロガー
- `vue` - Vue.js フレームワーク（ピア依存関係）
- `vue-router` - Vue Router（ピア依存関係）

## ライセンス

MIT
