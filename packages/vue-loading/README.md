# @fastkit/vue-loading

Vue.jsアプリケーション用の美しく柔軟なローディング・進捗表示コンポーネントライブラリ。円形とリニア形式の進捗インジケーターを提供し、アクセシビリティ対応とカスタマイズ性を重視した設計になっています。

## 機能

- **円形進捗表示**: カスタマイズ可能な円形プログレスインジケーター
- **リニア進捗表示**: 水平線形のプログレスバー
- **アクセシビリティ対応**: WAI-ARIA準拠の実装
- **不定期アニメーション**: 進捗が不明な場合のアニメーション表示
- **カラーテーマ対応**: @fastkit/vue-color-schemeとの統合
- **TypeScript完全サポート**: 厳密な型定義
- **SSR対応**: サーバーサイドレンダリング環境での安全な動作
- **軽量設計**: 最小限の依存関係
- **高いカスタマイズ性**: サイズ、色、アニメーション等の調整可能

## インストール

```bash
npm install @fastkit/vue-loading
```

CSSも含める場合:

```typescript
import '@fastkit/vue-loading/vue-loading.css'
```

## 基本的な使用方法

### 円形進捗表示（VProgressCircular）

```vue
<template>
  <div>
    <h2>円形進捗表示の例</h2>
    
    <!-- 基本的な円形進捗 -->
    <div class="progress-section">
      <h3>基本例</h3>
      <VProgressCircular :value="progress" />
      <p>進捗: {{ progress }}%</p>
    </div>
    
    <!-- カスタムサイズと色 -->
    <div class="progress-section">
      <h3>カスタマイズ例</h3>
      <VProgressCircular 
        :value="progress" 
        :size="64"
        :width="4"
        color="primary"
      />
    </div>
    
    <!-- 不定期進捗 -->
    <div class="progress-section">
      <h3>不定期進捗</h3>
      <VProgressCircular indeterminate color="secondary" />
    </div>
    
    <!-- ボタン用スタイル -->
    <div class="progress-section">
      <h3>ボタン内ローディング</h3>
      <button class="loading-button" :disabled="isLoading">
        <VProgressCircular 
          v-if="isLoading"
          indeterminate 
          button
          :size="16"
        />
        {{ isLoading ? '処理中...' : '実行' }}
      </button>
    </div>
    
    <!-- テキスト付き -->
    <div class="progress-section">
      <h3>テキスト付き</h3>
      <VProgressCircular :value="progress" :size="100">
        <span class="progress-text">{{ Math.round(progress) }}%</span>
      </VProgressCircular>
    </div>
    
    <div class="controls">
      <button @click="startProgress">進捗開始</button>
      <button @click="resetProgress">リセット</button>
      <button @click="toggleLoading">ローディング切り替え</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { VProgressCircular } from '@fastkit/vue-loading'

const progress = ref(0)
const isLoading = ref(false)
let intervalId: number | null = null

const startProgress = () => {
  if (intervalId) clearInterval(intervalId)
  
  progress.value = 0
  intervalId = setInterval(() => {
    progress.value += 5
    if (progress.value >= 100) {
      clearInterval(intervalId!)
      intervalId = null
    }
  }, 200)
}

const resetProgress = () => {
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
  progress.value = 0
}

const toggleLoading = () => {
  isLoading.value = !isLoading.value
}

onUnmounted(() => {
  if (intervalId) clearInterval(intervalId)
})
</script>

<style scoped>
.progress-section {
  margin: 20px 0;
  padding: 16px;
  border: 1px solid #eee;
  border-radius: 8px;
}

.progress-text {
  font-size: 14px;
  font-weight: bold;
}

.loading-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border: none;
  background: #007acc;
  color: white;
  border-radius: 4px;
  cursor: pointer;
}

.loading-button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.controls {
  margin: 20px 0;
  display: flex;
  gap: 10px;
}

.controls button {
  padding: 8px 16px;
  border: 1px solid #007acc;
  background: white;
  color: #007acc;
  border-radius: 4px;
  cursor: pointer;
}

.controls button:hover {
  background: #007acc;
  color: white;
}
</style>
```

### リニア進捗表示（VProgressLinear）

