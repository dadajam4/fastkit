# @fastkit/vue-location

Vue Routerの拡張ライブラリで、ルート状態の管理、タイプセーフなクエリパラメータ操作、ルート遷移状態の追跡機能を提供します。スキーマベースのクエリ操作、フォーム管理、ルートマッチングを簡単に実現できます。

## 機能

- **LocationService**: Vue Routerの状態を一元管理するサービスクラス
- **タイプセーフクエリ**: スキーマベースのクエリパラメータ操作
- **ルート遷移追跡**: ルート遷移中の状態監視とローディング表示
- **フォーム管理**: クエリパラメータ連動のフォームコンポーネント
- **ルートマッチング**: 現在のルートと指定ルートのマッチ判定
- **TypeScript完全サポート**: 厳密な型定義による型安全性
- **Vue 3 Composition API**: リアクティブシステムとの完全統合
- **SSR対応**: サーバーサイドレンダリング環境での安全な動作
- **軽量実装**: Vue Routerの上位拡張でパフォーマンスに影響なし

## インストール

```bash
npm install @fastkit/vue-location
```

## 基本的な使用方法

### LocationServiceのセットアップ

```typescript
// main.ts
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { LocationService } from '@fastkit/vue-location'
import App from './App.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: () => import('./pages/Home.vue') },
    { path: '/about', component: () => import('./pages/About.vue') },
    { path: '/users/:id', component: () => import('./pages/User.vue') },
    { path: '/search', component: () => import('./pages/Search.vue') }
  ]
})

const app = createApp(App)

app.use(router)

// LocationServiceをインストール
LocationService.install(app, { router })

app.mount('#app')
```

### 基本的なLocationServiceの使用

```vue
<template>
  <div>
    <h1>ナビゲーションサンプル</h1>
    
    <!-- ルート情報表示 -->
    <div class="route-info">
      <h2>現在のルート</h2>
      <p><strong>パス:</strong> {{ location.currentRoute.path }}</p>
      <p><strong>クエリ:</strong> {{ JSON.stringify(location.currentRoute.query) }}</p>
      <p><strong>ハッシュ:</strong> {{ location.currentRoute.hash || 'なし' }}</p>
    </div>
    
    <!-- 遷移状態表示 -->
    <div v-if="location.transitioning" class="transitioning">
      <h3>ルート遷移中...</h3>
      <p>遷移先: {{ location.transitioningTo?.path }}</p>
      <div class="transition-details">
        <p v-if="location.transitioning.path">パスを変更中</p>
        <p v-if="location.transitioning.hash">ハッシュを変更中</p>
        <p v-if="location.transitioning.query.length > 0">
          クエリを変更中: {{ location.transitioning.query.join(', ') }}
        </p>
      </div>
    </div>
    
    <!-- ナビゲーションボタン -->
    <div class="navigation">
      <h3>ナビゲーション</h3>
      <div class="nav-buttons">
        <button 
          @click="location.push('/')"
          :class="{ active: location.match('/') }"
        >
          ホーム
        </button>
        <button 
          @click="location.push('/about')"
          :class="{ active: location.match('/about') }"
        >
          アバウト
        </button>
        <button 
          @click="location.push('/users/123')"
          :class="{ active: location.match('/users/123') }"
        >
          ユーザーページ
        </button>
      </div>
    </div>
    
    <!-- クエリ操作 -->
    <div class="query-operations">
      <h3>クエリ操作</h3>
      <div class="query-buttons">
        <button @click="addSearchQuery">検索クエリを追加</button>
        <button @click="addFilterQuery">フィルタークエリを追加</button>
        <button @click="clearQueries">クエリをクリア</button>
      </div>
      
      <div class="current-queries">
        <h4>現在のクエリパラメータ</h4>
        <ul>
          <li v-for="(value, key) in location.currentRoute.query" :key="key">
            <strong>{{ key }}:</strong> {{ value }}
          </li>
          <li v-if="Object.keys(location.currentRoute.query).length === 0">
            クエリパラメータはありません
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useLocationService } from '@fastkit/vue-location'

const location = useLocationService()

const addSearchQuery = () => {
  location.pushQuery({ search: 'vue.js', category: 'frontend' })
}

const addFilterQuery = () => {
  location.pushQuery({ filter: 'active', sort: 'date' })
}

const clearQueries = () => {
  location.push({ path: location.currentRoute.path })
}

// ルート変更を監視
location.watchRoute((newRoute, oldRoute) => {
  console.log('ルートが変更されました:', {
    from: oldRoute?.path,
    to: newRoute.path,
    query: newRoute.query
  })
})
</script>

<style>
.route-info {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin: 20px 0;
}

.route-info h2 {
  margin: 0 0 15px 0;
  color: #495057;
}

.route-info p {
  margin: 8px 0;
  font-family: monospace;
  background: white;
  padding: 8px;
  border-radius: 4px;
}

.transitioning {
  background: #fff3cd;
  border: 1px solid #ffc107;
  padding: 15px;
  border-radius: 8px;
  margin: 20px 0;
}

.transitioning h3 {
  margin: 0 0 10px 0;
  color: #856404;
}

.transition-details p {
  margin: 5px 0;
  color: #856404;
  font-size: 14px;
}

.navigation, .query-operations {
  margin: 20px 0;
  padding: 20px;
  border: 1px solid #dee2e6;
  border-radius: 8px;
}

.navigation h3, .query-operations h3 {
  margin: 0 0 15px 0;
  color: #495057;
}

.nav-buttons, .query-buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.nav-buttons button, .query-buttons button {
  padding: 8px 16px;
  border: 1px solid #007bff;
  background: white;
  color: #007bff;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-buttons button:hover, .query-buttons button:hover {
  background: #007bff;
  color: white;
}

.nav-buttons button.active {
  background: #007bff;
  color: white;
  font-weight: bold;
}

.current-queries {
  margin-top: 15px;
}

.current-queries h4 {
  margin: 0 0 10px 0;
  color: #495057;
  font-size: 16px;
}

.current-queries ul {
  list-style: none;
  padding: 0;
  margin: 0;
  background: #f8f9fa;
  border-radius: 4px;
  padding: 10px;
}

.current-queries li {
  margin: 5px 0;
  font-family: monospace;
  font-size: 14px;
}
</style>
```

