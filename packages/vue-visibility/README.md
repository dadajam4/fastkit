
# @fastkit/vue-visibility

🌐 English | [日本語](https://github.com/dadajam4/fastkit/blob/main/packages/vue-visibility/README-ja.md)

A browser tab visibility monitoring library that utilizes the Page Visibility API in Vue applications. Reactively tracks display state changes when users switch tabs or move to other applications.

## Features

- **Page Visibility API Integration**: Provides the standard Page Visibility API in an easy-to-use format for Vue
- **Reactive State Management**: Complete integration with Vue's reactive system
- **Cross-Browser Support**: Supports various prefixes for major browsers
- **Full TypeScript Support**: Type safety through strict type definitions
- **Lightweight Design**: Minimal dependencies and overhead
- **SSR Support**: Safe operation in server-side rendering environments
- **Automatic Cleanup**: Listener management linked to component lifecycle
- **Flexible Callbacks**: Callbacks for state changes and specific states

## Installation

```bash
npm install @fastkit/vue-visibility
```

## Basic Usage

### Simple State Monitoring

```vue
<template>
  <div class="visibility-demo">
    <h2>Page Visibility State Monitoring</h2>

    <!-- Current state display -->
    <div class="status-display">
      <h3>Current Status</h3>
      <div class="status-item" :class="{ active: visibility.visible }">
        <span class="status-icon">👁️</span>
        <span class="status-label">Visible</span>
        <span class="status-value">{{ visibility.visible ? 'YES' : 'NO' }}</span>
      </div>
      <div class="status-item" :class="{ active: visibility.hidden }">
        <span class="status-icon">🙈</span>
        <span class="status-label">Hidden</span>
        <span class="status-value">{{ visibility.hidden ? 'YES' : 'NO' }}</span>
      </div>
    </div>

    <!-- Detailed information -->
    <div class="details">
      <h3>Detailed Information</h3>
      <div class="detail-item">
        <strong>State:</strong> {{ visibility.state }}
      </div>
      <div class="detail-item">
        <strong>Last Change:</strong> {{ lastChangeTime }}
      </div>
      <div class="detail-item">
        <strong>Change Count:</strong> {{ changeCount }}
      </div>
    </div>

    <!-- Usage instructions -->
    <div class="instructions">
      <h3>How to Use</h3>
      <ul>
        <li>Switching to another tab will make it "Hidden"</li>
        <li>Returning to this tab will make it "Visible"</li>
        <li>Minimizing the browser will also make it "Hidden"</li>
        <li>Activating other applications will also make it "Hidden"</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useVisibility } from '@fastkit/vue-visibility'

const lastChangeTime = ref('No changes yet')
const changeCount = ref(0)

// Monitor Visibility state
const visibility = useVisibility({
  change: (state, event) => {
    console.log('State changed:', state, event)
    lastChangeTime.value = new Date().toLocaleTimeString()
    changeCount.value++
  },
  visible: (event) => {
    console.log('Page became visible:', event)
  },
  hidden: (event) => {
    console.log('Page became hidden:', event)
  }
})

console.log('Initial state:', {
  state: visibility.state,
  visible: visibility.visible,
  hidden: visibility.hidden
})
</script>

<style scoped>
.visibility-demo {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.status-display {
  margin: 20px 0;
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
  background: #f9f9f9;
}

.status-item {
  display: flex;
  align-items: center;
  padding: 12px;
  margin: 8px 0;
  border: 2px solid #ddd;
  border-radius: 6px;
  background: white;
  transition: all 0.3s ease;
}

.status-item.active {
  border-color: #4caf50;
  background: #e8f5e8;
  box-shadow: 0 2px 4px rgba(76, 175, 80, 0.2);
}

.status-icon {
  font-size: 1.5rem;
  margin-right: 12px;
}

.status-label {
  flex: 1;
  font-weight: 500;
}

.status-value {
  font-weight: bold;
  color: #666;
}

.status-item.active .status-value {
  color: #4caf50;
}

.details {
  margin: 20px 0;
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
}

.detail-item {
  margin: 8px 0;
  padding: 8px 0;
  border-bottom: 1px solid #f0f0f0;
}

.detail-item:last-child {
  border-bottom: none;
}

.instructions {
  margin: 20px 0;
  padding: 20px;
  border: 1px solid #2196f3;
  border-radius: 8px;
  background: #e3f2fd;
}

.instructions ul {
  margin: 10px 0;
  padding-left: 20px;
}

.instructions li {
  margin: 5px 0;
}
</style>
```

### Practical Application Examples

```vue
<template>
  <div class="practical-demo">
    <h2>Practical Page Visibility Usage Examples</h2>

    <!-- Online status -->
    <div class="online-status" :class="statusClasses">
      <div class="status-indicator"></div>
      <span class="status-text">{{ statusText }}</span>
    </div>

    <!-- Video player -->
    <div class="video-section">
      <h3>Auto-Pause Video Player</h3>
      <div class="video-player">
        <video
          ref="videoRef"
          :src="videoSrc"
          controls
          preload="metadata"
          @play="handleVideoPlay"
          @pause="handleVideoPause"
        ></video>
        <div class="video-status">
          <p>Status: {{ videoStatus }}</p>
          <p>Auto-Pause: {{ autoPaused ? 'ON' : 'OFF' }}</p>
        </div>
      </div>
    </div>

    <!-- Timer -->
    <div class="timer-section">
      <h3>Pause-Aware Timer</h3>
      <div class="timer-display">
        <div class="timer-time">{{ formatTime(elapsedTime) }}</div>
        <div class="timer-controls">
          <button @click="startTimer" :disabled="timerRunning">Start</button>
          <button @click="stopTimer" :disabled="!timerRunning">Stop</button>
          <button @click="resetTimer">Reset</button>
        </div>
        <div class="timer-info">
          <p>Timer Status: {{ timerRunning ? 'Running' : 'Stopped' }}</p>
          <p>Background Pause: {{ backgroundPaused ? 'ON' : 'OFF' }}</p>
        </div>
      </div>
    </div>

    <!-- Notification system -->
    <div class="notification-section">
      <h3>Tab Return Notifications</h3>
      <div class="notification-controls">
        <button @click="simulateNotification">Generate Notification</button>
        <button @click="clearNotifications">Clear Notifications</button>
      </div>
      <div class="notification-list">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="notification-item"
          :class="{ unread: !notification.read }"
        >
          <div class="notification-content">
            <h4>{{ notification.title }}</h4>
            <p>{{ notification.message }}</p>
            <small>{{ formatDate(notification.timestamp) }}</small>
          </div>
          <button
            v-if="!notification.read"
            @click="markAsRead(notification.id)"
            class="mark-read-btn"
          >
            Mark as Read
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useVisibility } from '@fastkit/vue-visibility'

// Basic Visibility monitoring
const visibility = useVisibility({
  visible: handleTabVisible,
  hidden: handleTabHidden,
  change: handleVisibilityChange
})

// Online status
const statusClasses = computed(() => ({
  'status-online': visibility.visible,
  'status-offline': visibility.hidden
}))

const statusText = computed(() =>
  visibility.visible ? 'Online (Active)' : 'Offline (Inactive)'
)

// Video player
const videoRef = ref<HTMLVideoElement>()
const videoSrc = ref('https://www.w3schools.com/html/mov_bbb.mp4')
const videoStatus = ref('Stopped')
const autoPaused = ref(false)

const handleVideoPlay = () => {
  videoStatus.value = 'Playing'
  autoPaused.value = false
}

const handleVideoPause = () => {
  videoStatus.value = 'Paused'
}

// Timer functionality
const elapsedTime = ref(0)
const timerRunning = ref(false)
const backgroundPaused = ref(false)
let timerInterval: number | null = null

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
}

const startTimer = () => {
  if (timerInterval) return

  timerRunning.value = true
  timerInterval = setInterval(() => {
    if (!backgroundPaused.value) {
      elapsedTime.value++
    }
  }, 1000)
}

const stopTimer = () => {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
  timerRunning.value = false
  backgroundPaused.value = false
}

const resetTimer = () => {
  stopTimer()
  elapsedTime.value = 0
}

// Notification system
interface Notification {
  id: string
  title: string
  message: string
  timestamp: Date
  read: boolean
}

const notifications = ref<Notification[]>([])
let notificationCount = 0

const simulateNotification = () => {
  notificationCount++
  const notification: Notification = {
    id: `notification-${notificationCount}`,
    title: `New Notification #${notificationCount}`,
    message: `This notification was generated at ${new Date().toLocaleTimeString()}.`,
    timestamp: new Date(),
    read: false
  }
  notifications.value.unshift(notification)
}

