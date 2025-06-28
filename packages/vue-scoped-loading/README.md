# @fastkit/vue-scoped-loading

Vue.jsアプリケーションでスコープ化されたローディング状態を管理するためのHeadless UIライブラリ。非同期処理のローディング表示、進捗率の追跡、スコープ化されたローディング管理を簡単に実現できます。

## 機能

- **スコープ化ローディング**: コンポーネント単位で独立したローディング状態管理
- **進捗率追跡**: リアルタイムな進捗状況の監視と表示
- **自動ライフサイクル管理**: 関数実行の開始から終了まで自動管理
- **ルート連動**: Vue Routerとの統合でナビゲーション時の自動終了
- **ディレイ設定**: 短時間の処理でのフリッカー防止
- **バックドロップ制御**: オーバーレイ表示とスクロールロック
- **TypeScript完全サポート**: 厳密な型定義による型安全性
- **Vue 3 Composition API**: リアクティブシステムとの完全統合
- **SSR対応**: サーバーサイドレンダリング環境での安全な動作
- **Headless UI**: UIデザインに依存しないロジックのみ提供

## インストール

```bash
npm install @fastkit/vue-scoped-loading
```

## 基本的な使用方法

### プラグインのセットアップ

```typescript
// main.ts
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { installVueScopedLoading } from '@fastkit/vue-scoped-loading'
import App from './App.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // ルート定義
  ]
})

const app = createApp(App)

app.use(router)

// グローバルローディングスコープをインストール
installVueScopedLoading(app)

app.mount('#app')
```

### 基本的なローディング表示

