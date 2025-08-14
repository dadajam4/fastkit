# @fastkit/vue-visibility

VueアプリケーションでPage Visibility APIを活用したブラウザタブの表示状態監視ライブラリ。ユーザーがタブを切り替えたり、別のアプリケーションに移動した際の表示状態変化をリアクティブに追跡できます。

## 機能

- **Page Visibility API統合**: 標準のPage Visibility APIをVueで使いやすく提供
- **リアクティブな状態管理**: Vueのリアクティブシステムとの完全統合
- **クロスブラウザ対応**: 主要ブラウザの各種プレフィックスに対応
- **TypeScript完全サポート**: 厳密な型定義による型安全性
- **軽量設計**: 最小限の依存関係とオーバーヘッド
- **SSR対応**: サーバーサイドレンダリング環境での安全な動作
- **自動クリーンアップ**: コンポーネントのライフサイクルに連動したリスナー管理
- **柔軟なコールバック**: 状態変化や特定の状態に対するコールバック

## インストール

```bash
npm install @fastkit/vue-visibility
```

## 基本的な使用方法

### シンプルな状態監視

```vue
<template>
  <div class="visibility-demo">
    <h2>Page Visibility状態監視</h2>
    
    <!-- 現在の状態表示 -->
    <div class="status-display">
      <h3>現在の状態</h3>
      <div class="status-item" :class="{ active: visibility.visible }">
        <span class="status-icon">👁️</span>
        <span class="status-label">表示中 (Visible)</span>
        <span class="status-value">{{ visibility.visible ? 'YES' : 'NO' }}</span>
      </div>
      <div class="status-item" :class="{ active: visibility.hidden }">
        <span class="status-icon">🙈</span>
        <span class="status-label">非表示 (Hidden)</span>
        <span class="status-value">{{ visibility.hidden ? 'YES' : 'NO' }}</span>
      </div>
    </div>
    
    <!-- 詳細情報 -->
    <div class="details">
      <h3>詳細情報</h3>
      <div class="detail-item">
        <strong>状態:</strong> {{ visibility.state }}
      </div>
      <div class="detail-item">
        <strong>最後の変更:</strong> {{ lastChangeTime }}
      </div>
      <div class="detail-item">
        <strong>変更回数:</strong> {{ changeCount }}
      </div>
    </div>
    
    <!-- 使用方法の説明 -->
    <div class="instructions">
      <h3>使用方法</h3>
      <ul>
        <li>他のタブに切り替えると「非表示」になります</li>
        <li>このタブに戻ると「表示中」になります</li>
        <li>ブラウザを最小化しても「非表示」になります</li>
        <li>他のアプリケーションをアクティブにしても「非表示」になります</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useVisibility } from '@fastkit/vue-visibility'

const lastChangeTime = ref('まだ変更されていません')
const changeCount = ref(0)

// Visibility状態を監視
const visibility = useVisibility({
  change: (state, event) => {
    console.log('状態が変更されました:', state, event)
    lastChangeTime.value = new Date().toLocaleTimeString()
    changeCount.value++
  },
  visible: (event) => {
    console.log('ページが表示されました:', event)
  },
  hidden: (event) => {
    console.log('ページが非表示になりました:', event)
  }
})

console.log('初期状態:', {
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

### 実用的なアプリケーション例

```vue
<template>
  <div class="practical-demo">
    <h2>実用的なPage Visibility活用例</h2>
    
    <!-- オンラインステータス -->
    <div class="online-status" :class="statusClasses">
      <div class="status-indicator"></div>
      <span class="status-text">{{ statusText }}</span>
    </div>
    
    <!-- 動画プレイヤー -->
    <div class="video-section">
      <h3>自動一時停止動画プレイヤー</h3>
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
          <p>ステータス: {{ videoStatus }}</p>
          <p>自動一時停止: {{ autoPaused ? 'ON' : 'OFF' }}</p>
        </div>
      </div>
    </div>
    
    <!-- タイマー -->
    <div class="timer-section">
      <h3>一時停止対応タイマー</h3>
      <div class="timer-display">
        <div class="timer-time">{{ formatTime(elapsedTime) }}</div>
        <div class="timer-controls">
          <button @click="startTimer" :disabled="timerRunning">開始</button>
          <button @click="stopTimer" :disabled="!timerRunning">停止</button>
          <button @click="resetTimer">リセット</button>
        </div>
        <div class="timer-info">
          <p>タイマー状態: {{ timerRunning ? '実行中' : '停止中' }}</p>
          <p>バックグラウンド一時停止: {{ backgroundPaused ? 'ON' : 'OFF' }}</p>
        </div>
      </div>
    </div>
    
    <!-- 通知システム -->
    <div class="notification-section">
      <h3>タブ復帰時通知</h3>
      <div class="notification-controls">
        <button @click="simulateNotification">通知を生成</button>
        <button @click="clearNotifications">通知をクリア</button>
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
            既読にする
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useVisibility } from '@fastkit/vue-visibility'

