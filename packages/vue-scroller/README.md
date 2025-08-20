
# @fastkit/vue-scroller

🌐 English | [日本語](https://github.com/dadajam4/fastkit/blob/main/packages/vue-scroller/README-ja.md)

A comprehensive library for precisely controlling scroll functionality in Vue.js applications. Easily implement advanced scroll experiences including reactive scroll state monitoring, animated scrolling, guide display features, and element scrolling.

## Features

- **Vue 3 Composition API**: Complete integration with Vue.js
- **Reactive Scroll State**: Automatic updates for scrollTop, scrollLeft, scrollable, and more
- **Animated Scrolling**: Smooth scroll animations
- **Automatic Element Scrolling**: Precise scrolling to specified elements
- **Scroll Guides**: Visual indicators for scrollable directions
- **Scroll Stop Function**: Temporary scroll disabling
- **Document Scroll Support**: Full-page scroll control
- **Full TypeScript Support**: Type safety with strict type definitions
- **SSR Compatible**: Safe operation in server-side rendering environments

## Installation

```bash
npm install @fastkit/vue-scroller
```

## Basic Usage

### Composition API

```vue
<template>
  <div>
    <button @click="scrollToTop">To Top</button>
    <button @click="scrollToBottom">To Bottom</button>
    <div
      ref="scrollerRef"
      style="height: 300px; overflow: auto;"
    >
      <div style="height: 1000px; background: linear-gradient(to bottom, red, blue);">
        Scroll Content
      </div>
    </div>
    <p>Scroll Position: {{ scroller.scrollTop }}px</p>
    <p>Scrollable: Y-axis {{ scroller.scrollableY ? 'Yes' : 'No' }}</p>
  </div>
</template>

<script setup lang="ts">
import { useScrollerControl } from '@fastkit/vue-scroller'

const scroller = useScrollerControl({
  el: 'self',
  duration: 300, // Animation duration
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

### VScroller Component

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
      <h2>Section 1</h2>
      <p>Lorem ipsum dolor sit amet...</p>

      <h2 ref="section2">Section 2</h2>
      <p>Consectetur adipiscing elit...</p>

      <h2>Section 3</h2>
      <p>Sed do eiusmod tempor incididunt...</p>
    </div>
  </VScroller>

  <button @click="scrollToSection2">Go to Section 2</button>
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
      offsetTop: -20 // 20px margin at the top
    })
  }
}
</script>

<style>
.content {
  padding: 20px;
  height: 1200px; /* Ensure scrollable height */
}

.v-scroller {
  border: 1px solid #ddd;
  border-radius: 8px;
}
</style>
```

## Advanced Usage Examples

### Document Scroll Control

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
      <p>Scroll Position: {{ documentScroller.scrollTop }}px</p>
      <p>Scrolling: {{ documentScroller.nowScrolling ? 'Yes' : 'No' }}</p>
      <p>Scroll Direction: {{ documentScroller.lastDirection }}</p>
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
      offsetTop: -60 // Offset for navigation bar height
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

### Scroll Stopping and Filtering

```vue
<template>
  <div>
    <div class="controls">
      <button @click="toggleScrollLock">
        Scroll {{ isScrollLocked ? 'Unlock' : 'Lock' }}
      </button>
      <button @click="addVerticalOnlyFilter">Vertical Only</button>
      <button @click="clearFilters">Clear Filters</button>
    </div>

    <VScroller
      ref="scroller"
      :guide="true"
      style="height: 300px; width: 500px; border: 1px solid #ccc;"
    >
      <div style="width: 800px; height: 600px; background: linear-gradient(45deg, red, blue);">
        <p>Content scrollable in both directions</p>
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
    // Unlock
    currentStoppers.forEach(stopper => {
      scroller.value!.scroller.removeScrollStopper(stopper)
    })
    currentStoppers.length = 0
    isScrollLocked.value = false
  } else {
    // Lock
    const stopper: ScrollStopper = () => true // Stop all scrolling
    scroller.value.scroller.pushScrollStopper(stopper)
    currentStoppers.push(stopper)
    isScrollLocked.value = true
  }
}

const addVerticalOnlyFilter = () => {
  if (!scroller.value) return

  const stopper: ScrollStopper = (axis) => {
    return axis === 'x' // Stop only X-axis scrolling (disable horizontal scroll)
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

### Implementing Infinite Scroll

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
        Loading...
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

// Load initial data
onMounted(() => {
  loadMoreItems()
})

// Monitor scroll position
watch(() => scrollerRef.value?.scroller.scrollBottom, (scrollBottom) => {
  if (scrollBottom !== undefined && scrollBottom < 50 && !loading.value) {
    loadMoreItems()
  }
}, { immediate: false })

const loadMoreItems = async () => {
  if (loading.value) return

  loading.value = true

  // Simulate API request
  await new Promise(resolve => setTimeout(resolve, 1000))

  const newItems: ListItem[] = Array.from({ length: 20 }, (_, index) => ({
    id: (currentPage.value - 1) * 20 + index + 1,
    title: `Item ${(currentPage.value - 1) * 20 + index + 1}`
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

### Saving and Restoring Scroll Position

```vue
<template>
  <div>
    <div class="controls">
      <button @click="savePosition">Save Position</button>
      <button @click="restorePosition">Restore Position</button>
      <button @click="clearSavedPosition">Clear Saved Data</button>
    </div>

    <VScroller
      ref="scrollerRef"
      style="height: 300px;"
    >
      <div class="content">
        <div v-for="n in 100" :key="n" class="item">
          Item {{ n }}
        </div>
      </div>
    </VScroller>

    <div v-if="savedPosition" class="saved-info">
      Saved Position: Top={{ savedPosition.scrollTop }}px, Left={{ savedPosition.scrollLeft }}px
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

  // Save to localStorage
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

// Restore saved position on page load
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

### Parallax Scroll Effects

```vue
<template>
  <VScroller
    ref="scrollerRef"
    style="height: 100vh; position: relative; overflow: hidden;"
  >
    <div class="parallax-container">
      <!-- Background layer (moves slowly) -->
      <div
        class="parallax-layer background"
        :style="{ transform: `translateY(${backgroundOffset}px)` }"
      >
        <div class="bg-pattern"></div>
      </div>

      <!-- Middle layer (medium speed) -->
      <div
        class="parallax-layer midground"
        :style="{ transform: `translateY(${midgroundOffset}px)` }"
      >
        <div class="floating-shapes"></div>
      </div>

      <!-- Foreground (normal speed) -->
      <div class="parallax-layer foreground">
        <div class="content">
          <h1>Parallax Effect</h1>
          <div v-for="n in 20" :key="n" class="content-block">
            <h2>Section {{ n }}</h2>
            <p>When scrolling, the background and middle layers move at different speeds.</p>
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

// Calculate parallax effects
const backgroundOffset = computed(() => {
  if (!scrollerRef.value) return 0
  return scrollerRef.value.scroller.scrollTop * 0.5 // 50% speed
})

const midgroundOffset = computed(() => {
  if (!scrollerRef.value) return 0
  return scrollerRef.value.scroller.scrollTop * 0.7 // 70% speed
})
</script>

<style>
.parallax-container {
  position: relative;
  height: 200vh; /* Scrollable height */
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

## API Reference

### useScrollerControl

```typescript
function useScrollerControl(setting: UseScrollerSetting): UseScroller

interface UseScrollerSetting extends Omit<Partial<ScrollerSetting>, 'el'> {
  el?: 'self' | 'body'
  duration?: number        // Animation duration (milliseconds)
  easing?: string         // Easing function
  throttle?: number       // Scroll event throttle interval
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

### VScroller Component

```typescript
interface VScrollerProps {
  settings?: VScrollerSettings | null
  guide?: boolean | number    // Display and offset for scroll guides
  containerClass?: string     // Class name for container element
}

interface VScrollerSettings extends UseScrollerSetting {}

interface ScrollerAPI {
  scroller: ScrollerControl
  scrollable: ScrollerCombinedScrollability
}

interface ScrollerCombinedScrollability {
  left: boolean      // Scrollable to the left
  right: boolean     // Scrollable to the right
  top: boolean       // Scrollable upward
  bottom: boolean    // Scrollable downward
  strict: ScrollerScrollability  // Strict scrollability
}
```

### Scroll Options

```typescript
interface ScrollerScrollOptions {
  duration?: number           // Animation duration (milliseconds)
  easing?: string            // Easing function
  cancelable?: boolean       // Whether cancellable
}

interface ScrollerScrollToElementOptions extends ScrollerScrollOptions {
  offsetTop?: number         // Top offset
  offsetLeft?: number        // Left offset
  offsetRight?: number       // Right offset
  offsetBottom?: number      // Bottom offset
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

Get a singleton instance for controlling page-wide scrolling.

## Style Customization

### CSS Classes

```css
/* VScroller component styles */
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

### Custom Guide Styles

```css
/* Custom guide style examples */
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

## Related Packages

- `@fastkit/scroller` - Core scroll control library
- `@fastkit/vue-utils` - Vue.js development utilities
- `@fastkit/tiny-logger` - Logging system

## License

MIT