### タイプセーフクエリの使用

```vue
<template>
  <div>
    <h1>検索ページ</h1>
    
    <!-- 検索フォーム -->
    <form @submit.prevent="search.submit()" class="search-form">
      <div class="form-group">
        <label for="keyword">キーワード:</label>
        <input 
          id="keyword"
          v-model="search.values.keyword"
          type="text" 
          placeholder="検索キーワードを入力"
        >
      </div>
      
      <div class="form-group">
        <label for="category">カテゴリ:</label>
        <select id="category" v-model="search.values.category">
          <option value="">すべて</option>
          <option value="frontend">フロントエンド</option>
          <option value="backend">バックエンド</option>
          <option value="mobile">モバイル</option>
          <option value="devops">DevOps</option>
        </select>
      </div>
      
      <div class="form-group">
        <label for="sort">並び順:</label>
        <select id="sort" v-model="search.values.sort">
          <option value="relevance">関連度</option>
          <option value="date">日付</option>
          <option value="popularity">人気</option>
          <option value="title">タイトル</option>
        </select>
      </div>
      
      <div class="form-group">
        <label for="limit">表示件数:</label>
        <select id="limit" v-model="search.values.limit">
          <option :value="10">10件</option>
          <option :value="20">20件</option>
          <option :value="50">50件</option>
          <option :value="100">100件</option>
        </select>
      </div>
      
      <div class="form-group">
        <label>
          <input 
            v-model="search.values.includeArchived"
            type="checkbox"
          >
          アーカイブされたアイテムを含む
        </label>
      </div>
      
      <div class="form-actions">
        <button 
          type="submit" 
          :disabled="search.sending || !search.hasChanged"
          class="submit-button"
        >
          <span v-if="search.sending">検索中...</span>
          <span v-else>検索</span>
        </button>
        
        <button 
          type="button" 
          @click="search.reset()"
          :disabled="search.sending"
          class="reset-button"
        >
          リセット
        </button>
        
        <button 
          type="button" 
          @click="clearSearch()"
          :disabled="search.sending"
          class="clear-button"
        >
          クリア
        </button>
      </div>
    </form>
    
    <!-- 現在の検索条件表示 -->
    <div class="current-search">
      <h3>現在の検索条件</h3>
      <div class="search-params">
        <div v-if="query.keyword" class="param">
          <strong>キーワード:</strong> {{ query.keyword }}
        </div>
        <div v-if="query.category" class="param">
          <strong>カテゴリ:</strong> {{ getCategoryLabel(query.category) }}
        </div>
        <div class="param">
          <strong>並び順:</strong> {{ getSortLabel(query.sort) }}
        </div>
        <div class="param">
          <strong>表示件数:</strong> {{ query.limit }}件
        </div>
        <div v-if="query.includeArchived" class="param">
          <strong>アーカイブ:</strong> 含む
        </div>
      </div>
    </div>
    
    <!-- 変更状態表示 -->
    <div v-if="search.hasChanged" class="changes">
      <h4>変更された項目</h4>
      <ul>
        <li v-for="change in search.changes" :key="change">
          {{ getFieldLabel(change) }}
        </li>
      </ul>
    </div>
    
    <!-- 検索結果表示 -->
    <div class="search-results">
      <h3>検索結果 ({{ searchResults.length }}件)</h3>
      <div v-if="searchResults.length === 0" class="no-results">
        検索結果がありません
      </div>
      <div v-else class="results-list">
        <div v-for="result in searchResults" :key="result.id" class="result-item">
          <h4>{{ result.title }}</h4>
          <p>{{ result.description }}</p>
          <div class="result-meta">
            <span class="category">{{ getCategoryLabel(result.category) }}</span>
            <span class="date">{{ formatDate(result.date) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useLocationService } from '@fastkit/vue-location'

// 検索クエリのスキーマ定義
const searchSchema = {
  keyword: { type: String, default: '' },
  category: { type: String, default: '' },
  sort: { type: String, default: 'relevance' },
  limit: { type: Number, default: 20 },
  includeArchived: { type: Boolean, default: false }
}

const location = useLocationService()
const query = location.useQuery(searchSchema)
const search = query.$form()

// ラベル定義
const getCategoryLabel = (category: string) => {
  const labels: Record<string, string> = {
    frontend: 'フロントエンド',
    backend: 'バックエンド',
    mobile: 'モバイル',
    devops: 'DevOps'
  }
  return labels[category] || category
}

const getSortLabel = (sort: string) => {
  const labels: Record<string, string> = {
    relevance: '関連度',
    date: '日付',
    popularity: '人気',
    title: 'タイトル'
  }
  return labels[sort] || sort
}

const getFieldLabel = (field: string) => {
  const labels: Record<string, string> = {
    keyword: 'キーワード',
    category: 'カテゴリ',
    sort: '並び順',
    limit: '表示件数',
    includeArchived: 'アーカイブ含む'
  }
  return labels[field] || field
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('ja-JP')
}

// 検索結果のモックデータ
interface SearchResult {
  id: string
  title: string
  description: string
  category: string
  date: string
}

const searchResults = computed<SearchResult[]>(() => {
  // 実際のアプリケーションでは、ここでAPIを呼び出す
  const mockResults: SearchResult[] = [
    {
      id: '1',
      title: 'Vue.js 3入門ガイド',
      description: 'Vue.js 3の基本的な使い方とComposition APIの解説',
      category: 'frontend',
      date: '2024-01-15'
    },
    {
      id: '2',
      title: 'TypeScriptとVue Routerの連携',
      description: 'TypeScriptで型安全なVue Routerの実装方法',
      category: 'frontend',
      date: '2024-01-20'
    },
    {
      id: '3',
      title: 'Node.jsでのREST API開発',
      description: 'Express.jsを使ったREST APIの構築方法',
      category: 'backend',
      date: '2024-01-25'
    }
  ]
  
  // フィルタリングロジック
  let filtered = mockResults
  
  if (query.keyword) {
    const keyword = query.keyword.toLowerCase()
    filtered = filtered.filter(item => 
      item.title.toLowerCase().includes(keyword) ||
      item.description.toLowerCase().includes(keyword)
    )
  }
  
  if (query.category) {
    filtered = filtered.filter(item => item.category === query.category)
  }
  
  // ソート
  if (query.sort === 'date') {
    filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  } else if (query.sort === 'title') {
    filtered.sort((a, b) => a.title.localeCompare(b.title))
  }
  
  // 件数制限
  return filtered.slice(0, query.limit)
})

const clearSearch = () => {
  location.push({ path: '/search' })
}

// クエリの変更を監視して検索結果を更新
watch(query.$watchKey, () => {
  console.log('検索条件が変更されました:', {
    keyword: query.keyword,
    category: query.category,
    sort: query.sort,
    limit: query.limit,
    includeArchived: query.includeArchived
  })
})
</script>

<style>
.search-form {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin: 20px 0;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  color: #495057;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 14px;
}

.form-group input[type="checkbox"] {
  width: auto;
  margin-right: 8px;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.submit-button {
  background: #007bff;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.submit-button:hover:not(:disabled) {
  background: #0056b3;
}

.submit-button:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.reset-button,
.clear-button {
  background: #6c757d;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
}

.reset-button:hover:not(:disabled),
.clear-button:hover:not(:disabled) {
  background: #545b62;
}

.current-search {
  background: #e3f2fd;
  padding: 15px;
  border-radius: 8px;
  margin: 20px 0;
}

.current-search h3 {
  margin: 0 0 10px 0;
  color: #1976d2;
}

.search-params {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
}

.param {
  background: white;
  padding: 5px 10px;
  border-radius: 12px;
  font-size: 14px;
}

.changes {
  background: #fff3cd;
  border: 1px solid #ffc107;
  padding: 15px;
  border-radius: 8px;
  margin: 20px 0;
}

.changes h4 {
  margin: 0 0 10px 0;
  color: #856404;
}

.changes ul {
  margin: 0;
  padding-left: 20px;
}

.changes li {
  color: #856404;
}

.search-results {
  margin: 20px 0;
}

.search-results h3 {
  color: #495057;
  margin-bottom: 15px;
}

.no-results {
  text-align: center;
  color: #6c757d;
  padding: 40px;
  background: #f8f9fa;
  border-radius: 8px;
}

.results-list {
  display: grid;
  gap: 15px;
}

.result-item {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 20px;
  transition: box-shadow 0.2s ease;
}

.result-item:hover {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.result-item h4 {
  margin: 0 0 10px 0;
  color: #007bff;
}

.result-item p {
  margin: 0 0 10px 0;
  color: #6c757d;
  line-height: 1.5;
}

.result-meta {
  display: flex;
  gap: 15px;
  font-size: 12px;
}

.category {
  background: #28a745;
  color: white;
  padding: 2px 8px;
  border-radius: 10px;
}

.date {
  color: #6c757d;
}
</style>
```

