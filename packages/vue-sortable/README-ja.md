# @fastkit/vue-sortable

🌐 [English](https://github.com/dadajam4/fastkit/blob/main/packages/vue-sortable/README.md) | 日本語

Vue.jsアプリケーションでドラッグ＆ドロップによる要素並び替え機能を提供するライブラリ。SortableJSのVue統合実装で、コンポーネント、ディレクティブ、Composable APIの3つの使用方法をサポートします。

## 機能

- **ドラッグ＆ドロップ並び替え**: 直感的なマウス・タッチ操作による要素順序変更
- **3つの使用方法**: コンポーネント、ディレクティブ、Composable APIから選択可能
- **マルチドラッグ対応**: 複数要素の同時選択・移動
- **グループ間移動**: 異なるSortableリスト間での要素移動
- **更新前ガード機能**: 並び替え前の検証・キャンセル処理
- **アニメーション対応**: スムーズな並び替えアニメーション
- **TypeScript完全サポート**: 厳密な型定義による型安全性
- **Vue 3 Composition API**: リアクティブシステムとの完全統合
- **SSR対応**: サーバーサイドレンダリング環境での安全な動作
- **カスタマイズ可能**: SortableJSの全オプションに対応

## インストール

```bash
npm install @fastkit/vue-sortable
```

## 基本的な使用方法

### コンポーネントによる使用

```vue
<template>
  <div>
    <h2>タスクリスト</h2>

    <Sortable
      v-model="tasks"
      item-key="id"
      :animation="200"
    >
      <template #wrapper="{ children, attrs }">
        <ul v-bind="attrs" class="task-list">
          <component :is="children" />
        </ul>
      </template>

      <template #item="{ data, attrs }">
        <li v-bind="attrs" class="task-item">
          <div class="task-content">
            <span class="task-handle">≡</span>
            <div class="task-info">
              <h4>{{ data.title }}</h4>
              <p>{{ data.description }}</p>
              <span class="task-priority" :class="`priority-${data.priority}`">
                {{ getPriorityLabel(data.priority) }}
              </span>
            </div>
            <div class="task-actions">
              <button @click="editTask(data)" class="edit-button">編集</button>
              <button @click="deleteTask(data.id)" class="delete-button">削除</button>
            </div>
          </div>
        </li>
      </template>
    </Sortable>

    <div class="add-task">
      <button @click="addTask" class="add-button">+ 新しいタスクを追加</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Sortable } from '@fastkit/vue-sortable'

interface Task {
  id: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  completed: boolean
}

const tasks = ref<Task[]>([
  {
    id: '1',
    title: 'プロジェクト企画書作成',
    description: '新プロジェクトの企画書を作成する',
    priority: 'high',
    completed: false
  },
  {
    id: '2',
    title: 'ミーティング資料準備',
    description: '来週のミーティング用資料を準備する',
    priority: 'medium',
    completed: false
  },
  {
    id: '3',
    title: 'バグ修正',
    description: '報告されたバグを調査・修正する',
    priority: 'high',
    completed: false
  },
  {
    id: '4',
    title: 'ドキュメント更新',
    description: 'APIドキュメントを最新版に更新する',
    priority: 'low',
    completed: false
  }
])

const getPriorityLabel = (priority: Task['priority']) => {
  const labels = {
    low: '低',
    medium: '中',
    high: '高'
  }
  return labels[priority]
}

const addTask = () => {
  const newTask: Task = {
    id: Date.now().toString(),
    title: '新しいタスク',
    description: 'タスクの説明を入力してください',
    priority: 'medium',
    completed: false
  }
  tasks.value.push(newTask)
}

const editTask = (task: Task) => {
  console.log('編集:', task)
  // 編集処理を実装
}

const deleteTask = (taskId: string) => {
  const index = tasks.value.findIndex(task => task.id === taskId)
  if (index !== -1) {
    tasks.value.splice(index, 1)
  }
}
</script>

<style>
.task-list {
  list-style: none;
  padding: 0;
  margin: 0;
  background: #f8f9fa;
  border-radius: 8px;
  min-height: 100px;
}

.task-item {
  margin: 8px;
  background: white;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.task-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.task-content {
  display: flex;
  align-items: center;
  padding: 15px;
  gap: 15px;
}

.task-handle {
  color: #6c757d;
  cursor: grab;
  font-size: 18px;
  user-select: none;
}

.task-handle:active {
  cursor: grabbing;
}

.task-info {
  flex: 1;
}

.task-info h4 {
  margin: 0 0 5px 0;
  color: #495057;
  font-size: 16px;
}

.task-info p {
  margin: 0 0 8px 0;
  color: #6c757d;
  font-size: 14px;
}

.task-priority {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.priority-low {
  background: #d4edda;
  color: #155724;
}

.priority-medium {
  background: #fff3cd;
  color: #856404;
}

.priority-high {
  background: #f8d7da;
  color: #721c24;
}

.task-actions {
  display: flex;
  gap: 8px;
}

.edit-button,
.delete-button {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.2s ease;
}

.edit-button {
  background: #007bff;
  color: white;
}

.edit-button:hover {
  background: #0056b3;
}

.delete-button {
  background: #dc3545;
  color: white;
}

.delete-button:hover {
  background: #c82333;
}

.add-task {
  margin-top: 20px;
  text-align: center;
}

.add-button {
  padding: 12px 24px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s ease;
}

.add-button:hover {
  background: #1e7e34;
}
</style>
```

### ディレクティブによる使用

```vue
<template>
  <div>
    <h2>画像ギャラリー並び替え</h2>

    <div
      v-sortable="{
        animation: 300,
        ghostClass: 'sortable-ghost',
        chosenClass: 'sortable-chosen',
        dragClass: 'sortable-drag',
        onEnd: handleSortEnd
      }"
      class="image-gallery"
    >
      <div
        v-for="(image, index) in images"
        :key="image.id"
        :data-sortable-key="image.id"
        class="image-item"
      >
        <img :src="image.url" :alt="image.title">
        <div class="image-overlay">
          <h4>{{ image.title }}</h4>
          <p>{{ image.description }}</p>
          <div class="image-actions">
            <button @click="editImage(index)" class="action-button edit">
              編集
            </button>
            <button @click="deleteImage(index)" class="action-button delete">
              削除
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="gallery-controls">
      <button @click="addImage" class="control-button">
        + 画像を追加
      </button>
      <button @click="resetOrder" class="control-button">
        順序をリセット
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { SortableEvent } from '@fastkit/vue-sortable'

interface ImageItem {
  id: string
  title: string
  description: string
  url: string
}

const images = ref<ImageItem[]>([
  {
    id: '1',
    title: '美しい夕日',
    description: '海に沈む美しい夕日の風景',
    url: 'https://picsum.photos/300/200?random=1'
  },
  {
    id: '2',
    title: '山の風景',
    description: '雄大な山々の景色',
    url: 'https://picsum.photos/300/200?random=2'
  },
  {
    id: '3',
    title: '都市の夜景',
    description: 'きらめく都市の夜景',
    url: 'https://picsum.photos/300/200?random=3'
  },
  {
    id: '4',
    title: '自然の緑',
    description: '生き生きとした緑の自然',
    url: 'https://picsum.photos/300/200?random=4'
  }
])

const originalOrder = [...images.value]

const handleSortEnd = (event: SortableEvent) => {
  const { oldIndex, newIndex } = event

  if (oldIndex !== undefined && newIndex !== undefined && oldIndex !== newIndex) {
    const item = images.value.splice(oldIndex, 1)[0]
    images.value.splice(newIndex, 0, item)

    console.log(`画像を ${oldIndex} から ${newIndex} に移動しました`)
  }
}

const addImage = () => {
  const newImage: ImageItem = {
    id: Date.now().toString(),
    title: '新しい画像',
    description: '追加された画像',
    url: `https://picsum.photos/300/200?random=${Date.now()}`
  }
  images.value.push(newImage)
}

