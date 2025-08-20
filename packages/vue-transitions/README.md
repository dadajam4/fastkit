
# @fastkit/vue-transitions

🌐 English | [日本語](https://github.com/dadajam4/fastkit/blob/main/packages/vue-transitions/README-ja.md)

A library for easily implementing high-quality transitions and animation effects in Vue.js applications. Provides custom JavaScript transition generators and built-in components to build smooth and natural user interfaces.

## Features

- **JavaScript Transition Generator**: Easy creation of custom transition components
- **VExpandTransition**: Height and width expand/collapse animations
- **Fade Effects**: Animation combinations with opacity changes
- **Vue 3 Full Support**: Complete integration with Composition API
- **Complete TypeScript Support**: Type safety through strict type definitions
- **CSS Transition Integration**: Coordination of DOM manipulation and CSS animations
- **Flexible Customization**: Fine control through properties and hooks

## Installation

```bash
npm install @fastkit/vue-transitions
```

## Basic Usage

### VExpandTransition - Expand/Collapse Animation

```vue
<template>
  <div>
    <button @click="toggle">{{ isOpen ? 'Close' : 'Open' }} content</button>

    <!-- Basic height animation -->
    <VExpandTransition>
      <div v-show="isOpen" class="content">
        <p>This content opens and closes smoothly.</p>
        <p>Achieves natural animations in combination with CSS transitions.</p>
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

  /* Transition properties are required */
  transition: height 0.3s ease, margin 0.3s ease;
}
</style>
```

### Width Direction Expand Animation

```vue
<template>
  <div>
    <button @click="toggleWidth">{{ isWidthOpen ? 'Close' : 'Open' }} sidebar</button>

    <div class="container">
      <VExpandTransition expand="width">
        <div v-show="isWidthOpen" class="sidebar">
          <h3>Sidebar</h3>
          <ul>
            <li>Menu Item 1</li>
            <li>Menu Item 2</li>
            <li>Menu Item 3</li>
          </ul>
        </div>
      </VExpandTransition>

      <div class="main-content">
        <h2>Main Content</h2>
        <p>The sidebar animates horizontally.</p>
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

  /* Set width transition */
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

### Animation with Fade Effect

```vue
<template>
  <div>
    <button @click="toggleFade">{{ isFadeOpen ? 'Close' : 'Open' }} with fade</button>

    <VExpandTransition fade>
      <div v-show="isFadeOpen" class="fade-content">
        <h3>Content with Fade Effect</h3>
        <p>Opacity changes simultaneously with height changes.</p>
        <div class="image-placeholder">
          🖼️ Image placeholder
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

  /* Animate both height and opacity */
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

### Accordion Menu Implementation

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
    title: 'Section 1',
    content: 'Detailed content of Section 1 is displayed here. This accordion animates smoothly.'
  },
  {
    id: 2,
    title: 'Section 2',
    content: 'Detailed content of Section 2. Multiple sections can be opened simultaneously.'
  },
  {
    id: 3,
    title: 'Section 3',
    content: 'Detailed content of Section 3. Natural animations are achieved by combining with CSS transitions.'
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

### Card Detail Display

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
            <p><strong>Detailed Description:</strong></p>
            <p>{{ card.details }}</p>

            <div class="card-features">
              <h4>Features:</h4>
              <ul>
                <li v-for="feature in card.features" :key="feature">
                  {{ feature }}
                </li>
              </ul>
            </div>

            <div class="card-actions">
              <button class="btn btn-primary">View Details</button>
              <button class="btn btn-secondary">Favorite</button>
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
    title: 'Vue 3 Components',
    summary: 'Modern Vue.js component library',
    details: 'A high-performance component library utilizing Vue 3\'s Composition API. Improves development efficiency with full TypeScript support.',
    features: ['Composition API', 'TypeScript Support', 'High Performance', 'Customizable']
  },
  {
    id: 2,
    title: 'Animation System',
    summary: 'Smooth transition effects',
    details: 'A high-quality animation system combining CSS transitions and JavaScript.',
    features: ['CSS Integration', 'Performance Optimization', 'Flexible Configuration', 'Cross-browser Support']
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

## Creating Custom Transitions

### generateJavaScriptTransition

You can create custom transition components.

```typescript
import { generateJavaScriptTransition } from '@fastkit/vue-transitions'

// Creating slide transition
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

### Using Custom Transitions

```vue
<template>
  <div>
    <div class="controls">
      <button @click="changeDirection('left')">Left Slide</button>
      <button @click="changeDirection('right')">Right Slide</button>
      <button @click="changeDirection('up')">Up Slide</button>
      <button @click="changeDirection('down')">Down Slide</button>
    </div>

    <button @click="toggle" class="toggle-btn">
      {{ isVisible ? 'Hide' : 'Show' }}
    </button>

    <div class="slide-container">
      <VSlideTransition :direction="currentDirection" distance="200px">
        <div v-show="isVisible" class="slide-content">
          <h3>Slide Content</h3>
          <p>Direction: {{ currentDirection }}</p>
          <p>This content slides in from the {{ currentDirection }} direction.</p>
        </div>
      </VSlideTransition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
// import { VSlideTransition } from './VSlideTransition' // Component created above

const isVisible = ref(false)
const currentDirection = ref<'left' | 'right' | 'up' | 'down'>('left')

const toggle = () => {
  isVisible.value = !isVisible.value
}

const changeDirection = (direction: 'left' | 'right' | 'up' | 'down') => {
  currentDirection.value = direction
  // Hide once and re-display when changing direction
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

## API Reference

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
  expand?: 'width' | 'height'  // Expansion direction (default: 'height')
  fade?: boolean               // Enable/disable fade effect (default: false)
}
```

#### Properties

- **expand**: `'width' | 'height'` (default: `'height'`)
  - Specifies the transition direction
  - `'height'`: Vertical expand/collapse animation
  - `'width'`: Horizontal expand/collapse animation

- **fade**: `boolean` (default: `false`)
  - Enable fade in/out effect
  - `true`: Opacity changes simultaneously with size changes
  - `false`: Size changes only

#### Usage Notes

1. **CSS Transition Required**: CSS `transition` property must be set on the target element
2. **Required Properties**:
   - For `expand="height"`: `height`, `margin-top`, `margin-bottom`
   - For `expand="width"`: `width`, `margin-left`, `margin-right`
   - For `fade=true`: `opacity` in addition to the above

## Performance Optimization

### CSS Transition Optimization

```css
/* Good: Specify only changing properties */
.expand-content {
  transition: height 0.3s ease, margin 0.3s ease;
}

/* Bad: Using 'all' decreases performance */
.expand-content-bad {
  transition: all 0.3s ease;
}

/* Utilize GPU acceleration */
.gpu-optimized {
  transition: height 0.3s ease, margin 0.3s ease;
  will-change: height, margin; /* Instruct browser to optimize in advance */
}
```

### Performance with Large Numbers of Elements

```vue
<template>
  <div class="large-list">
    <!-- Use v-if instead of v-show to remove unnecessary DOM elements -->
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

// Implement debouncing for performance improvement
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
  }, 50) // Prevent continuous clicks in a short time
}
</script>

<style>
.item-content {
  /* Specify transform-style for performance improvement */
  transform-style: preserve-3d;
  transition: height 0.25s ease; /* Shorten animation time */
}
</style>
```

## Related Packages

- `@fastkit/dom` - DOM manipulation and transition event monitoring
- `@fastkit/helpers` - Utility functions (capitalize, etc.)
- `@fastkit/vue-utils` - Vue.js development utilities

## License

MIT