### ルート遷移状態の監視

```vue
<template>
  <div>
    <h1>ローディング状態の表示</h1>
    
    <!-- グローバルローディングインジケーター -->
    <div v-if="isLoading" class="global-loading">
      <div class="loading-spinner"></div>
      <p>ページを読み込んでいます...</p>
    </div>
    
    <!-- クエリのみ変更中の表示 -->
    <div v-if="isQueryOnlyLoading" class="query-loading">
      <div class="loading-bar"></div>
      <p>フィルターを更新中...</p>
    </div>
    
    <!-- ナビゲーションメニュー -->
    <nav class="navigation">
      <div class="nav-links">
        <router-link 
          to="/"
          class="nav-link"
          :class="{ loading: isNavigatingTo('/') }"
        >
          ホーム
          <span v-if="isNavigatingTo('/')" class="nav-spinner"></span>
        </router-link>
        
        <router-link 
          to="/about"
          class="nav-link"
          :class="{ loading: isNavigatingTo('/about') }"
        >
          アバウト
          <span v-if="isNavigatingTo('/about')" class="nav-spinner"></span>
        </router-link>
        
        <router-link 
          to="/products"
          class="nav-link"
          :class="{ loading: isNavigatingTo('/products') }"
        >
          商品一覧
          <span v-if="isNavigatingTo('/products')" class="nav-spinner"></span>
        </router-link>
        
        <button 
          @click="loadHeavyPage"
          class="nav-link button"
          :class="{ loading: isNavigatingTo('/heavy') }"
          :disabled="isNavigatingTo('/heavy')"
        >
          重いページ
          <span v-if="isNavigatingTo('/heavy')" class="nav-spinner"></span>
        </button>
      </div>
    </nav>
    
    <!-- フィルターコントロール -->
    <div class="filter-controls">
      <h3>フィルターコントロール</h3>
      <div class="filter-buttons">
        <button 
          @click="applyFilter('category', 'electronics')"
          :disabled="isFilterLoading"
          class="filter-button"
        >
          電子機器
        </button>
        <button 
          @click="applyFilter('category', 'clothing')"
          :disabled="isFilterLoading"
          class="filter-button"
        >
          衣類
        </button>
        <button 
          @click="applyFilter('sort', 'price')"
          :disabled="isFilterLoading"
          class="filter-button"
        >
          価格順
        </button>
        <button 
          @click="clearFilters"
          :disabled="isFilterLoading"
          class="filter-button clear"
        >
          クリア
        </button>
      </div>
      
      <div v-if="isFilterLoading" class="filter-loading">
        フィルターを適用中...
      </div>
    </div>
    
    <!-- 遷移状態詳細 -->
    <div class="transition-details">
      <h3>遷移状態詳細</h3>
      <div class="status-grid">
        <div class="status-item">
          <strong>現在のパス:</strong>
          <span>{{ location.currentRoute.path }}</span>
        </div>
        
        <div v-if="location.transitioningTo" class="status-item">
          <strong>遷移先パス:</strong>
          <span>{{ location.transitioningTo.path }}</span>
        </div>
        
        <div class="status-item">
          <strong>遷移中:</strong>
          <span :class="isLoading ? 'text-warning' : 'text-success'">
            {{ isLoading ? 'はい' : 'いいえ' }}
          </span>
        </div>
        
        <div class="status-item">
          <strong>クエリのみ遷移:</strong>
          <span :class="isQueryOnlyLoading ? 'text-warning' : 'text-success'">
            {{ isQueryOnlyLoading ? 'はい' : 'いいえ' }}
          </span>
        </div>
        
        <div v-if="location.transitioning?.query.length" class="status-item">
          <strong>変更中クエリ:</strong>
          <span>{{ location.transitioning.query.join(', ') }}</span>
        </div>
      </div>
    </div>
    
    <!-- パフォーマンス計測 -->
    <div class="performance-metrics">
      <h3>パフォーマンス計測</h3>
      <div class="metrics-grid">
        <div class="metric">
          <strong>遷移回数:</strong>
          <span>{{ navigationCount }}</span>
        </div>
        <div class="metric">
          <strong>最後の遷移時間:</strong>
          <span>{{ lastNavigationTime }}ms</span>
        </div>
        <div class="metric">
          <strong>平均遷移時間:</strong>
          <span>{{ averageNavigationTime }}ms</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useLocationService } from '@fastkit/vue-location'

const location = useLocationService()
const navigationCount = ref(0)
const navigationTimes = ref<number[]>([])
const navigationStartTime = ref<number | null>(null)

// ローディング状態
const isLoading = computed(() => !!location.transitioning)
const isQueryOnlyLoading = computed(() => 
  location.isQueryOnlyTransitioning()
)
const isFilterLoading = computed(() => 
  location.isQueryOnlyTransitioning(['category', 'sort', 'filter'])
)

// 特定パスへの遷移状態をチェック
const isNavigatingTo = (path: string) => {
  return location.transitioningTo?.path === path
}

// パフォーマンス計測
const lastNavigationTime = computed(() => 
  navigationTimes.value[navigationTimes.value.length - 1] || 0
)

const averageNavigationTime = computed(() => {
  if (navigationTimes.value.length === 0) return 0
  const sum = navigationTimes.value.reduce((a, b) => a + b, 0)
  return Math.round(sum / navigationTimes.value.length)
})

// ナビゲーションの監視
location.watchRoute((newRoute, oldRoute) => {
  if (oldRoute) {
    navigationCount.value++
    
    if (navigationStartTime.value) {
      const duration = Date.now() - navigationStartTime.value
      navigationTimes.value.push(duration)
      
      // 最大100件まで保持
      if (navigationTimes.value.length > 100) {
        navigationTimes.value.shift()
      }
    }
  }
  
  // 次の遷移のためにリセット
  navigationStartTime.value = null
})

// ルーターフックで遷移開始を検知
location.router.beforeEach(() => {
  navigationStartTime.value = Date.now()
})

// 重いページのロード（シミュレーション）
const loadHeavyPage = async () => {
  // 遅延をシミュレート
  await new Promise(resolve => setTimeout(resolve, 2000))
  location.push('/heavy')
}

// フィルター適用
const applyFilter = (key: string, value: string) => {
  location.pushQuery({ [key]: value })
}

const clearFilters = () => {
  location.push({ path: location.currentRoute.path })
}
</script>

<style>
.global-loading {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 20px;
  text-align: center;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
}

.loading-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-left: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.query-loading {
  background: #fff3cd;
  border: 1px solid #ffc107;
  padding: 10px 20px;
  margin: 10px 0;
  border-radius: 4px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.loading-bar {
  width: 20px;
  height: 4px;
  background: #ffc107;
  border-radius: 2px;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.navigation {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 8px;
  margin: 20px 0;
}

.nav-links {
  display: flex;
  gap: 15px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  text-decoration: none;
  color: #007bff;
  border: 1px solid #007bff;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-link.button {
  font-size: inherit;
  font-family: inherit;
}

.nav-link:hover:not(.loading):not(:disabled) {
  background: #007bff;
  color: white;
}

.nav-link.loading {
  background: #6c757d;
  color: white;
  cursor: not-allowed;
}

.nav-link:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.nav-spinner {
  width: 12px;
  height: 12px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-left: 1px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.filter-controls {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin: 20px 0;
}

.filter-controls h3 {
  margin: 0 0 15px 0;
  color: #495057;
}

.filter-buttons {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.filter-button {
  padding: 6px 12px;
  border: 1px solid #6c757d;
  background: white;
  color: #6c757d;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s ease;
}

.filter-button:hover:not(:disabled) {
  background: #6c757d;
  color: white;
}

.filter-button.clear {
  border-color: #dc3545;
  color: #dc3545;
}

.filter-button.clear:hover:not(:disabled) {
  background: #dc3545;
  color: white;
}

.filter-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.filter-loading {
  color: #856404;
  font-style: italic;
  font-size: 14px;
}

.transition-details,
.performance-metrics {
  background: white;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
}

.transition-details h3,
.performance-metrics h3 {
  margin: 0 0 15px 0;
  color: #495057;
}

.status-grid,
.metrics-grid {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
}

.status-item,
.metric {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: #f8f9fa;
  border-radius: 4px;
}

.text-warning {
  color: #ffc107;
  font-weight: bold;
}

.text-success {
  color: #28a745;
  font-weight: bold;
}
</style>
```