const clearNotifications = () => {
  notifications.value = []
}

const markAsRead = (id: string) => {
  const notification = notifications.value.find(n => n.id === id)
  if (notification) {
    notification.read = true
  }
}

const formatDate = (date: Date) => {
  return date.toLocaleString()
}

// Visibility event handlers
function handleTabVisible() {
  console.log('Tab became visible')

  // Resume timer
  if (timerRunning.value && backgroundPaused.value) {
    backgroundPaused.value = false
    console.log('Timer resumed')
  }

  // Show unread count in title if there are unread notifications
  const unreadCount = notifications.value.filter(n => !n.read).length
  if (unreadCount > 0) {
    // Display unread count in browser title
    document.title = `(${unreadCount}) Vue Visibility Demo`
  } else {
    document.title = 'Vue Visibility Demo'
  }
}

function handleTabHidden() {
  console.log('Tab became hidden')

  // Auto-pause video
  if (videoRef.value && !videoRef.value.paused) {
    videoRef.value.pause()
    autoPaused.value = true
    console.log('Video auto-paused')
  }

  // Pause timer
  if (timerRunning.value) {
    backgroundPaused.value = true
    console.log('Timer paused')
  }
}

function handleVisibilityChange(state: string) {
  console.log('Visibility state changed:', state)

  // Send to analytics (in actual implementation)
  // analytics.track('page_visibility_change', { state })
}