const editImage = (index: number) => {
  console.log('編集:', images.value[index])
  // 編集処理を実装
}

const deleteImage = (index: number) => {
  images.value.splice(index, 1)
}

const resetOrder = () => {
  images.value = [...originalOrder]
}
</script>

<style>
.image-gallery {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 8px;
  min-height: 200px;
}

.image-item {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  cursor: move;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.image-item:hover {
  transform: scale(1.02);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.image-item img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
}

.image-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  color: white;
  padding: 20px;
  transform: translateY(100%);
  transition: transform 0.3s ease;
}

.image-item:hover .image-overlay {
  transform: translateY(0);
}

.image-overlay h4 {
  margin: 0 0 5px 0;
  font-size: 16px;
}

.image-overlay p {
  margin: 0 0 10px 0;
  font-size: 14px;
  opacity: 0.9;
}

.image-actions {
  display: flex;
  gap: 8px;
}

.action-button {
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  transition: background-color 0.2s ease;
}

.action-button.edit {
  background: #007bff;
  color: white;
}

.action-button.edit:hover {
  background: #0056b3;
}

.action-button.delete {
  background: #dc3545;
  color: white;
}

.action-button.delete:hover {
  background: #c82333;
}

.gallery-controls {
  margin-top: 20px;
  display: flex;
  gap: 10px;
  justify-content: center;
}