```vue
<template>
  <div>
    <h2>リニア進捗表示の例</h2>
    
    <!-- 基本的なリニア進捗 -->
    <div class="progress-section">
      <h3>基本例</h3>
      <VProgressLinear :value="progress" active />
      <p>進捗: {{ progress }}%</p>
    </div>
    
    <!-- カスタムの高さと色 -->
    <div class="progress-section">
      <h3>カスタマイズ例</h3>
      <VProgressLinear 
        :value="progress" 
        :height="8"
        color="success"
        active
      />
    </div>
    
    <!-- 不定期進捗 -->
    <div class="progress-section">
      <h3>不定期進捗</h3>
      <VProgressLinear indeterminate active color="warning" />
    </div>
    
    <!-- バッファ付き進捗 -->
    <div class="progress-section">
      <h3>バッファ付き進捗</h3>
      <VProgressLinear 
        :value="progress"
        :buffer-value="bufferValue"
        active
        color="info"
      />
      <p>進捗: {{ progress }}% / バッファ: {{ bufferValue }}%</p>
    </div>
    
    <!-- クエリモード -->
    <div class="progress-section">
      <h3>クエリモード</h3>
      <VProgressLinear query active />
    </div>
    
    <!-- テキスト付き -->
    <div class="progress-section">
      <h3>テキスト付き</h3>
      <VProgressLinear :value="progress" active :height="24">
        <span class="progress-label">
          {{ fileName }} ({{ Math.round(progress) }}%)
        </span>
      </VProgressLinear>
    </div>
    
    <!-- ページトップローディング -->
    <div class="progress-section">
      <h3>ページトップローディング</h3>
      <div class="page-loading-demo">
        <VProgressLinear 
          :active="pageLoading"
          indeterminate
          color="primary"
          :height="3"
        />
        <div class="page-content">
          <h4>ページコンテンツ</h4>
          <p>ページの読み込み状態を上部に表示</p>
        </div>
      </div>
    </div>
    
    <div class="controls">
      <button @click="startProgress">進捗開始</button>
      <button @click="startBufferProgress">バッファ付き開始</button>
      <button @click="togglePageLoading">ページ読み込み切り替え</button>
      <button @click="resetProgress">リセット</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { VProgressLinear } from '@fastkit/vue-loading'

const progress = ref(0)
const bufferValue = ref(0)
const pageLoading = ref(false)
const fileName = ref('example-file.zip')

let progressInterval: number | null = null
let bufferInterval: number | null = null

const startProgress = () => {
  if (progressInterval) clearInterval(progressInterval)
  
  progress.value = 0
  progressInterval = setInterval(() => {
    progress.value += 2
    if (progress.value >= 100) {
      clearInterval(progressInterval!)
      progressInterval = null
    }
  }, 100)
}

const startBufferProgress = () => {
  if (progressInterval) clearInterval(progressInterval)
  if (bufferInterval) clearInterval(bufferInterval)
  
  progress.value = 0
  bufferValue.value = 0
  
  // バッファを先に進める
  bufferInterval = setInterval(() => {
    bufferValue.value += 5
    if (bufferValue.value >= 100) {
      clearInterval(bufferInterval!)
      bufferInterval = null
    }
  }, 50)
  
  // 少し遅れて実際の進捗を進める
  setTimeout(() => {
    progressInterval = setInterval(() => {
      progress.value += 3
      if (progress.value >= 100) {
        clearInterval(progressInterval!)
        progressInterval = null
      }
    }, 150)
  }, 500)
}

const togglePageLoading = () => {
  pageLoading.value = !pageLoading.value
}

const resetProgress = () => {
  if (progressInterval) {
    clearInterval(progressInterval)
    progressInterval = null
  }
  if (bufferInterval) {
    clearInterval(bufferInterval)
    bufferInterval = null
  }
  progress.value = 0
  bufferValue.value = 0
}

onUnmounted(() => {
  if (progressInterval) clearInterval(progressInterval)
  if (bufferInterval) clearInterval(bufferInterval)
})
</script>

<style scoped>
.progress-section {
  margin: 20px 0;
  padding: 16px;
  border: 1px solid #eee;
  border-radius: 8px;
}

.progress-label {
  font-size: 12px;
  font-weight: bold;
  line-height: 24px;
  text-align: center;
  display: block;
}

.page-loading-demo {
  position: relative;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}

.page-content {
  padding: 20px;
  background: #f9f9f9;
}

.controls {
  margin: 20px 0;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.controls button {
  padding: 8px 16px;
  border: 1px solid #007acc;
  background: white;
  color: #007acc;
  border-radius: 4px;
  cursor: pointer;
}

.controls button:hover {
  background: #007acc;
  color: white;
}
</style>
```

