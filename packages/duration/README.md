# @fastkit/duration

「期間」を表現する値オブジェクト実装。時間の計算、変換、操作を直感的に行うためのクラスを提供し、ミリ秒・秒・分・時間・日数の相互変換や、日時範囲からの期間計算を簡潔に実装できます。

## 機能

- **多単位対応**: ミリ秒、秒、分、時間、日数での期間表現
- **柔軟な初期化**: 数値、日時範囲、既存のDurationインスタンスから作成
- **静的ファクトリメソッド**: 各時間単位での簡潔な作成方法
- **型安全性**: TypeScriptによる厳密な型定義
- **JSON対応**: JSONシリアライゼーション・デシリアライゼーション
- **immutable**: 不変オブジェクトとして安全な値の受け渡し
- **軽量**: 依存関係なしの軽量ライブラリ

## インストール

```bash
npm install @fastkit/duration
```

## 基本的な使用方法

### Durationインスタンスの作成

```typescript
import { Duration } from '@fastkit/duration'

// 静的ファクトリメソッドを使用した作成
const duration1 = Duration.milliseconds(500)
const duration2 = Duration.seconds(30)
const duration3 = Duration.minutes(5)
const duration4 = Duration.hours(2)
const duration5 = Duration.days(1)

console.log(duration1.milliseconds) // 500
console.log(duration2.seconds)      // 30
console.log(duration3.minutes)      // 5
console.log(duration4.hours)        // 2
console.log(duration5.days)         // 1

// コンストラクターを使用した作成
const duration6 = new Duration(1000)  // 1000ミリ秒
console.log(duration6.seconds)        // 1
```

### 時間単位の変換

```typescript
import { Duration } from '@fastkit/duration'

// 5分の Duration を作成
const fiveMinutes = Duration.minutes(5)

console.log('5分は以下と等しい:')
console.log(`${fiveMinutes.milliseconds}ミリ秒`)  // 300000ミリ秒
console.log(`${fiveMinutes.seconds}秒`)          // 300秒
console.log(`${fiveMinutes.minutes}分`)          // 5分
console.log(`${fiveMinutes.hours}時間`)         // 0.08333...時間

// 複雑な計算例
const oneDay = Duration.days(1)
console.log(`1日は${oneDay.hours}時間`)         // 24時間
console.log(`1日は${oneDay.minutes}分`)        // 1440分
console.log(`1日は${oneDay.seconds}秒`)        // 86400秒
console.log(`1日は${oneDay.milliseconds}ミリ秒`) // 86400000ミリ秒
```

### 日時範囲からの期間計算

```typescript
import { Duration } from '@fastkit/duration'

// 日時範囲から期間を計算
const startDate = new Date('2024-01-01T10:00:00')
const endDate = new Date('2024-01-01T12:30:00')

const duration = new Duration([startDate, endDate])

console.log(`期間: ${duration.hours}時間`)      // 2.5時間
console.log(`期間: ${duration.minutes}分`)     // 150分
console.log(`期間: ${duration.seconds}秒`)     // 9000秒

// ISO文字列からも作成可能
const duration2 = new Duration([
  '2024-01-01T09:00:00Z',
  '2024-01-01T17:00:00Z'
])

console.log(`勤務時間: ${duration2.hours}時間`) // 8時間
```

## 高度な使用例

### タイムトラッキングシステム

