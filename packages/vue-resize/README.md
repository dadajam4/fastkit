
# @fastkit/vue-resize

🌐 English | [日本語](https://github.com/dadajam4/fastkit/blob/main/packages/vue-resize/README-ja.md)

A library for efficiently monitoring window resizes and element size changes in Vue.js applications. Integrates ResizeObserver API and window resize events, providing debounce functionality and reactive state management.

## Features

- **Window Resize Monitoring**: Reactive tracking of browser window size
- **Element Resize Monitoring**: Individual element monitoring using ResizeObserver API
- **v-resize Directive**: Simple directive for element monitoring
- **Debounce Support**: Delayed execution for performance optimization
- **Full TypeScript Support**: Type safety through strict type definitions
- **Vue 3 Composition API**: Complete integration with reactive system
- **SSR Support**: Safe operation in server-side rendering environments
- **Lightweight Implementation**: Minimal dependencies and efficient memory usage

## Installation

```bash
npm install @fastkit/vue-resize
```

## Basic Usage

### Window Size Monitoring

```vue
<template>
  <div>
    <h2>Window Size Monitoring</h2>
    <div v-if="window.available" class="window-info">
      <p>Width: {{ window.width }}px</p>
      <p>Height: {{ window.height }}px</p>
      <p>Aspect Ratio: {{ aspectRatio }}</p>
      <p>Screen Size: {{ screenSize }}</p>
    </div>
    <div v-else class="no-window">
      Window information unavailable (SSR environment)
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

### v-resize Directive - Element Monitoring

```vue
<template>
  <div>
    <h2>Element Resize Monitoring</h2>

    <!-- Basic element monitoring -->
    <div
      v-resize="handleResize"
      class="resizable-box"
      :style="{ width: boxWidth + 'px', height: boxHeight + 'px' }"
    >
      <p>Resizable Box</p>
      <p>Size: {{ elementSize.width }} x {{ elementSize.height }}px</p>
      <div class="resize-handle"></div>
    </div>

    <!-- Controls -->
    <div class="controls">
      <button @click="changeSize(300, 200)">Small</button>
      <button @click="changeSize(500, 300)">Medium</button>
      <button @click="changeSize(700, 400)">Large</button>
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
  console.log('Element resized:', payload)
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

### Resize Monitoring with Debounce

```vue
<template>
  <div>
    <h2>Resize Monitoring with Debounce</h2>

    <div class="settings">
      <label>
        Debounce Time:
        <select v-model="debounceTime">
          <option :value="0">None (0ms)</option>
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
      <h3>Monitoring Area</h3>
      <p>Resize Event Count: {{ eventCount }}</p>
      <p>Last Update: {{ lastUpdate }}</p>
      <p>Current Size: {{ currentSize.width }} x {{ currentSize.height }}px</p>

      <div class="size-controls">
        <input
          v-model.number="areaWidth"
          type="range"
          min="300"
          max="800"
          step="10"
        >
        <label>Width: {{ areaWidth }}px</label>
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

## Advanced Usage Examples

### Responsive Layout System

```vue
<template>
  <div class="responsive-layout">
    <header class="header">
      <h1>Responsive Header</h1>
      <nav :class="['nav', { 'nav--mobile': isMobile }]">
        <button v-if="isMobile" @click="toggleMenu" class="menu-toggle">
          ≡
        </button>
        <ul v-show="!isMobile || isMenuOpen" class="nav-list">
          <li><a href="#home">Home</a></li>
          <li><a href="#about">About</a></li>
          <li><a href="#contact">Contact</a></li>
        </ul>
      </nav>
    </header>

    <main class="main">
      <aside v-show="!isMobile" class="sidebar">
        <h3>Sidebar</h3>
        <ul>
          <li>Menu Item 1</li>
          <li>Menu Item 2</li>
          <li>Menu Item 3</li>
        </ul>
      </aside>

      <section class="content">
        <h2>Main Content</h2>
        <div class="stats">
          <div class="stat-card">
            <h4>Screen Width</h4>
            <p>{{ window.width }}px</p>
          </div>
          <div class="stat-card">
            <h4>Layout</h4>
            <p>{{ layoutType }}</p>
          </div>
          <div class="stat-card">
            <h4>Column Count</h4>
            <p>{{ columnCount }}</p>
          </div>
        </div>

        <div
          v-resize="handleContentResize"
          :class="['content-grid', `content-grid--${columnCount}col`]"
        >
          <div v-for="i in 12" :key="i" class="grid-item">
            <h5>Item {{ i }}</h5>
            <p>Content Area: {{ contentSize.width }}px</p>
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

// Responsive breakpoints
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

/* Mobile adjustments */
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

### Dynamic Components Based on Window Size

```vue
<template>
  <div class="dynamic-components">
    <h2>Dynamic Component Display</h2>

    <div class="component-container">
      <!-- Desktop table display -->
      <DataTable
        v-if="isDesktop"
        :data="tableData"
        :columns="tableColumns"
      />

      <!-- Tablet card display -->
      <CardList
        v-else-if="isTablet"
        :items="tableData"
      />

      <!-- Mobile list display -->
      <MobileList
        v-else
        :items="tableData"
      />
    </div>

    <div class="window-debug">
      <h4>Window Information</h4>
      <pre>{{ windowDebugInfo }}</pre>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineComponent, h } from 'vue'
import { useWindow } from '@fastkit/vue-resize'

const window = useWindow()

// Responsive breakpoints
const isMobile = computed(() => window.width < 768)
const isTablet = computed(() => window.width >= 768 && window.width < 1200)
const isDesktop = computed(() => window.width >= 1200)

// Sample data
const tableData = [
  { id: 1, name: 'Taro Tanaka', email: 'tanaka@example.com', department: 'Sales' },
  { id: 2, name: 'Hanako Sato', email: 'sato@example.com', department: 'Development' },
  { id: 3, name: 'Jiro Suzuki', email: 'suzuki@example.com', department: 'HR' },
  { id: 4, name: 'Mika Yamada', email: 'yamada@example.com', department: 'Marketing' }
]

const tableColumns = [
  { key: 'id', label: 'ID', width: '80px' },
  { key: 'name', label: 'Name', width: '150px' },
  { key: 'email', label: 'Email', width: '200px' },
  { key: 'department', label: 'Department', width: '150px' }
]

const windowDebugInfo = computed(() => ({
  width: window.width,
  height: window.height,
  deviceType: isMobile.value ? 'Mobile' : isTablet.value ? 'Tablet' : 'Desktop',
  componentUsed: isMobile.value ? 'MobileList' : isTablet.value ? 'CardList' : 'DataTable'
}))

// Desktop table component
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

// Tablet card component
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

// Mobile list component
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

/* Table styles (Desktop) */
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

/* Card styles (Tablet) */
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

/* List styles (Mobile) */
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

/* Debug information */
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

## Directive Options

### v-resize Directive Configuration

```vue
<template>
  <div>
    <!-- Direct function specification -->
    <div v-resize="handleResize">Basic monitoring</div>

    <!-- Configuration with options -->
    <div v-resize="{
      handler: handleResize,
      debounce: 300,
      rootMode: false
    }">
      Advanced monitoring settings
    </div>

    <!-- Window resize mode -->
    <div v-resize="{
      handler: handleWindowResize,
      rootMode: true,
      debounce: 100
    }">
      Window resize monitoring
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ResizeDirectivePayload } from '@fastkit/vue-resize'