## 実用的な使用例

### ファイルアップロード進捗

```vue
<template>
  <div class="file-upload">
    <h3>ファイルアップロード</h3>
    
    <div class="upload-area">
      <input 
        ref="fileInput"
        type="file" 
        @change="handleFileSelect"
        multiple
        style="display: none"
      />
      <button @click="fileInput?.click()" :disabled="isUploading">
        ファイルを選択
      </button>
    </div>
    
    <div v-if="uploadQueue.length > 0" class="upload-queue">
      <h4>アップロード進捗</h4>
      
      <div 
        v-for="file in uploadQueue" 
        :key="file.id"
        class="upload-item"
      >
        <div class="file-info">
          <span class="file-name">{{ file.name }}</span>
          <span class="file-size">({{ formatFileSize(file.size) }})</span>
        </div>
        
        <div class="progress-container">
          <VProgressLinear
            :value="file.progress"
            :active="file.status === 'uploading'"
            :indeterminate="file.status === 'preparing'"
            :color="getProgressColor(file.status)"
            :height="6"
          />
          <div class="progress-info">
            <span class="status">{{ getStatusText(file.status) }}</span>
            <span v-if="file.status === 'uploading'" class="percentage">
              {{ Math.round(file.progress) }}%
            </span>
          </div>
        </div>
      </div>
      
      <!-- 全体進捗 -->
      <div class="overall-progress">
        <h5>全体進捗</h5>
        <VProgressLinear
          :value="overallProgress"
          :active="isUploading"
          color="primary"
          :height="8"
        >
          <span class="overall-text">
            {{ completedFiles }}/{{ uploadQueue.length }} 完了
          </span>
        </VProgressLinear>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { VProgressLinear } from '@fastkit/vue-loading'

interface UploadFile {
  id: string
  name: string
  size: number
  progress: number
  status: 'preparing' | 'uploading' | 'completed' | 'error'
}

const fileInput = ref<HTMLInputElement>()
const uploadQueue = ref<UploadFile[]>([])

const isUploading = computed(() => 
  uploadQueue.value.some(file => 
    file.status === 'preparing' || file.status === 'uploading'
  )
)

const completedFiles = computed(() =>
  uploadQueue.value.filter(file => file.status === 'completed').length
)

const overallProgress = computed(() => {
  if (uploadQueue.value.length === 0) return 0
  
  const totalProgress = uploadQueue.value.reduce((sum, file) => {
    if (file.status === 'completed') return sum + 100
    if (file.status === 'uploading') return sum + file.progress
    return sum
  }, 0)
  
  return totalProgress / uploadQueue.value.length
})

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement
  const files = Array.from(target.files || [])
  
  for (const file of files) {
    const uploadFile: UploadFile = {
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      progress: 0,
      status: 'preparing'
    }
    
    uploadQueue.value.push(uploadFile)
    uploadFile(uploadFile, file)
  }
  
  target.value = ''
}

const uploadFile = async (uploadFile: UploadFile, file: File) => {
  try {
    // 準備段階のシミュレーション
    await new Promise(resolve => setTimeout(resolve, 500))
    
    uploadFile.status = 'uploading'
    
    // アップロード進捗のシミュレーション
    const uploadPromise = new Promise<void>((resolve) => {
      const interval = setInterval(() => {
        uploadFile.progress += Math.random() * 10
        
        if (uploadFile.progress >= 100) {
          uploadFile.progress = 100
          uploadFile.status = 'completed'
          clearInterval(interval)
          resolve()
        }
      }, 200)
    })
    
    await uploadPromise
  } catch (error) {
    uploadFile.status = 'error'
    console.error('Upload failed:', error)
  }
}

const getProgressColor = (status: UploadFile['status']) => {
  switch (status) {
    case 'preparing': return 'info'
    case 'uploading': return 'primary'
    case 'completed': return 'success'
    case 'error': return 'error'
    default: return 'primary'
  }
}

const getStatusText = (status: UploadFile['status']) => {
  switch (status) {
    case 'preparing': return '準備中...'
    case 'uploading': return 'アップロード中'
    case 'completed': return '完了'
    case 'error': return 'エラー'
    default: return ''
  }
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}
</script>

<style scoped>
.file-upload {
  max-width: 600px;
  margin: 0 auto;
}

.upload-area {
  padding: 20px;
  border: 2px dashed #ccc;
  border-radius: 8px;
  text-align: center;
  margin: 20px 0;
}

.upload-area button {
  padding: 10px 20px;
  background: #007acc;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.upload-area button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.upload-queue {
  margin: 20px 0;
}

.upload-item {
  margin: 10px 0;
  padding: 12px;
  border: 1px solid #eee;
  border-radius: 4px;
}

.file-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.file-name {
  font-weight: bold;
}

.file-size {
  color: #666;
  font-size: 0.9em;
}

.progress-container {
  position: relative;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  font-size: 0.9em;
  margin-top: 4px;
}

.overall-progress {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #eee;
}

.overall-text {
  font-size: 12px;
  font-weight: bold;
  line-height: 8px;
  text-align: center;
  display: block;
}
</style>
```