.control-button {
  padding: 10px 20px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s ease;
}

.control-button:hover {
  background: #545b62;
}

/* SortableJSスタイル */
.sortable-ghost {
  opacity: 0.4;
}

.sortable-chosen {
  transform: scale(1.05);
}

.sortable-drag {
  transform: rotate(5deg);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}
</style>
```

### Composable APIによる使用

```vue
<template>
  <div>
    <h2>グループ間でのタスク移動</h2>

    <div class="kanban-board">
      <!-- TODO列 -->
      <div class="kanban-column">
        <h3 class="column-header todo">TODO</h3>
        <div
          v-sortable="todoSortable.directiveValue"
          v-bind="todoSortable.wrapperAttrs"
          class="task-list"
        >
          <div
            v-for="item in todoSortable.items"
            :key="item.key"
            v-bind="item.attrs"
            class="kanban-task"
            :class="{ selected: item.selected }"
          >
            <div class="task-header">
              <span class="task-id">#{{ item.data.id }}</span>
              <button @click="item.select()" class="select-button">
                {{ item.selected ? '✓' : '○' }}
              </button>
            </div>
            <h4>{{ item.data.title }}</h4>
            <p>{{ item.data.description }}</p>
            <div class="task-meta">
              <span class="assignee">{{ item.data.assignee }}</span>
              <span class="estimate">{{ item.data.estimate }}h</span>
            </div>
          </div>
        </div>
      </div>

      <!-- DOING列 -->
      <div class="kanban-column">
        <h3 class="column-header doing">DOING</h3>
        <div
          v-sortable="doingSortable.directiveValue"
          v-bind="doingSortable.wrapperAttrs"
          class="task-list"
        >
          <div
            v-for="item in doingSortable.items"
            :key="item.key"
            v-bind="item.attrs"
            class="kanban-task"
            :class="{ selected: item.selected }"
          >
            <div class="task-header">
              <span class="task-id">#{{ item.data.id }}</span>
              <button @click="item.select()" class="select-button">
                {{ item.selected ? '✓' : '○' }}
              </button>
            </div>
            <h4>{{ item.data.title }}</h4>
            <p>{{ item.data.description }}</p>
            <div class="task-meta">
              <span class="assignee">{{ item.data.assignee }}</span>
              <span class="estimate">{{ item.data.estimate }}h</span>
            </div>
          </div>
        </div>
      </div>

      <!-- DONE列 -->
      <div class="kanban-column">
        <h3 class="column-header done">DONE</h3>
        <div
          v-sortable="doneSortable.directiveValue"
          v-bind="doneSortable.wrapperAttrs"
          class="task-list"
        >
          <div
            v-for="item in doneSortable.items"
            :key="item.key"
            v-bind="item.attrs"
            class="kanban-task"
            :class="{ selected: item.selected }"
          >
            <div class="task-header">
              <span class="task-id">#{{ item.data.id }}</span>
              <button @click="item.select()" class="select-button">
                {{ item.selected ? '✓' : '○' }}
              </button>
            </div>
            <h4>{{ item.data.title }}</h4>
            <p>{{ item.data.description }}</p>
            <div class="task-meta">
              <span class="assignee">{{ item.data.assignee }}</span>
              <span class="estimate">{{ item.data.estimate }}h</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="board-actions">
      <button @click="addTask" class="action-button">
        + 新しいタスクを追加
      </button>
      <button @click="showStats" class="action-button">
        統計を表示
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useSortable } from '@fastkit/vue-sortable'
import type { SortableUpdateContext } from '@fastkit/vue-sortable'