// Initialization on component mount
onMounted(() => {
  console.log('Component mounted')
  console.log('Initial Visibility state:', visibility.state)
})
</script>

<style scoped>
.practical-demo {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

/* Online status */
.online-status {
  display: flex;
  align-items: center;
  padding: 12px 20px;
  border-radius: 25px;
  margin: 20px 0;
  font-weight: 500;
  transition: all 0.3s ease;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 10px;
  transition: background-color 0.3s ease;
}

.status-online {
  background: #e8f5e8;
  color: #2e7d2e;
  border: 1px solid #4caf50;
}

.status-online .status-indicator {
  background: #4caf50;
}

.status-offline {
  background: #ffebee;
  color: #c62828;
  border: 1px solid #f44336;
}

.status-offline .status-indicator {
  background: #f44336;
}

/* Video player */
.video-section {
  margin: 30px 0;
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
}

.video-player {
  margin-top: 15px;
}

.video-player video {
  width: 100%;
  max-width: 500px;
  border-radius: 8px;
}

.video-status {
  margin-top: 10px;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 4px;
  font-size: 0.9em;
}

/* Timer */
.timer-section {
  margin: 30px 0;
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
}

.timer-display {
  text-align: center;
  margin-top: 15px;
}

.timer-time {
  font-size: 3rem;
  font-weight: bold;
  color: #333;
  margin: 20px 0;
  font-family: 'Courier New', monospace;
}

.timer-controls {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin: 20px 0;
}

.timer-controls button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.timer-controls button:first-child {
  background: #4caf50;
  color: white;
}

.timer-controls button:nth-child(2) {
  background: #f44336;
  color: white;
}

.timer-controls button:last-child {
  background: #2196f3;
  color: white;
}

.timer-controls button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.timer-info {
  margin-top: 15px;
  font-size: 0.9em;
  color: #666;
}

/* Notification system */
.notification-section {
  margin: 30px 0;
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
}

.notification-controls {
  display: flex;
  gap: 10px;
  margin: 15px 0;
}

.notification-controls button {
  padding: 8px 16px;
  border: 1px solid #007acc;
  background: white;
  color: #007acc;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.notification-controls button:hover {
  background: #007acc;
  color: white;
}

.notification-list {
  margin-top: 20px;
  max-height: 300px;
  overflow-y: auto;
}

.notification-item {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 15px;
  margin: 10px 0;
  border: 1px solid #eee;
  border-radius: 8px;
  background: white;
  transition: all 0.2s ease;
}

.notification-item.unread {
  background: #fff3e0;
  border-color: #ff9800;
}

.notification-content {
  flex: 1;
}

.notification-content h4 {
  margin: 0 0 5px 0;
  color: #333;
}

.notification-content p {
  margin: 0 0 5px 0;
  color: #666;
}

.notification-content small {
  color: #999;
}

.mark-read-btn {
  padding: 5px 10px;
  border: 1px solid #4caf50;
  background: white;
  color: #4caf50;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8em;
  transition: all 0.2s ease;
}

.mark-read-btn:hover {
  background: #4caf50;
  color: white;
}
</style>
```

## Advanced Usage Examples

### Custom Hook Implementation

```typescript
// composables/useAppVisibility.ts
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useVisibility } from '@fastkit/vue-visibility'

