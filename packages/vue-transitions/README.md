
# @fastkit/vue-transitions

🌐 English | [日本語](./README-ja.md)

Vue.jsアプリケーションで高品質なトランジションとアニメーション効果を簡単に実装するためのライブラリ。カスタムJavaScriptトランジション生成器とビルトインコンポーネントを提供し、滑らかで自然なユーザーインターフェースを構築できます。

## Features

- **JavaScriptトランジション生成器**: カスタムトランジションコンポーネントの簡単作成
- **VExpandTransition**: 高さ・幅の開閉アニメーション
- **フェード効果**: 透明度変化との組み合わせアニメーション
- **Vue 3完全対応**: Composition APIとの完全統合
- **TypeScript完全サポート**: 厳密な型定義による型安全性
- **CSSトランジション統合**: DOM操作とCSSアニメーションの協調
- **柔軟なカスタマイズ**: プロパティとフックによる細かい制御

## Installation

```bash
npm install @fastkit/vue-transitions
```

## Basic Usage

### VExpandTransition - 開閉アニメーション

```vue
<template>
  <div>
    <button @click="toggle">コンテンツを{{ isOpen ? '閉じる' : '開く' }}</button>
    
    <!-- 基本的な高さアニメーション -->
    <VExpandTransition>
      <div v-show="isOpen" class="content">
        <p>このコンテンツは滑らかに開閉します。</p>
        <p>CSSトランジションと組み合わせて自然なアニメーションを実現します。</p>
      </div>
    </VExpandTransition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { VExpandTransition } from '@fastkit/vue-transitions'

const isOpen = ref(false)

const toggle = () => {
  isOpen.value = !isOpen.value
}
</script>

<style>
.content {
  background: #f0f8ff;
  padding: 20px;
  margin: 10px 0;
  border-radius: 8px;
  border: 1px solid #4a90e2;
  
  /* トランジションプロパティが必須 */
  transition: height 0.3s ease, margin 0.3s ease;
}
</style>
```

### 幅方向の展開アニメーション

```vue
<template>
  <div>
    <button @click="toggleWidth">サイドバーを{{ isWidthOpen ? '閉じる' : '開く' }}</button>
    
    <div class="container">
      <VExpandTransition expand="width">
        <div v-show="isWidthOpen" class="sidebar">
          <h3>サイドバー</h3>
          <ul>
            <li>メニュー項目 1</li>
            <li>メニュー項目 2</li>
            <li>メニュー項目 3</li>
          </ul>
        </div>
      </VExpandTransition>
      
      <div class="main-content">
        <h2>メインコンテンツ</h2>
        <p>サイドバーが横方向にアニメーションします。</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { VExpandTransition } from '@fastkit/vue-transitions'

const isWidthOpen = ref(false)

const toggleWidth = () => {
  isWidthOpen.value = !isWidthOpen.value
}
</script>

<style>
.container {
  display: flex;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.sidebar {
  width: 200px;
  background: #2c3e50;
  color: white;
  padding: 20px;
  
  /* 幅のトランジションを設定 */
  transition: width 0.4s ease, margin 0.4s ease;
}

.sidebar h3 {
  margin-top: 0;
}

.sidebar ul {
  list-style: none;
  padding: 0;
}

.sidebar li {
  padding: 8px 0;
  border-bottom: 1px solid #34495e;
}

.main-content {
  flex: 1;
  padding: 20px;
  background: #fff;
}
</style>
```

### フェード効果付きアニメーション

```vue
<template>
  <div>
    <button @click="toggleFade">フェード付きで{{ isFadeOpen ? '閉じる' : '開く' }}</button>
    
    <VExpandTransition fade>
      <div v-show="isFadeOpen" class="fade-content">
        <h3>フェード効果付きコンテンツ</h3>
        <p>高さの変化と同時に透明度も変化します。</p>
        <div class="image-placeholder">
          🖼️ 画像プレースホルダー
        </div>
      </div>
    </VExpandTransition>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { VExpandTransition } from '@fastkit/vue-transitions'

const isFadeOpen = ref(false)

const toggleFade = () => {
  isFadeOpen.value = !isFadeOpen.value
}
</script>

<style>
.fade-content {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px;
  margin: 15px 0;
  border-radius: 12px;
  
  /* 高さと透明度の両方をアニメーション */
  transition: height 0.5s ease, margin 0.5s ease, opacity 0.5s ease;
}

.image-placeholder {
  background: rgba(255, 255, 255, 0.2);
  padding: 40px;
  text-align: center;
  border-radius: 8px;
  margin-top: 15px;
  font-size: 24px;
}
</style>
```

## Advanced Usage Examples

### アコーディオンメニューの実装

