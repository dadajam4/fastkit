
# @fastkit/debounce

🌐 English | [日本語](./README-ja.md)

軽量で高性能なデバウンス（遅延実行）ライブラリ。頻繁に呼び出される関数の実行を効率的に制御し、パフォーマンスの向上とリソースの節約を実現します。TypeScriptで記述され、厳密な型安全性を提供します。

## Features

- **高性能デバウンス**: 効率的なタイマー管理による最適化されたデバウンス処理
- **即座実行オプション**: 最初の呼び出しを即座に実行するimmediateモード
- **動的遅延設定**: 実行時に遅延時間を動的に変更可能
- **手動制御**: clear（キャンセル）やflush（強制実行）による細かい制御
- **TypeScript完全サポート**: 厳密な型定義による型安全性
- **ゼロ依存**: 外部依存なしの軽量実装
- **ブラウザ・Node.js対応**: あらゆる環境で動作
- **柔軟なAPI**: 複数のオーバーロードによる使いやすいインターフェース

## Installation

```bash
npm install @fastkit/debounce
```

## Basic Usage

### シンプルなデバウンス

```typescript
import { debounce } from '@fastkit/debounce'

// 基本的なデバウンス（デフォルト166ms）
const debouncedFunction = debounce(() => {
  console.log('実行されました！')
})

// 500msのデバウンス
const debouncedWithDelay = debounce(() => {
  console.log('500ms後に実行されました！')
}, 500)

// 複数回呼び出しても最後の1回のみ実行される
debouncedFunction()
debouncedFunction() 
debouncedFunction() // この呼び出しのみ実行される
```

### 引数を持つ関数のデバウンス

```typescript
import { debounce } from '@fastkit/debounce'

// 引数を持つ関数
const searchFunction = (query: string, filters: string[]) => {
  console.log(`検索: ${query}, フィルター:`, filters)
  // API呼び出しなどの処理
}

// デバウンスされた検索関数
const debouncedSearch = debounce(searchFunction, 300)

// 使用例
debouncedSearch('JavaScript', ['tech', 'programming'])
debouncedSearch('TypeScript', ['tech', 'programming']) // こちらのみ実行される
```

### 即座実行モード（Immediate）

```typescript
import { debounce } from '@fastkit/debounce'

// 最初の呼び出しを即座に実行し、その後の呼び出しをデバウンス
const immediateDebounced = debounce(() => {
  console.log('即座に実行、その後はデバウンス')
}, 1000, true) // 第3引数にtrueを指定

// または、オプションオブジェクトで指定
const immediateDebounced2 = debounce(() => {
  console.log('即座に実行、その後はデバウンス')
}, {
  delay: 1000,
  immediate: true
})

immediateDebounced() // 即座に実行される
immediateDebounced() // デバウンスされる
immediateDebounced() // デバウンスされる
```

## Advanced Usage Examples

