
# @fastkit/debounce

🌐 English | [日本語](https://github.com/dadajam4/fastkit/blob/main/packages/debounce/README-ja.md)

A lightweight and high-performance debounce (delayed execution) library. Efficiently controls the execution of frequently called functions to improve performance and save resources. Written in TypeScript and provides strict type safety.

## Features

- **High-Performance Debouncing**: Optimized debounce processing through efficient timer management
- **Immediate Execution Option**: Immediate mode that executes the first call instantly
- **Dynamic Delay Configuration**: Ability to dynamically change delay time at runtime
- **Manual Control**: Fine-grained control through clear (cancel) and flush (force execution)
- **Complete TypeScript Support**: Type safety through strict type definitions
- **Zero Dependencies**: Lightweight implementation without external dependencies
- **Browser & Node.js Support**: Works in all environments
- **Flexible API**: User-friendly interface with multiple overloads

## Installation

```bash
npm install @fastkit/debounce
```

## Basic Usage

### Simple Debouncing

```typescript
import { debounce } from '@fastkit/debounce'

// Basic debounce (default 166ms)
const debouncedFunction = debounce(() => {
  console.log('Executed!')
})

// 500ms debounce
const debouncedWithDelay = debounce(() => {
  console.log('Executed after 500ms!')
}, 500)

// Only the last call is executed even with multiple calls
debouncedFunction()
debouncedFunction()
debouncedFunction() // Only this call is executed
```

### Debouncing Functions with Arguments

```typescript
import { debounce } from '@fastkit/debounce'

// Function with arguments
const searchFunction = (query: string, filters: string[]) => {
  console.log(`Search: ${query}, Filters:`, filters)
  // API call processing, etc.
}

// Debounced search function
const debouncedSearch = debounce(searchFunction, 300)

// Usage example
debouncedSearch('JavaScript', ['tech', 'programming'])
debouncedSearch('TypeScript', ['tech', 'programming']) // Only this one is executed
```

### Immediate Execution Mode

```typescript
import { debounce } from '@fastkit/debounce'

// Execute the first call immediately, then debounce subsequent calls
const immediateDebounced = debounce(() => {
  console.log('Execute immediately, then debounce')
}, 1000, true) // Set true as third argument

// Or specify with options object
const immediateDebounced2 = debounce(() => {
  console.log('Execute immediately, then debounce')
}, {
  delay: 1000,
  immediate: true
})

immediateDebounced() // Executed immediately
immediateDebounced() // Debounced
immediateDebounced() // Debounced
```

## Advanced Usage Examples

### Real-time Search Feature

```typescript
import { debounce } from '@fastkit/debounce'

interface SearchResult {
  id: string
  title: string
  description: string
}

class SearchComponent {
  private searchInput: HTMLInputElement
  private resultsContainer: HTMLElement
  private debouncedSearch: ReturnType<typeof debounce>

  constructor(inputSelector: string, resultsSelector: string) {
    this.searchInput = document.querySelector(inputSelector)!
    this.resultsContainer = document.querySelector(resultsSelector)!

    // Control API calls with 300ms debounce
    this.debouncedSearch = debounce(this.performSearch.bind(this), 300)

    this.setupEventListeners()
  }

  private setupEventListeners() {
    this.searchInput.addEventListener('input', (event) => {
      const query = (event.target as HTMLInputElement).value.trim()

      if (query.length < 2) {
        this.clearResults()
        this.debouncedSearch.clear() // Cancel search
        return
      }

      this.debouncedSearch(query)
    })

    // Execute immediately on Enter key
    this.searchInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        this.debouncedSearch.flush() // Execute pending process immediately
      }
    })
  }

  private async performSearch(query: string) {
    try {
      this.showLoading()

      const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
      const results: SearchResult[] = await response.json()

      this.displayResults(results)
    } catch (error) {
      console.error('Search error:', error)
      this.showError('An error occurred during search')
    }
  }

  private showLoading() {
    this.resultsContainer.innerHTML = '<div class="loading">Searching...</div>'
  }

  private displayResults(results: SearchResult[]) {
    if (results.length === 0) {
      this.resultsContainer.innerHTML = '<div class="no-results">No results found</div>'
      return
    }

    const html = results.map(result => `
      <div class="search-result">
        <h3>${this.escapeHtml(result.title)}</h3>
        <p>${this.escapeHtml(result.description)}</p>
      </div>
    `).join('')

    this.resultsContainer.innerHTML = html
  }

  private clearResults() {
    this.resultsContainer.innerHTML = ''
  }

  private showError(message: string) {
    this.resultsContainer.innerHTML = `<div class="error">${this.escapeHtml(message)}</div>`
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div')
    div.textContent = text
    return div.innerHTML
  }
}

// Usage example
const searchComponent = new SearchComponent('#search-input', '#search-results')
```

### Window Resize Optimization

```typescript
import { debounce } from '@fastkit/debounce'

class ResponsiveLayout {
  private debouncedResize: ReturnType<typeof debounce>
  private debouncedScroll: ReturnType<typeof debounce>

  constructor() {
    // Debounce resize events (250ms)
    this.debouncedResize = debounce(this.handleResize.bind(this), 250)

    // Debounce scroll events (immediate execution + 100ms)
    this.debouncedScroll = debounce(this.handleScroll.bind(this), {
      delay: 100,
      immediate: true
    })

    this.setupEventListeners()
    this.handleResize() // Initialize
  }

  private setupEventListeners() {
    window.addEventListener('resize', this.debouncedResize)
    window.addEventListener('scroll', this.debouncedScroll)
  }

  private handleResize() {
    const width = window.innerWidth
    const height = window.innerHeight

    console.log(`Window size changed: ${width}x${height}`)

    // Handle responsive breakpoints
    this.updateLayout(width)

    // Recalculate grid layout
    this.recalculateGrid()
  }

  private handleScroll() {
    const scrollY = window.scrollY
    const documentHeight = document.documentElement.scrollHeight
    const windowHeight = window.innerHeight

    // Handle based on scroll position
    this.updateScrollIndicator(scrollY, documentHeight, windowHeight)

    // Determine infinite scroll
    if (scrollY + windowHeight >= documentHeight - 200) {
      this.loadMoreContent()
    }
  }

  private updateLayout(width: number) {
    const body = document.body

    // Set classes based on breakpoints
    body.classList.remove('mobile', 'tablet', 'desktop')

    if (width < 768) {
      body.classList.add('mobile')
    } else if (width < 1024) {
      body.classList.add('tablet')
    } else {
      body.classList.add('desktop')
    }
  }

  private recalculateGrid() {
    const grid = document.querySelector('.grid') as HTMLElement
    if (!grid) return

    // Dynamic sizing of grid items
    const containerWidth = grid.offsetWidth
    const itemWidth = 250 // Base item width
    const gap = 16 // Gap between items

    const columns = Math.floor((containerWidth + gap) / (itemWidth + gap))
    grid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`
  }

  private updateScrollIndicator(scrollY: number, documentHeight: number, windowHeight: number) {
    const progress = (scrollY / (documentHeight - windowHeight)) * 100
    const indicator = document.querySelector('.scroll-indicator') as HTMLElement

    if (indicator) {
      indicator.style.width = `${Math.min(progress, 100)}%`
    }
  }

  private async loadMoreContent() {
    // Load content for infinite scroll
    try {
      const response = await fetch('/api/more-content')
      const content = await response.text()

      const container = document.querySelector('.content-container')
      if (container) {
        container.insertAdjacentHTML('beforeend', content)
      }
    } catch (error) {
      console.error('Content loading error:', error)
    }
  }

  destroy() {
    // Remove event listeners
    window.removeEventListener('resize', this.debouncedResize)
    window.removeEventListener('scroll', this.debouncedScroll)

    // Clear debounce processes
    this.debouncedResize.clear()
    this.debouncedScroll.clear()
  }
}

