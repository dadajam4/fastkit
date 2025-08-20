
# @fastkit/dom

🌐 English | [日本語](https://github.com/dadajam4/fastkit/blob/main/packages/dom/README-ja.md)

A utility library for safe and efficient DOM manipulation in browser environments. Provides functionality including focus management, style manipulation, script loading, CSS transition monitoring, window operations, and image loading.

## Features

- **Focus Management**: Element focusability detection and focus control
- **Dynamic Styling**: Runtime style addition and CSS manipulation
- **Script Loading**: Dynamic loading of external scripts with cache management
- **CSS Transitions**: Advanced monitoring of transition events
- **Window Operations**: Retrieving owner document and window of nodes
- **Image Loading**: Promise-based image loading
- **SSR Support**: Safe operation in server-side rendering environments
- **Complete TypeScript Support**: Type safety through strict type definitions

## Installation

```bash
npm install @fastkit/dom
```

## Focus Management

### Basic Focus Control

```typescript
import {
  isFocusable,
  attemptFocus,
  focusFirstDescendant,
  blurActiveElement
} from '@fastkit/dom'

// Check focusability
const button = document.querySelector('button')
if (isFocusable(button)) {
  console.log('This element is focusable')
}

// Safe focus setting
const success = attemptFocus(button)
if (success) {
  console.log('Focus has been set')
}

// Focus on first focusable element among child elements
const container = document.querySelector('.form-container')
const focused = focusFirstDescendant(container)
if (focused) {
  console.log('Focus has been set on child element')
}

// Remove focus from active element
const previousActive = blurActiveElement()
if (previousActive) {
  console.log('Focus has been removed:', previousActive)
}
```

### Focus Management in Modal Dialogs

```typescript
import { focusFirstDescendant, blurActiveElement } from '@fastkit/dom'

class ModalDialog {
  private previousActiveElement: HTMLElement | SVGElement | undefined
  private modalElement: HTMLElement

  constructor(modalElement: HTMLElement) {
    this.modalElement = modalElement
  }

  open() {
    // Remember and clear current focus
    this.previousActiveElement = blurActiveElement()

    // Show modal
    this.modalElement.style.display = 'block'

    // Focus on first focusable element in modal
    setTimeout(() => {
      if (!focusFirstDescendant(this.modalElement)) {
        // If no focusable child element, focus on modal itself
        this.modalElement.setAttribute('tabindex', '-1')
        this.modalElement.focus()
      }
    }, 100)
  }

  close() {
    // Hide modal
    this.modalElement.style.display = 'none'

    // Restore previous focus
    if (this.previousActiveElement) {
      try {
        this.previousActiveElement.focus()
      } catch (e) {
        // Do nothing if previous element was removed
      }
    }
  }
}

// Usage example
const modal = new ModalDialog(document.querySelector('#my-modal'))
modal.open()
```

### Accessibility-Compatible Focus Trap

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
      // Shift + Tab (reverse direction)
      if (document.activeElement === firstElement) {
        e.preventDefault()
        attemptFocus(lastElement)
      }
    } else {
      // Tab (forward direction)
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
    // Event listener cleanup
  }
}
```

## Dynamic Style Manipulation

### Runtime Style Injection

```typescript
import { pushDynamicStyle } from '@fastkit/dom'

// Dynamically add CSS to header
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

// Dynamically create button
const button = document.createElement('button')
button.className = 'dynamic-button'
button.textContent = 'Dynamic Button'
document.body.appendChild(button)
```

### Theme Switching System

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

## Script Loading

### Basic Script Loading

```typescript
import { loadScript, ensureScript } from '@fastkit/dom'

// One-time script loading
try {
  const scriptElement = await loadScript('https://cdn.example.com/library.js', {
    crossorigin: 'anonymous',
    integrity: 'sha384-...',
    type: 'text/javascript'
  })
  console.log('Script loaded:', scriptElement)
} catch (error) {
  console.error('Script loading failed:', error)
}

// Script loading with cache functionality
// Scripts with the same URL won't be loaded twice
await ensureScript('https://cdn.example.com/analytics.js')
await ensureScript('https://cdn.example.com/analytics.js') // Retrieved from cache
```

### Dynamic Library Loader

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
    // @ts-ignore - After Chart.js is loaded
    return window.Chart
  }

  static async loadMaps() {
    await ensureScript(this.libraries.maps)
    // @ts-ignore - After Google Maps is loaded
    return window.google.maps
  }

  static async loadAnimations() {
    await ensureScript(this.libraries.animations)
    // @ts-ignore - After GSAP is loaded
    return window.gsap
  }
}

// Usage example
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

### Parallel Loading of Multiple Scripts

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

## CSS Transition Monitoring

### Basic Transition Monitoring

```typescript
import { addTransitionEvent, addTransitionendEvent } from '@fastkit/dom'

const element = document.querySelector('.animated-element') as HTMLElement