### リアルタイム検索機能

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
    
    // 300msのデバウンスでAPI呼び出しを制御
    this.debouncedSearch = debounce(this.performSearch.bind(this), 300)
    
    this.setupEventListeners()
  }
  
  private setupEventListeners() {
    this.searchInput.addEventListener('input', (event) => {
      const query = (event.target as HTMLInputElement).value.trim()
      
      if (query.length < 2) {
        this.clearResults()
        this.debouncedSearch.clear() // 検索をキャンセル
        return
      }
      
      this.debouncedSearch(query)
    })
    
    // Enterキーで即座実行
    this.searchInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        this.debouncedSearch.flush() // 待機中の処理を即座実行
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
      console.error('検索エラー:', error)
      this.showError('検索中にエラーが発生しました')
    }
  }
  
  private showLoading() {
    this.resultsContainer.innerHTML = '<div class="loading">検索中...</div>'
  }
  
  private displayResults(results: SearchResult[]) {
    if (results.length === 0) {
      this.resultsContainer.innerHTML = '<div class="no-results">結果が見つかりませんでした</div>'
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

// 使用例
const searchComponent = new SearchComponent('#search-input', '#search-results')
```

### ウィンドウリサイズの最適化

```typescript
import { debounce } from '@fastkit/debounce'

class ResponsiveLayout {
  private debouncedResize: ReturnType<typeof debounce>
  private debouncedScroll: ReturnType<typeof debounce>
  
  constructor() {
    // リサイズイベントのデバウンス（250ms）
    this.debouncedResize = debounce(this.handleResize.bind(this), 250)
    
    // スクロールイベントのデバウンス（即座実行 + 100ms）
    this.debouncedScroll = debounce(this.handleScroll.bind(this), {
      delay: 100,
      immediate: true
    })
    
    this.setupEventListeners()
    this.handleResize() // 初期化
  }
  
  private setupEventListeners() {
    window.addEventListener('resize', this.debouncedResize)
    window.addEventListener('scroll', this.debouncedScroll)
  }
  
  private handleResize() {
    const width = window.innerWidth
    const height = window.innerHeight
    
    console.log(`ウィンドウサイズ変更: ${width}x${height}`)
    
    // レスポンシブブレークポイントの処理
    this.updateLayout(width)
    
    // グリッドレイアウトの再計算
    this.recalculateGrid()
  }
  
  private handleScroll() {
    const scrollY = window.scrollY
    const documentHeight = document.documentElement.scrollHeight
    const windowHeight = window.innerHeight
    
    // スクロール位置に基づく処理
    this.updateScrollIndicator(scrollY, documentHeight, windowHeight)
    
    // 無限スクロールの判定
    if (scrollY + windowHeight >= documentHeight - 200) {
      this.loadMoreContent()
    }
  }
  
  private updateLayout(width: number) {
    const body = document.body
    
    // ブレークポイントに基づくクラス設定
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
    
    // グリッドアイテムの動的サイズ調整
    const containerWidth = grid.offsetWidth
    const itemWidth = 250 // 基本アイテム幅
    const gap = 16 // アイテム間の余白
    
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
    // 無限スクロールでのコンテンツ読み込み
    try {
      const response = await fetch('/api/more-content')
      const content = await response.text()
      
      const container = document.querySelector('.content-container')
      if (container) {
        container.insertAdjacentHTML('beforeend', content)
      }
    } catch (error) {
      console.error('コンテンツの読み込みエラー:', error)
    }
  }
  
  destroy() {
    // イベントリスナーの削除
    window.removeEventListener('resize', this.debouncedResize)
    window.removeEventListener('scroll', this.debouncedScroll)
    
    // デバウンス処理のクリア
    this.debouncedResize.clear()
    this.debouncedScroll.clear()
  }
}

// 使用例
const responsiveLayout = new ResponsiveLayout()

// ページアンロード時のクリーンアップ
window.addEventListener('beforeunload', () => {
  responsiveLayout.destroy()
})
```

### フォーム自動保存機能

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
    
    // 2秒のデバウンスで自動保存
    this.debouncedSave = debounce(this.saveForm.bind(this), 2000)
    
    this.setupEventListeners()
    this.loadSavedData()
  }
  
  private setupEventListeners() {
    // フォーム要素の変更を監視
    this.form.addEventListener('input', () => {
      this.handleFormChange()
    })
    
    this.form.addEventListener('change', () => {
      this.handleFormChange()
    })
    
    // Ctrl+S で即座保存
    document.addEventListener('keydown', (event) => {
      if (event.ctrlKey && event.key === 's') {
        event.preventDefault()
        this.debouncedSave.flush()
      }
    })
    
    // ページ離脱時の保存
    window.addEventListener('beforeunload', () => {
      this.debouncedSave.flush()
    })
  }
  
  private handleFormChange() {
    const currentData = this.getFormData()
    
    // データが変更された場合のみ保存処理をトリガー
    if (!this.isDataEqual(currentData, this.lastSavedData)) {
      this.showSaveStatus('変更を保存中...')
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
    
    // チェックボックスの処理
    const checkboxes = this.form.querySelectorAll('input[type="checkbox"]') as NodeListOf<HTMLInputElement>
    checkboxes.forEach(checkbox => {
      data[checkbox.name] = checkbox.checked
    })
    
    return data
  }
  
  private async saveForm() {
    const formData = this.getFormData()
    
    try {
      this.showSaveStatus('保存中...')
      
      const response = await fetch('/api/save-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })
      
      if (response.ok) {
        this.lastSavedData = { ...formData }
        this.showSaveStatus('保存完了', 'success')
        
        // 3秒後にステータスを非表示
        setTimeout(() => {
          this.hideSaveStatus()
        }, 3000)
      } else {
        throw new Error('保存に失敗しました')
      }
    } catch (error) {
      console.error('保存エラー:', error)
      this.showSaveStatus('保存エラー', 'error')
      
      // 5秒後にリトライ
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
      console.error('データ読み込みエラー:', error)
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
  
  // 手動保存メソッド
  forceSave() {
    this.debouncedSave.flush()
  }
  
  // 保存キャンセルメソッド
  cancelSave() {
    this.debouncedSave.clear()
    this.showSaveStatus('保存をキャンセルしました')
  }
}

// 使用例
const autoSaveForm = new AutoSaveForm('#user-profile-form')
```

### 動的遅延設定

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
    
    // 呼び出し頻度に応じて遅延時間を調整
    const elapsed = Date.now() - this.startTime
    const callsPerSecond = this.callCount / (elapsed / 1000)
    
    let newDelay: number
    if (callsPerSecond > 10) {
      newDelay = 1000 // 高頻度の場合は長めの遅延
    } else if (callsPerSecond > 5) {
      newDelay = 500  // 中頻度の場合は中程度の遅延
    } else {
      newDelay = 200  // 低頻度の場合は短めの遅延
    }
    
    this.debouncedFunction.setDelay(newDelay)
    this.debouncedFunction()
  }
  
  private execute() {
    console.log(`実行: 呼び出し回数=${this.callCount}, 遅延=${this.debouncedFunction}`)
    
    // 実際の処理をここに実装
    this.performTask()
    
    // 統計をリセット
    this.callCount = 0
    this.startTime = Date.now()
  }
  
  private performTask() {
    // 重い処理の実装
    console.log('重い処理を実行中...')
  }
}