```vue
<template>
  <div class="accordion">
    <div 
      v-for="(item, index) in accordionItems" 
      :key="item.id"
      class="accordion-item"
    >
      <button 
        @click="toggleItem(index)"
        class="accordion-header"
        :class="{ active: openItems.has(index) }"
      >
        <span>{{ item.title }}</span>
        <span class="icon" :class="{ rotated: openItems.has(index) }">▼</span>
      </button>
      
      <VExpandTransition>
        <div v-show="openItems.has(index)" class="accordion-content">
          <div class="accordion-body">
            {{ item.content }}
          </div>
        </div>
      </VExpandTransition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { VExpandTransition } from '@fastkit/vue-transitions'

interface AccordionItem {
  id: number
  title: string
  content: string
}

const accordionItems: AccordionItem[] = [
  {
    id: 1,
    title: 'セクション 1',
    content: 'セクション 1 の詳細内容がここに表示されます。このアコーディオンは滑らかにアニメーションします。'
  },
  {
    id: 2,
    title: 'セクション 2', 
    content: 'セクション 2 の詳細内容。複数のセクションを同時に開くことができます。'
  },
  {
    id: 3,
    title: 'セクション 3',
    content: 'セクション 3 の詳細内容。CSSトランジションと組み合わせることで自然なアニメーションを実現します。'
  }
]

const openItems = reactive(new Set<number>())

const toggleItem = (index: number) => {
  if (openItems.has(index)) {
    openItems.delete(index)
  } else {
    openItems.add(index)
  }
}
</script>

<style>
.accordion {
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  overflow: hidden;
}

.accordion-item {
  border-bottom: 1px solid #e1e5e9;
}

.accordion-item:last-child {
  border-bottom: none;
}

.accordion-header {
  width: 100%;
  padding: 16px 20px;
  background: #f8f9fa;
  border: none;
  text-align: left;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.accordion-header:hover {
  background: #e9ecef;
}

.accordion-header.active {
  background: #007bff;
  color: white;
}

.icon {
  transition: transform 0.2s ease;
}

.icon.rotated {
  transform: rotate(180deg);
}

.accordion-content {
  background: white;
  transition: height 0.3s ease, margin 0.3s ease;
}

.accordion-body {
  padding: 20px;
  line-height: 1.6;
  color: #333;
}
</style>
```

### カードの詳細表示

```vue
<template>
  <div class="card-grid">
    <div 
      v-for="card in cards"
      :key="card.id"
      class="card"
      @click="toggleCard(card.id)"
    >
      <div class="card-header">
        <h3>{{ card.title }}</h3>
        <span class="expand-icon" :class="{ expanded: expandedCards.has(card.id) }">
          +
        </span>
      </div>
      
      <p class="card-summary">{{ card.summary }}</p>
      
      <VExpandTransition fade>
        <div v-show="expandedCards.has(card.id)" class="card-details">
          <div class="detail-content">
            <p><strong>詳細説明:</strong></p>
            <p>{{ card.details }}</p>
            
            <div class="card-features">
              <h4>特徴:</h4>
              <ul>
                <li v-for="feature in card.features" :key="feature">
                  {{ feature }}
                </li>
              </ul>
            </div>
            
            <div class="card-actions">
              <button class="btn btn-primary">詳細を見る</button>
              <button class="btn btn-secondary">お気に入り</button>
            </div>
          </div>
        </div>
      </VExpandTransition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { VExpandTransition } from '@fastkit/vue-transitions'

interface Card {
  id: number
  title: string
  summary: string
  details: string
  features: string[]
}

const cards: Card[] = [
  {
    id: 1,
    title: 'Vue 3 コンポーネント',
    summary: 'モダンなVue.jsコンポーネントライブラリ',
    details: 'Vue 3のComposition APIを活用した高性能なコンポーネントライブラリです。TypeScriptフルサポートで開発効率を向上させます。',
    features: ['Composition API', 'TypeScript対応', '高性能', 'カスタマイズ可能']
  },
  {
    id: 2,
    title: 'アニメーションシステム',
    summary: '滑らかなトランジション効果',
    details: 'CSSトランジションとJavaScriptを組み合わせた高品質なアニメーションシステムです。',
    features: ['CSS統合', 'パフォーマンス最適化', '柔軟な設定', 'クロスブラウザ対応']
  }
]

const expandedCards = reactive(new Set<number>())

const toggleCard = (cardId: number) => {
  if (expandedCards.has(cardId)) {
    expandedCards.delete(cardId)
  } else {
    expandedCards.add(cardId)
  }
}
</script>

<style>
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  padding: 20px;
}

.card {
  border: 1px solid #ddd;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  background: white;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}

.card:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.15);
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.card-header h3 {
  margin: 0;
  color: #333;
}

.expand-icon {
  font-size: 24px;
  font-weight: bold;
  color: #007bff;
  transition: transform 0.2s ease;
}

.expand-icon.expanded {
  transform: rotate(45deg);
}

.card-summary {
  color: #666;
  margin-bottom: 15px;
  line-height: 1.5;
}

.card-details {
  border-top: 1px solid #eee;
  transition: height 0.4s ease, opacity 0.4s ease;
}

.detail-content {
  padding-top: 15px;
}

.card-features {
  margin: 15px 0;
}

.card-features h4 {
  margin: 0 0 8px 0;
  color: #333;
}

.card-features ul {
  margin: 0;
  padding-left: 20px;
}

.card-features li {
  margin: 4px 0;
  color: #555;
}

.card-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s ease;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover {
  background: #0056b3;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #545b62;
}
</style>
```