interface KanbanTask {
  id: string
  title: string
  description: string
  assignee: string
  estimate: number
}

const todoTasks = ref<KanbanTask[]>([
  {
    id: '1',
    title: 'APIエンドポイント設計',
    description: 'ユーザー管理APIの設計を行う',
    assignee: '田中',
    estimate: 8
  },
  {
    id: '2',
    title: 'データベース設計',
    description: 'ユーザーテーブルの設計を行う',
    assignee: '佐藤',
    estimate: 4
  }
])

const doingTasks = ref<KanbanTask[]>([
  {
    id: '3',
    title: 'ログイン機能実装',
    description: 'ユーザーログイン機能を実装',
    assignee: '鈴木',
    estimate: 6
  }
])

const doneTasks = ref<KanbanTask[]>([
  {
    id: '4',
    title: 'プロジェクト初期設定',
    description: 'Git リポジトリと基本構成の設定',
    assignee: '山田',
    estimate: 2
  }
])

const beforeUpdate = async (ctx: SortableUpdateContext<KanbanTask>) => {
  const { entries, oldValues, newValues } = ctx

  // 移動確認ダイアログ
  const moveCount = entries.length
  const message = moveCount === 1
    ? `タスク "${entries[0].data.title}" を移動しますか？`
    : `${moveCount}個のタスクを移動しますか？`

  const confirmed = confirm(message)

  if (!confirmed) {
    return false
  }

  // 移動ログ
  console.log('タスク移動:', {
    entries,
    oldValues: oldValues.map(t => t.title),
    newValues: newValues.map(t => t.title)
  })
}

const todoSortable = useSortable(
  {
    modelValue: todoTasks,
    itemKey: 'id',
    group: 'kanban',
    animation: 200,
    multiDrag: true,
    selectedClass: 'selected',
    beforeUpdate
  },
  { emit: (event, value) => {
    if (event === 'update:modelValue') {
      todoTasks.value = value
    }
  } }
)

const doingSortable = useSortable(
  {
    modelValue: doingTasks,
    itemKey: 'id',
    group: 'kanban',
    animation: 200,
    multiDrag: true,
    selectedClass: 'selected',
    beforeUpdate
  },
  { emit: (event, value) => {
    if (event === 'update:modelValue') {
      doingTasks.value = value
    }
  } }
)

const doneSortable = useSortable(
  {
    modelValue: doneTasks,
    itemKey: 'id',
    group: 'kanban',
    animation: 200,
    multiDrag: true,
    selectedClass: 'selected',
    beforeUpdate
  },
  { emit: (event, value) => {
    if (event === 'update:modelValue') {
      doneTasks.value = value
    }
  } }
)

const addTask = () => {
  const newTask: KanbanTask = {
    id: Date.now().toString(),
    title: '新しいタスク',
    description: 'タスクの詳細を入力してください',
    assignee: '未割り当て',
    estimate: 1
  }
  todoTasks.value.push(newTask)
}

const showStats = () => {
  const stats = {
    todo: todoTasks.value.length,
    doing: doingTasks.value.length,
    done: doneTasks.value.length,
    totalEstimate: {
      todo: todoTasks.value.reduce((sum, t) => sum + t.estimate, 0),
      doing: doingTasks.value.reduce((sum, t) => sum + t.estimate, 0),
      done: doneTasks.value.reduce((sum, t) => sum + t.estimate, 0)
    }
  }

  alert(`タスク統計:\nTODO: ${stats.todo}件 (${stats.totalEstimate.todo}時間)\nDOING: ${stats.doing}件 (${stats.totalEstimate.doing}時間)\nDONE: ${stats.done}件 (${stats.totalEstimate.done}時間)`)
}
</script>

<style>
.kanban-board {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin: 20px 0;
}