// Usage example
const responsiveLayout = new ResponsiveLayout()

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  responsiveLayout.destroy()
})
```

### Form Auto-Save Feature

```typescript
import { debounce } from '@fastkit/debounce'

interface FormData {
  [key: string]: string | number | boolean
}

class AutoSaveForm {
  private form: HTMLFormElement
  private debouncedSave: ReturnType<typeof debounce>
  private lastSavedData: FormData = {}
  private saveStatus: HTMLElement

  constructor(formSelector: string) {
    this.form = document.querySelector(formSelector)!
    this.saveStatus = document.querySelector('.save-status')!

    // Auto-save with 2 second debounce
    this.debouncedSave = debounce(this.saveForm.bind(this), 2000)

    this.setupEventListeners()
    this.loadSavedData()
  }

  private setupEventListeners() {
    // Monitor form element changes
    this.form.addEventListener('input', () => {
      this.handleFormChange()
    })

    this.form.addEventListener('change', () => {
      this.handleFormChange()
    })

    // Save immediately with Ctrl+S
    document.addEventListener('keydown', (event) => {
      if (event.ctrlKey && event.key === 's') {
        event.preventDefault()
        this.debouncedSave.flush()
      }
    })

    // Save on page exit
    window.addEventListener('beforeunload', () => {
      this.debouncedSave.flush()
    })
  }

