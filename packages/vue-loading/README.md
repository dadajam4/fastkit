
# @fastkit/vue-loading

🌐 English | [日本語](https://github.com/dadajam4/fastkit/blob/main/packages/vue-loading/README-ja.md)

A beautiful and flexible loading and progress display component library for Vue.js applications. Provides circular and linear progress indicators with a design focused on accessibility and customizability.

## Features

- **Circular Progress Display**: Customizable circular progress indicators
- **Linear Progress Display**: Horizontal linear progress bars
- **Accessibility Support**: WAI-ARIA compliant implementation
- **Indeterminate Animation**: Animation display when progress is unknown
- **Color Theme Support**: Integration with @fastkit/vue-color-scheme
- **Full TypeScript Support**: Strict type definitions
- **SSR Support**: Safe operation in server-side rendering environments
- **Lightweight Design**: Minimal dependencies
- **High Customizability**: Adjustable size, color, animation, etc.

## Installation

```bash
npm install @fastkit/vue-loading
```

To include CSS:

```typescript
import '@fastkit/vue-loading/vue-loading.css'
```

## Basic Usage

### Circular Progress Display (VProgressCircular)

```vue
<template>
  <div>
    <h2>Circular Progress Display Examples</h2>

    <!-- Basic circular progress -->
    <div class="progress-section">
      <h3>Basic Example</h3>
      <VProgressCircular :value="progress" />
      <p>Progress: {{ progress }}%</p>
    </div>

    <!-- Custom size and color -->
    <div class="progress-section">
      <h3>Customization Example</h3>
      <VProgressCircular
        :value="progress"
        :size="64"
        :width="4"
        color="primary"
      />
    </div>

    <!-- Indeterminate progress -->
    <div class="progress-section">
      <h3>Indeterminate Progress</h3>
      <VProgressCircular indeterminate color="secondary" />
    </div>

    <!-- Button style -->
    <div class="progress-section">
      <h3>Button Loading</h3>
      <button class="loading-button" :disabled="isLoading">
        <VProgressCircular
          v-if="isLoading"
          indeterminate
          button
          :size="16"
        />
        {{ isLoading ? 'Processing...' : 'Execute' }}
      </button>
    </div>

    <!-- With text -->
    <div class="progress-section">
      <h3>With Text</h3>
      <VProgressCircular :value="progress" :size="100">
        <span class="progress-text">{{ Math.round(progress) }}%</span>
      </VProgressCircular>
    </div>

    <div class="controls">
      <button @click="startProgress">Start Progress</button>
      <button @click="resetProgress">Reset</button>
      <button @click="toggleLoading">Toggle Loading</button>
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

### Linear Progress Display (VProgressLinear)

```vue
<template>
  <div>
    <h2>Linear Progress Display Examples</h2>

    <!-- Basic linear progress -->
    <div class="progress-section">
      <h3>Basic Example</h3>
      <VProgressLinear :value="progress" active />
      <p>Progress: {{ progress }}%</p>
    </div>

    <!-- Custom height and color -->
    <div class="progress-section">
      <h3>Customization Example</h3>
      <VProgressLinear
        :value="progress"
        :height="8"
        color="success"
        active
      />
    </div>

    <!-- Indeterminate progress -->
    <div class="progress-section">
      <h3>Indeterminate Progress</h3>
      <VProgressLinear indeterminate active color="warning" />
    </div>

    <!-- Buffered progress -->
    <div class="progress-section">
      <h3>Buffered Progress</h3>
      <VProgressLinear
        :value="progress"
        :buffer-value="bufferValue"
        active
        color="info"
      />
      <p>Progress: {{ progress }}% / Buffer: {{ bufferValue }}%</p>
    </div>

    <!-- Query mode -->
    <div class="progress-section">
      <h3>Query Mode</h3>
      <VProgressLinear query active />
    </div>

    <!-- With text -->
    <div class="progress-section">
      <h3>With Text</h3>
      <VProgressLinear :value="progress" active :height="24">
        <span class="progress-label">
          {{ fileName }} ({{ Math.round(progress) }}%)
        </span>
      </VProgressLinear>
    </div>

    <!-- Page top loading -->
    <div class="progress-section">
      <h3>Page Top Loading</h3>
      <div class="page-loading-demo">
        <VProgressLinear
          :active="pageLoading"
          indeterminate
          color="primary"
          :height="3"
        />
        <div class="page-content">
          <h4>Page Content</h4>
          <p>Display page loading state at the top</p>
        </div>
      </div>
    </div>

    <div class="controls">
      <button @click="startProgress">Start Progress</button>
      <button @click="startBufferProgress">Start Buffered</button>
      <button @click="togglePageLoading">Toggle Page Loading</button>
      <button @click="resetProgress">Reset</button>
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

  // Advance buffer first
  bufferInterval = setInterval(() => {
    bufferValue.value += 5
    if (bufferValue.value >= 100) {
      clearInterval(bufferInterval!)
      bufferInterval = null
    }
  }, 50)

  // Advance actual progress with slight delay
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

## Practical Usage Examples

### File Upload Progress

```vue
<template>
  <div class="file-upload">
    <h3>File Upload</h3>

    <div class="upload-area">
      <input
        ref="fileInput"
        type="file"
        @change="handleFileSelect"
        multiple
        style="display: none"
      />
      <button @click="fileInput?.click()" :disabled="isUploading">
        Select Files
      </button>
    </div>

    <div v-if="uploadQueue.length > 0" class="upload-queue">
      <h4>Upload Progress</h4>

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

      <!-- Overall progress -->
      <div class="overall-progress">
        <h5>Overall Progress</h5>
        <VProgressLinear
          :value="overallProgress"
          :active="isUploading"
          color="primary"
          :height="8"
        >
          <span class="overall-text">
            {{ completedFiles }}/{{ uploadQueue.length }} Completed
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
    // Preparation stage simulation
    await new Promise(resolve => setTimeout(resolve, 500))

    uploadFile.status = 'uploading'

    // Upload progress simulation
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
    case 'preparing': return 'Preparing...'
    case 'uploading': return 'Uploading'
    case 'completed': return 'Completed'
    case 'error': return 'Error'
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

### Dashboard Statistics Display

```vue
<template>
  <div class="dashboard">
    <h2>Dashboard Statistics</h2>

    <div class="stats-grid">
      <!-- CPU Usage -->
      <div class="stat-card">
        <h3>CPU Usage</h3>
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

      <!-- Memory Usage -->
      <div class="stat-card">
        <h3>Memory Usage</h3>
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

      <!-- Disk Usage -->
      <div class="stat-card">
        <h3>Disk Usage</h3>
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

      <!-- Network -->
      <div class="stat-card">
        <h3>Network Bandwidth</h3>
        <div class="network-stats">
          <div class="bandwidth-item">
            <span class="label">Upload</span>
            <VProgressLinear
              :value="stats.networkUp"
              active
              color="success"
              :height="8"
            />
            <span class="value">{{ formatBandwidth(stats.networkUp) }}</span>
          </div>
          <div class="bandwidth-item">
            <span class="label">Download</span>
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

    <!-- Task Progress -->
    <div class="tasks-section">
      <h3>Running Tasks</h3>
      <div v-if="tasks.length === 0" class="no-tasks">
        No running tasks
      </div>
      <div v-else class="task-list">
        <div
          v-for="task in tasks"
          :key="task.id"
          class="task-item"
        >
          <div class="task-header">
            <span class="task-name">{{ task.name }}</span>
            <span class="task-eta">Time remaining: {{ formatTime(task.eta) }}</span>
          </div>
          <VProgressLinear
            :value="task.progress"
            active
            :color="task.priority === 'high' ? 'warning' : 'primary'"
            :height="6"
          >
            <span class="task-progress-text">
              {{ Math.round(task.progress) }}% Complete
            </span>
          </VProgressLinear>
        </div>
      </div>
    </div>

    <div class="controls">
      <button @click="refreshStats">Refresh Statistics</button>
      <button @click="addRandomTask">Add Random Task</button>
      <button @click="clearTasks">Clear Tasks</button>
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
    // Realistic system statistics simulation
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
    'Database Backup',
    'Log File Compression',
    'Cache Clear',
    'System Update',
    'Security Scan'
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

## API Specification

### `VProgressCircular`

Circular progress display component.

**Props:**
- `value` (number, optional): Progress value (0-100)
- `size` (number | string, optional): Size (default: 32)
- `width` (number | string, optional): Line thickness (default: 2)
- `color` (string, optional): Color theme
- `indeterminate` (boolean, optional): Indeterminate animation
- `rotate` (number | string, optional): Rotation angle (default: 0)
- `button` (boolean, optional): Button style

**Slots:**
- `default`: Content to display in the center

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

Linear (horizontal) progress display component.

**Props:**
- `value` (number, optional): Progress value (0-100)
- `height` (number | string, optional): Height (default: 4)
- `color` (string, optional): Color theme
- `active` (boolean, optional): Active state
- `indeterminate` (boolean, optional): Indeterminate animation
- `query` (boolean, optional): Query mode
- `bufferValue` (number, optional): Buffer value (0-100, default: 100)
- `backgroundOpacity` (number, optional): Background opacity (default: 0.3)

**Slots:**
- `default`: Content to display within the progress bar

```vue
<VProgressLinear
  :value="60"
  :buffer-value="80"
  :height="8"
  color="success"
  active
>
  <span>Downloading...</span>
</VProgressLinear>
```

## Color Themes

Through integration with @fastkit/vue-color-scheme, the following color themes are available:

- `primary`: Primary color
- `secondary`: Secondary color
- `success`: Success color (green-based)
- `warning`: Warning color (orange-based)
- `error`: Error color (red-based)
- `info`: Info color (blue-based)

## Accessibility

Both components comply with WAI-ARIA specifications:

- `role="progressbar"`: Clearly indicates role as progress bar
- `aria-valuemin="0"`: Minimum value
- `aria-valuemax="100"`: Maximum value
- `aria-valuenow`: Current value (not set for indeterminate cases)

## Considerations

### Performance Considerations

- Animations are efficiently implemented using CSS transforms
- When displaying many progress indicators simultaneously, pay attention to update frequency
- `indeterminate` mode uses continuous animations, so disable when unnecessary

### Style Customization

- Theme customization is possible using CSS variables
- Detailed customization is also possible by directly importing SCSS files
- Color themes follow @fastkit/vue-color-scheme settings

### Browser Support

- Supported in all modern browsers
- Works with Internet Explorer 11 and later
- Uses CSS Flexbox and transforms

## License

MIT

## Related Packages

- [@fastkit/vue-color-scheme](../vue-color-scheme/README.md): Color theme system
- [@fastkit/vue-utils](../vue-utils/README.md): Vue.js utility functions
- [@fastkit/helpers](../helpers/README.md): Basic utility functions