## 高度な使用例

### カスタムルートマッチング

```typescript
// カスタムマッチングロジックの実装
import { useLocationService } from '@fastkit/vue-location'

const useAdvancedRouteMatching = () => {
  const location = useLocationService()
  
  // パスパラメータを含むマッチング
  const matchesUserRoute = (userId?: string) => {
    const current = location.currentRoute
    if (current.name !== 'user-detail') return false
    if (userId && current.params.id !== userId) return false
    return true
  }
  
  // クエリパラメータを含むマッチング
  const matchesSearchRoute = (filters?: Record<string, string>) => {
    if (!location.match('/search')) return false
    if (!filters) return true
    
    return Object.entries(filters).every(([key, value]) => 
      location.currentRoute.query[key] === value
    )
  }
  
  // 適応的ナビゲーション
  const smartNavigate = (target: string, fallback: string = '/') => {
    if (location.isAvailable(target)) {
      return location.push(target)
    } else {
      console.warn(`Route ${target} is not available, redirecting to ${fallback}`)
      return location.push(fallback)
    }
  }
  
  return {
    matchesUserRoute,
    matchesSearchRoute,
    smartNavigate
  }
}
```

### クエリパラメータの高度なバリデーション

```typescript
// 高度なクエリスキーマの定義
const advancedSearchSchema = {
  // 文字列フィールド
  keyword: {
    type: String,
    default: '',
    validate: (value: string) => {
      if (value.length > 100) {
        throw new Error('キーワードは100文字以内で入力してください')
      }
      return value.trim()
    }
  },
  
  // 数値フィールド
  page: {
    type: Number,
    default: 1,
    validate: (value: number) => {
      if (value < 1) {
        throw new Error('ページ番号は1以上である必要があります')
      }
      if (value > 1000) {
        throw new Error('ページ番号は1000以下である必要があります')
      }
      return Math.floor(value)
    }
  },
  
  // 配列フィールド
  categories: {
    type: Array,
    default: [],
    validate: (value: string[]) => {
      const validCategories = ['tech', 'design', 'business', 'science']
      const invalid = value.filter(cat => !validCategories.includes(cat))
      if (invalid.length > 0) {
        throw new Error(`無効なカテゴリ: ${invalid.join(', ')}`)
      }
      return [...new Set(value)] // 重複を除去
    }
  },
  
  // カスタム型フィールド
  dateRange: {
    type: Object,
    default: () => ({ start: null, end: null }),
    serialize: (value: { start: Date | null, end: Date | null }) => {
      if (!value.start && !value.end) return undefined
      return JSON.stringify({
        start: value.start?.toISOString(),
        end: value.end?.toISOString()
      })
    },
    deserialize: (value: string) => {
      try {
        const parsed = JSON.parse(value)
        return {
          start: parsed.start ? new Date(parsed.start) : null,
          end: parsed.end ? new Date(parsed.end) : null
        }
      } catch {
        return { start: null, end: null }
      }
    },
    validate: (value: { start: Date | null, end: Date | null }) => {
      if (value.start && value.end && value.start > value.end) {
        throw new Error('開始日は終了日より前である必要があります')
      }
      return value
    }
  }
}
```

