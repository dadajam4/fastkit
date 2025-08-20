# @fastkit/vue-scroller

🌐 [English](https://github.com/dadajam4/fastkit/blob/main/packages/vue-scroller/README.md) | 日本語

Vue.jsアプリケーションでスクロール機能を精密に制御するための包括的なライブラリ。リアクティブなスクロール状態監視、アニメーション付きスクロール、ガイド表示機能、元素へのスクロールなど、高度なスクロール体験を簡単に実装できます。

## 機能

- **Vue 3 Composition API**: Vue.jsとの完全統合
- **リアクティブスクロール状態**: scrollTop、scrollLeft、scrollableなど全て自動更新
- **アニメーション付きスクロール**: スムーズなスクロールアニメーション
- **要素への自動スクロール**: 指定要素への精密なスクロール機能
- **スクロールガイド**: スクロール可能方向の視覚的インジケーター
- **スクロール停止機能**: 一時的なスクロール無効化
- **ドキュメントスクロール対応**: ページ全体のスクロール制御
- **TypeScript完全サポート**: 厳密な型定義による型安全性
- **SSR対応**: サーバーサイドレンダリング環境での安全な動作

## インストール

```bash
npm install @fastkit/vue-scroller
```

## 基本的な使用方法

### Composition API

```vue
<template>
  <div>
    <button @click="scrollToTop">トップへ</button>
    <button @click="scrollToBottom">ボトムへ</button>
    <div
      ref="scrollerRef"
      style="height: 300px; overflow: auto;"
    >
      <div style="height: 1000px; background: linear-gradient(to bottom, red, blue);">
        スクロールコンテンツ
      </div>
    </div>
    <p>スクロール位置: {{ scroller.scrollTop }}px</p>
    <p>スクロール可能: Y軸 {{ scroller.scrollableY ? 'Yes' : 'No' }}</p>
  </div>
</template>

<script setup lang="ts">
import { useScrollerControl } from '@fastkit/vue-scroller'

const scroller = useScrollerControl({
  el: 'self',
  duration: 300, // アニメーション時間
  easing: 'ease-out'
})

const scrollerRef = scroller.elementRef

const scrollToTop = () => {
  scroller.toTop({ duration: 500 })
}

const scrollToBottom = () => {
  scroller.toBottom({ duration: 500 })
}
</script>
```

### VScrollerコンポーネント

```vue
<template>
  <VScroller
    ref="scrollerComponent"
    :guide="20"
    container-class="custom-container"
    :settings="{ duration: 400, easing: 'ease-in-out' }"
    style="height: 400px;"
  >
    <div class="content">
      <h2>セクション1</h2>
      <p>Lorem ipsum dolor sit amet...</p>

      <h2 ref="section2">セクション2</h2>
      <p>Consectetur adipiscing elit...</p>

      <h2>セクション3</h2>
      <p>Sed do eiusmod tempor incididunt...</p>
    </div>
  </VScroller>

  <button @click="scrollToSection2">セクション2へ移動</button>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { VScroller } from '@fastkit/vue-scroller'

const scrollerComponent = ref<InstanceType<typeof VScroller>>()
const section2 = ref<HTMLElement>()

const scrollToSection2 = () => {
  if (scrollerComponent.value && section2.value) {
    scrollerComponent.value.scroller.toElement(section2.value, {
      duration: 600,
      offsetTop: -20 // 上部に20pxのマージン
    })
  }
}
</script>

<style>
.content {
  padding: 20px;
  height: 1200px; /* スクロール可能な高さを確保 */
}

.v-scroller {
  border: 1px solid #ddd;
  border-radius: 8px;
}
</style>
```

## 高度な使用例

### ドキュメントスクロール制御

```vue
<template>
  <div>
    <nav class="floating-nav">
      <button @click="scrollToSection('hero')">Hero</button>
      <button @click="scrollToSection('about')">About</button>
      <button @click="scrollToSection('contact')">Contact</button>
    </nav>

    <section id="hero" style="height: 100vh; background: #ff6b6b;">
      <h1>Hero Section</h1>
    </section>

    <section id="about" style="height: 100vh; background: #4ecdc4;">
      <h1>About Section</h1>
    </section>

    <section id="contact" style="height: 100vh; background: #45b7d1;">
      <h1>Contact Section</h1>
    </section>

    <div class="scroll-info">
      <p>スクロール位置: {{ documentScroller.scrollTop }}px</p>
      <p>スクロール中: {{ documentScroller.nowScrolling ? 'Yes' : 'No' }}</p>
      <p>スクロール方向: {{ documentScroller.lastDirection }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getDocumentScroller } from '@fastkit/vue-scroller'

const documentScroller = getDocumentScroller()

const scrollToSection = (sectionId: string) => {
  const element = document.getElementById(sectionId)
  if (element) {
    documentScroller.toElement(element, {
      duration: 800,
      easing: 'ease-in-out',
      offsetTop: -60 // ナビゲーションバーの高さ分のオフセット
    })
  }
}
</script>

<style>
.floating-nav {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  gap: 10px;
}

.floating-nav button {
  padding: 8px 16px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.scroll-info {
  position: fixed;
  bottom: 20px;
  left: 20px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 10px;
  border-radius: 8px;
  font-size: 12px;
}
</style>
```

### スクロール停止とフィルタリング

```vue
<template>
  <div>
    <div class="controls">
      <button @click="toggleScrollLock">
        スクロール {{ isScrollLocked ? 'ロック解除' : 'ロック' }}
      </button>
      <button @click="addVerticalOnlyFilter">縦スクロールのみ</button>
      <button @click="clearFilters">フィルタークリア</button>
    </div>

    <VScroller
      ref="scroller"
      :guide="true"
      style="height: 300px; width: 500px; border: 1px solid #ccc;"
    >
      <div style="width: 800px; height: 600px; background: linear-gradient(45deg, red, blue);">
        <p>両方向にスクロール可能なコンテンツ</p>
      </div>
    </VScroller>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { VScroller, ScrollStopper } from '@fastkit/vue-scroller'

const scroller = ref<InstanceType<typeof VScroller>>()
const isScrollLocked = ref(false)
const currentStoppers: ScrollStopper[] = []

const toggleScrollLock = () => {
  if (!scroller.value) return

  if (isScrollLocked.value) {
    // ロック解除
    currentStoppers.forEach(stopper => {
      scroller.value!.scroller.removeScrollStopper(stopper)
    })
    currentStoppers.length = 0
    isScrollLocked.value = false
  } else {
    // ロック
    const stopper: ScrollStopper = () => true // 全てのスクロールを停止
    scroller.value.scroller.pushScrollStopper(stopper)
    currentStoppers.push(stopper)
    isScrollLocked.value = true
  }
}

const addVerticalOnlyFilter = () => {
  if (!scroller.value) return

  const stopper: ScrollStopper = (axis) => {
    return axis === 'x' // X軸のスクロールのみ停止（横スクロール無効）
  }

  scroller.value.scroller.pushScrollStopper(stopper)
  currentStoppers.push(stopper)
}

const clearFilters = () => {
  if (!scroller.value) return

  currentStoppers.forEach(stopper => {
    scroller.value!.scroller.removeScrollStopper(stopper)
  })
  currentStoppers.length = 0
  isScrollLocked.value = false
}
</script>

<style>
.controls {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.controls button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  background: white;
}

.controls button:hover {
  background: #f5f5f5;
}
</style>
```

### 無限スクロールの実装

```vue
<template>
  <VScroller
    ref="scrollerRef"
    style="height: 400px;"
    :settings="{ throttle: 16 }"
  >
    <div class="infinite-list">
      <div
        v-for="item in items"
        :key="item.id"
        class="list-item"
      >
        {{ item.title }}
      </div>

      <div v-if="loading" class="loading">
        読み込み中...
      </div>
    </div>
  </VScroller>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { VScroller } from '@fastkit/vue-scroller'

interface ListItem {
  id: number
  title: string
}

const scrollerRef = ref<InstanceType<typeof VScroller>>()
const items = ref<ListItem[]>([])
const loading = ref(false)
const currentPage = ref(1)

// 初期データ読み込み
onMounted(() => {
  loadMoreItems()
})

// スクロール位置を監視
watch(() => scrollerRef.value?.scroller.scrollBottom, (scrollBottom) => {
  if (scrollBottom !== undefined && scrollBottom < 50 && !loading.value) {
    loadMoreItems()
  }
}, { immediate: false })

const loadMoreItems = async () => {
  if (loading.value) return

  loading.value = true

  // APIリクエストのシミュレーション
  await new Promise(resolve => setTimeout(resolve, 1000))

  const newItems: ListItem[] = Array.from({ length: 20 }, (_, index) => ({
    id: (currentPage.value - 1) * 20 + index + 1,
    title: `アイテム ${(currentPage.value - 1) * 20 + index + 1}`
  }))

  items.value.push(...newItems)
  currentPage.value++
  loading.value = false
}
</script>

<style>
.infinite-list {
  padding: 20px;
}

.list-item {
  padding: 12px;
  border-bottom: 1px solid #eee;
  min-height: 50px;
  display: flex;
  align-items: center;
}

.list-item:hover {
  background: #f5f5f5;
}

.loading {
  padding: 20px;
  text-align: center;
  color: #666;
}
</style>
```

### スクロール位置の保存・復元

```vue
<template>
  <div>
    <div class="controls">
      <button @click="savePosition">位置を保存</button>
      <button @click="restorePosition">位置を復元</button>
      <button @click="clearSavedPosition">保存データクリア</button>
    </div>

    <VScroller
      ref="scrollerRef"
      style="height: 300px;"
    >
      <div class="content">
        <div v-for="n in 100" :key="n" class="item">
          アイテム {{ n }}
        </div>
      </div>
    </VScroller>

    <div v-if="savedPosition" class="saved-info">
      保存済み位置: Top={{ savedPosition.scrollTop }}px, Left={{ savedPosition.scrollLeft }}px
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { VScroller, ScrollPosition } from '@fastkit/vue-scroller'

const scrollerRef = ref<InstanceType<typeof VScroller>>()
const savedPosition = ref<ScrollPosition | null>(null)

const savePosition = () => {
  if (!scrollerRef.value) return

  const scroller = scrollerRef.value.scroller
  savedPosition.value = {
    scrollTop: scroller.scrollTop,
    scrollLeft: scroller.scrollLeft
  }

  // ローカルストレージに保存
  localStorage.setItem('scrollPosition', JSON.stringify(savedPosition.value))
}

const restorePosition = () => {
  if (!scrollerRef.value || !savedPosition.value) return

  scrollerRef.value.scroller.to(savedPosition.value, {
    duration: 500,
    easing: 'ease-out'
  })
}

const clearSavedPosition = () => {
  savedPosition.value = null
  localStorage.removeItem('scrollPosition')
}

// ページ読み込み時に保存された位置を復元
onMounted(() => {
  const saved = localStorage.getItem('scrollPosition')
  if (saved) {
    try {
      savedPosition.value = JSON.parse(saved)
    } catch (e) {
      console.warn('Failed to parse saved scroll position')
    }
  }
})
</script>

<style>
.controls {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.content {
  padding: 20px;
}

.item {
  padding: 10px;
  border-bottom: 1px solid #eee;
  min-height: 40px;
}

.saved-info {
  margin-top: 10px;
  padding: 10px;
  background: #f0f0f0;
  border-radius: 4px;
  font-size: 14px;
}
</style>
```

### パララックススクロール効果

```vue
<template>
  <VScroller
    ref="scrollerRef"
    style="height: 100vh; position: relative; overflow: hidden;"
  >
    <div class="parallax-container">
      <!-- 背景レイヤー（遅く動く） -->
      <div
        class="parallax-layer background"
        :style="{ transform: `translateY(${backgroundOffset}px)` }"
      >
        <div class="bg-pattern"></div>
      </div>

      <!-- 中間レイヤー（中程度の速度） -->
      <div
        class="parallax-layer midground"
        :style="{ transform: `translateY(${midgroundOffset}px)` }"
      >
        <div class="floating-shapes"></div>
      </div>

      <!-- フォアグラウンド（通常速度） -->
      <div class="parallax-layer foreground">
        <div class="content">
          <h1>パララックス効果</h1>
          <div v-for="n in 20" :key="n" class="content-block">
            <h2>セクション {{ n }}</h2>
            <p>スクロールすると背景と中間レイヤーが異なる速度で動きます。</p>
          </div>
        </div>
      </div>
    </div>
  </VScroller>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { VScroller } from '@fastkit/vue-scroller'

const scrollerRef = ref<InstanceType<typeof VScroller>>()

// パララックス効果の計算
const backgroundOffset = computed(() => {
  if (!scrollerRef.value) return 0
  return scrollerRef.value.scroller.scrollTop * 0.5 // 50%の速度
})

const midgroundOffset = computed(() => {
  if (!scrollerRef.value) return 0
  return scrollerRef.value.scroller.scrollTop * 0.7 // 70%の速度
})
</script>

<style>
.parallax-container {
  position: relative;
  height: 200vh; /* スクロール可能な高さ */
}

.parallax-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.background {
  z-index: 1;
}

.midground {
  z-index: 2;
}

.foreground {
  z-index: 3;
}

.bg-pattern {
  width: 100%;
  height: 120%;
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
  opacity: 0.3;
}

.floating-shapes {
  width: 100%;
  height: 120%;
  background-image: radial-gradient(circle, rgba(255,255,255,0.3) 20%, transparent 20%);
  background-size: 100px 100px;
}

.content {
  padding: 50px;
  background: rgba(255, 255, 255, 0.9);
  margin: 20px;
  border-radius: 10px;
}

.content-block {
  margin: 40px 0;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}
</style>
```

## API リファレンス

### useScrollerControl

```typescript
function useScrollerControl(setting: UseScrollerSetting): UseScroller

interface UseScrollerSetting extends Omit<Partial<ScrollerSetting>, 'el'> {
  el?: 'self' | 'body'
  duration?: number        // アニメーション時間（ミリ秒）
  easing?: string         // イージング関数
  throttle?: number       // スクロールイベントのスロットル間隔
}

interface UseScroller {
  // プロパティ
  readonly elementRef: Ref<HTMLElement | null>
  readonly scroller: ScrollerControl
  readonly containerHeight: number
  readonly containerWidth: number
  readonly isDestroyed: boolean
  readonly isPending: boolean
  readonly isReady: boolean
  readonly isRunning: boolean
  readonly lastAxis: ScrollAxis
  readonly lastDirection: ScrollDirection
  readonly lastXDirection: ScrollXDirection
  readonly lastYDirection: ScrollYDirection
  readonly nowScrolling: boolean
  readonly scrollEnabled: boolean
  readonly scrollHeight: number
  readonly scrollWidth: number
  readonly scrollableX: boolean
  readonly scrollableY: boolean
  readonly state: ScrollerState
  scrollBottom: number
  scrollLeft: number
  scrollRight: number
  scrollTop: number

  // メソッド
  ready(): Promise<void>
  element(): HTMLElement | null
  start(): void
  stop(): void
  destroy(): void
  update(): void
  cancel(): void

  // スクロール制御
  by(diffX: number, diffY: number, options?: ScrollerScrollOptions): Promise<void>
  to(scrollPosition: Partial<ScrollPosition>, options?: ScrollerScrollOptions): Promise<void>
  toElement(target: ScrollToElementTarget, options?: ScrollerScrollToElementOptions): Promise<void>
  toSide(targets: ScrollToSideTargets, options?: ScrollerScrollOptions): Promise<void>
  toTop(options?: ScrollerScrollOptions): Promise<void>
  toRight(options?: ScrollerScrollOptions): Promise<void>
  toBottom(options?: ScrollerScrollOptions): Promise<void>
  toLeft(options?: ScrollerScrollOptions): Promise<void>
  toLeftTop(options?: ScrollerScrollOptions): Promise<void>
  toLeftBottom(options?: ScrollerScrollOptions): Promise<void>
  toRightTop(options?: ScrollerScrollOptions): Promise<void>
  toRightBottom(options?: ScrollerScrollOptions): Promise<void>

  // スクロール停止
  pushScrollStopper(stopper: ScrollStopper): void
  removeScrollStopper(stopper: ScrollStopper): void

  // オフセット設定
  setScrollToElementAdditionalOffset(offset: ScrollToElementAdditionalOffset): void
  deleteScrollToElementAdditionalOffset(): void
}
```

### VScrollerコンポーネント

```typescript
interface VScrollerProps {
  settings?: VScrollerSettings | null
  guide?: boolean | number    // スクロールガイドの表示とオフセット
  containerClass?: string     // コンテナ要素のクラス名
}

interface VScrollerSettings extends UseScrollerSetting {}

interface ScrollerAPI {
  scroller: ScrollerControl
  scrollable: ScrollerCombinedScrollability
}

interface ScrollerCombinedScrollability {
  left: boolean      // 左方向にスクロール可能
  right: boolean     // 右方向にスクロール可能
  top: boolean       // 上方向にスクロール可能
  bottom: boolean    // 下方向にスクロール可能
  strict: ScrollerScrollability  // 厳密なスクロール可能性
}
```

### スクロールオプション

```typescript
interface ScrollerScrollOptions {
  duration?: number           // アニメーション時間（ミリ秒）
  easing?: string            // イージング関数
  cancelable?: boolean       // キャンセル可能かどうか
}

interface ScrollerScrollToElementOptions extends ScrollerScrollOptions {
  offsetTop?: number         // 上方向のオフセット
  offsetLeft?: number        // 左方向のオフセット
  offsetRight?: number       // 右方向のオフセット
  offsetBottom?: number      // 下方向のオフセット
}

interface ScrollPosition {
  scrollTop?: number
  scrollLeft?: number
}

type ScrollStopper = (axis?: ScrollAxis, direction?: ScrollDirection) => boolean
```

### getDocumentScroller

```typescript
function getDocumentScroller(): UseScroller
```

ページ全体のスクロールを制御するためのシングルトンインスタンスを取得します。

## スタイルのカスタマイズ

### CSSクラス

```css
/* VScrollerコンポーネントのスタイル */
.v-scroller {
  position: relative;
  overflow: hidden;
}

.v-scroller__container {
  height: 100%;
  overflow: auto;
}

.v-scroller__guide {
  position: absolute;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.v-scroller__guide--active {
  opacity: 1;
}

.v-scroller__guide--top {
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(to bottom, rgba(0,0,0,0.2), transparent);
}

.v-scroller__guide--bottom {
  bottom: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(to top, rgba(0,0,0,0.2), transparent);
}

.v-scroller__guide--left {
  top: 0;
  left: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(to right, rgba(0,0,0,0.2), transparent);
}

.v-scroller__guide--right {
  top: 0;
  right: 0;
  bottom: 0;
  width: 4px;
  background: linear-gradient(to left, rgba(0,0,0,0.2), transparent);
}
```

### カスタムガイドスタイル

```css
/* カスタムガイドスタイルの例 */
.v-scroller__guide--top {
  background: linear-gradient(to bottom, #4ECDC4, transparent);
  height: 6px;
}

.v-scroller__guide--bottom {
  background: linear-gradient(to top, #FF6B6B, transparent);
  height: 6px;
}

.v-scroller__guide--left,
.v-scroller__guide--right {
  background: linear-gradient(to right, #FFD93D, transparent);
  width: 6px;
}
```

## 関連パッケージ

- `@fastkit/scroller` - コアスクロール制御ライブラリ
- `@fastkit/vue-utils` - Vue.js開発ユーティリティ
- `@fastkit/tiny-logger` - ロギングシステム

## ライセンス

MIT