.kanban-column {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  min-height: 400px;
}

.column-header {
  margin: 0 0 15px 0;
  padding: 10px;
  border-radius: 6px;
  text-align: center;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
}

.column-header.todo {
  background: #e3f2fd;
  color: #1976d2;
}

.column-header.doing {
  background: #fff3e0;
  color: #f57c00;
}

.column-header.done {
  background: #e8f5e8;
  color: #388e3c;
}

.task-list {
  min-height: 300px;
  padding: 10px;
  border: 2px dashed #dee2e6;
  border-radius: 6px;
  transition: border-color 0.2s ease;
}

.task-list:hover {
  border-color: #007bff;
}

.kanban-task {
  background: white;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  cursor: move;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.kanban-task:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.kanban-task.selected {
  border: 2px solid #007bff;
  background: #f0f8ff;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.task-id {
  font-size: 12px;
  color: #6c757d;
  font-family: monospace;
}

.select-button {
  background: none;
  border: 1px solid #6c757d;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  cursor: pointer;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.select-button:hover {
  border-color: #007bff;
  color: #007bff;
}

.kanban-task h4 {
  margin: 0 0 6px 0;
  font-size: 14px;
  color: #495057;
}

.kanban-task p {
  margin: 0 0 10px 0;
  font-size: 12px;
  color: #6c757d;
  line-height: 1.4;
}

.task-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
}

.assignee {
  background: #e9ecef;
  color: #495057;
  padding: 2px 6px;
  border-radius: 10px;
}

.estimate {
  color: #6c757d;
  font-weight: 500;
}

.board-actions {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 20px;
}

.action-button {
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s ease;
}

.action-button:hover {
  background: #0056b3;
}
</style>
```

## 高度な使用例

### 更新前ガード機能

```vue
<template>
  <div>
    <h2>承認が必要な並び替え</h2>

    <div class="approval-settings">
      <label>
        <input v-model="requireApproval" type="checkbox">
        並び替えに承認を必要とする
      </label>
    </div>

    <Sortable
      v-model="items"
      item-key="id"
      :animation="200"
      :before-update="beforeUpdate"
    >
      <template #wrapper="{ children, attrs }">
        <div v-bind="attrs" class="approval-list">
          <component :is="children" />
        </div>
      </template>

      <template #item="{ data, attrs }">
        <div v-bind="attrs" class="approval-item">
          <div class="item-content">
            <span class="item-icon">📄</span>
            <div class="item-info">
              <h4>{{ data.title }}</h4>
              <p>{{ data.description }}</p>
            </div>
            <div class="item-status">
              <span class="status-badge" :class="data.status">
                {{ getStatusLabel(data.status) }}
              </span>
            </div>
          </div>
        </div>
      </template>
    </Sortable>

    <!-- 承認ダイアログ -->
    <div v-if="pendingUpdate" class="approval-modal-overlay">
      <div class="approval-modal">
        <h3>並び替えの承認</h3>
        <p>以下の変更を適用しますか？</p>

        <div class="change-summary">
          <div v-for="entry in pendingUpdate.entries" :key="entry.data.id">
            <strong>{{ entry.data.title }}</strong>
            <span v-if="entry.oldIndex !== undefined && entry.newIndex !== undefined">
              : {{ entry.oldIndex + 1 }}番目 → {{ entry.newIndex + 1 }}番目
            </span>
          </div>
        </div>

        <div class="approval-actions">
          <button @click="rejectUpdate" class="reject-button">
            キャンセル
          </button>
          <button @click="approveUpdate" class="approve-button">
            承認
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Sortable } from '@fastkit/vue-sortable'
import type { SortableUpdateContext } from '@fastkit/vue-sortable'

interface ApprovalItem {
  id: string
  title: string
  description: string
  status: 'pending' | 'approved' | 'rejected'
}

const requireApproval = ref(true)
const pendingUpdate = ref<SortableUpdateContext<ApprovalItem> | null>(null)
let updateResolver: ((result: boolean) => void) | null = null

