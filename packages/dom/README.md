# @fastkit/dom

ブラウザ環境でのDOM操作を安全かつ効率的に行うためのユーティリティライブラリ。フォーカス管理、スタイル操作、スクリプト読み込み、CSS トランジション監視、ウィンドウ操作、画像読み込みなどの機能を提供します。

## 機能

- **フォーカス管理**: 要素のフォーカス可能性判定とフォーカス制御
- **動的スタイル**: 実行時でのスタイル追加とCSS操作
- **スクリプト読み込み**: 外部スクリプトの動的読み込みとキャッシュ管理
- **CSS トランジション**: トランジションイベントの高度な監視機能
- **ウィンドウ操作**: Node所有者ドキュメント・ウィンドウの取得
- **画像読み込み**: Promise ベースの画像読み込み
- **SSR対応**: サーバーサイドレンダリング環境での安全な動作
- **TypeScript完全サポート**: 厳密な型定義による型安全性

## インストール

```bash
npm install @fastkit/dom
```

## フォーカス管理

### 基本的なフォーカス制御

```typescript
import { 
  isFocusable, 
  attemptFocus, 
  focusFirstDescendant, 
  blurActiveElement 
} from '@fastkit/dom'

// フォーカス可能性の判定
const button = document.querySelector('button')
if (isFocusable(button)) {
  console.log('この要素はフォーカス可能です')
}

// 安全なフォーカス設定
const success = attemptFocus(button)
if (success) {
  console.log('フォーカスが設定されました')
}

// 子要素の中で最初にフォーカス可能な要素にフォーカス
const container = document.querySelector('.form-container')
const focused = focusFirstDescendant(container)
if (focused) {
  console.log('子要素にフォーカスが設定されました')
}

// アクティブ要素のフォーカスを解除
const previousActive = blurActiveElement()
if (previousActive) {
  console.log('フォーカスが解除されました:', previousActive)
}
```

### モーダルダイアログでのフォーカス管理

```typescript
import { focusFirstDescendant, blurActiveElement } from '@fastkit/dom'

class ModalDialog {
  private previousActiveElement: HTMLElement | SVGElement | undefined
  private modalElement: HTMLElement
  
  constructor(modalElement: HTMLElement) {
    this.modalElement = modalElement
  }
  
  open() {
    // 現在のフォーカスを記憶してクリア
    this.previousActiveElement = blurActiveElement()
    
    // モーダルを表示
    this.modalElement.style.display = 'block'
    
    // モーダル内の最初のフォーカス可能要素にフォーカス
    setTimeout(() => {
      if (!focusFirstDescendant(this.modalElement)) {
        // フォーカス可能な子要素がない場合はモーダル自体にフォーカス
        this.modalElement.setAttribute('tabindex', '-1')
        this.modalElement.focus()
      }
    }, 100)
  }
  
  close() {
    // モーダルを非表示
    this.modalElement.style.display = 'none'
    
    // 前のフォーカスを復元
    if (this.previousActiveElement) {
      try {
        this.previousActiveElement.focus()
      } catch (e) {
        // 前の要素が削除されている場合は何もしない
      }
    }
  }
}

// 使用例
const modal = new ModalDialog(document.querySelector('#my-modal'))
modal.open()
```

### アクセシビリティ対応のフォーカストラップ

```typescript
import { isFocusable, attemptFocus } from '@fastkit/dom'

class FocusTrap {
  private container: HTMLElement
  private focusableElements: HTMLElement[] = []
  
  constructor(container: HTMLElement) {
    this.container = container
    this.updateFocusableElements()
    this.setupEventListeners()
  }
  
  private updateFocusableElements() {
    const all = this.container.querySelectorAll('*')
    this.focusableElements = Array.from(all).filter(el => 
      isFocusable(el as HTMLElement)
    ) as HTMLElement[]
  }
  
  private setupEventListeners() {
    this.container.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        this.handleTabKey(e)
      }
    })
  }
  
  private handleTabKey(e: KeyboardEvent) {
    if (this.focusableElements.length === 0) return
    
    const firstElement = this.focusableElements[0]
    const lastElement = this.focusableElements[this.focusableElements.length - 1]
    
    if (e.shiftKey) {
      // Shift + Tab (逆方向)
      if (document.activeElement === firstElement) {
        e.preventDefault()
        attemptFocus(lastElement)
      }
    } else {
      // Tab (順方向)
      if (document.activeElement === lastElement) {
        e.preventDefault()
        attemptFocus(firstElement)
      }
    }
  }
  
  focusFirst() {
    if (this.focusableElements.length > 0) {
      attemptFocus(this.focusableElements[0])
    }
  }
  
  destroy() {
    // イベントリスナーのクリーンアップ
  }
}
```