### ダッシュボード統計表示

```vue
<template>
  <div class="dashboard">
    <h2>ダッシュボード統計</h2>
    
    <div class="stats-grid">
      <!-- CPU使用率 -->
      <div class="stat-card">
        <h3>CPU使用率</h3>
        <div class="stat-visual">
          <VProgressCircular 
            :value="stats.cpu"
            :size="80"
            :width="6"
            :color="getPerformanceColor(stats.cpu)"
          >
            <span class="stat-value">{{ Math.round(stats.cpu) }}%</span>
          </VProgressCircular>
        </div>
      </div>
      
      <!-- メモリ使用量 -->
      <div class="stat-card">
        <h3>メモリ使用量</h3>
        <div class="stat-visual">
          <VProgressCircular 
            :value="stats.memory"
            :size="80"
            :width="6"
            :color="getPerformanceColor(stats.memory)"
          >
            <span class="stat-value">{{ Math.round(stats.memory) }}%</span>
          </VProgressCircular>
        </div>
      </div>
      
      <!-- ディスク使用量 -->
      <div class="stat-card">
        <h3>ディスク使用量</h3>
        <div class="stat-visual">
          <VProgressCircular 
            :value="stats.disk"
            :size="80"
            :width="6"
            :color="getPerformanceColor(stats.disk)"
          >
            <span class="stat-value">{{ Math.round(stats.disk) }}%</span>
          </VProgressCircular>
        </div>
      </div>
      
      <!-- ネットワーク -->
      <div class="stat-card">
        <h3>ネットワーク帯域</h3>
        <div class="network-stats">
          <div class="bandwidth-item">
            <span class="label">アップロード</span>
            <VProgressLinear
              :value="stats.networkUp"
              active
              color="success"
              :height="8"
            />
            <span class="value">{{ formatBandwidth(stats.networkUp) }}</span>
          </div>
          <div class="bandwidth-item">
            <span class="label">ダウンロード</span>
            <VProgressLinear
              :value="stats.networkDown"
              active
              color="info"
              :height="8"
            />
            <span class="value">{{ formatBandwidth(stats.networkDown) }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- タスク進捗 -->
    <div class="tasks-section">
      <h3>実行中のタスク</h3>
      <div v-if="tasks.length === 0" class="no-tasks">
        実行中のタスクはありません
      </div>
      <div v-else class="task-list">
        <div 
          v-for="task in tasks" 
          :key="task.id"
          class="task-item"
        >
          <div class="task-header">
            <span class="task-name">{{ task.name }}</span>
            <span class="task-eta">残り時間: {{ formatTime(task.eta) }}</span>
          </div>
          <VProgressLinear
            :value="task.progress"
            active
            :color="task.priority === 'high' ? 'warning' : 'primary'"
            :height="6"
          >
            <span class="task-progress-text">
              {{ Math.round(task.progress) }}% 完了
            </span>
          </VProgressLinear>
        </div>
      </div>
    </div>
    
    <div class="controls">
      <button @click="refreshStats">統計を更新</button>
      <button @click="addRandomTask">ランダムタスク追加</button>
      <button @click="clearTasks">タスクをクリア</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { VProgressCircular, VProgressLinear } from '@fastkit/vue-loading'

interface SystemStats {
  cpu: number
  memory: number
  disk: number
  networkUp: number
  networkDown: number
}

interface Task {
  id: string
  name: string
  progress: number
  priority: 'normal' | 'high'
  eta: number // seconds
}

const stats = ref<SystemStats>({
  cpu: 45,
  memory: 67,
  disk: 34,
  networkUp: 23,
  networkDown: 78
})

const tasks = ref<Task[]>([])

let statsInterval: number | null = null
let tasksInterval: number | null = null

onMounted(() => {
  startStatsUpdates()
  startTaskUpdates()
})

onUnmounted(() => {
  if (statsInterval) clearInterval(statsInterval)
  if (tasksInterval) clearInterval(tasksInterval)
})

const startStatsUpdates = () => {
  statsInterval = setInterval(() => {
    // リアルなシステム統計のシミュレーション
    stats.value.cpu = Math.max(0, Math.min(100, 
      stats.value.cpu + (Math.random() - 0.5) * 10
    ))
    stats.value.memory = Math.max(0, Math.min(100, 
      stats.value.memory + (Math.random() - 0.5) * 5
    ))
    stats.value.disk = Math.max(0, Math.min(100, 
      stats.value.disk + (Math.random() - 0.5) * 2
    ))
    stats.value.networkUp = Math.max(0, Math.min(100, 
      stats.value.networkUp + (Math.random() - 0.5) * 15
    ))
    stats.value.networkDown = Math.max(0, Math.min(100, 
      stats.value.networkDown + (Math.random() - 0.5) * 20
    ))
  }, 2000)
}

const startTaskUpdates = () => {
  tasksInterval = setInterval(() => {
    tasks.value.forEach(task => {
      task.progress += Math.random() * 5
      task.eta = Math.max(0, task.eta - 2)
      
      if (task.progress >= 100) {
        const index = tasks.value.indexOf(task)
        tasks.value.splice(index, 1)
      }
    })
  }, 1000)
}

const getPerformanceColor = (value: number) => {
  if (value < 50) return 'success'
  if (value < 80) return 'warning'
  return 'error'
}

const formatBandwidth = (percentage: number) => {
  const mbps = (percentage / 100) * 100 // Max 100 Mbps
  return `${mbps.toFixed(1)} Mbps`
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const refreshStats = () => {
  stats.value = {
    cpu: Math.random() * 100,
    memory: Math.random() * 100,
    disk: Math.random() * 100,
    networkUp: Math.random() * 100,
    networkDown: Math.random() * 100
  }
}

const addRandomTask = () => {
  const taskNames = [
    'データベースバックアップ',
    'ログファイル圧縮',
    'キャッシュクリア',
    'システムアップデート',
    'セキュリティスキャン'
  ]
  
  const task: Task = {
    id: Math.random().toString(36).substr(2, 9),
    name: taskNames[Math.floor(Math.random() * taskNames.length)],
    progress: Math.random() * 30,
    priority: Math.random() > 0.7 ? 'high' : 'normal',
    eta: Math.random() * 300 + 60 // 1-5 minutes
  }
  
  tasks.value.push(task)
}

const clearTasks = () => {
  tasks.value = []
}
</script>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin: 20px 0;
}

.stat-card {
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
  text-align: center;
}

.stat-visual {
  margin: 20px 0;
}

.stat-value {
  font-size: 16px;
  font-weight: bold;
}

.network-stats {
  text-align: left;
}

.bandwidth-item {
  margin: 12px 0;
}

.bandwidth-item .label {
  display: block;
  font-size: 0.9em;
  margin-bottom: 4px;
}

.bandwidth-item .value {
  font-size: 0.8em;
  color: #666;
  margin-top: 4px;
  display: block;
}

.tasks-section {
  margin: 40px 0;
}

.no-tasks {
  text-align: center;
  color: #666;
  padding: 40px;
  border: 1px solid #eee;
  border-radius: 8px;
}

.task-list {
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
}

.task-item {
  padding: 16px;
  border-bottom: 1px solid #eee;
}

.task-item:last-child {
  border-bottom: none;
}

.task-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.task-name {
  font-weight: bold;
}

.task-eta {
  font-size: 0.9em;
  color: #666;
}

.task-progress-text {
  font-size: 10px;
  line-height: 6px;
  text-align: center;
  display: block;
}

.controls {
  margin: 20px 0;
  display: flex;
  gap: 10px;
}

.controls button {
  padding: 8px 16px;
  border: 1px solid #007acc;
  background: white;
  color: #007acc;
  border-radius: 4px;
  cursor: pointer;
}

.controls button:hover {
  background: #007acc;
  color: white;
}
</style>
```