```typescript
import { Duration } from '@fastkit/duration'

interface TimeEntry {
  id: string
  projectName: string
  startTime: Date
  endTime?: Date
  description?: string
}

class TimeTracker {
  private entries: TimeEntry[] = []
  private currentEntry: TimeEntry | null = null
  
  startTracking(projectName: string, description?: string): string {
    if (this.currentEntry) {
      throw new Error('既に時間追跡が開始されています')
    }
    
    const entry: TimeEntry = {
      id: `entry_${Date.now()}`,
      projectName,
      startTime: new Date(),
      description
    }
    
    this.currentEntry = entry
    console.log(`時間追跡開始: ${projectName}`)
    
    return entry.id
  }
  
  stopTracking(): Duration | null {
    if (!this.currentEntry) {
      console.log('追跡中の時間がありません')
      return null
    }
    
    const entry = this.currentEntry
    entry.endTime = new Date()
    
    this.entries.push(entry)
    this.currentEntry = null
    
    const duration = new Duration([entry.startTime, entry.endTime])
    
    console.log(`時間追跡停止: ${entry.projectName}`)
    console.log(`作業時間: ${this.formatDuration(duration)}`)
    
    return duration
  }
  
  getTotalDuration(projectName?: string): Duration {
    const filteredEntries = projectName 
      ? this.entries.filter(entry => entry.projectName === projectName)
      : this.entries
    
    const totalMs = filteredEntries
      .filter(entry => entry.endTime)
      .reduce((total, entry) => {
        const duration = new Duration([entry.startTime, entry.endTime!])
        return total + duration.milliseconds
      }, 0)
    
    return new Duration(totalMs)
  }
  
  getCurrentDuration(): Duration | null {
    if (!this.currentEntry) return null
    
    return new Duration([this.currentEntry.startTime, new Date()])
  }
  
  private formatDuration(duration: Duration): string {
    const hours = Math.floor(duration.hours)
    const minutes = Math.floor(duration.minutes % 60)
    const seconds = Math.floor(duration.seconds % 60)
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }
  
  getReport(): string {
    const projects = [...new Set(this.entries.map(entry => entry.projectName))]
    
    let report = '=== 時間追跡レポート ===\n\n'
    
    for (const project of projects) {
      const duration = this.getTotalDuration(project)
      report += `${project}: ${this.formatDuration(duration)}\n`
    }
    
    const total = this.getTotalDuration()
    report += `\n合計時間: ${this.formatDuration(total)}`
    
    return report
  }
}

// 使用例
async function timeTrackingExample() {
  const tracker = new TimeTracker()
  
  // プロジェクトA の作業開始
  tracker.startTracking('プロジェクトA', 'ダッシュボード開発')
  
  // 30秒後に停止（シミュレーション）
  await new Promise(resolve => setTimeout(resolve, 30000))
  tracker.stopTracking()
  
  // プロジェクトB の作業開始
  tracker.startTracking('プロジェクトB', 'API設計')
  
  // 45秒後に停止（シミュレーション）
  await new Promise(resolve => setTimeout(resolve, 45000))
  tracker.stopTracking()
  
  // レポート表示
  console.log(tracker.getReport())
}
```

### キャッシュ期限管理

```typescript
import { Duration } from '@fastkit/duration'

interface CacheItem<T> {
  value: T
  createdAt: Date
  ttl: Duration
}

class TTLCache<T> {
  private cache = new Map<string, CacheItem<T>>()
  
  set(key: string, value: T, ttl: Duration): void {
    this.cache.set(key, {
      value,
      createdAt: new Date(),
      ttl
    })
  }
  
  get(key: string): T | null {
    const item = this.cache.get(key)
    
    if (!item) {
      return null
    }
    
    // 有効期限チェック
    const elapsed = new Duration([item.createdAt, new Date()])
    
    if (elapsed.milliseconds > item.ttl.milliseconds) {
      this.cache.delete(key)
      return null
    }
    
    return item.value
  }
  
  has(key: string): boolean {
    return this.get(key) !== null
  }
  
  getRemainingTTL(key: string): Duration | null {
    const item = this.cache.get(key)
    
    if (!item) {
      return null
    }
    
    const elapsed = new Duration([item.createdAt, new Date()])
    const remaining = item.ttl.milliseconds - elapsed.milliseconds
    
    return remaining > 0 ? new Duration(remaining) : null
  }
  
  cleanup(): number {
    let removedCount = 0
    
    for (const [key, item] of this.cache.entries()) {
      const elapsed = new Duration([item.createdAt, new Date()])
      
      if (elapsed.milliseconds > item.ttl.milliseconds) {
        this.cache.delete(key)
        removedCount++
      }
    }
    
    return removedCount
  }
  
  clear(): void {
    this.cache.clear()
  }
  
  size(): number {
    return this.cache.size
  }
  
  keys(): string[] {
    return Array.from(this.cache.keys()).filter(key => this.has(key))
  }
}

// 使用例
function cacheExample() {
  const cache = new TTLCache<string>()
  
  // 短期間キャッシュ（30秒）
  cache.set('session:user123', 'John Doe', Duration.seconds(30))
  
  // 中期間キャッシュ（5分）
  cache.set('api:config', '{"theme":"dark"}', Duration.minutes(5))
  
  // 長期間キャッシュ（1時間）
  cache.set('static:menu', '<nav>Menu HTML</nav>', Duration.hours(1))
  
  console.log('ユーザー情報:', cache.get('session:user123'))
  
  // 残り有効期間の確認
  const remainingTTL = cache.getRemainingTTL('session:user123')
  if (remainingTTL) {
    console.log(`残り有効期間: ${remainingTTL.seconds}秒`)
  }
  
  // 期限切れアイテムのクリーンアップ
  setInterval(() => {
    const removed = cache.cleanup()
    if (removed > 0) {
      console.log(`${removed}個の期限切れアイテムを削除しました`)
    }
  }, Duration.minutes(1).milliseconds) // 1分ごとにクリーンアップ
}
```