export interface AppVisibilityOptions {
  /**
   * Auto-pause functionality when in background
   */
  autoPause?: boolean

  /**
   * Activity tracking
   */
  trackActivity?: boolean

  /**
   * Notification management
   */
  manageNotifications?: boolean

  /**
   * Title updates
   */
  updateTitle?: boolean

  /**
   * Custom callbacks
   */
  onVisible?: () => void
  onHidden?: () => void
  onChange?: (state: 'visible' | 'hidden') => void
}

export function useAppVisibility(options: AppVisibilityOptions = {}) {
  const {
    autoPause = true,
    trackActivity = true,
    manageNotifications = true,
    updateTitle = true,
    onVisible,
    onHidden,
    onChange
  } = options

  // Internal state
  const hiddenAt = ref<Date | null>(null)
  const visibleAt = ref<Date | null>(null)
  const totalHiddenTime = ref(0)
  const sessionDuration = ref(0)
  const isAutoPaused = ref(false)

  // Management of pausable elements
  const pausableElements = ref<Array<{
    element: HTMLVideoElement | HTMLAudioElement
    wasPaused: boolean
  }>>([])

  // Base visibility functionality
  const visibility = useVisibility({
    visible: handleVisible,
    hidden: handleHidden,
    change: (state) => {
      onChange?.(state)

      if (trackActivity) {
        updateActivityMetrics(state)
      }
    }
  })

  // Computed properties
  const engagementScore = computed(() => {
    if (sessionDuration.value === 0) return 100
    const activeTime = sessionDuration.value - totalHiddenTime.value
    return Math.round((activeTime / sessionDuration.value) * 100)
  })

  const isEngaged = computed(() => engagementScore.value > 70)

  // Update activity metrics
  function updateActivityMetrics(state: 'visible' | 'hidden') {
    const now = new Date()

    if (state === 'hidden') {
      hiddenAt.value = now
    } else if (state === 'visible' && hiddenAt.value) {
      const hiddenDuration = now.getTime() - hiddenAt.value.getTime()
      totalHiddenTime.value += hiddenDuration
      visibleAt.value = now
      hiddenAt.value = null
    }
  }

  // Handler for when visible
  function handleVisible() {
    console.log('Application became visible')

    // Resume auto-paused media
    if (autoPause && isAutoPaused.value) {
      resumeMediaElements()
      isAutoPaused.value = false
    }

    // Restore title
    if (updateTitle) {
      restoreTitle()
    }

    // Custom callback
    onVisible?.()
  }

  // Handler for when hidden
  function handleHidden() {
    console.log('Application became hidden')

    // Auto-pause media elements
    if (autoPause) {
      pauseMediaElements()
      isAutoPaused.value = true
    }

    // Custom callback
    onHidden?.()
  }

  // Pause media elements
  function pauseMediaElements() {
    pausableElements.value = []

    const videos = document.querySelectorAll('video')
    const audios = document.querySelectorAll('audio')

    ;[...videos, ...audios].forEach(element => {
      if (!element.paused) {
        pausableElements.value.push({
          element,
          wasPaused: false
        })
        element.pause()
      }
    })
  }

  // Resume media elements
  function resumeMediaElements() {
    pausableElements.value.forEach(({ element, wasPaused }) => {
      if (!wasPaused) {
        element.play().catch(err => {
          console.warn('Failed to auto-resume media element:', err)
        })
      }
    })
    pausableElements.value = []
  }

  // Title management
  const originalTitle = ref('')

  function updateTitleWithNotification(count: number) {
    if (updateTitle) {
      if (count > 0) {
        document.title = `(${count}) ${originalTitle.value}`
      } else {
        document.title = originalTitle.value
      }
    }
  }

  function restoreTitle() {
    if (updateTitle && originalTitle.value) {
      document.title = originalTitle.value
    }
  }

  // Session time tracking
  let sessionInterval: number | null = null

  function startSessionTracking() {
    if (trackActivity) {
      sessionInterval = setInterval(() => {
        sessionDuration.value += 1000
      }, 1000)
    }
  }

  function stopSessionTracking() {
    if (sessionInterval) {
      clearInterval(sessionInterval)
      sessionInterval = null
    }
  }

  // Lifecycle management
  onMounted(() => {
    originalTitle.value = document.title
    if (trackActivity) {
      startSessionTracking()
    }
  })

  onBeforeUnmount(() => {
    stopSessionTracking()
  })

  // Public API
  return {
    // Basic state
    ...visibility,

    // Extended state
    isAutoPaused,
    hiddenAt,
    visibleAt,
    totalHiddenTime,
    sessionDuration,
    engagementScore,
    isEngaged,

    // Utilities
    updateTitleWithNotification,
    restoreTitle,
    pauseMediaElements,
    resumeMediaElements,

    // Metrics
    getActivityMetrics: () => ({
      sessionDuration: sessionDuration.value,
      totalHiddenTime: totalHiddenTime.value,
      engagementScore: engagementScore.value,
      isEngaged: isEngaged.value
    })
  }
}
```

### Practical Application Integration

```vue
<template>
  <div class="app-visibility-integration">
    <header class="app-header">
      <h1>Practical Page Visibility Integration</h1>
      <div class="header-stats">
        <span class="stat">
          <strong>Engagement:</strong> {{ appVisibility.engagementScore }}%
        </span>
        <span class="stat" :class="{ engaged: appVisibility.isEngaged }">
          {{ appVisibility.isEngaged ? '📈 Focused' : '📉 Distracted' }}
        </span>
      </div>
    </header>

    <!-- Dashboard -->
    <div class="dashboard">
      <div class="metric-card">
        <h3>Session Time</h3>
        <div class="metric-value">{{ formatDuration(appVisibility.sessionDuration) }}</div>
      </div>

      <div class="metric-card">
        <h3>Active Time</h3>
        <div class="metric-value">
          {{ formatDuration(appVisibility.sessionDuration - appVisibility.totalHiddenTime) }}
        </div>
      </div>

      <div class="metric-card">
        <h3>Hidden Time</h3>
        <div class="metric-value">{{ formatDuration(appVisibility.totalHiddenTime) }}</div>
      </div>

      <div class="metric-card">
        <h3>Current State</h3>
        <div class="metric-value" :class="`status-${appVisibility.state}`">
          {{ appVisibility.state === 'visible' ? 'Visible' : 'Hidden' }}
        </div>
      </div>
    </div>

    <!-- Media player -->
    <div class="media-section">
      <h2>Auto-Control Media Player</h2>
      <div class="media-controls">
        <video controls preload="metadata" width="100%" style="max-width: 600px;">
          <source src="https://www.w3schools.com/html/mov_bbb.mp4" type="video/mp4">
          Your browser does not support the video tag.
        </video>
        <audio controls preload="metadata" style="width: 100%; max-width: 600px;">
          <source src="https://www.w3schools.com/html/horse.ogg" type="audio/ogg">
          <source src="https://www.w3schools.com/html/horse.mp3" type="audio/mpeg">
          Your browser does not support the audio element.
        </audio>
      </div>
      <div class="media-info">
        <p>
          <strong>Auto Control:</strong>
          {{ appVisibility.isAutoPaused ? 'Paused' : 'Standby for Auto Control' }}
        </p>
        <p>
          <small>
            Video and audio are automatically paused when switching tabs,
            and automatically resumed when returning to the tab.
          </small>
        </p>
      </div>
    </div>

    <!-- Notification system -->
    <div class="notification-system">
      <h2>Notification System</h2>
      <div class="notification-controls">
        <button @click="addNotification" class="primary-btn">
          Add Notification
        </button>
        <button @click="clearAllNotifications" class="secondary-btn">
          Clear All
        </button>
      </div>

      <div class="notification-display">
        <p>Unread notifications: {{ unreadNotifications.length }}</p>
        <div class="notification-list">
          <div
            v-for="notification in notifications"
            :key="notification.id"
            class="notification"
            :class="{ unread: !notification.read }"
          >
            <div class="notification-content">
              <h4>{{ notification.title }}</h4>
              <p>{{ notification.message }}</p>
              <small>{{ new Date(notification.timestamp).toLocaleString() }}</small>
            </div>
            <button
              v-if="!notification.read"
              @click="markNotificationAsRead(notification.id)"
              class="read-btn"
            >
              Mark as Read
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Activity log -->
    <div class="activity-log">
      <h2>Activity Log</h2>
      <div class="log-entries">
        <div
          v-for="entry in activityLog"
          :key="entry.id"
          class="log-entry"
          :class="`log-${entry.type}`"
        >
          <span class="log-time">{{ new Date(entry.timestamp).toLocaleTimeString() }}</span>
          <span class="log-message">{{ entry.message }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useAppVisibility } from './composables/useAppVisibility'