## カスタムトランジションの作成

### generateJavaScriptTransition

独自のトランジションコンポーネントを作成できます。

```typescript
import { generateJavaScriptTransition } from '@fastkit/vue-transitions'

// スライドトランジションの作成
export const VSlideTransition = generateJavaScriptTransition({
  displayName: 'VSlideTransition',
  props: {
    direction: {
      type: String as PropType<'left' | 'right' | 'up' | 'down'>,
      default: 'left'
    },
    distance: {
      type: [Number, String],
      default: '100%'
    }
  },
  setup(props) {
    return {
      onBeforeEnter(el: HTMLElement) {
        const { direction, distance } = props
        el.style.transition = 'none'
        
        switch (direction) {
          case 'left':
            el.style.transform = `translateX(-${distance})`
            break
          case 'right':
            el.style.transform = `translateX(${distance})`
            break
          case 'up':
            el.style.transform = `translateY(-${distance})`
            break
          case 'down':
            el.style.transform = `translateY(${distance})`
            break
        }
        
        el.style.opacity = '0'
      },
      
      onEnter(el: HTMLElement, done: () => void) {
        // Force reflow
        void el.offsetHeight
        
        el.style.transition = 'transform 0.3s ease, opacity 0.3s ease'
        el.style.transform = 'translate(0, 0)'
        el.style.opacity = '1'
        
        el.addEventListener('transitionend', done, { once: true })
      },
      
      onLeave(el: HTMLElement, done: () => void) {
        const { direction, distance } = props
        
        el.style.transition = 'transform 0.3s ease, opacity 0.3s ease'
        
        switch (direction) {
          case 'left':
            el.style.transform = `translateX(-${distance})`
            break
          case 'right':
            el.style.transform = `translateX(${distance})`
            break
          case 'up':
            el.style.transform = `translateY(-${distance})`
            break
          case 'down':
            el.style.transform = `translateY(${distance})`
            break
        }
        
        el.style.opacity = '0'
        el.addEventListener('transitionend', done, { once: true })
      }
    }
  }
})
```

### カスタムトランジションの使用

```vue
<template>
  <div>
    <div class="controls">
      <button @click="changeDirection('left')">左スライド</button>
      <button @click="changeDirection('right')">右スライド</button>
      <button @click="changeDirection('up')">上スライド</button>
      <button @click="changeDirection('down')">下スライド</button>
    </div>
    
    <button @click="toggle" class="toggle-btn">
      {{ isVisible ? '非表示' : '表示' }}
    </button>
    
    <div class="slide-container">
      <VSlideTransition :direction="currentDirection" distance="200px">
        <div v-show="isVisible" class="slide-content">
          <h3>スライドコンテンツ</h3>
          <p>方向: {{ currentDirection }}</p>
          <p>このコンテンツは {{ currentDirection }} 方向からスライドインします。</p>
        </div>
      </VSlideTransition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
// import { VSlideTransition } from './VSlideTransition' // 上記で作成したコンポーネント

const isVisible = ref(false)
const currentDirection = ref<'left' | 'right' | 'up' | 'down'>('left')

const toggle = () => {
  isVisible.value = !isVisible.value
}

const changeDirection = (direction: 'left' | 'right' | 'up' | 'down') => {
  currentDirection.value = direction
  // 方向変更時に一度非表示にして再表示
  if (isVisible.value) {
    isVisible.value = false
    setTimeout(() => {
      isVisible.value = true
    }, 50)
  }
}
</script>

<style>
.controls {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.controls button {
  padding: 8px 16px;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
}

.controls button:hover {
  background: #f5f5f5;
}

.toggle-btn {
  padding: 12px 24px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 16px;
  margin-bottom: 20px;
}

.toggle-btn:hover {
  background: #0056b3;
}

.slide-container {
  position: relative;
  min-height: 200px;
  border: 2px dashed #ddd;
  border-radius: 8px;
  overflow: hidden;
}

.slide-content {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 30px;
  border-radius: 12px;
  text-align: center;
  min-width: 250px;
}
</style>
```

