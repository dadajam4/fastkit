
# @fastkit/duration

🌐 English | [日本語](https://github.com/dadajam4/fastkit/blob/main/packages/duration/README-ja.md)

A value object implementation representing "duration". Provides classes for intuitive time calculation, conversion, and manipulation, enabling concise implementation of mutual conversion between milliseconds, seconds, minutes, hours, and days, as well as duration calculation from date ranges.

## Features

- **Multi-unit Support**: Duration representation in milliseconds, seconds, minutes, hours, and days
- **Flexible Initialization**: Creation from numbers, date ranges, or existing Duration instances
- **Static Factory Methods**: Concise creation methods for each time unit
- **Type Safety**: Strict type definitions through TypeScript
- **JSON Support**: JSON serialization and deserialization
- **Immutable**: Safe value passing as immutable objects
- **Lightweight**: Lightweight library with no dependencies

## Installation

```bash
npm install @fastkit/duration
```

## Basic Usage

### Creating Duration Instances

```typescript
import { Duration } from '@fastkit/duration'

// Create using static factory methods
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

// Create using constructor
const duration6 = new Duration(1000)  // 1000 milliseconds
console.log(duration6.seconds)        // 1
```

### Time Unit Conversion

```typescript
import { Duration } from '@fastkit/duration'

// Create 5 minutes Duration
const fiveMinutes = Duration.minutes(5)

console.log('5 minutes equals:')
console.log(`${fiveMinutes.milliseconds} milliseconds`)  // 300000 milliseconds
console.log(`${fiveMinutes.seconds} seconds`)          // 300 seconds
console.log(`${fiveMinutes.minutes} minutes`)          // 5 minutes
console.log(`${fiveMinutes.hours} hours`)         // 0.08333... hours

// Complex calculation example
const oneDay = Duration.days(1)
console.log(`1 day is ${oneDay.hours} hours`)         // 24 hours
console.log(`1 day is ${oneDay.minutes} minutes`)        // 1440 minutes
console.log(`1 day is ${oneDay.seconds} seconds`)        // 86400 seconds
console.log(`1 day is ${oneDay.milliseconds} milliseconds`) // 86400000 milliseconds
```

### Duration Calculation from Date Ranges

```typescript
import { Duration } from '@fastkit/duration'

// Calculate duration from date range
const startDate = new Date('2024-01-01T10:00:00')
const endDate = new Date('2024-01-01T12:30:00')

const duration = new Duration([startDate, endDate])

console.log(`Duration: ${duration.hours} hours`)      // 2.5 hours
console.log(`Duration: ${duration.minutes} minutes`)     // 150 minutes
console.log(`Duration: ${duration.seconds} seconds`)     // 9000 seconds

// Can also create from ISO strings
const duration2 = new Duration([
  '2024-01-01T09:00:00Z',
  '2024-01-01T17:00:00Z'
])

console.log(`Working hours: ${duration2.hours} hours`) // 8 hours
```

## Advanced Usage Examples

### Time Tracking System

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
      throw new Error('Time tracking is already started')
    }

    const entry: TimeEntry = {
      id: `entry_${Date.now()}`,
      projectName,
      startTime: new Date(),
      description
    }

    this.currentEntry = entry
    console.log(`Time tracking started: ${projectName}`)

    return entry.id
  }

  stopTracking(): Duration | null {
    if (!this.currentEntry) {
      console.log('No time being tracked')
      return null
    }

    const entry = this.currentEntry
    entry.endTime = new Date()

    this.entries.push(entry)
    this.currentEntry = null

    const duration = new Duration([entry.startTime, entry.endTime])

    console.log(`Time tracking stopped: ${entry.projectName}`)
    console.log(`Work time: ${this.formatDuration(duration)}`)

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

    let report = '=== Time Tracking Report ===\n\n'

    for (const project of projects) {
      const duration = this.getTotalDuration(project)
      report += `${project}: ${this.formatDuration(duration)}\n`
    }

    const total = this.getTotalDuration()
    report += `\nTotal time: ${this.formatDuration(total)}`

    return report
  }
}

// Usage example
async function timeTrackingExample() {
  const tracker = new TimeTracker()

  // Start work on Project A
  tracker.startTracking('Project A', 'Dashboard development')

  // Stop after 30 seconds (simulation)
  await new Promise(resolve => setTimeout(resolve, 30000))
  tracker.stopTracking()

  // Start work on Project B
  tracker.startTracking('Project B', 'API design')

  // Stop after 45 seconds (simulation)
  await new Promise(resolve => setTimeout(resolve, 45000))
  tracker.stopTracking()

  // Display report
  console.log(tracker.getReport())
}
```

### Cache Expiration Management

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

    // Check expiration
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

// Usage example
function cacheExample() {
  const cache = new TTLCache<string>()

  // Short-term cache (30 seconds)
  cache.set('session:user123', 'John Doe', Duration.seconds(30))

  // Medium-term cache (5 minutes)
  cache.set('api:config', '{"theme":"dark"}', Duration.minutes(5))

  // Long-term cache (1 hour)
  cache.set('static:menu', '<nav>Menu HTML</nav>', Duration.hours(1))

  console.log('User info:', cache.get('session:user123'))

  // Check remaining TTL
  const remainingTTL = cache.getRemainingTTL('session:user123')
  if (remainingTTL) {
    console.log(`Remaining TTL: ${remainingTTL.seconds} seconds`)
  }

  // Cleanup expired items
  setInterval(() => {
    const removed = cache.cleanup()
    if (removed > 0) {
      console.log(`Removed ${removed} expired items`)
    }
  }, Duration.minutes(1).milliseconds) // Cleanup every minute
}
```