// Notification management
interface Notification {
  id: string
  title: string
  message: string
  timestamp: number
  read: boolean
}

const notifications = ref<Notification[]>([])
let notificationIdCounter = 0

const unreadNotifications = computed(() =>
  notifications.value.filter(n => !n.read)
)

// Activity log
interface LogEntry {
  id: string
  type: 'visible' | 'hidden' | 'notification' | 'system'
  message: string
  timestamp: number
}

const activityLog = ref<LogEntry[]>([])
let logIdCounter = 0

// Application Visibility management
const appVisibility = useAppVisibility({
  autoPause: true,
  trackActivity: true,
  manageNotifications: true,
  updateTitle: true,
  onVisible: () => {
    addLogEntry('visible', 'Application became visible')

    // Update title
    updateDocumentTitle()
  },
  onHidden: () => {
    addLogEntry('hidden', 'Application became hidden')
  },
  onChange: (state) => {
    addLogEntry('system', `State changed to ${state}`)
  }
})

// Notification management functions
function addNotification() {
  const notification: Notification = {
    id: `notification-${++notificationIdCounter}`,
    title: `New Notification #${notificationIdCounter}`,
    message: `This notification was created at ${new Date().toLocaleTimeString()}.`,
    timestamp: Date.now(),
    read: false
  }

  notifications.value.unshift(notification)
  addLogEntry('notification', `New notification added: ${notification.title}`)

  // タイトルを更新
  updateDocumentTitle()
}

