
# @fastkit/vue-app-layout

🌐 English | [日本語](https://github.com/dadajam4/fastkit/blob/main/packages/vue-app-layout/README-ja.md)

A comprehensive component implementation for controlling the overall layout of Vue applications. Provides UI patterns such as responsive application layouts, drawers, toolbars, sidebars, and stack navigation.

## Features

- **Responsive Layout**: Adaptive layout compatible with device sizes
- **Drawer Navigation**: Slide-style side menu system
- **Toolbar**: Header and footer area management
- **Stack**: Multi-layer content navigation
- **Flexible Placement**: Free placement of top, bottom, left, right
- **Viewport Management**: Automatic adjustment of screen size and layout
- **Scroll Control**: Body scroll lock and custom scroll
- **Animation**: Smooth transition effects

## Installation

```bash
npm install @fastkit/vue-app-layout
```

## Basic Usage

### CSS Import

```typescript
// main.ts
import '@fastkit/vue-app-layout/vue-app-layout.css'
```

### Basic Layout Setup

```vue
<template>
  <VAppLayout>
    <template #default="{ layout }">
      <!-- System bar -->
      <VAppSystemBar>
        App Title
      </VAppSystemBar>

      <!-- Main toolbar -->
      <VAppToolbar>
        <button @click="layout.toggleDrawer('left')">
          Menu
        </button>
        <h1>Page Title</h1>
      </VAppToolbar>

      <!-- Left side drawer -->
      <VAppDrawer position="left">
        <nav>
          <router-link to="/">Home</router-link>
          <router-link to="/about">About</router-link>
          <router-link to="/contact">Contact</router-link>
        </nav>
      </VAppDrawer>

      <!-- Main content area -->
      <VAppBody>
        <VAppContainer>
          <router-view />
        </VAppContainer>
      </VAppBody>

      <!-- Footer toolbar -->
      <VAppBottom>
        <p>&copy; 2024 My App</p>
      </VAppBottom>
    </template>
  </VAppLayout>
</template>

<script setup lang="ts">
import {
  VAppLayout,
  VAppSystemBar,
  VAppToolbar,
  VAppDrawer,
  VAppBody,
  VAppContainer,
  VAppBottom
} from '@fastkit/vue-app-layout'
</script>
```

## Drawer Navigation

### Basic Drawer

```vue
<template>
  <VAppLayout>
    <template #default="{ layout }">
      <VAppToolbar>
        <button @click="layout.toggleDrawer('left')">
          <i class="menu-icon"></i>
        </button>
        <h1>App Title</h1>
      </VAppToolbar>

      <!-- 左ドロワー -->
      <VAppDrawer
        position="left"
        :width="280"
        :persistent="isDesktop"
        :overlay="!isDesktop"
      >
        <div class="drawer-header">
          <h2>Navigation</h2>
        </div>
        <nav class="drawer-nav">
          <router-link to="/" @click="closeDrawerOnMobile">
            <i class="icon-home"></i>
            ホーム
          </router-link>
          <router-link to="/products" @click="closeDrawerOnMobile">
            <i class="icon-products"></i>
            商品一覧
          </router-link>
          <router-link to="/about" @click="closeDrawerOnMobile">
            <i class="icon-info"></i>
            会社情報
          </router-link>
        </nav>
      </VAppDrawer>

      <VAppBody>
        <router-view />
      </VAppBody>
    </template>
  </VAppLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useVueAppLayout } from '@fastkit/vue-app-layout'

const layout = useVueAppLayout()
const isDesktop = computed(() => layout.viewportRect.value.width >= 1024)

const closeDrawerOnMobile = () => {
  if (!isDesktop.value) {
    layout.closeDrawer('left')
  }
}
</script>
```

### 右サイドドロワー

```vue
<template>
  <VAppLayout>
    <template #default="{ layout }">
      <VAppToolbar>
        <h1>App</h1>
        <button @click="layout.toggleDrawer('right')">
          設定
        </button>
      </VAppToolbar>

      <!-- 右ドロワー -->
      <VAppDrawer
        position="right"
        :width="320"
        overlay
      >
        <div class="settings-panel">
          <h3>設定</h3>

          <div class="setting-group">
            <label>テーマ</label>
            <select v-model="theme">
              <option value="light">ライト</option>
              <option value="dark">ダーク</option>
            </select>
          </div>

          <div class="setting-group">
            <label>言語</label>
            <select v-model="language">
              <option value="ja">日本語</option>
              <option value="en">English</option>
            </select>
          </div>

          <button @click="layout.closeDrawer('right')">
            Close
          </button>
        </div>
      </VAppDrawer>

      <VAppBody>
        <router-view />
      </VAppBody>
    </template>
  </VAppLayout>
</template>
```

## ツールバーとバー

### マルチレベルツールバー

```vue
<template>
  <VAppLayout>
    <template #default="{ layout }">
      <!-- システムバー -->
      <VAppSystemBar class="system-bar">
        <span class="system-info">System Status: Online</span>
        <span class="system-time">{{ currentTime }}</span>
      </VAppSystemBar>

      <!-- メインツールバー -->
      <VAppToolbar class="main-toolbar">
        <button @click="layout.toggleDrawer('left')">
          <i class="menu-icon"></i>
        </button>
        <div class="toolbar-title">
          <h1>{{ pageTitle }}</h1>
          <span class="subtitle">{{ pageSubtitle }}</span>
        </div>
        <div class="toolbar-actions">
          <button class="search-btn">
            <i class="search-icon"></i>
          </button>
          <button class="notifications-btn">
            <i class="bell-icon"></i>
            <span class="badge">3</span>
          </button>
          <button class="profile-btn">
            <img :src="userAvatar" alt="Profile" />
          </button>
        </div>
      </VAppToolbar>

      <!-- サブツールバー（タブナビゲーション） -->
      <VAppToolbar class="sub-toolbar">
        <nav class="tab-navigation">
          <router-link to="/dashboard" class="tab">
            ダッシュボード
          </router-link>
          <router-link to="/analytics" class="tab">
            分析
          </router-link>
          <router-link to="/settings" class="tab">
            設定
          </router-link>
        </nav>
      </VAppToolbar>

      <VAppBody>
        <router-view />
      </VAppBody>
    </template>
  </VAppLayout>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const currentTime = ref(new Date().toLocaleTimeString())

const pageTitle = computed(() => route.meta.title || 'App')
const pageSubtitle = computed(() => route.meta.subtitle)
const userAvatar = ref('/images/user-avatar.jpg')

// 時計の更新
let timeInterval: number
onMounted(() => {
  timeInterval = setInterval(() => {
    currentTime.value = new Date().toLocaleTimeString()
  }, 1000)
})

onUnmounted(() => {
  clearInterval(timeInterval)
})
</script>
```

## スタックナビゲーション

```vue
<template>
  <VAppLayout>
    <template #default="{ layout }">
      <VAppToolbar>
        <button
          v-if="canGoBack"
          @click="layout.popStack()"
        >
          <i class="back-icon"></i>
        </button>
        <h1>{{ currentStackTitle }}</h1>
      </VAppToolbar>

      <!-- スタックコンテナ -->
      <VAppStack>
        <router-view />
      </VAppStack>
    </template>
  </VAppLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useVueAppLayout } from '@fastkit/vue-app-layout'

const layout = useVueAppLayout()

const canGoBack = computed(() => layout.stackDepth.value > 1)
const currentStackTitle = computed(() => {
  const currentStack = layout.currentStack.value
  return currentStack?.title || 'Page'
})

// Example of pushing to stack
const pushToStack = (component: any, props: any = {}) => {
  layout.pushStack({
    component,
    props,
    title: 'New Page'
  })
}
</script>
```

## レスポンシブ対応

### ブレークポイントベースのレイアウト

```vue
<template>
  <VAppLayout>
    <template #default="{ layout }">
      <VAppToolbar>
        <!-- モバイル: ハンバーガーメニュー -->
        <button
          v-if="isMobile"
          @click="layout.toggleDrawer('left')"
        >
          <i class="menu-icon"></i>
        </button>

        <h1>App</h1>

        <!-- デスクトップ: 検索バー -->
        <div v-if="isDesktop" class="search-bar">
          <input type="search" placeholder="検索..." />
        </div>
      </VAppToolbar>

      <!-- 左ドロワー：レスポンシブ設定 -->
      <VAppDrawer
        position="left"
        :width="drawerWidth"
        :persistent="isDesktop"
        :overlay="isMobile"
        :mini="isTablet && !layout.isDrawerOpen('left')"
      >
        <nav class="responsive-nav">
          <router-link
            v-for="item in navigationItems"
            :key="item.path"
            :to="item.path"
            class="nav-item"
            :class="{ 'mini': isTablet && !layout.isDrawerOpen('left') }"
          >
            <i :class="item.icon"></i>
            <span v-if="!isTablet || layout.isDrawerOpen('left')">
              {{ item.label }}
            </span>
          </router-link>
        </nav>
      </VAppDrawer>

      <VAppBody>
        <VAppContainer :fluid="isMobile">
          <router-view />
        </VAppContainer>
      </VAppBody>

      <!-- モバイル: ボトムナビゲーション -->
      <VAppBottom v-if="isMobile">
        <nav class="bottom-nav">
          <router-link
            v-for="item in bottomNavItems"
            :key="item.path"
            :to="item.path"
            class="bottom-nav-item"
          >
            <i :class="item.icon"></i>
            <span>{{ item.label }}</span>
          </router-link>
        </nav>
      </VAppBottom>
    </template>
  </VAppLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useVueAppLayout } from '@fastkit/vue-app-layout'

const layout = useVueAppLayout()

// レスポンシブブレークポイント
const isMobile = computed(() => layout.viewportRect.value.width < 768)
const isTablet = computed(() =>
  layout.viewportRect.value.width >= 768 &&
  layout.viewportRect.value.width < 1024
)
const isDesktop = computed(() => layout.viewportRect.value.width >= 1024)

// ドロワー幅の動的調整
const drawerWidth = computed(() => {
  if (isMobile.value) return 280
  if (isTablet.value) return 64  // ミニドロワー
  return 320
})

const navigationItems = [
  { path: '/', icon: 'icon-home', label: 'ホーム' },
  { path: '/products', icon: 'icon-box', label: '商品' },
  { path: '/orders', icon: 'icon-shopping', label: '注文' },
  { path: '/customers', icon: 'icon-users', label: '顧客' },
  { path: '/analytics', icon: 'icon-chart', label: '分析' }
]

const bottomNavItems = [
  { path: '/', icon: 'icon-home', label: 'ホーム' },
  { path: '/search', icon: 'icon-search', label: '検索' },
  { path: '/favorites', icon: 'icon-heart', label: 'お気に入り' },
  { path: '/profile', icon: 'icon-user', label: 'プロフィール' }
]
</script>
```

## 高度なカスタマイズ

### カスタムテーマ

```vue
<template>
  <VAppLayout :class="themeClass">
    <!-- レイアウトコンテンツ -->
  </VAppLayout>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

const currentTheme = ref('light')

const themeClass = computed(() => `theme-${currentTheme.value}`)

const toggleTheme = () => {
  currentTheme.value = currentTheme.value === 'light' ? 'dark' : 'light'
}
</script>

<style>
/* ライトテーマ */
.theme-light {
  --app-bg-color: #ffffff;
  --app-text-color: #333333;
  --toolbar-bg: #f5f5f5;
  --drawer-bg: #ffffff;
}

/* ダークテーマ */
.theme-dark {
  --app-bg-color: #1a1a1a;
  --app-text-color: #ffffff;
  --toolbar-bg: #2d2d2d;
  --drawer-bg: #262626;
}

.v-app-layout {
  background-color: var(--app-bg-color);
  color: var(--app-text-color);
}

.v-app-toolbar {
  background-color: var(--toolbar-bg);
}

.v-app-drawer {
  background-color: var(--drawer-bg);
}
</style>
```

### アニメーションカスタマイズ

```vue
<template>
  <VAppLayout>
    <template #default="{ layout }">
      <!-- カスタムトランジション付きドロワー -->
      <VAppDrawer
        position="left"
        transition-duration="400ms"
        transition-timing="cubic-bezier(0.4, 0, 0.2, 1)"
      >
        <nav>
          <!-- ナビゲーション内容 -->
        </nav>
      </VAppDrawer>

      <!-- ページトランジション -->
      <VAppBody>
        <transition name="page-fade" mode="out-in">
          <router-view />
        </transition>
      </VAppBody>
    </template>
  </VAppLayout>
</template>

<style>
/* ページトランジション */
.page-fade-enter-active,
.page-fade-leave-active {
  transition: opacity 0.3s ease;
}

.page-fade-enter-from,
.page-fade-leave-to {
  opacity: 0;
}

/* カスタムドロワートランジション */
.v-app-drawer {
  transition: transform 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
```

## パフォーマンス最適化

### 遅延ローディング

```vue
<template>
  <VAppLayout>
    <template #default="{ layout }">
      <!-- 軽量なメインUI -->
      <VAppToolbar>
        <h1>App</h1>
      </VAppToolbar>

      <!-- Conditionally load heavy components -->
      <VAppDrawer
        v-if="shouldShowDrawer"
        position="left"
        @open="onDrawerOpen"
      >
        <Suspense>
          <template #default>
            <AsyncNavigationMenu />
          </template>
          <template #fallback>
            <div class="loading-placeholder">
              Loading menu...
            </div>
          </template>
        </Suspense>
      </VAppDrawer>

      <VAppBody>
        <router-view />
      </VAppBody>
    </template>
  </VAppLayout>
</template>

<script setup lang="ts">
import { defineAsyncComponent, ref } from 'vue'

const shouldShowDrawer = ref(false)

// 非同期コンポーネント
const AsyncNavigationMenu = defineAsyncComponent(() =>
  import('./components/NavigationMenu.vue')
)

const onDrawerOpen = () => {
  // Load heavy components when drawer is opened
  shouldShowDrawer.value = true
}
</script>
```

## API リファレンス

### VAppLayout

メインレイアウトコンテナ

```typescript
interface VAppLayoutProps {
  // No layout-specific properties currently
}
```

### VAppDrawer

サイドドロワーコンポーネント

```typescript
interface VAppDrawerProps {
  position: 'left' | 'right'
  width?: number | string
  persistent?: boolean
  overlay?: boolean
  mini?: boolean
  'transition-duration'?: string
  'transition-timing'?: string
}
```

### VAppToolbar

ツールバーコンポーネント

```typescript
interface VAppToolbarProps {
  height?: number | string
  dense?: boolean
  prominent?: boolean
}
```

### VAppBody

メインコンテンツエリア

```typescript
interface VAppBodyProps {
  // Basic properties only
}
```

### VAppContainer

コンテンツコンテナ

```typescript
interface VAppContainerProps {
  fluid?: boolean
  'max-width'?: number | string
}
```

### useVueAppLayout

レイアウト制御のComposable

```typescript
interface VueAppLayoutComposable {
  // ドロワー制御
  toggleDrawer(position: 'left' | 'right'): void
  openDrawer(position: 'left' | 'right'): void
  closeDrawer(position?: 'left' | 'right'): void
  isDrawerOpen(position: 'left' | 'right'): boolean

  // スタック制御
  pushStack(options: StackOptions): void
  popStack(): void
  stackDepth: Ref<number>
  currentStack: Ref<StackItem | null>

  // ビューポート情報
  viewportRect: Ref<ViewportRect>
}
```

## Related Packages

- `@fastkit/vue-body-scroll-lock` - ボディスクロール制御
- `@fastkit/vue-resize` - リサイズ検出
- `@fastkit/vue-scroller` - カスタムスクロール
- `@fastkit/vue-utils` - Vue ユーティリティ関数
- `@fastkit/helpers` - ヘルパー関数
- `@fastkit/tiny-logger` - ロガー
- `vue` - Vue.js フレームワーク（ピア依存関係）
- `vue-router` - Vue Router（ピア依存関係）

## License

MIT