  private handleFormChange() {
    const currentData = this.getFormData()

    // Trigger save process only when data has changed
    if (!this.isDataEqual(currentData, this.lastSavedData)) {
      this.showSaveStatus('Saving changes...')
      this.debouncedSave()
    }
  }

  private getFormData(): FormData {
    const formData = new FormData(this.form)
    const data: FormData = {}

    for (const [key, value] of formData.entries()) {
      if (typeof value === 'string') {
        data[key] = value
      }
    }

    // Handle checkboxes
    const checkboxes = this.form.querySelectorAll('input[type="checkbox"]') as NodeListOf<HTMLInputElement>
    checkboxes.forEach(checkbox => {
      data[checkbox.name] = checkbox.checked
    })

    return data
  }

  private async saveForm() {
    const formData = this.getFormData()

    try {
      this.showSaveStatus('Saving...')

      const response = await fetch('/api/save-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        this.lastSavedData = { ...formData }
        this.showSaveStatus('Save complete', 'success')

        // Hide status after 3 seconds
        setTimeout(() => {
          this.hideSaveStatus()
        }, 3000)
      } else {
        throw new Error('Save failed')
      }
    } catch (error) {
      console.error('Save error:', error)
      this.showSaveStatus('Save error', 'error')

      // Retry after 5 seconds
      setTimeout(() => {
        this.debouncedSave()
      }, 5000)
    }
  }

  private async loadSavedData() {
    try {
      const response = await fetch('/api/load-form')
      if (response.ok) {
        const data: FormData = await response.json()
        this.populateForm(data)
        this.lastSavedData = { ...data }
      }
    } catch (error) {
      console.error('Data loading error:', error)
    }
  }

  private populateForm(data: FormData) {
    Object.entries(data).forEach(([key, value]) => {
      const element = this.form.querySelector(`[name="${key}"]`) as HTMLInputElement
      if (element) {
        if (element.type === 'checkbox') {
          element.checked = Boolean(value)
        } else {
          element.value = String(value)
        }
      }
    })
  }

  private isDataEqual(data1: FormData, data2: FormData): boolean {
    const keys1 = Object.keys(data1)
    const keys2 = Object.keys(data2)

    if (keys1.length !== keys2.length) return false

    return keys1.every(key => data1[key] === data2[key])
  }

  private showSaveStatus(message: string, type: 'info' | 'success' | 'error' = 'info') {
    this.saveStatus.textContent = message
    this.saveStatus.className = `save-status ${type}`
    this.saveStatus.style.display = 'block'
  }

  private hideSaveStatus() {
    this.saveStatus.style.display = 'none'
  }

  // Manual save method
  forceSave() {
    this.debouncedSave.flush()
  }

  // Cancel save method
  cancelSave() {
    this.debouncedSave.clear()
    this.showSaveStatus('Save cancelled')
  }
}

// Usage example
const autoSaveForm = new AutoSaveForm('#user-profile-form')
```

### Dynamic Delay Configuration

```typescript
import { debounce } from '@fastkit/debounce'

class AdaptiveDebouncer {
  private debouncedFunction: ReturnType<typeof debounce>
  private callCount = 0
  private startTime = Date.now()

  constructor() {
    this.debouncedFunction = debounce(this.execute.bind(this), 500)
  }

  call() {
    this.callCount++

    // Adjust delay time based on call frequency
    const elapsed = Date.now() - this.startTime
    const callsPerSecond = this.callCount / (elapsed / 1000)

    let newDelay: number
    if (callsPerSecond > 10) {
      newDelay = 1000 // Longer delay for high frequency
    } else if (callsPerSecond > 5) {
      newDelay = 500  // Medium delay for medium frequency
    } else {
      newDelay = 200  // Shorter delay for low frequency
    }

    this.debouncedFunction.setDelay(newDelay)
    this.debouncedFunction()
  }