function markNotificationAsRead(id: string) {
  const notification = notifications.value.find(n => n.id === id)
  if (notification) {
    notification.read = true
    addLogEntry('notification', `Marked notification as read: ${notification.title}`)
    updateDocumentTitle()
  }
}

function clearAllNotifications() {
  const count = notifications.value.length
  notifications.value = []
  addLogEntry('system', `Cleared ${count} notifications`)
  updateDocumentTitle()
}

// Log management
function addLogEntry(type: LogEntry['type'], message: string) {
  const entry: LogEntry = {
    id: `log-${++logIdCounter}`,
    type,
    message,
    timestamp: Date.now()
  }

  activityLog.value.unshift(entry)

  // Keep logs to the latest 50 entries
  if (activityLog.value.length > 50) {
    activityLog.value = activityLog.value.slice(0, 50)
  }
}

// Utility functions
function formatDuration(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)

  if (hours > 0) {
    return `${hours}:${(minutes % 60).toString().padStart(2, '0')}:${(seconds % 60).toString().padStart(2, '0')}`
  }
  return `${minutes}:${(seconds % 60).toString().padStart(2, '0')}`
}

function updateDocumentTitle() {
  const unreadCount = unreadNotifications.value.length
  appVisibility.updateTitleWithNotification(unreadCount)
}