```vue
<template>
  <div>
    <h1>基本的なローディング例</h1>
    
    <!-- グローバルローディング表示 -->
    <div v-if="loading.isDisplaying" class="global-loading">
      <div class="loading-overlay">
        <div class="loading-spinner"></div>
        <p>読み込み中... {{ Math.round(loading.progress) }}%</p>
      </div>
    </div>
    
    <!-- コンテンツエリア -->
    <div class="content" :class="{ disabled: loading.isDisplaying }">
      <div class="actions">
        <h2>アクションボタン</h2>
        <div class="button-group">
          <button @click="fetchData" :disabled="loading.isActive">
            データを取得
          </button>
          <button @click="processData" :disabled="loading.isActive">
            データを処理
          </button>
          <button @click="uploadFile" :disabled="loading.isActive">
            ファイルをアップロード
          </button>
          <button @click="longRunningTask" :disabled="loading.isActive">
            長時間タスク
          </button>
        </div>
      </div>
      
      <!-- ローディング状態表示 -->
      <div class="status">
        <h3>ローディング状態</h3>
        <div class="status-grid">
          <div class="status-item">
            <strong>状態:</strong>
            <span :class="getStatusClass()">
              {{ getStatusText() }}
            </span>
          </div>
          <div class="status-item">
            <strong>アクティブリクエスト数:</strong>
            <span>{{ loading.requests.length }}</span>
          </div>
          <div class="status-item">
            <strong>進捗率:</strong>
            <span>{{ Math.round(loading.progress) }}%</span>
          </div>
          <div class="status-item">
            <strong>バックドロップ:</strong>
            <span>{{ loading.currentDisplaySettings?.backdrop ? '有効' : '無効' }}</span>
          </div>
        </div>
      </div>
      
      <!-- 結果表示 -->
      <div v-if="results.length > 0" class="results">
        <h3>実行結果</h3>
        <ul>
          <li v-for="(result, index) in results" :key="index">
            <strong>{{ result.timestamp }}:</strong> {{ result.message }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useLoading } from '@fastkit/vue-scoped-loading'

const loading = useLoading()
const results = ref<{ timestamp: string; message: string }[]>([])

// 結果を追加するヘルパー関数
const addResult = (message: string) => {
  results.value.push({
    timestamp: new Date().toLocaleTimeString(),
    message
  })
}

// シンプルなデータ取得
const fetchData = loading.create(async () => {
  await new Promise(resolve => setTimeout(resolve, 2000))
  addResult('データ取得が完了しました')
})

// データ処理（進捗率付き）
const processData = loading.createProgressHandler(
  (request) => async () => {
    const steps = 5
    for (let i = 0; i < steps; i++) {
      await new Promise(resolve => setTimeout(resolve, 800))
      request.progress = ((i + 1) / steps) * 100
    }
    addResult('データ処理が完了しました')
  }
)

// ファイルアップロード（ディレイあり）
const uploadFile = loading.create(async () => {
  await new Promise(resolve => setTimeout(resolve, 3000))
  addResult('ファイルアップロードが完了しました')
}, {
  delay: 500, // 500ms遅延でフリッカー防止
  backdrop: true
})

// 長時間タスク（request関数使用）
const longRunningTask = () => {
  loading.request(async (request) => {
    const tasks = [
      'タスク1を実行中...',
      'タスク2を実行中...',
      'タスク3を実行中...',
      'タスク4を実行中...',
      'すべてのタスクが完了しました'
    ]
    
    for (let i = 0; i < tasks.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      request.progress = ((i + 1) / tasks.length) * 100
      
      if (i < tasks.length - 1) {
        addResult(tasks[i])
      }
    }
    
    addResult(tasks[tasks.length - 1])
  })
}

// 状態テキストとスタイル
const getStatusText = () => {
  if (loading.isDisplaying) return '表示中'
  if (loading.isPending) return '待機中'
  return 'アイドル'
}

const getStatusClass = () => {
  if (loading.isDisplaying) return 'status-displaying'
  if (loading.isPending) return 'status-pending'
  return 'status-idle'
}
</script>

<style>
.global-loading {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1000;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-left: 4px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.content {
  padding: 20px;
  transition: opacity 0.3s ease;
}

.content.disabled {
  opacity: 0.6;
  pointer-events: none;
}

.actions {
  margin-bottom: 30px;
}

.actions h2 {
  margin: 0 0 15px 0;
  color: #495057;
}

.button-group {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.button-group button {
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s ease;
}

.button-group button:hover:not(:disabled) {
  background: #0056b3;
}

.button-group button:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.status {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
}

.status h3 {
  margin: 0 0 15px 0;
  color: #495057;
}

.status-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 10px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: white;
  border-radius: 4px;
}

.status-idle {
  color: #28a745;
  font-weight: bold;
}

.status-pending {
  color: #ffc107;
  font-weight: bold;
}

.status-displaying {
  color: #dc3545;
  font-weight: bold;
}

.results {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 20px;
}

.results h3 {
  margin: 0 0 15px 0;
  color: #495057;
}

.results ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.results li {
  padding: 8px 0;
  border-bottom: 1px solid #f8f9fa;
  font-family: monospace;
  font-size: 14px;
}

.results li:last-child {
  border-bottom: none;
}
</style>
```

### スコープ化されたローディング

```vue
<template>
  <div>
    <h1>スコープ化ローディングの例</h1>
    
    <!-- グローバルローディング状態 -->
    <div class="global-status">
      <h2>グローバルローディング状態</h2>
      <p>Active: {{ globalLoading.isActive ? 'Yes' : 'No' }} | Progress: {{ Math.round(globalLoading.progress) }}%</p>
    </div>
    
    <!-- ローカルスコープのコンポーネント -->
    <div class="components-container">
      <UserListComponent />
      <ProductListComponent />
      <NotificationComponent />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLoading } from '@fastkit/vue-scoped-loading'
import UserListComponent from './components/UserListComponent.vue'
import ProductListComponent from './components/ProductListComponent.vue'
import NotificationComponent from './components/NotificationComponent.vue'

const globalLoading = useLoading()
</script>

<style>
.global-status {
  background: #e3f2fd;
  padding: 15px;
  border-radius: 8px;
  margin: 20px 0;
}

.global-status h2 {
  margin: 0 0 10px 0;
  color: #1976d2;
  font-size: 18px;
}

.components-container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin: 20px 0;
}
</style>
```

#### UserListComponent.vue