## API仕様

### `VProgressCircular`

円形の進捗表示コンポーネント。

**Props:**
- `value` (number, optional): 進捗値（0-100）
- `size` (number | string, optional): サイズ（デフォルト: 32）
- `width` (number | string, optional): 線の太さ（デフォルト: 2）
- `color` (string, optional): 色テーマ
- `indeterminate` (boolean, optional): 不定期アニメーション
- `rotate` (number | string, optional): 回転角度（デフォルト: 0）
- `button` (boolean, optional): ボタン用スタイル

**Slots:**
- `default`: 中央に表示するコンテンツ

```vue
<VProgressCircular 
  :value="75"
  :size="64"
  :width="4"
  color="primary"
  :rotate="90"
>
  75%
</VProgressCircular>
```

### `VProgressLinear`

リニア（水平線形）の進捗表示コンポーネント。

**Props:**
- `value` (number, optional): 進捗値（0-100）
- `height` (number | string, optional): 高さ（デフォルト: 4）
- `color` (string, optional): 色テーマ
- `active` (boolean, optional): アクティブ状態
- `indeterminate` (boolean, optional): 不定期アニメーション
- `query` (boolean, optional): クエリモード
- `bufferValue` (number, optional): バッファ値（0-100、デフォルト: 100）
- `backgroundOpacity` (number, optional): 背景の透明度（デフォルト: 0.3）