// 基本的なVisibility監視
const visibility = useVisibility({
  visible: handleTabVisible,
  hidden: handleTabHidden,
  change: handleVisibilityChange
})

// オンラインステータス
const statusClasses = computed(() => ({
  'status-online': visibility.visible,
  'status-offline': visibility.hidden
}))

const statusText = computed(() => 
  visibility.visible ? 'オンライン（アクティブ）' : 'オフライン（非アクティブ）'
)

// 動画プレイヤー
const videoRef = ref<HTMLVideoElement>()
const videoSrc = ref('https://www.w3schools.com/html/mov_bbb.mp4')
const videoStatus = ref('停止中')
const autoPaused = ref(false)

const handleVideoPlay = () => {
  videoStatus.value = '再生中'
  autoPaused.value = false
}

const handleVideoPause = () => {
  videoStatus.value = '一時停止中'
}

// タイマー機能
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

// 通知システム
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
    title: `新着通知 #${notificationCount}`,
    message: `これは ${new Date().toLocaleTimeString()} に生成された通知です。`,
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

// Visibilityイベントハンドラー
function handleTabVisible() {
  console.log('タブが表示されました')
  
  // タイマーの再開
  if (timerRunning.value && backgroundPaused.value) {
    backgroundPaused.value = false
    console.log('タイマーを再開しました')
  }
  
  // 未読通知があればタイトルで通知
  const unreadCount = notifications.value.filter(n => !n.read).length
  if (unreadCount > 0) {
    // ブラウザタイトルに未読数を表示
    document.title = `(${unreadCount}) Vue Visibility Demo`
  } else {
    document.title = 'Vue Visibility Demo'
  }
}

function handleTabHidden() {
  console.log('タブが非表示になりました')
  
  // 動画の自動一時停止
  if (videoRef.value && !videoRef.value.paused) {
    videoRef.value.pause()
    autoPaused.value = true
    console.log('動画を自動一時停止しました')
  }
  
  // タイマーの一時停止
  if (timerRunning.value) {
    backgroundPaused.value = true
    console.log('タイマーを一時停止しました')
  }
}

function handleVisibilityChange(state: string) {
  console.log('Visibility状態が変更されました:', state)
  
  // アナリティクスへの送信（実際の実装では）
  // analytics.track('page_visibility_change', { state })
}

// コンポーネントマウント時の初期化
onMounted(() => {
  console.log('コンポーネントがマウントされました')
  console.log('初期Visibility状態:', visibility.state)
})
</script>