```vue
<template>
  <div class="component-card">
    <h3>ユーザーリスト</h3>
    
    <!-- ローカルローディング表示 -->
    <div v-if="localLoading.isDisplaying" class="local-loading">
      <div class="loading-bar">
        <div 
          class="loading-progress" 
          :style="{ width: localLoading.progress + '%' }"
        ></div>
      </div>
      <p>ユーザーデータを読み込み中... {{ Math.round(localLoading.progress) }}%</p>
    </div>
    
    <!-- ユーザーリスト -->
    <div v-else class="user-list">
      <div v-if="users.length === 0" class="empty-state">
        ユーザーがありません
      </div>
      <div v-for="user in users" :key="user.id" class="user-item">
        <h4>{{ user.name }}</h4>
        <p>{{ user.email }}</p>
      </div>
    </div>
    
    <div class="actions">
      <button @click="loadUsers" :disabled="localLoading.isActive">
        ユーザーを読み込み
      </button>
      <button @click="refreshUsers" :disabled="localLoading.isActive">
        更新
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { initLoadingScope } from '@fastkit/vue-scoped-loading'

// ローカルスコープを作成
const localLoading = initLoadingScope()

interface User {
  id: number
  name: string
  email: string
}

const users = ref<User[]>([])

// ユーザーデータを取得（進捗率付き）
const loadUsers = localLoading.createProgressHandler(
  (request) => async () => {
    const mockUsers = [
      { id: 1, name: '田中太郎', email: 'tanaka@example.com' },
      { id: 2, name: '佐藤花子', email: 'sato@example.com' },
      { id: 3, name: '鈴木一郎', email: 'suzuki@example.com' },
      { id: 4, name: '高橋美香', email: 'takahashi@example.com' },
      { id: 5, name: '田中二郎', email: 'tanaka2@example.com' }
    ]
    
    users.value = []
    
    for (let i = 0; i < mockUsers.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 400))
      users.value.push(mockUsers[i])
      request.progress = ((i + 1) / mockUsers.length) * 100
    }
  }
)

// ユーザーデータを更新
const refreshUsers = localLoading.create(async () => {
  await new Promise(resolve => setTimeout(resolve, 1500))
  users.value = users.value.map(user => ({
    ...user,
    email: user.email.replace('@example.com', `+${Date.now()}@example.com`)
  }))
}, {
  delay: 300
})
</script>

<style>
.component-card {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 20px;
  height: fit-content;
}

.component-card h3 {
  margin: 0 0 15px 0;
  color: #495057;
  border-bottom: 2px solid #007bff;
  padding-bottom: 8px;
}

.local-loading {
  text-align: center;
  padding: 20px;
}

.loading-bar {
  width: 100%;
  height: 8px;
  background: #f8f9fa;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 10px;
}

.loading-progress {
  height: 100%;
  background: linear-gradient(90deg, #007bff, #0056b3);
  transition: width 0.3s ease;
}

.user-list {
  min-height: 200px;
}

.empty-state {
  text-align: center;
  color: #6c757d;
  padding: 40px 20px;
  font-style: italic;
}

.user-item {
  padding: 10px;
  border-bottom: 1px solid #f8f9fa;
  transition: background-color 0.2s ease;
}

.user-item:hover {
  background: #f8f9fa;
}

.user-item:last-child {
  border-bottom: none;
}

.user-item h4 {
  margin: 0 0 5px 0;
  color: #495057;
  font-size: 16px;
}

.user-item p {
  margin: 0;
  color: #6c757d;
  font-size: 14px;
}

.actions {
  margin-top: 15px;
  display: flex;
  gap: 10px;
}

.actions button {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #007bff;
  background: white;
  color: #007bff;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.actions button:hover:not(:disabled) {
  background: #007bff;
  color: white;
}

.actions button:disabled {
  border-color: #6c757d;
  color: #6c757d;
  cursor: not-allowed;
}
</style>
```

### ルート連動ローディング