const items = ref<ApprovalItem[]>([
  {
    id: '1',
    title: '予算申請書',
    description: '来年度の予算申請書類',
    status: 'pending'
  },
  {
    id: '2',
    title: '人事評価シート',
    description: '四半期人事評価の提出',
    status: 'approved'
  },
  {
    id: '3',
    title: '経費精算書',
    description: '出張費用の精算書類',
    status: 'pending'
  },
  {
    id: '4',
    title: '企画提案書',
    description: '新プロジェクトの企画提案',
    status: 'rejected'
  }
])

const getStatusLabel = (status: ApprovalItem['status']) => {
  const labels = {
    pending: '承認待ち',
    approved: '承認済み',
    rejected: '却下'
  }
  return labels[status]
}

const beforeUpdate = async (ctx: SortableUpdateContext<ApprovalItem>) => {
  if (!requireApproval.value) {
    return true
  }

  // 承認ダイアログを表示
  pendingUpdate.value = ctx

  return new Promise<boolean>((resolve) => {
    updateResolver = resolve
  })
}

const approveUpdate = () => {
  if (updateResolver) {
    updateResolver(true)
    updateResolver = null
  }
  pendingUpdate.value = null
}

const rejectUpdate = () => {
  if (updateResolver) {
    updateResolver(false)
    updateResolver = null
  }
  pendingUpdate.value = null
}
</script>

<style>
.approval-settings {
  margin: 20px 0;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
}

.approval-settings label {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;
}

.approval-list {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  min-height: 200px;
}