## API リファレンス

### LocationService

```typescript
class LocationService {
  readonly router: Router
  readonly state: LocationServiceState
  readonly currentRoute: RouteLocationNormalizedLoaded
  readonly transitioningTo: _RouteLocationBase | null
  readonly transitioning: LocationTransitioning | null
  
  // ルート監視
  watchRoute<Immediate extends boolean>(
    cb: WatchCallback<RouteLocationNormalizedLoaded>,
    options?: WatchRouteOptions<Immediate>
  ): WatchStopHandle
  
  // ルートマッチング
  locationIsMatched(target: RouteLocationRaw): boolean
  match(raw?: RouteLocationRaw, opts?: SameRouteCheckOptions): boolean
  isAvailable(raw?: RouteLocationRaw): boolean
  
  // クエリ操作
  useQuery<Schema extends QueriesSchema>(schema: Schema): TypedQuery<Schema>
  getQuery(key: string, type?: RouteQueryType, defaultValue?: any): any
  getQueryMergedLocation(query: LocationQueryRaw, route?: RouteLocationNormalizedLoaded): _RouteLocationBase
  
  // ナビゲーション
  push(...args: Parameters<Router['push']>): ReturnType<Router['push']>
  pushQuery(query: LocationQueryRaw): ReturnType<Router['push']>
  replace(...args: Parameters<Router['replace']>): ReturnType<Router['replace']>
  replaceQuery(query: LocationQueryRaw): ReturnType<Router['replace']>
  go(...args: Parameters<Router['go']>): ReturnType<Router['go']>
  back(...args: Parameters<Router['back']>): ReturnType<Router['back']>
  forward(...args: Parameters<Router['forward']>): ReturnType<Router['forward']>
  
  // 遷移状態
  isQueryOnlyTransitioning(queries?: string | string[]): boolean
  
  // コンポーネント取得
  getMatchedComponents(raw?: RouteLocationRaw): RawRouteComponent[]
  
  // インストール
  static install(app: App, ctx: LocationServiceContext): LocationService
}
```