```vue
<template>
  <div>
    <h1>ルート連動ローディング</h1>
    
    <!-- グローバルローディングインジケーター -->
    <div v-if="loading.isDisplaying" class="route-loading">
      <div class="loading-banner">
        <div class="loading-spinner"></div>
        <span>ページを読み込み中...</span>
      </div>
    </div>
    
    <!-- ナビゲーション -->
    <nav class="navigation">
      <router-link to="/" class="nav-link">ホーム</router-link>
      <router-link to="/users" class="nav-link">ユーザー一覧</router-link>
      <router-link to="/products" class="nav-link">商品一覧</router-link>
      <router-link to="/dashboard" class="nav-link">ダッシュボード</router-link>
    </nav>
    
    <!-- APIテストエリア -->
    <div class="api-test">
      <h2>APIテスト</h2>
      <div class="test-buttons">
        <button @click="testApiCall" :disabled="loading.isActive">
          API呼び出しテスト
        </button>
        <button @click="testLongApiCall" :disabled="loading.isActive">
          長時間APIテスト
        </button>
        <button @click="testNavigationWithApi" :disabled="loading.isActive">
          ナビゲーション+APIテスト
        </button>
      </div>
      
      <div class="test-info">
        <h3>テスト情報</h3>
        <p><strong>注意:</strong> APIテスト実行中にページを切り替えると、ローディングが自動的に終了します。</p>
        <p><strong>endOnNavigation: false</strong> を設定すると、ナビゲーション後もローディングが継続します。</p>
      </div>
    </div>
    
    <!-- ルータービュー -->
    <div class="router-view">
      <router-view />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useLoading } from '@fastkit/vue-scoped-loading'

const router = useRouter()
const loading = useLoading()

// 通常のAPI呼び出し（ナビゲーションで自動終了）
const testApiCall = loading.create(async () => {
  console.log('API呼び出し開始')
  await new Promise(resolve => setTimeout(resolve, 2000))
  console.log('API呼び出し完了')
}, {
  delay: 200,
  endOnNavigation: true // デフォルト
})

// 長時間API呼び出し（ナビゲーションで自動終了しない）
const testLongApiCall = loading.create(async () => {
  console.log('長時間API呼び出し開始')
  await new Promise(resolve => setTimeout(resolve, 5000))
  console.log('長時間API呼び出し完了')
}, {
  delay: 500,
  endOnNavigation: false // ナビゲーションで終了しない
})

// ナビゲーションとAPI呼び出しを組み合わせたテスト
const testNavigationWithApi = async () => {
  // API呼び出しを開始
  const apiPromise = loading.create(async () => {
    await new Promise(resolve => setTimeout(resolve, 3000))
    console.log('API呼び出しが完了しました')
  })()
  
  // 1秒後にページ移動
  setTimeout(() => {
    router.push('/users')
  }, 1000)
  
  try {
    await apiPromise
  } catch (error) {
    console.log('API呼び出しがキャンセルされました')
  }
}
</script>

<style>
.route-loading {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.loading-banner {
  background: linear-gradient(90deg, #007bff, #0056b3);
  color: white;
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-left: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.navigation {
  background: #f8f9fa;
  padding: 15px 20px;
  display: flex;
  gap: 20px;
  border-bottom: 1px solid #dee2e6;
}

.nav-link {
  color: #495057;
  text-decoration: none;
  padding: 8px 12px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.nav-link:hover {
  background: #e9ecef;
}

.nav-link.router-link-active {
  background: #007bff;
  color: white;
}

.api-test {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 20px;
  margin: 20px;
}

.api-test h2 {
  margin: 0 0 15px 0;
  color: #495057;
}

.test-buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.test-buttons button {
  padding: 10px 15px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s ease;
}

.test-buttons button:hover:not(:disabled) {
  background: #1e7e34;
}

.test-buttons button:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.test-info {
  background: #fff3cd;
  border: 1px solid #ffc107;
  border-radius: 4px;
  padding: 15px;
}

.test-info h3 {
  margin: 0 0 10px 0;
  color: #856404;
}

.test-info p {
  margin: 5px 0;
  color: #856404;
  font-size: 14px;
}

.router-view {
  margin: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
```

## 高度な使用例

### 複数のAPI呼び出しの統合管理