// Initialization
addLogEntry('system', 'Application initialized')
</script>

<style scoped>
.app-visibility-integration {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 10px;
}

.header-stats {
  display: flex;
  gap: 20px;
}

.stat {
  padding: 8px 12px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  font-size: 0.9em;
}

.stat.engaged {
  background: rgba(76, 175, 80, 0.3);
  border: 1px solid rgba(76, 175, 80, 0.5);
}

.dashboard {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.metric-card {
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  text-align: center;
}

.metric-card h3 {
  margin: 0 0 10px 0;
  color: #666;
  font-size: 0.9em;
  text-transform: uppercase;
}

.metric-value {
  font-size: 1.5em;
  font-weight: bold;
  color: #333;
}

.metric-value.status-visible {
  color: #4caf50;
}

.metric-value.status-hidden {
  color: #f44336;
}

.media-section,
.notification-system,
.activity-log {
  margin: 30px 0;
  padding: 25px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.media-controls {
  margin: 20px 0;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.media-info {
  padding: 15px;
  background: #f8f9fa;
  border-radius: 6px;
  border-left: 4px solid #007acc;
}

.notification-controls {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.primary-btn,
.secondary-btn {
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.primary-btn {
  background: #007acc;
  color: white;
}

.primary-btn:hover {
  background: #0056a3;
}

.secondary-btn {
  background: #6c757d;
  color: white;
}

.secondary-btn:hover {
  background: #545b62;
}

.notification-list {
  max-height: 300px;
  overflow-y: auto;
}

.notification {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 15px;
  margin: 10px 0;
  border: 1px solid #e9ecef;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.notification.unread {
  background: #fff3cd;
  border-color: #ffeaa7;
}

.notification-content {
  flex: 1;
}

.notification-content h4 {
  margin: 0 0 5px 0;
  color: #495057;
}

.notification-content p {
  margin: 0 0 5px 0;
  color: #6c757d;
}

.read-btn {
  padding: 6px 12px;
  border: 1px solid #28a745;
  background: white;
  color: #28a745;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8em;
  transition: all 0.3s ease;
}

.read-btn:hover {
  background: #28a745;
  color: white;
}

.log-entries {
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid #e9ecef;
  border-radius: 6px;
}

.log-entry {
  display: flex;
  align-items: center;
  padding: 10px 15px;
  border-bottom: 1px solid #f8f9fa;
  font-size: 0.9em;
}

.log-entry:last-child {
  border-bottom: none;
}

.log-time {
  width: 100px;
  color: #6c757d;
  font-family: monospace;
  margin-right: 15px;
}

.log-message {
  flex: 1;
}

.log-visible {
  background: #d4edda;
  color: #155724;
}

.log-hidden {
  background: #f8d7da;
  color: #721c24;
}

.log-notification {
  background: #d1ecf1;
  color: #0c5460;
}

.log-system {
  background: #e2e3e5;
  color: #383d41;
}
</style>
```

## API Specification

### `useVisibility(options?)`

Composable function for using the Page Visibility API in Vue.

```typescript
function useVisibility(options?: UseVisibilityOptions): UseVisibilityRef
```

**Parameters:**
- `options` (UseVisibilityOptions, optional): Callback configuration

**Return Value:**
- `UseVisibilityRef`: Reactive Visibility state

### `UseVisibilityOptions`

Visibility callback configuration options.

```typescript
interface UseVisibilityOptions {
  change?: VisibilityStateListener     // Callback for state changes
  visible?: VisibilityTypedCallback    // Callback when visible
  hidden?: VisibilityTypedCallback     // Callback when hidden
}
```

### `UseVisibilityRef`

Reactive Visibility state object.

```typescript
interface UseVisibilityRef {
  readonly state: VisibilityState      // Current state ('visible' | 'hidden')
  readonly visible: boolean            // Whether currently visible
  readonly hidden: boolean             // Whether currently hidden
}
```

### Type Definitions

```typescript
// Visibility state
type VisibilityState = 'visible' | 'hidden'

// State change callback
type VisibilityStateListener = (
  state: VisibilityState,
  event: Event
) => any

// State-specific callback
type VisibilityTypedCallback = (event: Event) => any

// Visibility stateオブジェクト
interface VisibilityState {
  state: VisibilityState
  visible: boolean
  hidden: boolean
}
```

## Usage Examples

### Basic State Monitoring

```typescript
import { useVisibility } from '@fastkit/vue-visibility'

const visibility = useVisibility()

// Current state
console.log(visibility.state)    // 'visible' | 'hidden'
console.log(visibility.visible)  // true | false
console.log(visibility.hidden)   // true | false
```

### Monitoring with Callbacks

```typescript
const visibility = useVisibility({
  change: (state, event) => {
    console.log('State change:', state)
    // Send to analytics, etc.
  },
  visible: (event) => {
    console.log('Became visible')
    // Resume video, timer, etc.
  },
  hidden: (event) => {
    console.log('Became hidden')
    // Pause video, timer, etc.
  }
})
```

### Practical Integration Examples

```typescript
// Application-wide Visibility management
const { visible, hidden } = useVisibility({
  visible: () => {
    // Resume background tasks
    resumeBackgroundTasks()

    // Show notifications
    showPendingNotifications()

    // Analytics
    analytics.track('app_focus')
  },
  hidden: () => {
    // Pause background tasks
    pauseBackgroundTasks()

    // Save data
    saveCurrentState()

    // Analytics
    analytics.track('app_blur')
  }
})
```

## Considerations

### ブラウザ対応

- **モダンブラウザ**: すべてのモダンブラウザでサポート
- **レガシーブラウザ**: 各種ベンダープレフィックスに自動対応
  - `webkitvisibilitychange` (WebKit)
  - `mozvisibilitychange` (Firefox)
  - `msvisibilitychange` (Internet Explorer)

### Page Visibility APIの制限

- **最小化**: ブラウザウィンドウの最小化で`hidden`になる
- **タブ切り替え**: 他のタブへの切り替えで`hidden`になる
- **アプリ切り替え**: 他のアプリケーションへの切り替えで`hidden`になる
- **スクリーンセーバー**: 一部の環境ではスクリーンセーバーで`hidden`になる

### パフォーマンス考慮事項

- イベントリスナーはコンポーネントのライフサイクルに連動して自動管理
- 複数のコンポーネントで使用しても単一のイベントリスナーを共有
- メモリリークを防ぐため適切なクリーンアップを実装

### SSR対応

- サーバーサイドでは常に`hidden`状態で初期化
- クライアントサイドでマウント後に実際の状態に更新
- ハイドレーション時の状態不整合を防ぐ設計

## License

MIT

## Related Packages

- [@fastkit/visibility](../visibility/README.md): コアVisibility機能
- [@fastkit/helpers](../helpers/README.md): 基本的なユーティリティ関数