// 使用例
const adaptiveDebouncer = new AdaptiveDebouncer()

// 頻繁に呼び出し
for (let i = 0; i < 20; i++) {
  setTimeout(() => adaptiveDebouncer.call(), i * 50)
}
```

## API Specification

### `debounce`関数

```typescript
// 基本的な呼び出し
function debounce<FN extends AnyFunction>(
  handler: FN, 
  delay?: number, 
  immediate?: boolean
): Debounced<FN>

// オプションオブジェクトでの呼び出し
function debounce<FN extends AnyFunction>(
  handler: FN, 
  options: DebounceOptions
): Debounced<FN>

// 設定オブジェクトでの呼び出し
function debounce<FN extends AnyFunction>(
  settings: DebounceSettings<FN>
): Debounced<FN>
```

### `Debounced`インターフェース

```typescript
interface Debounced<FN extends AnyFunction> {
  // デバウンス処理が注入されたハンドラー関数
  (...args: Parameters<FN>): void
  
  // タイマーをクリアし、待機中のハンドラー実行をキャンセル
  clear(): void
  
  // 待機中の遅延ハンドラーがあれば実行
  flush(): void
  
  // 設定済みの遅延時間を更新
  setDelay(delay: number): void
}
```

### オプション型

```typescript
interface DebounceOptions {
  // 遅延時間（ミリ秒）
  delay?: number      // デフォルト: 166ms
  
  // 即座実行フラグ
  immediate?: boolean // デフォルト: false
}

interface DebounceSettings<FN extends AnyFunction> extends DebounceOptions {
  handler: FN  // ハンドラー関数
}
```

### 定数

```typescript
// デフォルトの遅延時間（約60FPS）
const DEFAULT_DEBOUNCE_DELAY = 166
```

## パフォーマンス考慮事項

### 遅延時間の選択指針

```typescript
// UI更新系（スムーズな体験重視）
const uiDebounced = debounce(updateUI, 16) // 60FPS

// 検索系（レスポンス重視）
const searchDebounced = debounce(search, 300)

// API呼び出し系（リソース節約重視）
const apiDebounced = debounce(apiCall, 500)

// ファイル保存系（データ安全性重視）
const saveDebounced = debounce(saveFile, 2000)

// ログ出力系（パフォーマンス重視）
const logDebounced = debounce(writeLog, 1000)
```

### メモリ効率的な使用法

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
    // 入力処理
  }
  
  destroy() {
    // デバウンス処理のクリーンアップ
    this.debouncedMethods.forEach(debounced => debounced.clear())
    this.debouncedMethods.clear()
  }
}
```

## Considerations

### this コンテキストの保持

```typescript
class MyClass {
  value = 'test'
  
  // NG: thisコンテキストが失われる
  method = debounce(function() {
    console.log(this.value) // undefined
  }, 300)
  
  // OK: アロー関数を使用
  method = debounce(() => {
    console.log(this.value) // 'test'
  }, 300)
  
  // OK: bindを使用
  method = debounce(function() {
    console.log(this.value) // 'test'
  }.bind(this), 300)
}
```

### メモリリークの防止

```typescript
// コンポーネントの破棄時には必ずクリア
class Component {
  private debouncedSave = debounce(this.save, 1000)
  
  destroy() {
    this.debouncedSave.clear() // 重要: タイマーをクリア
  }
}
```

### 非同期関数の考慮

```typescript
// 非同期関数もデバウンス可能
const debouncedAsync = debounce(async (data: any) => {
  const result = await api.save(data)
  return result
}, 500)

// ただし、戻り値は無視される（voidになる）
debouncedAsync(data) // Promise<any>ではなくvoid
```

## License

MIT

## Related Packages

このパッケージは依存関係を持たない独立したライブラリです。