### パフォーマンス測定

```typescript
import { Duration } from '@fastkit/duration'

class PerformanceMonitor {
  private measurements = new Map<string, Duration[]>()
  private startTimes = new Map<string, Date>()
  
  start(label: string): void {
    this.startTimes.set(label, new Date())
  }
  
  end(label: string): Duration | null {
    const startTime = this.startTimes.get(label)
    
    if (!startTime) {
      console.warn(`測定ラベル "${label}" が見つかりません`)
      return null
    }
    
    const duration = new Duration([startTime, new Date()])
    
    // 測定結果を記録
    if (!this.measurements.has(label)) {
      this.measurements.set(label, [])
    }
    
    this.measurements.get(label)!.push(duration)
    this.startTimes.delete(label)
    
    console.log(`${label}: ${duration.milliseconds}ms`)
    
    return duration
  }
  
  measure<T>(label: string, fn: () => T): T
  measure<T>(label: string, fn: () => Promise<T>): Promise<T>
  measure<T>(label: string, fn: () => T | Promise<T>): T | Promise<T> {
    this.start(label)
    
    try {
      const result = fn()
      
      if (result instanceof Promise) {
        return result.finally(() => {
          this.end(label)
        })
      } else {
        this.end(label)
        return result
      }
    } catch (error) {
      this.end(label)
      throw error
    }
  }
  
  getStats(label: string): {
    count: number
    average: Duration
    min: Duration
    max: Duration
    total: Duration
  } | null {
    const measurements = this.measurements.get(label)
    
    if (!measurements || measurements.length === 0) {
      return null
    }
    
    const totalMs = measurements.reduce((sum, d) => sum + d.milliseconds, 0)
    const averageMs = totalMs / measurements.length
    const minMs = Math.min(...measurements.map(d => d.milliseconds))
    const maxMs = Math.max(...measurements.map(d => d.milliseconds))
    
    return {
      count: measurements.length,
      average: new Duration(averageMs),
      min: new Duration(minMs),
      max: new Duration(maxMs),
      total: new Duration(totalMs)
    }
  }
  
  getAllStats(): Record<string, ReturnType<PerformanceMonitor['getStats']>> {
    const result: Record<string, ReturnType<PerformanceMonitor['getStats']>> = {}
    
    for (const label of this.measurements.keys()) {
      result[label] = this.getStats(label)
    }
    
    return result
  }
  
  clear(label?: string): void {
    if (label) {
      this.measurements.delete(label)
      this.startTimes.delete(label)
    } else {
      this.measurements.clear()
      this.startTimes.clear()
    }
  }
}

// 使用例
async function performanceExample() {
  const monitor = new PerformanceMonitor()
  
  // 同期処理の測定
  monitor.measure('data-processing', () => {
    // データ処理のシミュレーション
    const data = Array.from({ length: 100000 }, (_, i) => i * 2)
    return data.filter(n => n % 3 === 0).reduce((sum, n) => sum + n, 0)
  })
  
  // 非同期処理の測定
  await monitor.measure('api-call', async () => {
    // API呼び出しのシミュレーション
    await new Promise(resolve => setTimeout(resolve, 500))
    return { status: 'success', data: 'response data' }
  })
  
  // 手動測定
  monitor.start('custom-operation')
  
  // カスタム処理のシミュレーション
  await new Promise(resolve => setTimeout(resolve, 200))
  
  monitor.end('custom-operation')
  
  // 統計情報の表示
  const allStats = monitor.getAllStats()
  
  console.log('=== パフォーマンス統計 ===')
  for (const [label, stats] of Object.entries(allStats)) {
    if (stats) {
      console.log(`${label}:`)
      console.log(`  実行回数: ${stats.count}`)
      console.log(`  平均時間: ${stats.average.milliseconds}ms`)
      console.log(`  最短時間: ${stats.min.milliseconds}ms`)
      console.log(`  最長時間: ${stats.max.milliseconds}ms`)
      console.log(`  合計時間: ${stats.total.milliseconds}ms`)
      console.log('')
    }
  }
}
```

### タイムアウト管理