// Monitor transition end for specific properties
const { clear } = addTransitionendEvent(
  element,
  (event) => {
    console.log(`Transition for ${event.propertyName} completed`)
  },
  {
    properties: ['opacity', 'transform'], // Monitor only specific properties
    once: true // Execute only once
  }
)

// Start animation
element.style.opacity = '0'
element.style.transform = 'translateX(100px)'

// Clear monitoring when necessary
// clear()
```

### Advanced Transition Control

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
      // Monitor all transition events
      this.transitionWatcher = addTransitionEvent(
        ['transitionstart', 'transitionend', 'transitioncancel'],
        this.element,
        (event) => {
          console.log(`${event.type}: ${event.propertyName}`)

          if (event.type === 'transitionend' && event.propertyName === 'transform') {
            resolve()
          }

          if (event.type === 'transitioncancel') {
            console.warn('Animation was cancelled')
            resolve()
          }
        },
        {
          properties: (propertyName) => {
            // Custom filter function
            return ['transform', 'opacity'].includes(propertyName)
          }
        }
      )

      // Start animation
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

// Usage example
const animator = new AnimationController(document.querySelector('.slide-element'))
await animator.slideIn()
console.log('Animation completed')
```

### Synchronized Animation of Multiple Elements

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

        // Start gradually (cascade effect)
        setTimeout(() => {
          element.style.transition = 'opacity 0.5s ease'
          element.style.opacity = '1'
        }, index * 100)
      })
    })
  }
}

// Usage example
const elements = Array.from(document.querySelectorAll('.fade-item')) as HTMLElement[]
const animation = new SynchronizedAnimation(elements)
await animation.fadeInAll()
console.log('Fade-in completed for all elements')
```

## Window and Document Operations

### Getting Owner Document and Window

```typescript
import { ownerDocument, ownerWindow } from '@fastkit/dom'

// Get correct document and window even for elements inside iframe
function setupElementInFrame(element: HTMLElement) {
  const doc = ownerDocument(element)
  const win = ownerWindow(element)

  // Create style element for that document
  const style = doc.createElement('style')
  style.textContent = `
    .highlight { background: yellow; }
  `
  doc.head.appendChild(style)

  // Monitor events for that window
  win.addEventListener('resize', () => {
    console.log('Window was resized')
  })
}

// iframe-compatible utilities
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

## Image Loading

### Promise-based Image Loading

```typescript
import { loadImage } from '@fastkit/dom'

// Single image loading
try {
  const image = await loadImage('https://example.com/image.jpg')
  console.log('Image loaded:', image.width, 'x', image.height)

  // Add to DOM
  document.body.appendChild(image)
} catch (error) {
  console.error('Image loading failed:', error)
}
```

### Image Gallery Loader

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
    loadingElement.textContent = 'Loading images...'
    this.container.appendChild(loadingElement)

    try {
      const images = await Promise.all(
        this.imageUrls.map(url => loadImage(url))
      )

      // Remove loading display
      this.container.removeChild(loadingElement)

      // Display images
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

      console.log(`Loaded ${images.length} images`)
    } catch (error) {
      loadingElement.textContent = 'Failed to load images'
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

// Usage example
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

### Lazy Loading Image System

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
            // Show placeholder
            img.style.filter = 'blur(5px)'

            // Load actual image
            const loadedImage = await loadImage(src)

            // Replace after loading completion
            img.src = loadedImage.src
            img.style.filter = 'none'
            img.style.transition = 'filter 0.3s ease'

            // Stop monitoring
            this.observer.unobserve(img)
          } catch (error) {
            console.error('Lazy load failed:', error)
            img.alt = 'Failed to load image'
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

// Usage example
const lazyLoader = new LazyImageLoader()

// Set up lazy loading images
document.querySelectorAll('img[data-src]').forEach(img => {
  lazyLoader.observe(img as HTMLImageElement)
})
```

## Integration Example: Modal Dialog System

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
              // Ignore if previous element was removed
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

// Usage example
const modalContent = document.createElement('div')
modalContent.innerHTML = `
  <h2>Modal Title</h2>
  <p>This is the modal content.</p>
  <button type="button">OK</button>
  <button type="button">Cancel</button>
`

const modal = new Modal(modalContent)
await modal.open()
```

## API Reference

### Focus Management

```typescript
// Check focusability
function isFocusableElement(element: Element | null | undefined): element is SVGElement | HTMLElement
function isFocusable(element: HTMLElement): boolean

// Focus control
function attemptFocus(element: HTMLElement): boolean
function focusFirstDescendant(element: HTMLElement): boolean
function blurActiveElement(): SVGElement | HTMLElement | undefined
```

### Style Operations

```typescript
// Add dynamic styles
function pushDynamicStyle(styleContent: string): void
```

### Script Loading

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

### CSS Transitions

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

### Window and Document

```typescript
function ownerDocument(node: Node | null | undefined): Document
function ownerWindow(node: Node | undefined): Window
```

### Image Loading

```typescript
function loadImage(url: string): Promise<HTMLImageElement>
```

## Related Packages

- `@fastkit/helpers` - General helper functions (like `IN_DOCUMENT` constant)

## License

MIT