## API リファレンス

### generateJavaScriptTransition

```typescript
function generateJavaScriptTransition<CustomProps extends ComponentPropsOptions>(
  options: JavaScriptTransitionOptions<CustomProps>
): JavaScriptTransition<CustomProps>

interface JavaScriptTransitionOptions<CustomProps, Props> {
  props?: CustomProps
  displayName?: string
  setup: (props: Props, ctx: SetupContext) => JavaScriptTransitionHooks
}

type JavaScriptTransitionHooks<HostElement = HTMLElement> = {
  onBeforeEnter?: (el: HostElement) => void
  onEnter?: (el: HostElement, done: () => void) => void
  onAfterEnter?: (el: HostElement) => void
  onEnterCancelled?: (el: HostElement) => void
  onBeforeLeave?: (el: HostElement) => void
  onLeave?: (el: HostElement, done: () => void) => void
  onAfterLeave?: (el: HostElement) => void
  onLeaveCancelled?: (el: HostElement) => void
  onBeforeAppear?: (el: HostElement) => void
  onAppear?: (el: HostElement, done: () => void) => void
  onAfterAppear?: (el: HostElement) => void
  onAppearCancelled?: (el: HostElement) => void
}
```

### VExpandTransition

```typescript
interface VExpandTransitionProps {
  expand?: 'width' | 'height'  // 展開方向（デフォルト: 'height'）
  fade?: boolean               // フェード効果の有効/無効（デフォルト: false）
}
```

#### プロパティ

- **expand**: `'width' | 'height'` (デフォルト: `'height'`)
  - トランジションの方向を指定
  - `'height'`: 縦方向の開閉アニメーション
  - `'width'`: 横方向の開閉アニメーション

- **fade**: `boolean` (デフォルト: `false`)
  - フェードイン/アウト効果の有効化
  - `true`: サイズ変化と同時に透明度も変化
  - `false`: サイズのみの変化

#### 使用上の注意

1. **CSSトランジション必須**: 対象要素にCSSの`transition`プロパティを設定する必要があります
2. **必要なプロパティ**: 
   - `expand="height"`の場合: `height`, `margin-top`, `margin-bottom`
   - `expand="width"`の場合: `width`, `margin-left`, `margin-right`
   - `fade=true`の場合: 上記に加えて`opacity`

## パフォーマンス最適化

### CSSトランジションの最適化

```css
/* 良い例：変化するプロパティのみを指定 */
.expand-content {
  transition: height 0.3s ease, margin 0.3s ease;
}

/* 悪い例：all を使うとパフォーマンスが低下 */
.expand-content-bad {
  transition: all 0.3s ease;
}

/* GPU加速を活用 */
.gpu-optimized {
  transition: height 0.3s ease, margin 0.3s ease;
  will-change: height, margin; /* 事前にブラウザに最適化を指示 */
}
```

### 大量の要素でのパフォーマンス

```vue
<template>
  <div class="large-list">
    <!-- v-showよりもv-ifを使用して不要なDOM要素を削除 -->
    <div v-for="item in items" :key="item.id" class="list-item">
      <button @click="toggleItem(item.id)">
        {{ item.title }}
      </button>
      
      <VExpandTransition>
        <div v-if="openItems.has(item.id)" class="item-content">
          {{ item.content }}
        </div>
      </VExpandTransition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { VExpandTransition } from '@fastkit/vue-transitions'

const openItems = reactive(new Set<number>())

// パフォーマンス向上のため、デバウンスを実装
let toggleTimeout: number | undefined

const toggleItem = (itemId: number) => {
  if (toggleTimeout) {
    clearTimeout(toggleTimeout)
  }
  
  toggleTimeout = setTimeout(() => {
    if (openItems.has(itemId)) {
      openItems.delete(itemId)
    } else {
      openItems.add(itemId)
    }
  }, 50) // 短時間での連続クリックを防ぐ
}
</script>

<style>
.item-content {
  /* パフォーマンス向上のためにtransform-styleを指定 */
  transform-style: preserve-3d;
  transition: height 0.25s ease; /* アニメーション時間を短縮 */
}
</style>
```

## Related Packages

- `@fastkit/dom` - DOM操作とトランジションイベント監視
- `@fastkit/helpers` - ユーティリティ関数（capitalize等）
- `@fastkit/vue-utils` - Vue.js開発ユーティリティ

## License

MIT