### Performance Measurement

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
      console.warn(`Measurement label "${label}" not found`)
      return null
    }

    const duration = new Duration([startTime, new Date()])

    // Record measurement result
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

// Usage example
async function performanceExample() {
  const monitor = new PerformanceMonitor()

  // Measure synchronous processing
  monitor.measure('data-processing', () => {
    // Data processing simulation
    const data = Array.from({ length: 100000 }, (_, i) => i * 2)
    return data.filter(n => n % 3 === 0).reduce((sum, n) => sum + n, 0)
  })

  // Measure asynchronous processing
  await monitor.measure('api-call', async () => {
    // API call simulation
    await new Promise(resolve => setTimeout(resolve, 500))
    return { status: 'success', data: 'response data' }
  })

  // Manual measurement
  monitor.start('custom-operation')

  // Custom processing simulation
  await new Promise(resolve => setTimeout(resolve, 200))

  monitor.end('custom-operation')

  // Display statistics
  const allStats = monitor.getAllStats()

  console.log('=== Performance Statistics ===')
  for (const [label, stats] of Object.entries(allStats)) {
    if (stats) {
      console.log(`${label}:`)
      console.log(`  Executions: ${stats.count}`)
      console.log(`  Average time: ${stats.average.milliseconds}ms`)
      console.log(`  Min time: ${stats.min.milliseconds}ms`)
      console.log(`  Max time: ${stats.max.milliseconds}ms`)
      console.log(`  Total time: ${stats.total.milliseconds}ms`)
      console.log('')
    }
  }
}
```

### Timeout Management

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
      // Clear existing timeout
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
    // Clear existing interval
    this.clearTimeout(label)

    const intervalId = setInterval(async () => {
      try {
        await callback()
      } catch (error) {
        console.error(`Error in interval "${label}":`, error)
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

// Usage example
async function timeoutExample() {
  const timeoutManager = new TimeoutManager()

  console.log('Setting various timeouts...')

  // Process to execute after 5 seconds
  timeoutManager.setTimeout('welcome-message', () => {
    console.log('Welcome!')
    return 'welcome'
  }, Duration.seconds(5))

  // Process to execute every 10 seconds
  timeoutManager.setInterval('health-check', () => {
    console.log('Running health check...')
    return fetch('/health').then(r => r.json())
  }, Duration.seconds(10))

  // Cleanup after 30 seconds
  timeoutManager.setTimeout('cleanup', () => {
    console.log('Running cleanup')
    timeoutManager.clearAll()
  }, Duration.seconds(30))

  console.log('Active timeouts:', timeoutManager.getActiveTimeouts())
}
```

## API Specification

### `Duration` Class

```typescript
class Duration {
  // Static factory methods
  static milliseconds(milliseconds: number): Duration
  static seconds(seconds: number): Duration
  static minutes(minutes: number): Duration
  static hours(hours: number): Duration
  static days(days: number): Duration

  // Constructor
  constructor(milliseconds: number)
  constructor(range: [RawDate, RawDate])
  constructor(duration: Duration)
  constructor(source: DurationSource)

  // Properties (read-only)
  readonly milliseconds: number
  readonly seconds: number
  readonly minutes: number
  readonly hours: number
  readonly days: number

  // Value conversion methods
  valueOf(): number
  toJSON(): number
  toString(): `${number}ms`
}
```

### Type Definitions

```typescript
type RawDate = number | string | Date

type DurationSource =
  | number                    // Milliseconds
  | [RawDate, RawDate]        // Date range
  | Duration                  // Duration instance

// Constants
const ONE_SECOND_MS = 1000     // Milliseconds in 1 second
const ONE_MINUTE_MS = 60000    // Milliseconds in 1 minute
const ONE_HOUR_MS = 3600000    // Milliseconds in 1 hour
const ONE_DAY_MS = 86400000    // Milliseconds in 1 day
```

### Creation Method Examples

```typescript
// Create from number
const duration1 = new Duration(5000)          // 5000 milliseconds
const duration2 = Duration.seconds(5)         // 5 seconds

// Create from date range
const start = new Date('2024-01-01T10:00:00')
const end = new Date('2024-01-01T11:30:00')
const duration3 = new Duration([start, end])  // 1.5 hours

// Clone from existing Duration
const duration4 = new Duration(duration2)     // Copy of duration2

// Create from string dates
const duration5 = new Duration([
  '2024-01-01T09:00:00',
  '2024-01-01T17:00:00'
])  // 8 hours
```

## Considerations

### About Precision
- Internally stores values in milliseconds
- Decimal values are also accurately maintained
- Floating point errors may occur when converting to other units

### Immutability
- Duration instances are immutable objects
- Values cannot be changed; new instances must be created
- Safe value passing is possible

### Performance
- Lightweight class design with minimal overhead
- Be mindful of memory usage when creating large numbers of instances
- Calculation processing is fast and practical

### Use Cases
- Cache TTL management
- Timeout settings
- Performance measurement
- Time tracking systems
- Business processing requiring duration calculations

## License

MIT