## 動的スタイル操作

### 実行時スタイル注入

```typescript
import { pushDynamicStyle } from '@fastkit/dom'

// CSS をヘッダーに動的に追加
pushDynamicStyle(`
  .dynamic-button {
    background: linear-gradient(45deg, #FF6B6B, #4ECDC4);
    border: none;
    border-radius: 8px;
    padding: 12px 24px;
    color: white;
    font-weight: bold;
    cursor: pointer;
    transition: transform 0.2s ease;
  }
  
  .dynamic-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
  }
`)

// 動的にボタンを作成
const button = document.createElement('button')
button.className = 'dynamic-button'
button.textContent = 'Dynamic Button'
document.body.appendChild(button)
```

### テーマ切り替えシステム

```typescript
import { pushDynamicStyle } from '@fastkit/dom'

class ThemeManager {
  private currentTheme = 'light'
  
  applyTheme(theme: 'light' | 'dark') {
    this.currentTheme = theme
    
    const styles = theme === 'dark' ? `
      :root {
        --bg-color: #1a1a1a;
        --text-color: #ffffff;
        --border-color: #333333;
        --accent-color: #4ECDC4;
      }
      
      body {
        background-color: var(--bg-color);
        color: var(--text-color);
        transition: background-color 0.3s ease, color 0.3s ease;
      }
      
      .card {
        background: #2d2d2d;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 16px;
      }
    ` : `
      :root {
        --bg-color: #ffffff;
        --text-color: #333333;
        --border-color: #e0e0e0;
        --accent-color: #2196F3;
      }
      
      body {
        background-color: var(--bg-color);
        color: var(--text-color);
        transition: background-color 0.3s ease, color 0.3s ease;
      }
      
      .card {
        background: #ffffff;
        border: 1px solid var(--border-color);
        border-radius: 8px;
        padding: 16px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
    `
    
    pushDynamicStyle(styles)
  }
  
  toggle() {
    this.applyTheme(this.currentTheme === 'light' ? 'dark' : 'light')
  }
}

const themeManager = new ThemeManager()
themeManager.applyTheme('dark')
```

## スクリプト読み込み

### 基本的なスクリプト読み込み

```typescript
import { loadScript, ensureScript } from '@fastkit/dom'

// 単発のスクリプト読み込み
try {
  const scriptElement = await loadScript('https://cdn.example.com/library.js', {
    crossorigin: 'anonymous',
    integrity: 'sha384-...',
    type: 'text/javascript'
  })
  console.log('スクリプトが読み込まれました:', scriptElement)
} catch (error) {
  console.error('スクリプトの読み込みに失敗:', error)
}

// キャッシュ機能付きスクリプト読み込み
// 同じURLのスクリプトは重複して読み込まれない
await ensureScript('https://cdn.example.com/analytics.js')
await ensureScript('https://cdn.example.com/analytics.js') // キャッシュから取得
```

### 動的ライブラリローダー

```typescript
import { ensureScript } from '@fastkit/dom'

class LibraryLoader {
  private static libraries = {
    charts: 'https://cdn.jsdelivr.net/npm/chart.js',
    maps: 'https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY',
    animations: 'https://cdn.jsdelivr.net/npm/gsap@3/dist/gsap.min.js'
  }
  
  static async loadCharts() {
    await ensureScript(this.libraries.charts)
    // @ts-ignore - Chart.js が読み込まれた後
    return window.Chart
  }
  
  static async loadMaps() {
    await ensureScript(this.libraries.maps)
    // @ts-ignore - Google Maps が読み込まれた後
    return window.google.maps
  }
  
  static async loadAnimations() {
    await ensureScript(this.libraries.animations)
    // @ts-ignore - GSAP が読み込まれた後
    return window.gsap
  }
}

// 使用例
async function createChart() {
  const Chart = await LibraryLoader.loadCharts()
  
  const ctx = document.querySelector('#myChart') as HTMLCanvasElement
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Red', 'Blue', 'Yellow'],
      datasets: [{
        label: 'My Dataset',
        data: [12, 19, 3],
        backgroundColor: ['red', 'blue', 'yellow']
      }]
    }
  })
}
```

### 複数スクリプトの並列読み込み

```typescript
import { ensureScript } from '@fastkit/dom'

class ScriptBundleLoader {
  static async loadBundle(scripts: string[]) {
    try {
      const results = await Promise.all(
        scripts.map(src => ensureScript(src))
      )
      console.log(`${results.length} scripts loaded successfully`)
      return results
    } catch (error) {
      console.error('Bundle loading failed:', error)
      throw error
    }
  }
  
  static async loadPolyfills() {
    const polyfills = [
      'https://polyfill.io/v3/polyfill.min.js?features=fetch',
      'https://polyfill.io/v3/polyfill.min.js?features=IntersectionObserver'
    ]
    
    return this.loadBundle(polyfills)
  }
  
  static async loadAnalytics() {
    const analytics = [
      'https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID',
      'https://cdn.example.com/custom-analytics.js'
    ]
    
    return this.loadBundle(analytics)
  }
}
```

## CSS トランジション監視

### 基本的なトランジション監視

```typescript
import { addTransitionEvent, addTransitionendEvent } from '@fastkit/dom'

const element = document.querySelector('.animated-element') as HTMLElement

// 特定のプロパティのトランジション終了を監視
const { clear } = addTransitionendEvent(
  element,
  (event) => {
    console.log(`${event.propertyName} のトランジションが完了しました`)
  },
  {
    properties: ['opacity', 'transform'], // 特定プロパティのみ監視
    once: true // 一度だけ実行
  }
)

// アニメーション開始
element.style.opacity = '0'
element.style.transform = 'translateX(100px)'

// 必要に応じて監視をクリア
// clear()
```

### 高度なトランジション制御

```typescript
import { addTransitionEvent } from '@fastkit/dom'

class AnimationController {
  private element: HTMLElement
  private transitionWatcher: any
  
  constructor(element: HTMLElement) {
    this.element = element
  }
  
  async slideIn() {
    return new Promise<void>((resolve) => {
      // すべてのトランジションイベントを監視
      this.transitionWatcher = addTransitionEvent(
        ['transitionstart', 'transitionend', 'transitioncancel'],
        this.element,
        (event) => {
          console.log(`${event.type}: ${event.propertyName}`)
          
          if (event.type === 'transitionend' && event.propertyName === 'transform') {
            resolve()
          }
          
          if (event.type === 'transitioncancel') {
            console.warn('アニメーションがキャンセルされました')
            resolve()
          }
        },
        {
          properties: (propertyName) => {
            // カスタムフィルター関数
            return ['transform', 'opacity'].includes(propertyName)
          }
        }
      )
      
      // アニメーション開始
      this.element.style.transition = 'transform 0.5s ease, opacity 0.3s ease'
      this.element.style.transform = 'translateX(0)'
      this.element.style.opacity = '1'
    })
  }
  
  destroy() {
    if (this.transitionWatcher) {
      this.transitionWatcher.clear()
    }
  }
}

// 使用例
const animator = new AnimationController(document.querySelector('.slide-element'))
await animator.slideIn()
console.log('アニメーション完了')
```

### 複数要素の同期アニメーション

```typescript
import { addTransitionendEvent } from '@fastkit/dom'

class SynchronizedAnimation {
  private elements: HTMLElement[]
  private completedCount = 0
  
  constructor(elements: HTMLElement[]) {
    this.elements = elements
  }
  
  async fadeInAll() {
    return new Promise<void>((resolve) => {
      this.completedCount = 0
      
      this.elements.forEach((element, index) => {
        addTransitionendEvent(
          element,
          () => {
            this.completedCount++
            if (this.completedCount === this.elements.length) {
              resolve()
            }
          },
          {
            properties: 'opacity',
            once: true
          }
        )
        
        // 段階的に開始（カスケード効果）
        setTimeout(() => {
          element.style.transition = 'opacity 0.5s ease'
          element.style.opacity = '1'
        }, index * 100)
      })
    })
  }
}

// 使用例
const elements = Array.from(document.querySelectorAll('.fade-item')) as HTMLElement[]
const animation = new SynchronizedAnimation(elements)
await animation.fadeInAll()
console.log('すべての要素のフェードインが完了')
```

## ウィンドウ・ドキュメント操作

### 所有者ドキュメント・ウィンドウの取得

```typescript
import { ownerDocument, ownerWindow } from '@fastkit/dom'

// iframe内の要素でも正しいドキュメント・ウィンドウを取得
function setupElementInFrame(element: HTMLElement) {
  const doc = ownerDocument(element)
  const win = ownerWindow(element)
  
  // そのドキュメントのスタイル要素を作成
  const style = doc.createElement('style')
  style.textContent = `
    .highlight { background: yellow; }
  `
  doc.head.appendChild(style)
  
  // そのウィンドウのイベントを監視
  win.addEventListener('resize', () => {
    console.log('ウィンドウがリサイズされました')
  })
}

// iframe 対応のユーティリティ
class CrossFrameHelper {
  static getScrollPosition(element?: HTMLElement) {
    const win = ownerWindow(element)
    return {
      x: win.pageXOffset || win.scrollX,
      y: win.pageYOffset || win.scrollY
    }
  }
  
  static getViewportSize(element?: HTMLElement) {
    const win = ownerWindow(element)
    return {
      width: win.innerWidth,
      height: win.innerHeight
    }
  }
  
  static scrollTo(x: number, y: number, element?: HTMLElement) {
    const win = ownerWindow(element)
    win.scrollTo(x, y)
  }
}
```

## 画像読み込み

### Promise ベースの画像読み込み

```typescript
import { loadImage } from '@fastkit/dom'

// 単一画像の読み込み
try {
  const image = await loadImage('https://example.com/image.jpg')
  console.log('画像が読み込まれました:', image.width, 'x', image.height)
  
  // DOM に追加
  document.body.appendChild(image)
} catch (error) {
  console.error('画像の読み込みに失敗:', error)
}
```

### 画像ギャラリーローダー

```typescript
import { loadImage } from '@fastkit/dom'

class ImageGallery {
  private container: HTMLElement
  private imageUrls: string[]
  
  constructor(container: HTMLElement, imageUrls: string[]) {
    this.container = container
    this.imageUrls = imageUrls
  }
  
  async loadAll() {
    const loadingElement = document.createElement('div')
    loadingElement.textContent = '画像を読み込み中...'
    this.container.appendChild(loadingElement)
    
    try {
      const images = await Promise.all(
        this.imageUrls.map(url => loadImage(url))
      )
      
      // ローディング表示を削除
      this.container.removeChild(loadingElement)
      
      // 画像を表示
      images.forEach((image, index) => {
        image.style.cssText = `
          max-width: 300px;
          margin: 8px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        `
        image.alt = `Image ${index + 1}`
        this.container.appendChild(image)
      })
      
      console.log(`${images.length} 枚の画像を読み込みました`)
    } catch (error) {
      loadingElement.textContent = '画像の読み込みに失敗しました'
      console.error('Gallery loading failed:', error)
    }
  }
  
  async loadWithProgress() {
    const progressBar = this.createProgressBar()
    let loaded = 0
    
    const promises = this.imageUrls.map(async (url) => {
      try {
        const image = await loadImage(url)
        loaded++
        this.updateProgress(progressBar, loaded / this.imageUrls.length)
        return image
      } catch (error) {
        console.error(`Failed to load image: ${url}`)
        throw error
      }
    })
    
    try {
      const images = await Promise.all(promises)
      this.container.removeChild(progressBar)
      
      images.forEach(image => {
        image.style.cssText = 'max-width: 300px; margin: 8px;'
        this.container.appendChild(image)
      })
    } catch (error) {
      console.error('Some images failed to load:', error)
    }
  }
  
  private createProgressBar() {
    const progress = document.createElement('div')
    progress.style.cssText = `
      width: 100%;
      height: 20px;
      background: #f0f0f0;
      border-radius: 10px;
      overflow: hidden;
      margin: 20px 0;
    `
    
    const bar = document.createElement('div')
    bar.style.cssText = `
      width: 0%;
      height: 100%;
      background: #4ECDC4;
      transition: width 0.3s ease;
    `
    
    progress.appendChild(bar)
    this.container.appendChild(progress)
    return progress
  }
  
  private updateProgress(progressBar: HTMLElement, ratio: number) {
    const bar = progressBar.firstElementChild as HTMLElement
    bar.style.width = `${ratio * 100}%`
  }
}

// 使用例
const gallery = new ImageGallery(
  document.querySelector('#gallery'),
  [
    'https://picsum.photos/300/200?random=1',
    'https://picsum.photos/300/200?random=2',
    'https://picsum.photos/300/200?random=3'
  ]
)

gallery.loadWithProgress()
```

### 遅延読み込み画像システム

```typescript
import { loadImage } from '@fastkit/dom'

class LazyImageLoader {
  private observer: IntersectionObserver
  
  constructor() {
    this.observer = new IntersectionObserver(
      this.handleIntersection.bind(this),
      {
        rootMargin: '50px',
        threshold: 0.1
      }
    )
  }
  
  private async handleIntersection(entries: IntersectionObserverEntry[]) {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement
        const src = img.dataset.src
        
        if (src) {
          try {
            // プレースホルダーを表示
            img.style.filter = 'blur(5px)'
            
            // 実際の画像を読み込み
            const loadedImage = await loadImage(src)
            
            // 読み込み完了後に差し替え
            img.src = loadedImage.src
            img.style.filter = 'none'
            img.style.transition = 'filter 0.3s ease'
            
            // 監視を停止
            this.observer.unobserve(img)
          } catch (error) {
            console.error('Lazy load failed:', error)
            img.alt = '画像の読み込みに失敗しました'
          }
        }
      }
    }
  }
  
  observe(img: HTMLImageElement) {
    this.observer.observe(img)
  }
  
  disconnect() {
    this.observer.disconnect()
  }
}

// 使用例
const lazyLoader = new LazyImageLoader()

// 遅延読み込み画像を設定
document.querySelectorAll('img[data-src]').forEach(img => {
  lazyLoader.observe(img as HTMLImageElement)
})
```

## 統合例: モーダルダイアログシステム

```typescript
import { 
  focusFirstDescendant, 
  blurActiveElement, 
  addTransitionendEvent,
  pushDynamicStyle 
} from '@fastkit/dom'

class Modal {
  private element: HTMLElement
  private overlay: HTMLElement
  private previousActiveElement?: HTMLElement | SVGElement
  private transitionWatcher?: any
  
  constructor(element: HTMLElement) {
    this.element = element
    this.setupStyles()
    this.setupOverlay()
    this.setupEventListeners()
  }
  
  private setupStyles() {
    pushDynamicStyle(`
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        visibility: hidden;
        transition: opacity 0.3s ease, visibility 0.3s ease;
        z-index: 1000;
      }
      
      .modal-overlay.visible {
        opacity: 1;
        visibility: visible;
      }
      
      .modal {
        background: white;
        border-radius: 8px;
        padding: 24px;
        max-width: 600px;
        max-height: 80vh;
        overflow-y: auto;
        transform: scale(0.9);
        transition: transform 0.3s ease;
      }
      
      .modal-overlay.visible .modal {
        transform: scale(1);
      }
    `)
  }
  
  private setupOverlay() {
    this.overlay = document.createElement('div')
    this.overlay.className = 'modal-overlay'
    this.element.className = 'modal'
    this.overlay.appendChild(this.element)
    document.body.appendChild(this.overlay)
  }
  
  private setupEventListeners() {
    this.overlay.addEventListener('click', (e) => {
      if (e.target === this.overlay) {
        this.close()
      }
    })
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen()) {
        this.close()
      }
    })
  }
  
  async open() {
    return new Promise<void>((resolve) => {
      this.previousActiveElement = blurActiveElement()
      
      this.transitionWatcher = addTransitionendEvent(
        this.overlay,
        () => {
          focusFirstDescendant(this.element)
          resolve()
        },
        { once: true, properties: 'opacity' }
      )
      
      this.overlay.classList.add('visible')
    })
  }
  
  async close() {
    return new Promise<void>((resolve) => {
      this.transitionWatcher = addTransitionendEvent(
        this.overlay,
        () => {
          if (this.previousActiveElement) {
            try {
              this.previousActiveElement.focus()
            } catch (e) {
              // 前の要素が削除されている場合は無視
            }
          }
          resolve()
        },
        { once: true, properties: 'opacity' }
      )
      
      this.overlay.classList.remove('visible')
    })
  }
  
  isOpen() {
    return this.overlay.classList.contains('visible')
  }
  
  destroy() {
    if (this.transitionWatcher) {
      this.transitionWatcher.clear()
    }
    if (this.overlay.parentNode) {
      this.overlay.parentNode.removeChild(this.overlay)
    }
  }
}

// 使用例
const modalContent = document.createElement('div')
modalContent.innerHTML = `
  <h2>モーダルタイトル</h2>
  <p>モーダルの内容です。</p>
  <button type="button">OK</button>
  <button type="button">キャンセル</button>