```typescript
import { Duration } from '@fastkit/duration'

class TimeoutManager {
  private timeouts = new Map<string, NodeJS.Timeout>()
  
  setTimeout<T>(
    label: string,
    callback: () => T | Promise<T>,
    duration: Duration
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      // 既存のタイムアウトをクリア
      this.clearTimeout(label)
      
      const timeoutId = setTimeout(async () => {
        try {
          const result = await callback()
          this.timeouts.delete(label)
          resolve(result)
        } catch (error) {
          this.timeouts.delete(label)
          reject(error)
        }
      }, duration.milliseconds)
      
      this.timeouts.set(label, timeoutId)
    })
  }
  
  setInterval<T>(
    label: string,
    callback: () => T | Promise<T>,
    duration: Duration
  ): void {
    // 既存のインターバルをクリア
    this.clearTimeout(label)
    
    const intervalId = setInterval(async () => {
      try {
        await callback()
      } catch (error) {
        console.error(`インターバル "${label}" でエラー:`, error)
      }
    }, duration.milliseconds)
    
    this.timeouts.set(label, intervalId)
  }
  
  clearTimeout(label: string): boolean {
    const timeoutId = this.timeouts.get(label)
    
    if (timeoutId) {
      clearTimeout(timeoutId)
      this.timeouts.delete(label)
      return true
    }
    
    return false
  }
  
  clearAll(): void {
    for (const timeoutId of this.timeouts.values()) {
      clearTimeout(timeoutId)
    }
    this.timeouts.clear()
  }
  
  getActiveTimeouts(): string[] {
    return Array.from(this.timeouts.keys())
  }
}

// 使用例
async function timeoutExample() {
  const timeoutManager = new TimeoutManager()
  
  console.log('各種タイムアウトを設定中...')
  
  // 5秒後に実行される処理
  timeoutManager.setTimeout('welcome-message', () => {
    console.log('ようこそ！')
    return 'welcome'
  }, Duration.seconds(5))
  
  // 10秒ごとに実行される処理
  timeoutManager.setInterval('health-check', () => {
    console.log('ヘルスチェック実行中...')
    return fetch('/health').then(r => r.json())
  }, Duration.seconds(10))
  
  // 30秒後にクリーンアップ
  timeoutManager.setTimeout('cleanup', () => {
    console.log('クリーンアップを実行します')
    timeoutManager.clearAll()
  }, Duration.seconds(30))
  
  console.log('アクティブなタイムアウト:', timeoutManager.getActiveTimeouts())
}
```

## API仕様

### `Duration`クラス

```typescript
class Duration {
  // 静的ファクトリメソッド
  static milliseconds(milliseconds: number): Duration
  static seconds(seconds: number): Duration
  static minutes(minutes: number): Duration
  static hours(hours: number): Duration
  static days(days: number): Duration
  
  // コンストラクター
  constructor(milliseconds: number)
  constructor(range: [RawDate, RawDate])
  constructor(duration: Duration)
  constructor(source: DurationSource)
  
  // プロパティ（読み取り専用）
  readonly milliseconds: number
  readonly seconds: number
  readonly minutes: number
  readonly hours: number
  readonly days: number
  
  // 値変換メソッド
  valueOf(): number
  toJSON(): number
  toString(): `${number}ms`
}
```

### 型定義

```typescript
type RawDate = number | string | Date

type DurationSource = 
  | number                    // ミリ秒数
  | [RawDate, RawDate]        // 日時範囲
  | Duration                  // Durationインスタンス

// 定数
const ONE_SECOND_MS = 1000     // 1秒のミリ秒数
const ONE_MINUTE_MS = 60000    // 1分のミリ秒数
const ONE_HOUR_MS = 3600000    // 1時間のミリ秒数
const ONE_DAY_MS = 86400000    // 1日のミリ秒数
```

### 作成方法の例

```typescript
// 数値からの作成
const duration1 = new Duration(5000)          // 5000ミリ秒
const duration2 = Duration.seconds(5)         // 5秒

// 日時範囲からの作成
const start = new Date('2024-01-01T10:00:00')
const end = new Date('2024-01-01T11:30:00')
const duration3 = new Duration([start, end])  // 1.5時間

// 既存のDurationからのクローン
const duration4 = new Duration(duration2)     // duration2のコピー

// 文字列日時からの作成
const duration5 = new Duration([
  '2024-01-01T09:00:00',
  '2024-01-01T17:00:00'
])  // 8時間
```

## 注意事項

### 精度について
- 内部的にはミリ秒単位で値を保持
- 小数点以下の値も正確に保持される
- 他の単位への変換時に浮動小数点誤差が生じる可能性

### immutability
- Durationインスタンスは不変オブジェクト
- 値の変更はできず、新しいインスタンスを作成する必要
- 安全な値の受け渡しが可能

### パフォーマンス
- 軽量なクラス設計でオーバーヘッドは最小限
- 大量のインスタンス作成時はメモリ使用量に注意
- 計算処理は高速で実用的

### 使用場面
- キャッシュのTTL管理
- タイムアウト設定
- パフォーマンス測定
- 時間追跡システム
- 期間計算が必要な業務処理

## ライセンス

MIT