const handleResize = (payload: ResizeDirectivePayload) => {
  console.log('Element resize:', payload)
}

const handleWindowResize = (payload: ResizeDirectivePayload) => {
  console.log('Window resize:', payload)
}
</script>
```

### Plugin Installation

```typescript
// main.ts
import { createApp } from 'vue'
import { installResizeDirective } from '@fastkit/vue-resize'
import App from './App.vue'

const app = createApp(App)

// Install v-resize directive globally
installResizeDirective(app)

app.mount('#app')
```

## API Reference

### useWindow

```typescript
interface UseWindowRef {
  readonly available: boolean  // Whether window is available
  readonly width: number      // Window width
  readonly height: number     // Window height
}

function useWindow(): UseWindowRef
```

### v-resize Directive

```typescript
interface ResizeDirectivePayload {
  width: number   // Element width
  height: number  // Element height
}

type ResizeDirectiveHandler = (payload: ResizeDirectivePayload) => any

interface ResizeDirectiveBindingValue {
  handler: ResizeDirectiveHandler  // Resize event handler
  debounce?: number               // Debounce time (milliseconds)
  rootMode?: boolean              // Window resize monitoring mode
}

type RawResizeDirectiveBindingValue =
  | ResizeDirectiveHandler
  | ResizeDirectiveBindingValue
```

### Installation Functions

```typescript
function installResizeDirective(app: App): App

function resizeDirectiveArgument(
  bindingValue: RawResizeDirectiveBindingValue
): [ResizeDirective, RawResizeDirectiveBindingValue]
```

## Performance Optimization

### Appropriate Debounce Configuration

```typescript
// Recommended debounce times by use case
const DEBOUNCE_SETTINGS = {
  // When UI updates are needed (responsive layouts, etc.)
  UI_UPDATE: 100,

  // When calculation processing is required
  CALCULATION: 300,

  // Heavy operations like API calls
  HEAVY_OPERATION: 500,

  // When real-time performance is important
  REAL_TIME: 0
}
```

### Memory Leak Prevention

```vue
<script setup lang="ts">
import { onBeforeUnmount } from 'vue'

// Proper cleanup when using custom resize handlers
const resizeObserver = new ResizeObserver(() => {
  // Resize processing
})

onBeforeUnmount(() => {
  resizeObserver.disconnect()
})
</script>
```

## Related Packages

- `@fastkit/debounce` - Debounce functionality
- `@fastkit/helpers` - Utility functions (`IN_WINDOW`, etc.)
- `@fastkit/vue-utils` - Vue.js development utilities

## License

MIT