```vue
<template>
  <div>
    <h2>複数APIの統合管理</h2>
    
    <!-- 統合ローディング表示 -->
    <div v-if="loading.isDisplaying" class="integrated-loading">
      <div class="loading-header">
        <h3>データを読み込み中...</h3>
        <div class="overall-progress">
          <div class="progress-bar">
            <div 
              class="progress-fill" 
              :style="{ width: loading.progress + '%' }"
            ></div>
          </div>
          <span class="progress-text">{{ Math.round(loading.progress) }}%</span>
        </div>
      </div>
      
      <!-- 個別のリクエストの進捗 -->
      <div class="request-details">
        <div 
          v-for="(request, index) in loading.requests" 
          :key="index"
          class="request-item"
        >
          <span class="request-name">{{ getRequestName(index) }}</span>
          <div class="request-progress">
            <div class="mini-progress-bar">
              <div 
                class="mini-progress-fill" 
                :style="{ width: request.progress + '%' }"
              ></div>
            </div>
            <span class="mini-progress-text">{{ Math.round(request.progress) }}%</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- コントロール -->
    <div class="controls">
      <button @click="loadAllData" :disabled="loading.isActive">
        すべてのデータを読み込み
      </button>
      <button @click="loadDataSequentially" :disabled="loading.isActive">
        順次読み込み
      </button>
      <button @click="loading.endAll()" :disabled="!loading.isActive">
        すべてキャンセル
      </button>
    </div>
    
    <!-- 結果表示 -->
    <div class="results">
      <div class="result-section">
        <h4>ユーザーデータ ({{ userData.length }}件)</h4>
        <div class="data-preview">
          {{ userData.slice(0, 3).map(u => u.name).join(', ') }}
          {{ userData.length > 3 ? '...' : '' }}
        </div>
      </div>
      
      <div class="result-section">
        <h4>商品データ ({{ productData.length }}件)</h4>
        <div class="data-preview">
          {{ productData.slice(0, 3).map(p => p.name).join(', ') }}
          {{ productData.length > 3 ? '...' : '' }}
        </div>
      </div>
      
      <div class="result-section">
        <h4>注文データ ({{ orderData.length }}件)</h4>
        <div class="data-preview">
          {{ orderData.slice(0, 3).map(o => `#${o.id}`).join(', ') }}
          {{ orderData.length > 3 ? '...' : '' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useLoading } from '@fastkit/vue-scoped-loading'

interface User {
  id: number
  name: string
  email: string
}

interface Product {
  id: number
  name: string
  price: number
}

interface Order {
  id: number
  userId: number
  productId: number
  quantity: number
}

const loading = useLoading()
const userData = ref<User[]>([])
const productData = ref<Product[]>([])
const orderData = ref<Order[]>([])

// リクエスト名を取得
const getRequestName = (index: number) => {
  const names = ['ユーザーデータ', '商品データ', '注文データ']
  return names[index] || `リクエスト ${index + 1}`
}

// ユーザーデータの読み込み
const loadUserData = loading.createProgressHandler(
  (request) => async () => {
    const users: User[] = []
    for (let i = 1; i <= 50; i++) {
      await new Promise(resolve => setTimeout(resolve, 50))
      users.push({
        id: i,
        name: `ユーザー${i}`,
        email: `user${i}@example.com`
      })
      request.progress = (i / 50) * 100
    }
    userData.value = users
  }
)

// 商品データの読み込み
const loadProductData = loading.createProgressHandler(
  (request) => async () => {
    const products: Product[] = []
    for (let i = 1; i <= 30; i++) {
      await new Promise(resolve => setTimeout(resolve, 80))
      products.push({
        id: i,
        name: `商品${i}`,
        price: Math.floor(Math.random() * 10000) + 1000
      })
      request.progress = (i / 30) * 100
    }
    productData.value = products
  }
)

// 注文データの読み込み
const loadOrderData = loading.createProgressHandler(
  (request) => async () => {
    const orders: Order[] = []
    for (let i = 1; i <= 100; i++) {
      await new Promise(resolve => setTimeout(resolve, 30))
      orders.push({
        id: i,
        userId: Math.floor(Math.random() * 50) + 1,
        productId: Math.floor(Math.random() * 30) + 1,
        quantity: Math.floor(Math.random() * 5) + 1
      })
      request.progress = (i / 100) * 100
    }
    orderData.value = orders
  }
)

// すべてのデータを並列で読み込み
const loadAllData = async () => {
  await Promise.all([
    loadUserData(),
    loadProductData(),
    loadOrderData()
  ])
}

// 順次読み込み
const loadDataSequentially = async () => {
  await loadUserData()
  await loadProductData()
  await loadOrderData()
}
</script>

<style>
.integrated-loading {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
}

.loading-header {
  margin-bottom: 20px;
}

.loading-header h3 {
  margin: 0 0 15px 0;
  color: #495057;
}

.overall-progress {
  display: flex;
  align-items: center;
  gap: 15px;
}

.progress-bar {
  flex: 1;
  height: 12px;
  background: #e9ecef;
  border-radius: 6px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #007bff, #0056b3);
  transition: width 0.3s ease;
}

.progress-text {
  font-weight: bold;
  color: #495057;
  min-width: 40px;
  text-align: right;
}

.request-details {
  display: grid;
  gap: 10px;
}

.request-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background: white;
  border-radius: 4px;
}

