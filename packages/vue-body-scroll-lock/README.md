
# @fastkit/vue-body-scroll-lock

🌐 English | [日本語](https://github.com/dadajam4/fastkit/blob/main/packages/vue-body-scroll-lock/README-ja.md)

A library for disabling body scroll when modals, drawers, and overlays are displayed in Vue.js applications. Provides simultaneous management of multiple elements, support for nested elements, and countermeasures for special behavior in iOS Safari.

## Features

- **Body Scroll Disable**: Prevent body scroll when modals or drawers are displayed
- **v-body-scroll-lock Directive**: Simple directive-based scroll control
- **Stack Management**: Simultaneous management of multiple overlay elements
- **Nested Support**: Support for complex structures like modals within modals
- **iOS Safari Support**: Countermeasures for iOS special scroll behavior
- **Full TypeScript Support**: Type safety through strict type definitions
- **Vue 3 Composition API**: Complete integration with reactive system
- **SSR Support**: Safe operation in server-side rendering environments
- **Lightweight Implementation**: Minimal dependencies and efficient memory usage

## Installation

```bash
npm install @fastkit/vue-body-scroll-lock
```

## Basic Usage

### Using with Modal Dialogs

```vue
<template>
  <div>
    <button @click="showModal = true" class="open-button">
      Open Modal
    </button>

    <!-- Modal overlay -->
    <div
      v-if="showModal"
      v-body-scroll-lock="showModal"
      class="modal-overlay"
      @click="closeModal"
    >
      <div class="modal-content" @click.stop>
        <header class="modal-header">
          <h2>Modal Dialog</h2>
          <button @click="closeModal" class="close-button">×</button>
        </header>

        <div class="modal-body">
          <p>While this modal is displayed, background scrolling is disabled.</p>

          <!-- Scrollable content within the modal -->
          <div class="scrollable-content" data-scroll-lock-scroller>
            <p v-for="i in 20" :key="i">
              Scrollable content {{ i }}
            </p>
          </div>
        </div>

        <footer class="modal-footer">
          <button @click="closeModal" class="cancel-button">
            Cancel
          </button>
          <button @click="confirmAction" class="confirm-button">
            Confirm
          </button>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const showModal = ref(false)

const closeModal = () => {
  showModal.value = false
}

const confirmAction = () => {
  alert('Confirmed')
  closeModal()
}
</script>

<style>
.open-button {
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

.open-button:hover {
  background: #0056b3;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  max-width: 90vw;
  max-height: 90vh;
  width: 500px;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  color: #495057;
}

.close-button {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #6c757d;
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.close-button:hover {
  background: #f8f9fa;
  color: #495057;
}

.modal-body {
  padding: 20px;
  flex: 1;
  overflow: hidden;
}

.scrollable-content {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #dee2e6;
  padding: 15px;
  border-radius: 4px;
  background: #f8f9fa;
}

.scrollable-content p {
  margin: 8px 0;
  padding: 8px;
  background: white;
  border-radius: 4px;
}

.modal-footer {
  padding: 20px;
  border-top: 1px solid #dee2e6;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.cancel-button,
.confirm-button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.cancel-button {
  background: #6c757d;
  color: white;
}

.cancel-button:hover {
  background: #545b62;
}

.confirm-button {
  background: #28a745;
  color: white;
}

.confirm-button:hover {
  background: #1e7e34;
}
</style>
```

### Using with Side Drawer

```vue
<template>
  <div>
    <header class="header">
      <button @click="showDrawer = true" class="menu-button">
        ≡ Menu
      </button>
      <h1>Application</h1>
    </header>

    <!-- Side drawer -->
    <div
      v-if="showDrawer"
      v-body-scroll-lock="showDrawer"
      class="drawer-overlay"
      @click="closeDrawer"
    >
      <nav class="drawer" @click.stop>
        <header class="drawer-header">
          <h2>Navigation</h2>
          <button @click="closeDrawer" class="close-button">×</button>
        </header>

        <ul class="nav-list">
          <li><a href="#" @click="navigateTo('home')">Home</a></li>
          <li><a href="#" @click="navigateTo('products')">Products</a></li>
          <li><a href="#" @click="navigateTo('about')">About Us</a></li>
          <li><a href="#" @click="navigateTo('contact')">Contact</a></li>
        </ul>

        <div class="drawer-footer">
          <button @click="showSettings = true" class="settings-button">
            Settings
          </button>
        </div>
      </nav>
    </div>

    <!-- Main content -->
    <main class="main-content">
      <h2>Main Content</h2>
      <p v-for="i in 50" :key="i">
        Page content {{ i }} - Cannot scroll while drawer is open.
      </p>
    </main>

    <!-- Settings modal (nested example) -->
    <div
      v-if="showSettings"
      v-body-scroll-lock="showSettings"
      class="settings-overlay"
      @click="closeSettings"
    >
      <div class="settings-modal" @click.stop>
        <h3>Settings</h3>
        <p>This is an example of a nested modal.</p>
        <button @click="closeSettings">Close</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const showDrawer = ref(false)
const showSettings = ref(false)

const closeDrawer = () => {
  showDrawer.value = false
}

const closeSettings = () => {
  showSettings.value = false
}

const navigateTo = (page: string) => {
  console.log(`Navigate to: ${page}`)
  closeDrawer()
}
</script>

<style>
.header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: #343a40;
  color: white;
  display: flex;
  align-items: center;
  padding: 0 20px;
  z-index: 100;
}

.menu-button {
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  cursor: pointer;
  margin-right: 15px;
  padding: 8px;
  border-radius: 4px;
}

.menu-button:hover {
  background: rgba(255, 255, 255, 0.1);
}

.header h1 {
  margin: 0;
  font-size: 18px;
}

.drawer-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

.drawer {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 280px;
  background: white;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.3);
  display: flex;
  flex-direction: column;
  transform: translateX(0);
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(-100%);
  }
  to {
    transform: translateX(0);
  }
}

.drawer-header {
  padding: 20px;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.drawer-header h2 {
  margin: 0;
  color: #495057;
  font-size: 18px;
}

.close-button {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #6c757d;
  padding: 4px;
  border-radius: 4px;
}

.close-button:hover {
  background: #f8f9fa;
}

.nav-list {
  flex: 1;
  list-style: none;
  margin: 0;
  padding: 0;
}

.nav-list li {
  border-bottom: 1px solid #f8f9fa;
}

.nav-list a {
  display: block;
  padding: 15px 20px;
  color: #495057;
  text-decoration: none;
  transition: background-color 0.2s ease;
}

.nav-list a:hover {
  background: #f8f9fa;
}

.drawer-footer {
  padding: 20px;
  border-top: 1px solid #dee2e6;
}

.settings-button {
  width: 100%;
  padding: 10px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.settings-button:hover {
  background: #0056b3;
}

.main-content {
  margin-top: 60px;
  padding: 20px;
}

.main-content h2 {
  color: #495057;
}

.main-content p {
  margin: 10px 0;
  padding: 10px;
  background: #f8f9fa;
  border-radius: 4px;
  border: 1px solid #dee2e6;
}

.settings-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.settings-modal {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  max-width: 400px;
  width: 90vw;
}

.settings-modal h3 {
  margin: 0 0 15px 0;
  color: #495057;
}

.settings-modal button {
  margin-top: 15px;
  padding: 8px 16px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.settings-modal button:hover {
  background: #545b62;
}
</style>
```

### Using with Fullscreen Overlay

```vue
<template>
  <div>
    <div class="page-content">
      <h1>Image Gallery</h1>

      <div class="image-grid">
        <div
          v-for="(image, index) in images"
          :key="index"
          class="image-item"
          @click="openLightbox(index)"
        >
          <img :src="image.thumbnail" :alt="image.title">
          <div class="image-overlay">
            <span class="view-icon">🔍</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Lightbox -->
    <div
      v-if="lightboxOpen"
      v-body-scroll-lock="lightboxOpen"
      class="lightbox-overlay"
      @click="closeLightbox"
    >
      <div class="lightbox-content">
        <button @click="closeLightbox" class="lightbox-close">×</button>

        <button
          v-if="currentImageIndex > 0"
          @click="previousImage"
          class="lightbox-nav lightbox-prev"
        >
          ‹
        </button>

        <div class="lightbox-image-container">
          <img
            :src="currentImage.full"
            :alt="currentImage.title"
            class="lightbox-image"
          >
          <div class="lightbox-info">
            <h3>{{ currentImage.title }}</h3>
            <p>{{ currentImage.description }}</p>
            <span class="image-counter">
              {{ currentImageIndex + 1 }} / {{ images.length }}
            </span>
          </div>
        </div>

        <button
          v-if="currentImageIndex < images.length - 1"
          @click="nextImage"
          class="lightbox-nav lightbox-next"
        >
          ›
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface ImageData {
  title: string
  description: string
  thumbnail: string
  full: string
}

const lightboxOpen = ref(false)
const currentImageIndex = ref(0)

const images: ImageData[] = [
  {
    title: 'Beautiful Landscape 1',
    description: 'A lake surrounded by mountains.',
    thumbnail: 'https://picsum.photos/300/200?random=1',
    full: 'https://picsum.photos/800/600?random=1'
  },
  {
    title: 'Beautiful Landscape 2',
    description: 'A coastline colored by the sunset.',
    thumbnail: 'https://picsum.photos/300/200?random=2',
    full: 'https://picsum.photos/800/600?random=2'
  },
  {
    title: 'Beautiful Landscape 3',
    description: 'A small stream in the forest.',
    thumbnail: 'https://picsum.photos/300/200?random=3',
    full: 'https://picsum.photos/800/600?random=3'
  },
  {
    title: 'Beautiful Landscape 4',
    description: 'A magnificent view from the mountaintop.'
    thumbnail: 'https://picsum.photos/300/200?random=4',
    full: 'https://picsum.photos/800/600?random=4'
  }
]

const currentImage = computed(() => images[currentImageIndex.value])

const openLightbox = (index: number) => {
  currentImageIndex.value = index
  lightboxOpen.value = true
}

const closeLightbox = () => {
  lightboxOpen.value = false
}

const previousImage = () => {
  if (currentImageIndex.value > 0) {
    currentImageIndex.value--
  }
}

const nextImage = () => {
  if (currentImageIndex.value < images.length - 1) {
    currentImageIndex.value++
  }
}

// キーボードナビゲーション
const handleKeydown = (event: KeyboardEvent) => {
  if (!lightboxOpen.value) return

  switch (event.key) {
    case 'Escape':
      closeLightbox()
      break
    case 'ArrowLeft':
      previousImage()
      break
    case 'ArrowRight':
      nextImage()
      break
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('keydown', handleKeydown)
}
</script>

<style>
.page-content {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.page-content h1 {
  text-align: center;
  color: #495057;
  margin-bottom: 30px;
}

.image-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.image-item {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.image-item:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.image-item img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.image-item:hover .image-overlay {
  opacity: 1;
}

.view-icon {
  font-size: 30px;
  color: white;
}

.lightbox-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.lightbox-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
  display: flex;
  align-items: center;
}

.lightbox-close {
  position: absolute;
  top: -50px;
  right: 0;
  background: none;
  border: none;
  color: white;
  font-size: 30px;
  cursor: pointer;
  padding: 10px;
  z-index: 1001;
}

.lightbox-close:hover {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
}

.lightbox-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: white;
  font-size: 40px;
  width: 60px;
  height: 60px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s ease;
}

.lightbox-nav:hover {
  background: rgba(255, 255, 255, 0.3);
}

.lightbox-prev {
  left: -80px;
}

.lightbox-next {
  right: -80px;
}

.lightbox-image-container {
  text-align: center;
}

.lightbox-image {
  max-width: 100%;
  max-height: 70vh;
  object-fit: contain;
  border-radius: 8px;
}

.lightbox-info {
  color: white;
  margin-top: 20px;
  text-align: center;
}

.lightbox-info h3 {
  margin: 0 0 10px 0;
  font-size: 24px;
}

.lightbox-info p {
  margin: 0 0 10px 0;
  font-size: 16px;
  color: #ccc;
}

.image-counter {
  display: inline-block;
  background: rgba(255, 255, 255, 0.2);
  padding: 5px 10px;
  border-radius: 12px;
  font-size: 14px;
}

/* モバイル対応 */
@media (max-width: 768px) {
  .lightbox-nav {
    width: 50px;
    height: 50px;
    font-size: 30px;
  }

  .lightbox-prev {
    left: -60px;
  }

  .lightbox-next {
    right: -60px;
  }

  .lightbox-close {
    top: -40px;
    font-size: 25px;
  }
}
</style>
```

## Advanced Usage Examples

### カスタムスクロール領域の指定

```vue
<template>
  <div>
    <button @click="showModal = true">カスタムスクロールモーダル</button>

    <div
      v-if="showModal"
      v-body-scroll-lock="showModal"
      class="modal-overlay"
      @click="closeModal"
    >
      <div class="modal" @click.stop>
        <header class="modal-header">
          <h2>カスタムスクロール領域</h2>
          <button @click="closeModal">×</button>
        </header>

        <!-- data-scroll-lock-scroller属性でスクロール可能領域を指定 -->
        <div class="modal-body" data-scroll-lock-scroller>
          <div class="content-section">
            <h3>セクション 1</h3>
            <p v-for="i in 10" :key="`section1-${i}`">
              セクション1のコンテンツ {{ i }}
            </p>
          </div>

          <div class="content-section">
            <h3>セクション 2</h3>
            <p v-for="i in 10" :key="`section2-${i}`">
              セクション2のコンテンツ {{ i }}
            </p>
          </div>

          <div class="content-section">
            <h3>セクション 3</h3>
            <p v-for="i in 10" :key="`section3-${i}`">
              セクション3のコンテンツ {{ i }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const showModal = ref(false)

const closeModal = () => {
  showModal.value = false
}
</script>

<style>
.modal {
  background: white;
  border-radius: 8px;
  max-width: 600px;
  max-height: 80vh;
  width: 90vw;
  display: flex;
  flex-direction: column;
}

.modal-header {
  padding: 20px;
  border-bottom: 1px solid #dee2e6;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.content-section {
  margin-bottom: 30px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
}

.content-section h3 {
  margin: 0 0 15px 0;
  color: #495057;
}

.content-section p {
  margin: 8px 0;
  padding: 10px;
  background: white;
  border-radius: 4px;
  border: 1px solid #dee2e6;
}
</style>
```

### Programmatic Installation

```typescript
// main.ts
import { createApp } from 'vue'
import { installBodyScrollLockDirective } from '@fastkit/vue-body-scroll-lock'
import App from './App.vue'

const app = createApp(App)

// v-body-scroll-lockディレクティブをグローバルにインストール
installBodyScrollLockDirective(app)

app.mount('#app')
```

### 条件付きスクロールロック

```vue
<template>
  <div>
    <div class="controls">
      <label>
        <input v-model="enableScrollLock" type="checkbox">
        Enable scroll lock
      </label>
    </div>

    <button @click="showModal = true">モーダルを開く</button>

    <div
      v-if="showModal"
      v-body-scroll-lock="enableScrollLock && showModal"
      class="modal-overlay"
      @click="closeModal"
    >
      <div class="modal" @click.stop>
        <h2>条件付きスクロールロック</h2>
        <p>
          Scroll lock is {{ enableScrollLock ? 'enabled' : 'disabled' }}.
        </p>
        <p>
          Please scroll the background to verify the functionality.
        </p>
        <button @click="closeModal">Close</button>
      </div>
    </div>

    <!-- 背景コンテンツ -->
    <div class="background-content">
      <p v-for="i in 50" :key="i">
        Background content {{ i }} - Scrolling becomes enabled/disabled based on scroll lock state.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const showModal = ref(false)
const enableScrollLock = ref(true)

const closeModal = () => {
  showModal.value = false
}
</script>

<style>
.controls {
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  margin-bottom: 20px;
}

.controls label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;
}

.background-content {
  margin-top: 20px;
}

.background-content p {
  padding: 15px;
  margin: 10px 0;
  background: #fff;
  border: 1px solid #dee2e6;
  border-radius: 4px;
}

.modal {
  background: white;
  padding: 30px;
  border-radius: 8px;
  max-width: 500px;
  width: 90vw;
}

.modal h2 {
  margin: 0 0 15px 0;
  color: #495057;
}

.modal p {
  margin: 10px 0;
  color: #6c757d;
}

.modal button {
  margin-top: 15px;
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.modal button:hover {
  background: #0056b3;
}
</style>
```

## API リファレンス

### v-body-scroll-lockディレクティブ

```typescript
type BodyScrollLockDirectiveBindingValue = boolean | undefined | void

interface BodyScrollLockDirectiveAttrs {
  'v-body-scroll-lock'?: BodyScrollLockDirectiveBindingValue
}
```

**使用方法:**
```vue
<!-- 基本的な使用 -->
<div v-body-scroll-lock="true">スクロールロック有効</div>
<div v-body-scroll-lock="false">スクロールロック無効</div>
<div v-body-scroll-lock="condition">条件付きスクロールロック</div>

<!-- カスタムスクロール領域の指定 -->
<div v-body-scroll-lock="true">
  <div data-scroll-lock-scroller>
    <!-- This area is scrollable -->
  </div>
</div>
```

### インストール関数

```typescript
function installBodyScrollLockDirective(app: App): App
```

Globally installs the v-body-scroll-lock directive in a Vue application.

### ディレクティブヘルパー

```typescript
function bodyScrollLockDirectiveArgument(
  bindingValue?: BodyScrollLockDirectiveBindingValue
): [BodyScrollLockDirective, BodyScrollLockDirectiveBindingValue]
```

A helper function for using the directive programmatically.

### 特別な属性

#### data-scroll-lock-scroller

Used to specify scrollable areas within scroll lock target elements.

```html
<div v-body-scroll-lock="true">
  <!-- bodyスクロールは無効 -->
  <div data-scroll-lock-scroller>
    <!-- This area is scrollable -->
  </div>
</div>
```

#### data-body-scroll-lock

An attribute automatically set on `document.documentElement` when scroll lock is enabled. Can be used for CSS control.

```css
[data-body-scroll-lock] {
  overflow: hidden;
}
```

## パフォーマンスと注意事項

### スタック管理

When multiple overlay elements exist simultaneously, they are managed internally with a stack. Body scroll remains disabled until the last active element is removed.

```vue
<template>
  <!-- モーダル1 -->
  <div v-if="modal1" v-body-scroll-lock="modal1">
    <!-- モーダル2（ネスト） -->
    <div v-if="modal2" v-body-scroll-lock="modal2">
      <!-- Body scroll is disabled until both are closed -->
    </div>
  </div>
</template>
```

### iOS Safari対応

Handles iOS Safari's special scroll behavior appropriately, properly disabling body scroll.

### メモリ管理

Scroll lock is automatically released when a component is unmounted. Manual cleanup is not required.

## Related Packages

- `@fastkit/body-scroll-lock` - コアのbodyスクロールロック機能
- `@fastkit/dom` - DOM操作ユーティリティ
- `@fastkit/helpers` - ユーティリティ関数（`IN_WINDOW`等）
- `@fastkit/vue-utils` - Vue.js開発ユーティリティ

## License

MIT