<style scoped>
.practical-demo {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

/* オンラインステータス */
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

/* 動画プレイヤー */
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

/* タイマー */
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

/* 通知システム */
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

## 高度な使用例

### カスタムフック実装

```typescript
// composables/useAppVisibility.ts
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useVisibility } from '@fastkit/vue-visibility'

export interface AppVisibilityOptions {
  /**
   * バックグラウンド時の自動一時停止機能
   */
  autoPause?: boolean
  
  /**
   * アクティビティ追跡
   */
  trackActivity?: boolean
  
  /**
   * 通知管理
   */
  manageNotifications?: boolean
  
  /**
   * タイトル更新
   */
  updateTitle?: boolean
  
  /**
   * カスタムコールバック
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

  // 内部状態
  const hiddenAt = ref<Date | null>(null)
  const visibleAt = ref<Date | null>(null)
  const totalHiddenTime = ref(0)
  const sessionDuration = ref(0)
  const isAutoPaused = ref(false)
  
  // 一時停止可能な要素の管理
  const pausableElements = ref<Array<{
    element: HTMLVideoElement | HTMLAudioElement
    wasPaused: boolean
  }>>([])

  // ベースのvisibility機能
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

  // 計算プロパティ
  const engagementScore = computed(() => {
    if (sessionDuration.value === 0) return 100
    const activeTime = sessionDuration.value - totalHiddenTime.value
    return Math.round((activeTime / sessionDuration.value) * 100)
  })

  const isEngaged = computed(() => engagementScore.value > 70)

  // アクティビティメトリクス更新
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

  // 表示時のハンドラー
  function handleVisible() {
    console.log('アプリケーションが表示されました')
    
    // 自動一時停止されたメディアを再開
    if (autoPause && isAutoPaused.value) {
      resumeMediaElements()
      isAutoPaused.value = false
    }
    
    // タイトル復元
    if (updateTitle) {
      restoreTitle()
    }
    
    // カスタムコールバック
    onVisible?.()
  }

  // 非表示時のハンドラー
  function handleHidden() {
    console.log('アプリケーションが非表示になりました')
    
    // メディア要素の自動一時停止
    if (autoPause) {
      pauseMediaElements()
      isAutoPaused.value = true
    }
    
    // カスタムコールバック
    onHidden?.()
  }

  // メディア要素の一時停止
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

  // メディア要素の再開
  function resumeMediaElements() {
    pausableElements.value.forEach(({ element, wasPaused }) => {
      if (!wasPaused) {
        element.play().catch(err => {
          console.warn('メディア要素の自動再生に失敗:', err)
        })
      }
    })
    pausableElements.value = []
  }

  // タイトル管理
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

  // セッション時間の追跡
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

  // ライフサイクル管理
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
    // 基本状態
    ...visibility,
    
    // 拡張状態
    isAutoPaused,
    hiddenAt,
    visibleAt,
    totalHiddenTime,
    sessionDuration,
    engagementScore,
    isEngaged,
    
    // ユーティリティ
    updateTitleWithNotification,
    restoreTitle,
    pauseMediaElements,
    resumeMediaElements,
    
    // メトリクス
    getActivityMetrics: () => ({
      sessionDuration: sessionDuration.value,
      totalHiddenTime: totalHiddenTime.value,
      engagementScore: engagementScore.value,
      isEngaged: isEngaged.value
    })
  }
}
```

### 実践的なアプリケーション統合

```vue
<template>
  <div class="app-visibility-integration">
    <header class="app-header">
      <h1>実践的なPage Visibility統合</h1>
      <div class="header-stats">
        <span class="stat">
          <strong>エンゲージメント:</strong> {{ appVisibility.engagementScore }}%
        </span>
        <span class="stat" :class="{ engaged: appVisibility.isEngaged }">
          {{ appVisibility.isEngaged ? '📈 集中中' : '📉 散漫' }}
        </span>
      </div>
    </header>

    <!-- ダッシュボード -->
    <div class="dashboard">
      <div class="metric-card">
        <h3>セッション時間</h3>
        <div class="metric-value">{{ formatDuration(appVisibility.sessionDuration) }}</div>
      </div>
      
      <div class="metric-card">
        <h3>アクティブ時間</h3>
        <div class="metric-value">
          {{ formatDuration(appVisibility.sessionDuration - appVisibility.totalHiddenTime) }}
        </div>
      </div>
      
      <div class="metric-card">
        <h3>非表示時間</h3>
        <div class="metric-value">{{ formatDuration(appVisibility.totalHiddenTime) }}</div>
      </div>
      
      <div class="metric-card">
        <h3>現在の状態</h3>
        <div class="metric-value" :class="`status-${appVisibility.state}`">
          {{ appVisibility.state === 'visible' ? '表示中' : '非表示' }}
        </div>
      </div>
    </div>

    <!-- メディアプレイヤー -->
    <div class="media-section">
      <h2>自動制御メディアプレイヤー</h2>
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
          <strong>自動制御:</strong> 
          {{ appVisibility.isAutoPaused ? '一時停止中' : '自動制御待機中' }}
        </p>
        <p>
          <small>
            タブを切り替えると動画・音声が自動で一時停止され、
            タブに戻ると自動で再開されます。
          </small>
        </p>
      </div>
    </div>

    <!-- 通知システム -->
    <div class="notification-system">
      <h2>通知システム</h2>
      <div class="notification-controls">
        <button @click="addNotification" class="primary-btn">
          通知を追加
        </button>
        <button @click="clearAllNotifications" class="secondary-btn">
          全てクリア
        </button>
      </div>
      
      <div class="notification-display">
        <p>未読通知: {{ unreadNotifications.length }}件</p>
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
              既読
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- アクティビティログ -->
    <div class="activity-log">
      <h2>アクティビティログ</h2>
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

// 通知管理
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

// アクティビティログ
interface LogEntry {
  id: string
  type: 'visible' | 'hidden' | 'notification' | 'system'
  message: string
  timestamp: number
}

const activityLog = ref<LogEntry[]>([])
let logIdCounter = 0

// アプリケーションのVisibility管理
const appVisibility = useAppVisibility({
  autoPause: true,
  trackActivity: true,
  manageNotifications: true,
  updateTitle: true,
  onVisible: () => {
    addLogEntry('visible', 'アプリケーションが表示状態になりました')
    
    // タイトルを更新
    updateDocumentTitle()
  },
  onHidden: () => {
    addLogEntry('hidden', 'アプリケーションが非表示状態になりました')
  },
  onChange: (state) => {
    addLogEntry('system', `状態が ${state} に変更されました`)
  }
})

// 通知管理関数
function addNotification() {
  const notification: Notification = {
    id: `notification-${++notificationIdCounter}`,
    title: `新着通知 #${notificationIdCounter}`,
    message: `これは ${new Date().toLocaleTimeString()} に作成された通知です。`,
    timestamp: Date.now(),
    read: false
  }
  
  notifications.value.unshift(notification)
  addLogEntry('notification', `新しい通知が追加されました: ${notification.title}`)
  
  // タイトルを更新
  updateDocumentTitle()
}