.request-name {
  font-size: 14px;
  color: #495057;
  font-weight: 500;
}

.request-progress {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mini-progress-bar {
  width: 80px;
  height: 6px;
  background: #e9ecef;
  border-radius: 3px;
  overflow: hidden;
}

.mini-progress-fill {
  height: 100%;
  background: #28a745;
  transition: width 0.3s ease;
}

.mini-progress-text {
  font-size: 12px;
  color: #6c757d;
  min-width: 30px;
  text-align: right;
}

.controls {
  display: flex;
  gap: 10px;
  margin: 20px 0;
  flex-wrap: wrap;
}

.controls button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.controls button:first-child {
  background: #007bff;
  color: white;
}

.controls button:first-child:hover:not(:disabled) {
  background: #0056b3;
}

.controls button:nth-child(2) {
  background: #28a745;
  color: white;
}

.controls button:nth-child(2):hover:not(:disabled) {
  background: #1e7e34;
}

.controls button:last-child {
  background: #dc3545;
  color: white;
}

.controls button:last-child:hover:not(:disabled) {
  background: #c82333;
}

.controls button:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.results {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
  margin: 20px 0;
}

.result-section {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 15px;
}

.result-section h4 {
  margin: 0 0 10px 0;
  color: #495057;
  font-size: 16px;
}

.data-preview {
  color: #6c757d;
  font-size: 14px;
  line-height: 1.4;
}
</style>
```

### カスタムローディングUIコンポーネント

```vue
<template>
  <div>
    <h2>カスタムローディングUI</h2>
    
    <!-- カスタムローディングコンポーネント -->
    <CustomLoadingOverlay />
    
    <div class="demo-content">
      <div class="demo-section">
        <h3>スタイルバリエーション</h3>
        <div class="style-buttons">
          <button @click="setLoadingStyle('minimal')" :class="{ active: loadingStyle === 'minimal' }">
            ミニマル
          </button>
          <button @click="setLoadingStyle('detailed')" :class="{ active: loadingStyle === 'detailed' }">
            詳細
          </button>
          <button @click="setLoadingStyle('creative')" :class="{ active: loadingStyle === 'creative' }">
            クリエイティブ
          </button>
        </div>
      </div>
      
      <div class="demo-section">
        <h3>ローディングテスト</h3>
        <div class="test-buttons">
          <button @click="quickTest" :disabled="loading.isActive">
            短時間テスト
          </button>
          <button @click="progressTest" :disabled="loading.isActive">
            進捗テスト
          </button>
          <button @click="longTest" :disabled="loading.isActive">
            長時間テスト
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, provide } from 'vue'
import { useLoading } from '@fastkit/vue-scoped-loading'
import CustomLoadingOverlay from './components/CustomLoadingOverlay.vue'

const loading = useLoading()
const loadingStyle = ref<'minimal' | 'detailed' | 'creative'>('minimal')

// スタイルを子コンポーネントに提供
provide('loadingStyle', loadingStyle)

const setLoadingStyle = (style: typeof loadingStyle.value) => {
  loadingStyle.value = style
}

// 短時間テスト
const quickTest = loading.create(async () => {
  await new Promise(resolve => setTimeout(resolve, 1500))
}, { delay: 100 })

// 進捗テスト
const progressTest = loading.createProgressHandler(
  (request) => async () => {
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(resolve => setTimeout(resolve, 200))
      request.progress = i
    }
  }
)

// 長時間テスト
const longTest = loading.create(async () => {
  await new Promise(resolve => setTimeout(resolve, 8000))
}, { delay: 300 })
</script>