### useLocationService

```typescript
function useLocationService(): LocationService
```

### TypedQuery

```typescript
interface TypedQuery<Schema extends QueriesSchema> {
  // サービスアクセス
  readonly $service: LocationService
  readonly $router: Router
  readonly $currentRoute: RouteLocationNormalizedLoaded
  
  // 状態
  readonly $transitioningQueries: (keyof Schema)[]
  readonly $transitioning: boolean
  readonly $sending: boolean
  readonly $watchKey: ComputedRef<string>
  
  // エクストラクター
  readonly $extractors: QueriesExtractor<Schema>
  readonly $states: TypedQueryExtractStates<Schema>
  
  // ユーティリティ
  $ensure<K extends keyof Schema>(queryKey: K): Exclude<InferQueryType<Schema[K]>, undefined>
  $serialize(values: ExtractQueryInputs<Schema>, mergeCurrentValues?: boolean): LocationQuery
  $serializeCurrentValues(): LocationQuery
  $location(values: ExtractQueryInputs<Schema>, options?: TypedQueryRouteOptions): ReturnType<Router['resolve']>
  $push(values: ExtractQueryInputs<Schema>, options?: TypedQueryRouteOptions): ReturnType<Router['push']>
  $replace(values: ExtractQueryInputs<Schema>, options?: TypedQueryRouteOptions): ReturnType<Router['replace']>
  $form(options?: TypedQueryFormSubmitOptions): TypedQueryForm<Schema>
}
```