function markNotificationAsRead(id: string) {
  const notification = notifications.value.find(n => n.id === id)
  if (notification) {
    notification.read = true
    addLogEntry('notification', `通知を既読にしました: ${notification.title}`)
    updateDocumentTitle()
  }
}

function clearAllNotifications() {
  const count = notifications.value.length
  notifications.value = []
  addLogEntry('system', `${count}件の通知をクリアしました`)
  updateDocumentTitle()
}

// ログ管理
function addLogEntry(type: LogEntry['type'], message: string) {
  const entry: LogEntry = {
    id: `log-${++logIdCounter}`,
    type,
    message,
    timestamp: Date.now()
  }
  
  activityLog.value.unshift(entry)
  
  // ログは最新50件まで
  if (activityLog.value.length > 50) {
    activityLog.value = activityLog.value.slice(0, 50)
  }
}

// ユーティリティ関数
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

// 初期化
addLogEntry('system', 'アプリケーションが初期化されました')
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

## API仕様

### `useVisibility(options?)`

Page Visibility APIをVueで使用するためのComposable関数。

```typescript
function useVisibility(options?: UseVisibilityOptions): UseVisibilityRef
```

**パラメータ:**
- `options` (UseVisibilityOptions, optional): コールバック設定

**戻り値:**
- `UseVisibilityRef`: リアクティブなVisibility状態

### `UseVisibilityOptions`

Visibilityコールバック設定オプション。

```typescript
interface UseVisibilityOptions {
  change?: VisibilityStateListener     // 状態変化時のコールバック
  visible?: VisibilityTypedCallback    // 表示時のコールバック
  hidden?: VisibilityTypedCallback     // 非表示時のコールバック
}
```

### `UseVisibilityRef`

リアクティブなVisibility状態オブジェクト。

```typescript
interface UseVisibilityRef {
  readonly state: VisibilityState      // 現在の状態 ('visible' | 'hidden')
  readonly visible: boolean            // 表示中かどうか
  readonly hidden: boolean             // 非表示かどうか
}
```

### 型定義

```typescript
// Visibility状態
type VisibilityState = 'visible' | 'hidden'

// 状態変化コールバック
type VisibilityStateListener = (
  state: VisibilityState,
  event: Event
) => any

// 状態固有コールバック
type VisibilityTypedCallback = (event: Event) => any

// Visibility状態オブジェクト
interface VisibilityState {
  state: VisibilityState
  visible: boolean
  hidden: boolean
}
```

## 使用例

### 基本的な状態監視

```typescript
import { useVisibility } from '@fastkit/vue-visibility'

const visibility = useVisibility()

// 現在の状態
console.log(visibility.state)    // 'visible' | 'hidden'
console.log(visibility.visible)  // true | false
console.log(visibility.hidden)   // true | false
```

### コールバック付き監視

```typescript
const visibility = useVisibility({
  change: (state, event) => {
    console.log('状態変化:', state)
    // アナリティクスへの送信など
  },
  visible: (event) => {
    console.log('表示されました')
    // 動画の再開、タイマーの再開など
  },
  hidden: (event) => {
    console.log('非表示になりました')
    // 動画の一時停止、タイマーの一時停止など
  }
})
```

### 実用的な統合例

```typescript
// アプリケーション全体でのVisibility管理
const { visible, hidden } = useVisibility({
  visible: () => {
    // バックグラウンドタスクの再開
    resumeBackgroundTasks()
    
    // 通知の表示
    showPendingNotifications()
    
    // アナリティクス
    analytics.track('app_focus')
  },
  hidden: () => {
    // バックグラウンドタスクの一時停止
    pauseBackgroundTasks()
    
    // データの保存
    saveCurrentState()
    
    // アナリティクス
    analytics.track('app_blur')
  }
})
```

## 注意事項

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

## ライセンス

MIT

## 関連パッケージ

- [@fastkit/visibility](../visibility/README.md): コアVisibility機能
- [@fastkit/helpers](../helpers/README.md): 基本的なユーティリティ関数