  private execute() {
    console.log(`Execute: call count=${this.callCount}, delay=${this.debouncedFunction}`)

    // Implement actual processing here
    this.performTask()

    // Reset statistics
    this.callCount = 0
    this.startTime = Date.now()
  }

  private performTask() {
    // Implementation of heavy processing
    console.log('Executing heavy processing...')
  }
}

// Usage example
const adaptiveDebouncer = new AdaptiveDebouncer()

// Frequent calls
for (let i = 0; i < 20; i++) {
  setTimeout(() => adaptiveDebouncer.call(), i * 50)
}
```

## API Specification

### `debounce` Function

```typescript
// Basic call
function debounce<FN extends AnyFunction>(
  handler: FN,
  delay?: number,
  immediate?: boolean
): Debounced<FN>

// Call with options object
function debounce<FN extends AnyFunction>(
  handler: FN,
  options: DebounceOptions
): Debounced<FN>

// Call with settings object
function debounce<FN extends AnyFunction>(
  settings: DebounceSettings<FN>
): Debounced<FN>
```

### `Debounced` Interface

```typescript
interface Debounced<FN extends AnyFunction> {
  // Handler function with debounce processing injected
  (...args: Parameters<FN>): void

  // Clear timer and cancel pending handler execution
  clear(): void

  // Execute if there's a pending delayed handler
  flush(): void

  // Update the configured delay time
  setDelay(delay: number): void
}
```

### Option Types

```typescript
interface DebounceOptions {
  // Delay time (milliseconds)
  delay?: number      // Default: 166ms

  // Immediate execution flag
  immediate?: boolean // Default: false
}

interface DebounceSettings<FN extends AnyFunction> extends DebounceOptions {
  handler: FN  // Handler function
}
```

### Constants

```typescript
// Default delay time (approximately 60FPS)
const DEFAULT_DEBOUNCE_DELAY = 166
```

## Performance Considerations

### Guidelines for Delay Time Selection

```typescript
// UI updates (prioritize smooth experience)
const uiDebounced = debounce(updateUI, 16) // 60FPS

// Search (prioritize responsiveness)
const searchDebounced = debounce(search, 300)

// API calls (prioritize resource conservation)
const apiDebounced = debounce(apiCall, 500)

// File saving (prioritize data safety)
const saveDebounced = debounce(saveFile, 2000)

// Log output (prioritize performance)
const logDebounced = debounce(writeLog, 1000)
```

### Memory-Efficient Usage

```typescript
class PerformantComponent {
  private debouncedMethods = new Map<string, ReturnType<typeof debounce>>()

  private getDebounced(key: string, handler: Function, delay: number) {
    if (!this.debouncedMethods.has(key)) {
      this.debouncedMethods.set(key, debounce(handler, delay))
    }
    return this.debouncedMethods.get(key)!
  }

  handleInput() {
    const debouncedHandler = this.getDebounced('input', this.processInput, 300)
    debouncedHandler()
  }

  private processInput() {
    // Input processing
  }

  destroy() {
    // Cleanup debounce processes
    this.debouncedMethods.forEach(debounced => debounced.clear())
    this.debouncedMethods.clear()
  }
}
```

## Considerations

### Maintaining this Context

```typescript
class MyClass {
  value = 'test'

  // NG: this context is lost
  method = debounce(function() {
    console.log(this.value) // undefined
  }, 300)

  // OK: Use arrow function
  method = debounce(() => {
    console.log(this.value) // 'test'
  }, 300)

  // OK: Use bind
  method = debounce(function() {
    console.log(this.value) // 'test'
  }.bind(this), 300)
}
```

### Preventing Memory Leaks

```typescript
// Always clear when destroying components
class Component {
  private debouncedSave = debounce(this.save, 1000)

  destroy() {
    this.debouncedSave.clear() // Important: clear timer
  }
}
```

### Async Function Considerations

```typescript
// Async functions can also be debounced
const debouncedAsync = debounce(async (data: any) => {
  const result = await api.save(data)
  return result
}, 500)

// However, return value is ignored (becomes void)
debouncedAsync(data) // void instead of Promise<any>
```

## License

MIT

## Related Packages

This package is an independent library with no dependencies.