### TypedQueryForm

```typescript
interface TypedQueryForm<Schema extends QueriesSchema> {
  readonly ctx: TypedQuery<Schema>
  readonly to?: RouteLocationRaw
  readonly behavior: TypedQueryFormSubmitBehavior
  readonly query: Readonly<ExtractQueryTypes<Schema>>
  readonly values: ExtractQueryTypes<Schema>
  readonly changes: (keyof Schema)[]
  readonly hasChanged: boolean
  readonly transitioningQueries: (keyof Schema)[]
  readonly transitioning: boolean
  readonly sending: boolean
  readonly watchKey: ComputedRef<string>
  
  reset(): void
  submit(options?: TypedQueryFormSubmitOptions): ReturnType<Router['push']>
}
```

### ユーティリティ関数

```typescript
function locationIsMatched(router: Router, target: RouteLocationRaw): boolean
function pickShallowRoute(route: _RouteLocationBase): _RouteLocationBase
```

## パフォーマンス最適化

### メモリリークの防止

```typescript
// コンポーネントでの適切なクリーンアップ
import { onBeforeUnmount } from 'vue'
import { useLocationService } from '@fastkit/vue-location'

const useRouteWatcher = () => {
  const location = useLocationService()
  
  // autoStop: true（デフォルト）で自動クリーンアップ
  const stopWatcher = location.watchRoute((route) => {
    console.log('Route changed:', route.path)
  }, { autoStop: true })
  
  // 手動でクリーンアップする場合
  onBeforeUnmount(() => {
    stopWatcher()
  })
}
```

### 大量クエリの最適化

```typescript
// クエリのデバウンス処理
import { debounce } from 'lodash-es'

const useOptimizedQuery = <T extends QueriesSchema>(schema: T) => {
  const location = useLocationService()
  const query = location.useQuery(schema)
  
  // デバウンスされた更新関数
  const debouncedPush = debounce(
    (values: any) => query.$push(values),
    300
  )
  
  return {
    ...query,
    pushDebounced: debouncedPush
  }
}
```

## 関連パッケージ

- `vue-router` - Vue Router 4.x
- `@fastkit/vue-utils` - Vue.js開発ユーティリティ

## ライセンス

MIT