.approval-item {
  background: white;
  border-radius: 6px;
  margin-bottom: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.approval-item:hover {
  transform: translateY(-1px);
}

.item-content {
  display: flex;
  align-items: center;
  padding: 15px;
  gap: 15px;
}

.item-icon {
  font-size: 24px;
}

.item-info {
  flex: 1;
}

.item-info h4 {
  margin: 0 0 5px 0;
  color: #495057;
}

.item-info p {
  margin: 0;
  color: #6c757d;
  font-size: 14px;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
}

.status-badge.pending {
  background: #fff3cd;
  color: #856404;
}

.status-badge.approved {
  background: #d4edda;
  color: #155724;
}

.status-badge.rejected {
  background: #f8d7da;
  color: #721c24;
}

.approval-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.approval-modal {
  background: white;
  border-radius: 8px;
  padding: 30px;
  max-width: 500px;
  width: 90vw;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.approval-modal h3 {
  margin: 0 0 15px 0;
  color: #495057;
}

.change-summary {
  background: #f8f9fa;
  border-radius: 6px;
  padding: 15px;
  margin: 15px 0;
}

.change-summary div {
  margin: 5px 0;
  font-size: 14px;
}

.approval-actions {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 20px;
}

.reject-button,
.approve-button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.reject-button {
  background: #6c757d;
  color: white;
}

.reject-button:hover {
  background: #545b62;
}

.approve-button {
  background: #28a745;
  color: white;
}

.approve-button:hover {
  background: #1e7e34;
}
</style>
```

### プラグインインストール

```typescript
// main.ts
import { createApp } from 'vue'
import { installSortableDirective } from '@fastkit/vue-sortable'
import App from './App.vue'

const app = createApp(App)

// v-sortableディレクティブをグローバルにインストール
installSortableDirective(app)

app.mount('#app')
```

### CSSファイルのインポート

```typescript
// main.ts または対象のコンポーネント
import '@fastkit/vue-sortable/vue-sortable.css'
```

## API リファレンス

### Sortableコンポーネント

```typescript
interface SortableProps<T extends SortableData = SortableData> {
  modelValue?: T[]                              // 並び替え対象のデータ配列
  itemKey?: string | IterableKeyResolver<T>    // アイテムのキー検出方法
  itemKeyCandidates?: IterableKeyDetectorCandidate[]  // キー自動検出の候補
  clone?: (source: T) => T                     // アイテムのクローン関数
  beforeUpdate?: SortableUpdateGuardFn<T>      // 更新前ガード関数

  // SortableJSのオプション
  group?: string | GroupOptions
  sort?: boolean
  disabled?: boolean
  animation?: number
  handle?: string
  filter?: string
  ghostClass?: string
  chosenClass?: string
  dragClass?: string
  // ... その他SortableJSオプション
}

type SortableEmits<T> = {
  'update:modelValue': (modelValue: T[]) => true
}
```

### useSortable Composable

```typescript
function useSortable<T extends SortableData = SortableData>(
  props: SortableProps<T>,
  { emit }: Pick<SetupContext<SortableEmits<T>>, 'emit'>
): SortableContext<T>

interface SortableContext<T> {
  readonly sortable: Sortable | undefined
  readonly el: SortableDirectiveElement<T> | undefined
  readonly id: string
  readonly group: GroupOptions | undefined
  readonly directiveValue: SortableDirectiveValue<SortableContext<T>>
  readonly disabled: boolean
  readonly items: SortableItemDetails<T>[]
  readonly guardInProgress: boolean
  readonly canOperation: boolean
  readonly wrapperAttrs: Record<string, any>

  getIndexByData(data: T): number
  replace(data: T, index: number): Promise<void>
  getKeys(): string[]
  getKeyByData(data: T): string
  getKeyByElement(el: HTMLElement): string
  findDataByKey(key: string): T | undefined
  getDataByKey(key: string): T
  findElementByKey(key: string): HTMLElement
}
```

### v-sortableディレクティブ

```typescript
interface SortableDirectiveValue<C = undefined> {
  onMounted?: (sortable: Sortable) => void
  inject?: () => C

  // SortableJSオプション
  group?: string | GroupOptions
  sort?: boolean
  disabled?: boolean
  animation?: number
  handle?: string
  filter?: string
  ghostClass?: string
  chosenClass?: string
  dragClass?: string

  // イベントハンドラー
  onStart?: (event: ExtendedSortableEvent<SortableEvent>) => void
  onEnd?: (event: ExtendedSortableEvent<SortableEvent>) => void
  onAdd?: (event: ExtendedSortableEvent<SortableEvent>) => void
  onRemove?: (event: ExtendedSortableEvent<SortableEvent>) => void
  onSelect?: (event: ExtendedSortableEvent<SortableEvent>) => void
  onDeselect?: (event: ExtendedSortableEvent<SortableEvent>) => void
  // ... その他イベント
}
```

### 更新前ガード

```typescript
type SortableUpdateGuardFn<T extends SortableData = SortableData> = (
  ctx: SortableUpdateContext<T>
) => SortableGuardReturn

type SortableGuardReturn = boolean | void | Promise<boolean | void>

interface SortableUpdateContext<T> {
  readonly event: SortableUpdateEvent<T> | undefined
  readonly sortable: SortableContext<T>
  readonly entries: SortableUpdateEntry<T>[]
  readonly oldValues: T[]
  readonly newValues: T[]
}

interface SortableUpdateEntry<T> {
  readonly type: 'add' | 'sort' | 'remove'
  readonly oldIndex?: number
  readonly newIndex?: number
  readonly sameGroup: boolean
  readonly from: SortableContext<T>
  readonly to: SortableContext<T>
  readonly data: T
}
```

### インストール関数

```typescript
function installSortableDirective(app: App): App
```

## パフォーマンス最適化

### 大量データの処理

```typescript
// 仮想スクロールとの組み合わせ例
const useLargeSortable = <T extends SortableData>(items: Ref<T[]>) => {
  const visibleItems = computed(() =>
    items.value.slice(startIndex.value, endIndex.value)
  )

  const sortable = useSortable({
    modelValue: visibleItems,
    itemKey: 'id',
    beforeUpdate: async (ctx) => {
      // 大量データの場合は確認ダイアログを表示
      if (items.value.length > 1000) {
        return confirm('大量データの並び替えを実行しますか？')
      }
    }
  }, { emit })

  return sortable
}
```

### メモリリークの防止

```vue
<script setup>
import { onBeforeUnmount } from 'vue'

const sortable = useSortable(props, { emit })

// コンポーネント破棄時の自動クリーンアップは内部で行われるため、
// 通常は手動でのクリーンアップは不要
</script>
```

## 関連パッケージ

- `sortablejs` - コアのSortableJSライブラリ
- `@fastkit/helpers` - ユーティリティ関数
- `@fastkit/vue-utils` - Vue.js開発ユーティリティ

## ライセンス

MIT