<style>
.demo-content {
  margin: 20px 0;
}

.demo-section {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
}

.demo-section h3 {
  margin: 0 0 15px 0;
  color: #495057;
}

.style-buttons,
.test-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.style-buttons button {
  padding: 8px 16px;
  border: 1px solid #007bff;
  background: white;
  color: #007bff;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.style-buttons button:hover,
.style-buttons button.active {
  background: #007bff;
  color: white;
}

.test-buttons button {
  padding: 10px 15px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.test-buttons button:hover:not(:disabled) {
  background: #1e7e34;
}

.test-buttons button:disabled {
  background: #6c757d;
  cursor: not-allowed;
}
</style>
```

#### CustomLoadingOverlay.vue

```vue
<template>
  <!-- ミニマルスタイル -->
  <div v-if="loading.isDisplaying && currentStyle === 'minimal'" class="loading-overlay minimal">
    <div class="loading-content">
      <div class="simple-spinner"></div>
    </div>
  </div>
  
  <!-- 詳細スタイル -->
  <div v-else-if="loading.isDisplaying && currentStyle === 'detailed'" class="loading-overlay detailed">
    <div class="loading-content">
      <div class="detailed-spinner"></div>
      <h3>処理中...</h3>
      <div class="progress-container">
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: loading.progress + '%' }"></div>
        </div>
        <span class="progress-percentage">{{ Math.round(loading.progress) }}%</span>
      </div>
      <p class="loading-description">
        {{ getLoadingDescription() }}
      </p>
    </div>
  </div>
  
  <!-- クリエイティブスタイル -->
  <div v-else-if="loading.isDisplaying && currentStyle === 'creative'" class="loading-overlay creative">
    <div class="loading-content">
      <div class="creative-animation">
        <div class="orbit">
          <div class="planet"></div>
        </div>
        <div class="orbit orbit-2">
          <div class="planet planet-2"></div>
        </div>
        <div class="orbit orbit-3">
          <div class="planet planet-3"></div>
        </div>
      </div>
      <h3>魔法をかけています...</h3>
      <div class="creative-progress">
        <div class="progress-orbs">
          <div 
            v-for="i in 10" 
            :key="i"
            class="progress-orb"
            :class="{ active: (loading.progress / 10) >= i }"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject, computed } from 'vue'
import { useLoading } from '@fastkit/vue-scoped-loading'

const loading = useLoading()
const currentStyle = inject('loadingStyle', () => 'minimal')

const getLoadingDescription = () => {
  const progress = loading.progress
  if (progress < 25) return '初期化中...'
  if (progress < 50) return 'データを読み込み中...'
  if (progress < 75) return '処理中...'
  if (progress < 95) return '最終処理中...'
  return '完了直前...'
}
</script>

<style>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* ミニマルスタイル */
.minimal {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(2px);
}

.simple-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(0, 123, 255, 0.3);
  border-left: 3px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* 詳細スタイル */
.detailed {
  background: rgba(0, 0, 0, 0.8);
  color: white;
}