`

const modal = new Modal(modalContent)
await modal.open()
```

## API リファレンス

### フォーカス管理

```typescript
// フォーカス可能性の判定
function isFocusableElement(element: Element | null | undefined): element is SVGElement | HTMLElement
function isFocusable(element: HTMLElement): boolean

// フォーカス制御
function attemptFocus(element: HTMLElement): boolean
function focusFirstDescendant(element: HTMLElement): boolean
function blurActiveElement(): SVGElement | HTMLElement | undefined
```

### スタイル操作

```typescript
// 動的スタイル追加
function pushDynamicStyle(styleContent: string): void
```

### スクリプト読み込み

```typescript
interface LoadScriptAttrs {
  crossorigin?: 'anonymous' | 'use-credentials' | ''
  integrity?: string
  nomodule?: boolean
  nonce?: string
  type?: string
}

function loadScript(
  src: string,
  attrs?: LoadScriptAttrs | null,
  parentNode?: Node
): Promise<HTMLScriptElement>

function ensureScript(src: string): Promise<HTMLScriptElement>
```

### CSS トランジション

```typescript
type TransitionEventType = 'transitioncancel' | 'transitionend' | 'transitionrun' | 'transitionstart'

interface AddTransitionEventOptions extends AddEventListenerOptions {
  properties?: string | string[] | ((propertyName: string) => boolean)
}

interface AddTransitionendEventOptions extends AddTransitionEventOptions {
  includeCancel?: boolean
}

type AddTransitionEventResult = {
  start(): void
  clear(): void
}

function addTransitionEvent(
  type: TransitionEventType | TransitionEventType[],
  el: HTMLElement,
  handler: (this: HTMLElement, ev: TransitionEvent) => any,
  opts?: boolean | AddTransitionEventOptions
): AddTransitionEventResult

function addTransitionendEvent(
  el: HTMLElement,
  handler: (this: HTMLElement, ev: TransitionEvent) => any,
  opts?: boolean | AddTransitionendEventOptions
): AddTransitionEventResult
```

### ウィンドウ・ドキュメント

```typescript
function ownerDocument(node: Node | null | undefined): Document
function ownerWindow(node: Node | undefined): Window
```

### 画像読み込み

```typescript
function loadImage(url: string): Promise<HTMLImageElement>
```

## 関連パッケージ

- `@fastkit/helpers` - 汎用ヘルパー関数（`IN_DOCUMENT`定数など）

## ライセンス

MIT