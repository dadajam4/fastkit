# @fastkit/vue-resize

🌐 [English](https://github.com/dadajam4/fastkit/blob/main/packages/vue-resize/README.md) | 日本語

Vue.jsアプリケーションでウィンドウリサイズや要素サイズ変更を効率的に監視するためのライブラリ。ResizeObserver APIとwindowリサイズイベントを統合し、デバウンス機能とリアクティブな状態管理を提供します。

## 機能

- **ウィンドウリサイズ監視**: ブラウザウィンドウサイズのリアクティブ追跡
- **要素リサイズ監視**: ResizeObserver APIを使った個別要素の監視
- **v-resizeディレクティブ**: 簡単なディレクティブによる要素監視
- **デバウンス対応**: パフォーマンス最適化のための遅延実行
- **TypeScript完全サポート**: 厳密な型定義による型安全性
- **Vue 3 Composition API**: リアクティブシステムとの完全統合
- **SSR対応**: サーバーサイドレンダリング環境での安全な動作
- **軽量実装**: 最小限の依存関係と効率的なメモリ使用

## インストール

```bash
npm install @fastkit/vue-resize
```

## 基本的な使用方法

### ウィンドウサイズの監視

```vue
<template>
  <div>
    <h2>ウィンドウサイズ監視</h2>
    <div v-if="window.available" class="window-info">
      <p>幅: {{ window.width }}px</p>
      <p>高さ: {{ window.height }}px</p>
      <p>アスペクト比: {{ aspectRatio }}</p>
      <p>画面サイズ: {{ screenSize }}</p>
    </div>
    <div v-else class="no-window">
      ウィンドウ情報が利用できません（SSR環境）
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useWindow } from '@fastkit/vue-resize'

const window = useWindow()

const aspectRatio = computed(() => {
  if (!window.available) return 0
  return (window.width / window.height).toFixed(2)
})

const screenSize = computed(() => {
  if (!window.available) return 'Unknown'

  if (window.width >= 1200) return 'Large (Desktop)'
  if (window.width >= 768) return 'Medium (Tablet)'
  return 'Small (Mobile)'
})
</script>

<style>
.window-info {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #dee2e6;
}

.window-info p {
  margin: 8px 0;
  font-family: monospace;
}

.no-window {
  color: #6c757d;
  font-style: italic;
}
</style>
```

### v-resizeディレクティブ - 要素監視

```vue
<template>
  <div>
    <h2>要素リサイズ監視</h2>

    <!-- 基本的な要素監視 -->
    <div
      v-resize="handleResize"
      class="resizable-box"
      :style="{ width: boxWidth + 'px', height: boxHeight + 'px' }"
    >
      <p>リサイズ可能なボックス</p>
      <p>サイズ: {{ elementSize.width }} x {{ elementSize.height }}px</p>
      <div class="resize-handle"></div>
    </div>

    <!-- コントロール -->
    <div class="controls">
      <button @click="changeSize(300, 200)">小さく</button>
      <button @click="changeSize(500, 300)">中くらい</button>
      <button @click="changeSize(700, 400)">大きく</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { ResizeDirectivePayload } from '@fastkit/vue-resize'

const boxWidth = ref(400)
const boxHeight = ref(250)

const elementSize = reactive({
  width: 0,
  height: 0
})

const handleResize = (payload: ResizeDirectivePayload) => {
  elementSize.width = Math.round(payload.width)
  elementSize.height = Math.round(payload.height)
  console.log('要素がリサイズされました:', payload)
}

const changeSize = (width: number, height: number) => {
  boxWidth.value = width
  boxHeight.value = height
}
</script>

<style>
.resizable-box {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  border-radius: 12px;
  position: relative;
  resize: both;
  overflow: auto;
  margin: 20px 0;
  min-width: 200px;
  min-height: 150px;
}

.resizable-box p {
  margin: 8px 0;
  font-weight: 500;
}

.resize-handle {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 20px;
  height: 20px;
  background: rgba(255, 255, 255, 0.3);
  cursor: se-resize;
}

.controls {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.controls button {
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.controls button:hover {
  background: #0056b3;
}
</style>
```

### デバウンス付きリサイズ監視

```vue
<template>
  <div>
    <h2>デバウンス付きリサイズ監視</h2>

    <div class="settings">
      <label>
        デバウンス時間:
        <select v-model="debounceTime">
          <option :value="0">なし (0ms)</option>
          <option :value="100">100ms</option>
          <option :value="300">300ms</option>
          <option :value="500">500ms</option>
        </select>
      </label>
    </div>

    <div
      v-resize="{ handler: handleDebouncedResize, debounce: debounceTime }"
      class="monitored-area"
    >
      <h3>監視エリア</h3>
      <p>リサイズイベント回数: {{ eventCount }}</p>
      <p>最後の更新: {{ lastUpdate }}</p>
      <p>現在のサイズ: {{ currentSize.width }} x {{ currentSize.height }}px</p>

      <div class="size-controls">
        <input
          v-model.number="areaWidth"
          type="range"
          min="300"
          max="800"
          step="10"
        >
        <label>幅: {{ areaWidth }}px</label>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import type { ResizeDirectivePayload } from '@fastkit/vue-resize'

const debounceTime = ref(300)
const eventCount = ref(0)
const lastUpdate = ref<string>('')
const areaWidth = ref(500)

const currentSize = reactive({
  width: 0,
  height: 0
})

const handleDebouncedResize = (payload: ResizeDirectivePayload) => {
  eventCount.value++
  lastUpdate.value = new Date().toLocaleTimeString()
  currentSize.width = Math.round(payload.width)
  currentSize.height = Math.round(payload.height)
}

const monitoredAreaStyle = computed(() => ({
  width: `${areaWidth.value}px`,
  minHeight: '200px'
}))
</script>

<style>
.settings {
  margin: 20px 0;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.settings label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;
}

.settings select {
  padding: 4px 8px;
  border: 1px solid #ced4da;
  border-radius: 4px;
}

.monitored-area {
  background: #fff3cd;
  border: 2px solid #ffc107;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
  transition: width 0.3s ease;
}

.monitored-area h3 {
  margin-top: 0;
  color: #856404;
}

.monitored-area p {
  margin: 8px 0;
  font-family: monospace;
  color: #856404;
}

.size-controls {
  margin-top: 15px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.size-controls input {
  width: 100%;
}

.size-controls label {
  font-weight: 500;
  color: #856404;
}
</style>
```

## 高度な使用例

### レスポンシブレイアウトシステム

```vue
<template>
  <div class="responsive-layout">
    <header class="header">
      <h1>レスポンシブヘッダー</h1>
      <nav :class="['nav', { 'nav--mobile': isMobile }]">
        <button v-if="isMobile" @click="toggleMenu" class="menu-toggle">
          ≡
        </button>
        <ul v-show="!isMobile || isMenuOpen" class="nav-list">
          <li><a href="#home">ホーム</a></li>
          <li><a href="#about">について</a></li>
          <li><a href="#contact">お問い合わせ</a></li>
        </ul>
      </nav>
    </header>

    <main class="main">
      <aside v-show="!isMobile" class="sidebar">
        <h3>サイドバー</h3>
        <ul>
          <li>メニュー項目 1</li>
          <li>メニュー項目 2</li>
          <li>メニュー項目 3</li>
        </ul>
      </aside>

      <section class="content">
        <h2>メインコンテンツ</h2>
        <div class="stats">
          <div class="stat-card">
            <h4>画面幅</h4>
            <p>{{ window.width }}px</p>
          </div>
          <div class="stat-card">
            <h4>レイアウト</h4>
            <p>{{ layoutType }}</p>
          </div>
          <div class="stat-card">
            <h4>カラム数</h4>
            <p>{{ columnCount }}</p>
          </div>
        </div>

        <div
          v-resize="handleContentResize"
          :class="['content-grid', `content-grid--${columnCount}col`]"
        >
          <div v-for="i in 12" :key="i" class="grid-item">
            <h5>アイテム {{ i }}</h5>
            <p>コンテンツエリア: {{ contentSize.width }}px</p>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue'
import { useWindow } from '@fastkit/vue-resize'
import type { ResizeDirectivePayload } from '@fastkit/vue-resize'

const window = useWindow()
const isMenuOpen = ref(false)

const contentSize = reactive({
  width: 0,
  height: 0
})

// レスポンシブブレークポイント
const isMobile = computed(() => window.width < 768)
const isTablet = computed(() => window.width >= 768 && window.width < 1024)
const isDesktop = computed(() => window.width >= 1024)

const layoutType = computed(() => {
  if (isMobile.value) return 'Mobile'
  if (isTablet.value) return 'Tablet'
  return 'Desktop'
})

const columnCount = computed(() => {
  if (isMobile.value) return 1
  if (isTablet.value) return 2
  if (window.width >= 1400) return 4
  return 3
})

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value
}

const handleContentResize = (payload: ResizeDirectivePayload) => {
  contentSize.width = Math.round(payload.width)
  contentSize.height = Math.round(payload.height)
}
</script>

<style>
.responsive-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  background: #343a40;
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header h1 {
  margin: 0;
  font-size: 1.5rem;
}

.nav {
  display: flex;
  align-items: center;
}

.menu-toggle {
  background: none;
  border: none;
  color: white;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.5rem;
}

.nav-list {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 1rem;
}

.nav--mobile .nav-list {
  position: absolute;
  top: 100%;
  right: 2rem;
  background: #343a40;
  border-radius: 4px;
  padding: 1rem;
  flex-direction: column;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}

.nav-list a {
  color: white;
  text-decoration: none;
  padding: 0.5rem;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.nav-list a:hover {
  background: rgba(255,255,255,0.1);
}

.main {
  flex: 1;
  display: flex;
}

.sidebar {
  width: 250px;
  background: #f8f9fa;
  padding: 2rem;
  border-right: 1px solid #dee2e6;
}

.sidebar h3 {
  margin-top: 0;
}

.sidebar ul {
  list-style: none;
  padding: 0;
}

.sidebar li {
  padding: 0.5rem 0;
  border-bottom: 1px solid #dee2e6;
}

.content {
  flex: 1;
  padding: 2rem;
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin: 2rem 0;
}

.stat-card {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #dee2e6;
  text-align: center;
}

.stat-card h4 {
  margin: 0 0 0.5rem 0;
  color: #495057;
  font-size: 0.9rem;
}

.stat-card p {
  margin: 0;
  font-size: 1.2rem;
  font-weight: bold;
  color: #007bff;
}

.content-grid {
  display: grid;
  gap: 1rem;
}

.content-grid--1col {
  grid-template-columns: 1fr;
}

.content-grid--2col {
  grid-template-columns: repeat(2, 1fr);
}

.content-grid--3col {
  grid-template-columns: repeat(3, 1fr);
}

.content-grid--4col {
  grid-template-columns: repeat(4, 1fr);
}

.grid-item {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid #dee2e6;
  min-height: 120px;
}

.grid-item h5 {
  margin: 0 0 0.5rem 0;
  color: #495057;
}

.grid-item p {
  margin: 0;
  font-size: 0.85rem;
  color: #6c757d;
  font-family: monospace;
}

/* モバイル調整 */
@media (max-width: 767px) {
  .header {
    padding: 1rem;
  }

  .content {
    padding: 1rem;
  }

  .stats {
    grid-template-columns: 1fr;
  }
}
</style>
```

### ウィンドウサイズによる動的コンポーネント

```vue
<template>
  <div class="dynamic-components">
    <h2>動的コンポーネント表示</h2>

    <div class="component-container">
      <!-- デスクトップ用のテーブル表示 -->
      <DataTable
        v-if="isDesktop"
        :data="tableData"
        :columns="tableColumns"
      />

      <!-- タブレット用のカード表示 -->
      <CardList
        v-else-if="isTablet"
        :items="tableData"
      />

      <!-- モバイル用のリスト表示 -->
      <MobileList
        v-else
        :items="tableData"
      />
    </div>

    <div class="window-debug">
      <h4>ウィンドウ情報</h4>
      <pre>{{ windowDebugInfo }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h } from 'vue'
import { useWindow } from '@fastkit/vue-resize'

const window = useWindow()

// レスポンシブブレークポイント
const isMobile = computed(() => window.width < 768)
const isTablet = computed(() => window.width >= 768 && window.width < 1200)
const isDesktop = computed(() => window.width >= 1200)

// サンプルデータ
const tableData = [
  { id: 1, name: '田中太郎', email: 'tanaka@example.com', department: '営業部' },
  { id: 2, name: '佐藤花子', email: 'sato@example.com', department: '開発部' },
  { id: 3, name: '鈴木次郎', email: 'suzuki@example.com', department: '人事部' },
  { id: 4, name: '山田美香', email: 'yamada@example.com', department: 'マーケティング部' }
]

const tableColumns = [
  { key: 'id', label: 'ID', width: '80px' },
  { key: 'name', label: '名前', width: '150px' },
  { key: 'email', label: 'メール', width: '200px' },
  { key: 'department', label: '部署', width: '150px' }
]

const windowDebugInfo = computed(() => ({
  width: window.width,
  height: window.height,
  deviceType: isMobile.value ? 'Mobile' : isTablet.value ? 'Tablet' : 'Desktop',
  componentUsed: isMobile.value ? 'MobileList' : isTablet.value ? 'CardList' : 'DataTable'
}))

// デスクトップ用テーブルコンポーネント
const DataTable = defineComponent({
  props: ['data', 'columns'],
  setup(props) {
    return () => h('div', { class: 'data-table' }, [
      h('table', { class: 'table' }, [
        h('thead', [
          h('tr', props.columns.map((col: any) =>
            h('th', { style: { width: col.width } }, col.label)
          ))
        ]),
        h('tbody', props.data.map((row: any) =>
          h('tr', { key: row.id }, props.columns.map((col: any) =>
            h('td', row[col.key])
          ))
        ))
      ])
    ])
  }
})

// タブレット用カードコンポーネント
const CardList = defineComponent({
  props: ['items'],
  setup(props) {
    return () => h('div', { class: 'card-list' },
      props.items.map((item: any) =>
        h('div', { key: item.id, class: 'card' }, [
          h('h4', item.name),
          h('p', item.email),
          h('span', { class: 'department' }, item.department)
        ])
      )
    )
  }
})

// モバイル用リストコンポーネント
const MobileList = defineComponent({
  props: ['items'],
  setup(props) {
    return () => h('div', { class: 'mobile-list' },
      props.items.map((item: any) =>
        h('div', { key: item.id, class: 'list-item' }, [
          h('div', { class: 'item-header' }, [
            h('span', { class: 'name' }, item.name),
            h('span', { class: 'department' }, item.department)
          ]),
          h('div', { class: 'item-email' }, item.email)
        ])
      )
    )
  }
})
</script>

<style>
.dynamic-components {
  padding: 2rem;
}

.component-container {
  margin: 2rem 0;
  min-height: 300px;
}

/* テーブルスタイル（デスクトップ） */
.data-table {
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.table th,
.table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #dee2e6;
}

.table th {
  background: #f8f9fa;
  font-weight: 600;
}

.table tr:hover {
  background: #f8f9fa;
}

/* カードスタイル（タブレット） */
.card-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid #dee2e6;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.card h4 {
  margin: 0 0 0.5rem 0;
  color: #495057;
}

.card p {
  margin: 0.5rem 0;
  color: #6c757d;
  font-size: 0.9rem;
}

.card .department {
  display: inline-block;
  background: #007bff;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

/* リストスタイル（モバイル） */
.mobile-list {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.list-item {
  padding: 1rem;
  border-bottom: 1px solid #dee2e6;
}

.list-item:last-child {
  border-bottom: none;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.item-header .name {
  font-weight: 600;
  color: #495057;
}

.item-header .department {
  background: #28a745;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.item-email {
  color: #6c757d;
  font-size: 0.9rem;
}

/* デバッグ情報 */
.window-debug {
  margin-top: 2rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #dee2e6;
}

.window-debug h4 {
  margin: 0 0 1rem 0;
}

.window-debug pre {
  margin: 0;
  font-family: monospace;
  font-size: 0.9rem;
  background: white;
  padding: 1rem;
  border-radius: 4px;
  border: 1px solid #dee2e6;
}
</style>
```

## ディレクティブオプション

### v-resizeディレクティブの設定

```vue
<template>
  <div>
    <!-- 関数を直接指定 -->
    <div v-resize="handleResize">基本的な監視</div>

    <!-- オプション付きで指定 -->
    <div v-resize="{
      handler: handleResize,
      debounce: 300,
      rootMode: false
    }">
      高度な監視設定
    </div>

    <!-- ウィンドウリサイズモード -->
    <div v-resize="{
      handler: handleWindowResize,
      rootMode: true,
      debounce: 100
    }">
      ウィンドウリサイズ監視
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ResizeDirectivePayload } from '@fastkit/vue-resize'

const handleResize = (payload: ResizeDirectivePayload) => {
  console.log('要素リサイズ:', payload)
}

const handleWindowResize = (payload: ResizeDirectivePayload) => {
  console.log('ウィンドウリサイズ:', payload)
}
</script>
```

### プラグインインストール

```typescript
// main.ts
import { createApp } from 'vue'
import { installResizeDirective } from '@fastkit/vue-resize'
import App from './App.vue'

const app = createApp(App)

// v-resizeディレクティブをグローバルにインストール
installResizeDirective(app)

app.mount('#app')
```

## API リファレンス

### useWindow

```typescript
interface UseWindowRef {
  readonly available: boolean  // ウィンドウが利用可能かどうか
  readonly width: number      // ウィンドウ幅
  readonly height: number     // ウィンドウ高さ
}

function useWindow(): UseWindowRef
```

### v-resizeディレクティブ

```typescript
interface ResizeDirectivePayload {
  width: number   // 要素の幅
  height: number  // 要素の高さ
}

type ResizeDirectiveHandler = (payload: ResizeDirectivePayload) => any

interface ResizeDirectiveBindingValue {
  handler: ResizeDirectiveHandler  // リサイズイベントハンドラー
  debounce?: number               // デバウンス時間（ミリ秒）
  rootMode?: boolean              // ウィンドウリサイズ監視モード
}

type RawResizeDirectiveBindingValue =
  | ResizeDirectiveHandler
  | ResizeDirectiveBindingValue
```

### インストール関数

```typescript
function installResizeDirective(app: App): App

function resizeDirectiveArgument(
  bindingValue: RawResizeDirectiveBindingValue
): [ResizeDirective, RawResizeDirectiveBindingValue]
```

## パフォーマンス最適化

### デバウンスの適切な設定

```typescript
// 用途別の推奨デバウンス時間
const DEBOUNCE_SETTINGS = {
  // UI更新が必要な場合（レスポンシブレイアウト等）
  UI_UPDATE: 100,

  // 計算処理が必要な場合
  CALCULATION: 300,

  // API呼び出しなど重い処理
  HEAVY_OPERATION: 500,

  // リアルタイム性が重要な場合
  REAL_TIME: 0
}
```

### メモリリークの防止

```vue
<script setup lang="ts">
import { onBeforeUnmount } from 'vue'

// カスタムリサイズハンドラーを使用する場合は適切にクリーンアップ
const resizeObserver = new ResizeObserver(() => {
  // リサイズ処理
})

onBeforeUnmount(() => {
  resizeObserver.disconnect()
})
</script>
```

## 関連パッケージ

- `@fastkit/debounce` - デバウンス機能
- `@fastkit/helpers` - ユーティリティ関数（`IN_WINDOW`等）
- `@fastkit/vue-utils` - Vue.js開発ユーティリティ

## ライセンス

MIT