.detailed .loading-content {
  text-align: center;
  max-width: 400px;
  padding: 40px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.detailed-spinner {
  width: 60px;
  height: 60px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-left: 4px solid white;
  border-radius: 50%;
  animation: spin 1.5s linear infinite;
  margin: 0 auto 20px;
}

.detailed h3 {
  margin: 0 0 20px 0;
  font-size: 24px;
  font-weight: 300;
}

.progress-container {
  margin: 20px 0;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 10px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #00d4ff, #007bff);
  transition: width 0.3s ease;
}

.progress-percentage {
  font-size: 18px;
  font-weight: bold;
}

.loading-description {
  margin: 20px 0 0 0;
  font-size: 14px;
  opacity: 0.8;
}

/* クリエイティブスタイル */
.creative {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.creative .loading-content {
  text-align: center;
}

.creative-animation {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto 30px;
}

.orbit {
  position: absolute;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  animation: rotate 4s linear infinite;
}

.orbit:nth-child(1) {
  width: 120px;
  height: 120px;
  top: 0;
  left: 0;
}

.orbit-2 {
  width: 80px;
  height: 80px;
  top: 20px;
  left: 20px;
  animation-duration: 3s;
  animation-direction: reverse;
}

.orbit-3 {
  width: 40px;
  height: 40px;
  top: 40px;
  left: 40px;
  animation-duration: 2s;
}

.planet {
  position: absolute;
  width: 8px;
  height: 8px;
  background: white;
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.8);
  top: -4px;
  left: 50%;
  transform: translateX(-50%);
}

.planet-2 {
  background: #00d4ff;
  box-shadow: 0 0 10px rgba(0, 212, 255, 0.8);
}

.planet-3 {
  background: #ff6b6b;
  box-shadow: 0 0 10px rgba(255, 107, 107, 0.8);
}

.creative h3 {
  margin: 0 0 30px 0;
  font-size: 28px;
  font-weight: 300;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.creative-progress {
  margin: 20px 0;
}

.progress-orbs {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.progress-orb {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
  transition: all 0.3s ease;
}

.progress-orb.active {
  background: white;
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.8);
  transform: scale(1.2);
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@keyframes rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
```

## API リファレンス

### LoadingScope

```typescript
interface LoadingScope {
  readonly root: LoadingScope
  readonly router?: Router
  readonly requests: LoadingRequest[]
  readonly currentDisplaySettings: LoadingDisplaySettings | undefined
  readonly isIdle: boolean
  readonly isPending: boolean
  readonly isDisplaying: boolean
  readonly isActive: boolean
  readonly progress: number
  
  create<Fn extends Callable>(fn: Fn, options?: LoadingRequestOptions): WithLoadingRequest<Fn>
  createProgressHandler<Fn extends Callable>(handler: (request: LoadingRequest) => Fn, options?: LoadingRequestOptions): Fn
  request<Fn extends (request: LoadingRequest) => any>(fn: Fn, options?: LoadingRequestOptions): ReturnType<Fn>
  endAll(): void
}
```

### LoadingRequest

```typescript
interface LoadingRequest extends LoadingDisplaySettings {
  readonly state: LoadingRequestState
  readonly isIdle: boolean
  readonly isPending: boolean
  readonly isDisplaying: boolean
  readonly isActive: boolean
  progress: number
  
  start(): void
  end(): void
}

type LoadingRequestState = 'idle' | 'pending' | 'displaying'
```

### オプション

```typescript
interface LoadingDisplayOptions {
  backdrop?: MaybeRefOrGetter<boolean>  // オーバーレイ表示 (デフォルト: true)
  delay?: number                        // 表示遅延時間ミリ秒 (デフォルト: 0)
  endOnNavigation?: boolean            // ルート遷移時の自動終了 (デフォルト: true)
}

interface LoadingDisplaySettings {
  backdrop: boolean
}
```

### 関数

```typescript
// スコープ作成
function createLoadingScope(app?: App): LoadingScope
function initLoadingScope(app?: App): LoadingScope

// スコープ取得
function useLoading(): LoadingScope
function useScopedLoading(): LoadingScope

// プラグイン
function installVueScopedLoading(app: App): LoadingScope

// ラッピング関数
function withLoadingRequest<Fn extends Callable>(
  scope: LoadingScope,
  fn: Fn,
  options?: LoadingRequestOptions
): WithLoadingRequest<Fn>
```

## パフォーマンス最適化

### メモリリークの防止

```typescript
// コンポーネントアンマウント時の自動クリーンアップ
// withLoadingRequest関数で作成された関数は自動的にクリーンアップされる
import { onBeforeUnmount } from 'vue'

const myLoadingFunction = loading.create(async () => {
  // 処理
})

// 手動でクリーンアップする場合
onBeforeUnmount(() => {
  myLoadingFunction[LOADING_REQUEST_SYMBOL].end()
})
```

### フリッカー防止

```typescript
// 短時間の処理では遅延を設定してフリッカーを防止
const quickApiCall = loading.create(async () => {
  await fetch('/api/quick')
}, {
  delay: 300 // 300ms未満の処理ではローディングを表示しない
})
```

## 関連パッケージ

- `@fastkit/helpers` - ユーティリティ関数
- `vue-router` - Vue Router 4.x (オプション)

## ライセンス

MIT