**Slots:**
- `default`: プログレスバー内に表示するコンテンツ

```vue
<VProgressLinear
  :value="60"
  :buffer-value="80"
  :height="8"
  color="success"
  active
>
  <span>ダウンロード中...</span>
</VProgressLinear>
```

## カラーテーマ

@fastkit/vue-color-schemeとの統合により、以下のカラーテーマが利用可能です：

- `primary`: プライマリーカラー
- `secondary`: セカンダリーカラー
- `success`: 成功色（緑系）
- `warning`: 警告色（オレンジ系）
- `error`: エラー色（赤系）
- `info`: 情報色（青系）

## アクセシビリティ

両コンポーネントはWAI-ARIA仕様に準拠しています：

- `role="progressbar"`: 進捗バーとしての役割を明示
- `aria-valuemin="0"`: 最小値
- `aria-valuemax="100"`: 最大値
- `aria-valuenow`: 現在値（不定期の場合は未設定）

## 注意事項

### パフォーマンス考慮事項

- アニメーションはCSS transformsを使用して効率的に実装
- 大量の進捗インジケーターを同時表示する場合は、更新頻度に注意
- `indeterminate`モードは継続的なアニメーションを使用するため、不要な場合は無効化

### スタイルカスタマイズ

- CSS変数を使用してテーマのカスタマイズが可能
- SCSSファイルを直接インポートして詳細なカスタマイズも可能
- カラーテーマは@fastkit/vue-color-schemeの設定に従う

### ブラウザ対応

- モダンブラウザすべてでサポート
- Internet Explorer 11以降で動作
- CSS Flexboxとtransformsを使用

## ライセンス

MIT

## 関連パッケージ

- [@fastkit/vue-color-scheme](../vue-color-scheme/README.md): カラーテーマシステム
- [@fastkit/vue-utils](../vue-utils/README.md): Vue.jsユーティリティ関数
- [@fastkit/helpers](../helpers/README.md): 基本的なユーティリティ関数