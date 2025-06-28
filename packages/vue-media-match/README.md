# @fastkit/vue-media-match

VueアプリケーションでTypeセーフなメディアクエリブレイクポイントスキーマを扱うためのライブラリ。リアクティブなメディアクエリ状態管理により、レスポンシブデザインを効率的に実装できます。

## 機能

- **TypeSafeなメディアクエリ**: 型安全なブレイクポイント管理
- **リアクティブな状態管理**: Vueのリアクティブシステムとの完全統合
- **高いパフォーマンス**: 効率的なMediaQueryListイベント処理
- **柔軟なブレイクポイント設定**: カスタムメディアクエリ条件の登録
- **SSR対応**: サーバーサイドレンダリング環境での安全な動作
- **自動セットアップ**: onMountedでの自動初期化
- **メモリ効率**: 適切なリスナーの管理とクリーンアップ
- **デバッグサポート**: 開発時の状態確認機能

## インストール

```bash
npm install @fastkit/vue-media-match
```

## 基本的な使用方法

### ブレイクポイントの定義

```typescript
// breakpoints.ts
import { registerMediaMatchConditions } from '@fastkit/vue-media-match'

// カスタムブレイクポイントを定義
declare module '@fastkit/media-match' {
  interface MediaMatchKeyMap {
    xs: true
    sm: true
    md: true
    lg: true
    xl: true
    mobile: true
    tablet: true
    desktop: true
    'dark-mode': true
    'high-contrast': true
    'reduced-motion': true
  }
}

// メディアクエリ条件を登録
registerMediaMatchConditions([
  {
    key: 'xs',
    condition: '(max-width: 599px)',
    description: 'Extra small devices'
  },
  {
    key: 'sm',
    condition: '(min-width: 600px) and (max-width: 959px)',
    description: 'Small devices'
  },
  {
    key: 'md',
    condition: '(min-width: 960px) and (max-width: 1279px)',
    description: 'Medium devices'
  },
  {
    key: 'lg',
    condition: '(min-width: 1280px) and (max-width: 1919px)',
    description: 'Large devices'
  },
  {
    key: 'xl',
    condition: '(min-width: 1920px)',
    description: 'Extra large devices'
  },
  {
    key: 'mobile',
    condition: '(max-width: 767px)',
    description: 'Mobile devices'
  },
  {
    key: 'tablet',
    condition: '(min-width: 768px) and (max-width: 1023px)',
    description: 'Tablet devices'
  },
  {
    key: 'desktop',
    condition: '(min-width: 1024px)',
    description: 'Desktop devices'
  },
  {
    key: 'dark-mode',
    condition: '(prefers-color-scheme: dark)',
    description: 'Dark color scheme preference'
  },
  {
    key: 'high-contrast',
    condition: '(prefers-contrast: high)',
    description: 'High contrast preference'
  },
  {
    key: 'reduced-motion',
    condition: '(prefers-reduced-motion: reduce)',
    description: 'Reduced motion preference'
  }
])
```

### 基本的なレスポンシブコンポーネント

```vue
<template>
  <div class="responsive-layout">
    <h2>レスポンシブレイアウト</h2>
    
    <!-- デバイスタイプ表示 -->>
    <div class="device-info">
      <h3>現在のデバイス</h3>
      <div class="device-badges">
        <span v-if="mediaMatch('mobile')" class="badge mobile">📱 モバイル</span>
        <span v-if="mediaMatch('tablet')" class="badge tablet">📊 タブレット</span>
        <span v-if="mediaMatch('desktop')" class="badge desktop">🖥️ デスクトップ</span>
      </div>
    </div>
    
    <!-- ブレイクポイント表示 -->
    <div class="breakpoint-info">
      <h3>ブレイクポイント状態</h3>
      <div class="breakpoint-grid">
        <div 
          v-for="(active, breakpoint) in breakpoints" 
          :key="breakpoint"
          class="breakpoint-item"
          :class="{ active }"
        >
          <span class="breakpoint-name">{{ breakpoint }}</span>
          <span class="breakpoint-status">{{ active ? '✅' : '❌' }}</span>
        </div>
      </div>
    </div>
    
    <!-- アクセシビリティ設定 -->
    <div class="accessibility-info">
      <h3>アクセシビリティ設定</h3>
      <div class="accessibility-list">
        <div class="accessibility-item" :class="{ active: mediaMatch('dark-mode') }">
          🌙 ダークモード: {{ mediaMatch('dark-mode') ? 'ON' : 'OFF' }}
        </div>
        <div class="accessibility-item" :class="{ active: mediaMatch('high-contrast') }">
          🔆 ハイコントラスト: {{ mediaMatch('high-contrast') ? 'ON' : 'OFF' }}
        </div>
        <div class="accessibility-item" :class="{ active: mediaMatch('reduced-motion') }">
          🏃 モーション軽減: {{ mediaMatch('reduced-motion') ? 'ON' : 'OFF' }}
        </div>
      </div>
    </div>
    
    <!-- レスポンシブコンテンツ -->
    <div class="content-area">
      <div v-if="mediaMatch('mobile')" class="mobile-content">
        <h3>モバイル向けコンテンツ</h3>
        <div class="mobile-nav">
          <button class="nav-button">☰ メニュー</button>
          <button class="nav-button">🔍 検索</button>
        </div>
        <div class="mobile-cards">
          <div class="card">カード 1</div>
          <div class="card">カード 2</div>
        </div>
      </div>
      
      <div v-else-if="mediaMatch('tablet')" class="tablet-content">
        <h3>タブレット向けコンテンツ</h3>
        <div class="tablet-layout">
          <aside class="sidebar">
            <nav>
              <ul>
                <li>ホーム</li>
                <li>カテゴリ</li>
                <li>検索</li>
              </ul>
            </nav>
          </aside>
          <main class="main-content">
            <div class="card-grid">
              <div class="card">カード 1</div>
              <div class="card">カード 2</div>
              <div class="card">カード 3</div>
              <div class="card">カード 4</div>
            </div>
          </main>
        </div>
      </div>
      
      <div v-else class="desktop-content">
        <h3>デスクトップ向けコンテンツ</h3>
        <div class="desktop-layout">
          <aside class="sidebar">
            <nav>
              <ul>
                <li>ダッシュボード</li>
                <li>プロジェクト</li>
                <li>チーム</li>
                <li>設定</li>
              </ul>
            </nav>
          </aside>
          <main class="main-content">
            <div class="desktop-grid">
              <div class="card large">大きなカード</div>
              <div class="card">カード 1</div>
              <div class="card">カード 2</div>
              <div class="card">カード 3</div>
              <div class="card">カード 4</div>
              <div class="card">カード 5</div>
            </div>
          </main>
          <aside class="right-sidebar">
            <div class="widget">ウィジェット 1</div>
            <div class="widget">ウィジェット 2</div>
          </aside>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useMediaMatch } from '@fastkit/vue-media-match'

const mediaMatch = useMediaMatch()

// 全ブレイクポイントの状態を取得
const breakpoints = computed(() => mediaMatch.state())

// 便利なヘルパー
const isMobile = computed(() => mediaMatch('mobile'))
const isTablet = computed(() => mediaMatch('tablet'))
const isDesktop = computed(() => mediaMatch('desktop'))
const isDarkMode = computed(() => mediaMatch('dark-mode'))

// デバイスタイプを判定
const deviceType = computed(() => {
  if (isMobile.value) return 'mobile'
  if (isTablet.value) return 'tablet'
  return 'desktop'
})

console.log('Current device type:', deviceType.value)
</script>

<style scoped>
.responsive-layout {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.device-info {
  margin: 20px 0;
  padding: 16px;
  border: 1px solid #eee;
  border-radius: 8px;
}

.device-badges {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.badge {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9em;
}

.badge.mobile {
  background: #e3f2fd;
  color: #1976d2;
}

.badge.tablet {
  background: #f3e5f5;
  color: #7b1fa2;
}

.badge.desktop {
  background: #e8f5e8;
  color: #388e3c;
}

.breakpoint-info {
  margin: 20px 0;
  padding: 16px;
  border: 1px solid #eee;
  border-radius: 8px;
}

.breakpoint-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 8px;
  margin-top: 10px;
}

.breakpoint-item {
  display: flex;
  justify-content: space-between;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 0.9em;
}

.breakpoint-item.active {
  background: #e8f5e8;
  border-color: #4caf50;
}

.accessibility-info {
  margin: 20px 0;
  padding: 16px;
  border: 1px solid #eee;
  border-radius: 8px;
}

.accessibility-list {
  margin-top: 10px;
}

.accessibility-item {
  padding: 8px;
  margin: 4px 0;
  border-radius: 4px;
  background: #f5f5f5;
}

.accessibility-item.active {
  background: #fff3e0;
  color: #f57c00;
}

.content-area {
  margin: 20px 0;
  padding: 16px;
  border: 1px solid #eee;
  border-radius: 8px;
}

/* モバイルレイアウト */
.mobile-content .mobile-nav {
  display: flex;
  gap: 10px;
  margin: 15px 0;
}

.nav-button {
  flex: 1;
  padding: 12px;
  border: none;
  background: #007acc;
  color: white;
  border-radius: 4px;
  cursor: pointer;
}

.mobile-cards {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* タブレットレイアウト */
.tablet-layout {
  display: flex;
  gap: 20px;
}

.sidebar {
  width: 200px;
  background: #f5f5f5;
  padding: 16px;
  border-radius: 4px;
}

.main-content {
  flex: 1;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
}

/* デスクトップレイアウト */
.desktop-layout {
  display: grid;
  grid-template-columns: 200px 1fr 200px;
  gap: 20px;
}

.desktop-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.right-sidebar {
  background: #f0f0f0;
  padding: 16px;
  border-radius: 4px;
}

.card {
  padding: 20px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 8px;
  text-align: center;
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card.large {
  grid-column: span 2;
  min-height: 120px;
  background: #e3f2fd;
}

.widget {
  padding: 15px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin: 10px 0;
  text-align: center;
}

.sidebar ul {
  list-style: none;
  padding: 0;
}

.sidebar li {
  padding: 8px 0;
  border-bottom: 1px solid #eee;
  cursor: pointer;
}

.sidebar li:hover {
  background: #f0f0f0;
}
</style>
```

## 実用的な使用例

### レスポンシブナビゲーション

```vue
<template>
  <nav class="responsive-nav" :class="navClasses">
    <!-- モバイル用ハンバーガーメニュー -->
    <div v-if="mediaMatch('mobile')" class="mobile-nav">
      <div class="nav-header">
        <h1 class="logo">MyApp</h1>
        <button 
          class="hamburger-btn"
          @click="toggleMobileMenu"
          :class="{ active: showMobileMenu }"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
      
      <div class="mobile-menu" :class="{ open: showMobileMenu }">
        <ul class="nav-list">
          <li><a href="#" @click="closeMobileMenu">ホーム</a></li>
          <li><a href="#" @click="closeMobileMenu">サービス</a></li>
          <li><a href="#" @click="closeMobileMenu">会社概要</a></li>
          <li><a href="#" @click="closeMobileMenu">お問い合わせ</a></li>
        </ul>
        
        <div class="mobile-actions">
          <button class="btn-login">ログイン</button>
          <button class="btn-signup">登録</button>
        </div>
      </div>
    </div>
    
    <!-- タブレット・デスクトップ用ナビゲーション -->
    <div v-else class="desktop-nav">
      <h1 class="logo">MyApp</h1>
      
      <ul class="nav-list">
        <li><a href="#">ホーム</a></li>
        <li><a href="#">サービス</a></li>
        <li><a href="#">会社概要</a></li>
        <li><a href="#">お問い合わせ</a></li>
      </ul>
      
      <div class="nav-actions">
        <button class="btn-login">ログイン</button>
        <button class="btn-signup">登録</button>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useMediaMatch } from '@fastkit/vue-media-match'

const mediaMatch = useMediaMatch()
const showMobileMenu = ref(false)

const navClasses = computed(() => ({
  'mobile-mode': mediaMatch('mobile'),
  'tablet-mode': mediaMatch('tablet'),
  'desktop-mode': mediaMatch('desktop'),
  'dark-mode': mediaMatch('dark-mode')
}))

const toggleMobileMenu = () => {
  showMobileMenu.value = !showMobileMenu.value
}

const closeMobileMenu = () => {
  showMobileMenu.value = false
}
</script>

<style scoped>
.responsive-nav {
  background: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.responsive-nav.dark-mode {
  background: #1a1a1a;
  color: white;
}

/* モバイルナビゲーション */
.mobile-nav {
  padding: 0 16px;
}

.nav-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
}

.logo {
  margin: 0;
  font-size: 1.5rem;
  color: #007acc;
}

.hamburger-btn {
  background: none;
  border: none;
  width: 30px;
  height: 30px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  padding: 4px;
}

.hamburger-btn span {
  display: block;
  height: 3px;
  width: 100%;
  background: #333;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.hamburger-btn.active span:nth-child(1) {
  transform: rotate(45deg) translate(6px, 6px);
}

.hamburger-btn.active span:nth-child(2) {
  opacity: 0;
}

.hamburger-btn.active span:nth-child(3) {
  transform: rotate(-45deg) translate(6px, -6px);
}

.mobile-menu {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease;
}

.mobile-menu.open {
  max-height: 400px;
}

.mobile-menu .nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.mobile-menu .nav-list li {
  border-bottom: 1px solid #eee;
}

.mobile-menu .nav-list a {
  display: block;
  padding: 16px 0;
  text-decoration: none;
  color: #333;
  font-weight: 500;
}

.mobile-actions {
  padding: 20px 0;
  display: flex;
  gap: 10px;
}

/* デスクトップナビゲーション */
.desktop-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  height: 70px;
}

.desktop-nav .nav-list {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 32px;
}

.desktop-nav .nav-list a {
  text-decoration: none;
  color: #333;
  font-weight: 500;
  transition: color 0.2s ease;
}

.desktop-nav .nav-list a:hover {
  color: #007acc;
}

.nav-actions {
  display: flex;
  gap: 12px;
}

/* ボタンスタイル */
.btn-login, .btn-signup {
  padding: 8px 16px;
  border: 1px solid #007acc;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-login {
  background: white;
  color: #007acc;
}

.btn-login:hover {
  background: #f0f8ff;
}

.btn-signup {
  background: #007acc;
  color: white;
}

.btn-signup:hover {
  background: #0056a3;
}

/* タブレット用調整 */
.responsive-nav.tablet-mode .desktop-nav {
  padding: 0 24px;
}

.responsive-nav.tablet-mode .nav-list {
  gap: 24px;
}
</style>
```

### アダプティブコンポーネント

```vue
<template>
  <div class="adaptive-dashboard">
    <h2>アダプティブダッシュボード</h2>
    
    <!-- レイアウト切り替えコントロール -->
    <div class="layout-controls">
      <div class="current-layout">
        現在のレイアウト: {{ currentLayoutName }}
      </div>
      <div class="breakpoint-debug" v-if="isDevelopment">
        <details>
          <summary>ブレイクポイント詳細</summary>
          <pre>{{ JSON.stringify(mediaMatch.state(), null, 2) }}</pre>
        </details>
      </div>
    </div>
    
    <!-- 動的レイアウト -->
    <div class="dashboard-content" :class="layoutClasses">
      <!-- カードリスト -->
      <div class="cards-section">
        <h3>統計カード</h3>
        <div class="cards-container">
          <div 
            v-for="card in visibleCards"
            :key="card.id"
            class="stat-card"
            :class="card.type"
          >
            <div class="card-icon">{{ card.icon }}</div>
            <div class="card-content">
              <h4>{{ card.title }}</h4>
              <div class="card-value">{{ card.value }}</div>
              <div class="card-change" :class="card.trend">
                {{ card.change }}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- チャートセクション -->
      <div class="chart-section" v-if="showCharts">
        <h3>チャート</h3>
        <div class="chart-container" :style="chartContainerStyle">
          <div class="chart" v-for="chart in visibleCharts" :key="chart.id">
            <h4>{{ chart.title }}</h4>
            <div class="chart-placeholder">
              📊 {{ chart.type }}チャート
            </div>
          </div>
        </div>
      </div>
      
      <!-- データテーブル -->
      <div class="table-section" v-if="showTable">
        <h3>データテーブル</h3>
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th v-for="column in visibleColumns" :key="column">
                  {{ column }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in tableData" :key="row.id">
                <td v-for="column in visibleColumns" :key="column">
                  {{ row[column.toLowerCase()] }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useMediaMatch } from '@fastkit/vue-media-match'

const mediaMatch = useMediaMatch()
const isDevelopment = ref(process.env.NODE_ENV === 'development')

// レイアウト設定
const layoutClasses = computed(() => ({
  'layout-mobile': mediaMatch('mobile'),
  'layout-tablet': mediaMatch('tablet'),
  'layout-desktop': mediaMatch('desktop'),
  'layout-xl': mediaMatch('xl'),
  'reduced-motion': mediaMatch('reduced-motion')
}))

const currentLayoutName = computed(() => {
  if (mediaMatch('mobile')) return 'モバイル'
  if (mediaMatch('tablet')) return 'タブレット'
  if (mediaMatch('desktop')) return 'デスクトップ'
  if (mediaMatch('xl')) return '大画面'
  return '不明'
})

// 表示する要素の制御
const showCharts = computed(() => !mediaMatch('xs'))
const showTable = computed(() => mediaMatch('desktop') || mediaMatch('xl'))

// カードの表示数制御
const allCards = ref([
  { id: 1, title: '売上', value: '¥1,234,567', change: '+12%', trend: 'up', icon: '💰', type: 'revenue' },
  { id: 2, title: 'ユーザー数', value: '12,345', change: '+5%', trend: 'up', icon: '👥', type: 'users' },
  { id: 3, title: '注文数', value: '789', change: '-2%', trend: 'down', icon: '📦', type: 'orders' },
  { id: 4, title: 'コンバージョン', value: '3.4%', change: '+0.2%', trend: 'up', icon: '📈', type: 'conversion' },
  { id: 5, title: 'セッション', value: '45,678', change: '+8%', trend: 'up', icon: '🔍', type: 'sessions' },
  { id: 6, title: '離脱率', value: '23%', change: '-1%', trend: 'up', icon: '🚪', type: 'bounce' }
])

const visibleCards = computed(() => {
  if (mediaMatch('mobile')) return allCards.value.slice(0, 2)
  if (mediaMatch('tablet')) return allCards.value.slice(0, 4)
  return allCards.value
})

// チャートの設定
const allCharts = ref([
  { id: 1, title: '売上推移', type: 'ライン' },
  { id: 2, title: 'ユーザー分析', type: 'バー' },
  { id: 3, title: '地域別売上', type: 'パイ' },
  { id: 4, title: 'トレンド分析', type: 'エリア' }
])

const visibleCharts = computed(() => {
  if (mediaMatch('tablet')) return allCharts.value.slice(0, 2)
  if (mediaMatch('desktop')) return allCharts.value.slice(0, 3)
  return allCharts.value
})

const chartContainerStyle = computed(() => {
  if (mediaMatch('mobile')) {
    return { gridTemplateColumns: '1fr' }
  }
  if (mediaMatch('tablet')) {
    return { gridTemplateColumns: 'repeat(2, 1fr)' }
  }
  return { gridTemplateColumns: 'repeat(2, 1fr)' }
})

// テーブルの設定
const allColumns = ['名前', '売上', '注文数', '地域', 'ステータス', '更新日']

const visibleColumns = computed(() => {
  if (mediaMatch('tablet')) return allColumns.slice(0, 4)
  return allColumns
})

const tableData = ref([
  { id: 1, 名前: '田中太郎', 売上: '¥123,456', 注文数: '45', 地域: '東京', ステータス: 'アクティブ', 更新日: '2024-01-15' },
  { id: 2, 名前: '佐藤花子', 売上: '¥234,567', 注文数: '67', 地域: '大阪', ステータス: 'アクティブ', 更新日: '2024-01-14' },
  { id: 3, 名前: '鈴木一郎', 売上: '¥345,678', 注文数: '89', 地域: '名古屋', ステータス: '保留', 更新日: '2024-01-13' }
])
</script>

<style scoped>
.adaptive-dashboard {
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

.layout-controls {
  margin-bottom: 20px;
  padding: 16px;
  background: #f8f9fa;
  border-radius: 8px;
}

.current-layout {
  font-weight: bold;
  color: #007acc;
}

.breakpoint-debug {
  margin-top: 10px;
}

.breakpoint-debug pre {
  background: white;
  padding: 10px;
  border-radius: 4px;
  font-size: 0.8em;
  overflow-x: auto;
}

.dashboard-content {
  display: grid;
  gap: 24px;
}

/* モバイルレイアウト */
.dashboard-content.layout-mobile {
  grid-template-columns: 1fr;
}

/* タブレットレイアウト */
.dashboard-content.layout-tablet {
  grid-template-columns: 1fr;
}

/* デスクトップレイアウト */
.dashboard-content.layout-desktop {
  grid-template-columns: 1fr;
}

/* 大画面レイアウト */
.dashboard-content.layout-xl {
  grid-template-columns: 2fr 1fr;
}

.cards-section, .chart-section, .table-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

/* カードスタイル */
.cards-container {
  display: grid;
  gap: 16px;
  margin-top: 16px;
}

.layout-mobile .cards-container {
  grid-template-columns: 1fr;
}

.layout-tablet .cards-container {
  grid-template-columns: repeat(2, 1fr);
}

.layout-desktop .cards-container,
.layout-xl .cards-container {
  grid-template-columns: repeat(3, 1fr);
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 16px;
  border: 1px solid #eee;
  border-radius: 8px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.reduced-motion .stat-card {
  transition: none;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.reduced-motion .stat-card:hover {
  transform: none;
}

.card-icon {
  font-size: 2rem;
  margin-right: 16px;
}

.card-content h4 {
  margin: 0 0 8px 0;
  color: #666;
  font-size: 0.9rem;
}

.card-value {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 4px;
}

.card-change {
  font-size: 0.8rem;
  font-weight: 500;
}

.card-change.up {
  color: #4caf50;
}

.card-change.down {
  color: #f44336;
}

/* チャートスタイル */
.chart-container {
  display: grid;
  gap: 16px;
  margin-top: 16px;
}

.chart {
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
  text-align: center;
}

.chart h4 {
  margin: 0 0 16px 0;
  color: #333;
}

.chart-placeholder {
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border-radius: 4px;
  font-size: 1.2rem;
}

/* テーブルスタイル */
.table-wrapper {
  margin-top: 16px;
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.data-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #333;
}

.data-table tr:hover {
  background: #f8f9fa;
}

.reduced-motion .data-table tr:hover {
  background: inherit;
}

/* レスポンシブ調整 */
@media (max-width: 599px) {
  .adaptive-dashboard {
    padding: 12px;
  }
  
  .cards-section, .chart-section, .table-section {
    padding: 16px;
  }
}
</style>
```

### メディアクエリベースのスタイリング

```vue
<template>
  <div class="media-aware-component">
    <h2>メディアクエリ対応コンポーネント</h2>
    
    <!-- 動的スタイリング例 -->
    <div class="dynamic-styles" :style="dynamicStyles">
      <h3>動的スタイル</h3>
      <p>このボックスはブレイクポイントに応じてスタイルが変化します</p>
    </div>
    
    <!-- フォントサイズ調整 -->
    <div class="typography-section">
      <h3 class="responsive-heading">レスポンシブタイポグラフィ</h3>
      <p class="responsive-text">
        このテキストは画面サイズに応じて最適化されます。
        モバイルでは読みやすさを、デスクトップでは情報密度を重視します。
      </p>
    </div>
    
    <!-- 条件付きアニメーション -->
    <div class="animation-section">
      <h3>条件付きアニメーション</h3>
      <div 
        class="animated-box"
        :class="animationClasses"
        @click="triggerAnimation"
      >
        クリックしてアニメーション
      </div>
    </div>
    
    <!-- パフォーマンス最適化表示 -->
    <div class="performance-section">
      <h3>パフォーマンス最適化</h3>
      <div v-if="shouldShowHeavyContent" class="heavy-content">
        <div v-for="n in heavyContentItems" :key="n" class="heavy-item">
          重いコンテンツ {{ n }}
        </div>
      </div>
      <div v-else class="light-content">
        軽量版コンテンツ（モバイル最適化）
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useMediaMatch } from '@fastkit/vue-media-match'

const mediaMatch = useMediaMatch()
const animationTriggered = ref(false)

// 動的スタイル計算
const dynamicStyles = computed(() => {
  const styles: Record<string, string> = {}
  
  // 背景色をブレイクポイントに応じて変更
  if (mediaMatch('mobile')) {
    styles.backgroundColor = '#e3f2fd'
    styles.padding = '12px'
    styles.borderRadius = '4px'
  } else if (mediaMatch('tablet')) {
    styles.backgroundColor = '#f3e5f5'
    styles.padding = '20px'
    styles.borderRadius = '8px'
  } else {
    styles.backgroundColor = '#e8f5e8'
    styles.padding = '24px'
    styles.borderRadius = '12px'
  }
  
  // ダークモード対応
  if (mediaMatch('dark-mode')) {
    styles.backgroundColor = '#333'
    styles.color = 'white'
  }
  
  return styles
})

// アニメーションクラス
const animationClasses = computed(() => ({
  'animate': animationTriggered.value && !mediaMatch('reduced-motion'),
  'no-motion': mediaMatch('reduced-motion')
}))

// パフォーマンス最適化
const shouldShowHeavyContent = computed(() => {
  // モバイルでは軽量コンテンツのみ表示
  return !mediaMatch('mobile')
})

const heavyContentItems = computed(() => {
  // 画面サイズに応じてアイテム数を調整
  if (mediaMatch('tablet')) return 10
  if (mediaMatch('desktop')) return 20
  return 30
})

const triggerAnimation = () => {
  animationTriggered.value = true
  setTimeout(() => {
    animationTriggered.value = false
  }, 1000)
}
</script>

<style scoped>
.media-aware-component {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

/* 動的スタイリング */
.dynamic-styles {
  margin: 20px 0;
  transition: all 0.3s ease;
}

/* レスポンシブタイポグラフィ */
.responsive-heading {
  font-size: clamp(1.5rem, 4vw, 2.5rem);
  line-height: 1.2;
  margin: 20px 0 10px 0;
}

.responsive-text {
  font-size: clamp(0.9rem, 2.5vw, 1.1rem);
  line-height: 1.6;
  margin: 0;
}

/* アニメーション */
.animation-section {
  margin: 30px 0;
}

.animated-box {
  width: 200px;
  height: 100px;
  background: #007acc;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  cursor: pointer;
  user-select: none;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.animated-box.animate {
  transform: scale(1.1) rotate(5deg);
  box-shadow: 0 8px 16px rgba(0, 122, 204, 0.4);
}

.animated-box.no-motion {
  transition: none;
}

.animated-box.no-motion.animate {
  transform: none;
  box-shadow: none;
  background: #0056a3;
}

/* パフォーマンス最適化コンテンツ */
.performance-section {
  margin: 30px 0;
}

.heavy-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
  margin-top: 15px;
}

.heavy-item {
  padding: 20px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  text-align: center;
  min-height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.light-content {
  padding: 30px;
  background: #fff3e0;
  border: 2px solid #ff9800;
  border-radius: 8px;
  text-align: center;
  font-weight: bold;
  color: #f57c00;
}

/* メディアクエリによる詳細調整 */
@media (max-width: 599px) {
  .media-aware-component {
    padding: 12px;
  }
  
  .animated-box {
    width: 100%;
    max-width: 300px;
  }
}

@media (min-width: 600px) and (max-width: 959px) {
  .heavy-content {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 960px) {
  .heavy-content {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* ダークモードサポート */
@media (prefers-color-scheme: dark) {
  .media-aware-component {
    color: #e0e0e0;
  }
  
  .heavy-item {
    background: #424242;
    border-color: #666;
    color: #e0e0e0;
  }
}

/* ハイコントラストサポート */
@media (prefers-contrast: high) {
  .animated-box {
    border: 2px solid white;
  }
  
  .heavy-item {
    border-width: 2px;
    border-color: #000;
  }
}

/* モーション軽減サポート */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
```

## API仕様

### `useMediaMatch()`

メディアクエリの状態を監視するComposable関数。

```typescript
function useMediaMatch(): VueMediaMatchService
```

**戻り値:**
- `VueMediaMatchService`: メディアクエリサービスインスタンス

**使用例:**
```typescript
const mediaMatch = useMediaMatch()

// ブレイクポイント判定
const isMobile = mediaMatch('mobile')

// 全状態取得
const state = mediaMatch.state()

// 条件確認
const isLargeScreen = mediaMatch('lg') || mediaMatch('xl')
```

### `VueMediaMatchService`

メディアクエリ状態管理サービス。

**メソッド:**
- `(key: MediaMatchKey): boolean` - 指定されたブレイクポイントがマッチするかを返す
- `state(): MediaMatchServiceState` - 全ブレイクポイントの状態を返す
- `matches(key: MediaMatchKey): boolean` - ブレイクポイント判定（関数呼び出しと同じ）
- `conditions(): MediaMatchConditions` - 登録済みの条件一覧を返す
- `bootState(): BootState` - サービスの初期化状態を返す
- `isPending(): boolean` - 初期化待ちかどうかを返す
- `isBooted(): boolean` - 初期化完了かどうかを返す
- `flush(): void` - 全リスナーの状態を強制更新
- `setup(): void` - サービスを手動初期化
- `dispose(): void` - サービスを破棄してリスナーをクリーンアップ

### `registerMediaMatchConditions()`

カスタムメディアクエリ条件を登録する関数。

```typescript
function registerMediaMatchConditions(
  conditions: MediaMatchCondition[]
): MediaMatchConditions
```

**パラメータ:**
- `conditions`: 登録するメディアクエリ条件の配列

**使用例:**
```typescript
registerMediaMatchConditions([
  {
    key: 'mobile',
    condition: '(max-width: 767px)',
    description: 'Mobile devices'
  }
])
```

### 型定義

```typescript
// メディアクエリキーの型（Module Augmentation）
declare module '@fastkit/media-match' {
  interface MediaMatchKeyMap {
    mobile: true
    tablet: true
    desktop: true
    // ... その他のカスタムキー
  }
}

// メディアクエリ条件
interface MediaMatchCondition {
  key: MediaMatchKey          // ユニークなキー
  condition: string          // CSS メディアクエリ文字列
  description: string        // 説明文
}

// サービス状態
type MediaMatchServiceState = Record<MediaMatchKey, boolean>

// 初期化状態
type BootState = 'pending' | 'resvered' | 'ready'
```

## 高度な使用例

### カスタムブレイクポイントシステム

```typescript
// custom-breakpoints.ts
import { registerMediaMatchConditions } from '@fastkit/vue-media-match'

// カスタムブレイクポイントの型定義
declare module '@fastkit/media-match' {
  interface MediaMatchKeyMap {
    // デバイスサイズ
    'phone': true
    'tablet-portrait': true
    'tablet-landscape': true
    'laptop': true
    'desktop': true
    'ultrawide': true
    
    // 機能ベース
    'touch': true
    'hover': true
    'retina': true
    
    // アクセシビリティ
    'dark-mode': true
    'light-mode': true
    'high-contrast': true
    'reduced-motion': true
    'reduced-data': true
    
    // 印刷
    'print': true
    'screen': true
  }
}

// ブレイクポイント定義
export const customBreakpoints = [
  // デバイスサイズ
  {
    key: 'phone' as const,
    condition: '(max-width: 599px)',
    description: 'Phone devices'
  },
  {
    key: 'tablet-portrait' as const,
    condition: '(min-width: 600px) and (max-width: 899px) and (orientation: portrait)',
    description: 'Tablet in portrait mode'
  },
  {
    key: 'tablet-landscape' as const,
    condition: '(min-width: 600px) and (max-width: 1199px) and (orientation: landscape)',
    description: 'Tablet in landscape mode'
  },
  {
    key: 'laptop' as const,
    condition: '(min-width: 900px) and (max-width: 1439px)',
    description: 'Laptop screens'
  },
  {
    key: 'desktop' as const,
    condition: '(min-width: 1440px) and (max-width: 1919px)',
    description: 'Desktop screens'
  },
  {
    key: 'ultrawide' as const,
    condition: '(min-width: 1920px)',
    description: 'Ultrawide screens'
  },
  
  // 機能ベース
  {
    key: 'touch' as const,
    condition: '(pointer: coarse)',
    description: 'Touch-capable devices'
  },
  {
    key: 'hover' as const,
    condition: '(hover: hover)',
    description: 'Devices that support hover'
  },
  {
    key: 'retina' as const,
    condition: '(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)',
    description: 'High-DPI displays'
  },
  
  // アクセシビリティ
  {
    key: 'dark-mode' as const,
    condition: '(prefers-color-scheme: dark)',
    description: 'Dark color scheme preference'
  },
  {
    key: 'light-mode' as const,
    condition: '(prefers-color-scheme: light)',
    description: 'Light color scheme preference'
  },
  {
    key: 'high-contrast' as const,
    condition: '(prefers-contrast: high)',
    description: 'High contrast preference'
  },
  {
    key: 'reduced-motion' as const,
    condition: '(prefers-reduced-motion: reduce)',
    description: 'Reduced motion preference'
  },
  {
    key: 'reduced-data' as const,
    condition: '(prefers-reduced-data: reduce)',
    description: 'Reduced data usage preference'
  },
  
  // メディアタイプ
  {
    key: 'print' as const,
    condition: 'print',
    description: 'Print media'
  },
  {
    key: 'screen' as const,
    condition: 'screen',
    description: 'Screen media'
  }
]

// ブレイクポイントを登録
registerMediaMatchConditions(customBreakpoints)
```

## 注意事項

### パフォーマンス考慮事項

- MediaQueryListイベントは効率的に管理され、不要なリスナーは自動的にクリーンアップされます
- 大量のブレイクポイントを同時監視する場合は、パフォーマンスに注意
- SSR環境では初期化時にwindowオブジェクトの存在確認を行っています

### ブラウザ対応

- モダンブラウザすべてでサポート
- Internet Explorer 11以降で動作
- MediaQueryList APIを使用

### SSR対応

- サーバーサイドでは全てのブレイクポイントがfalseで初期化
- クライアントサイドでマウント後に実際の値に更新
- ハイドレーション時の不整合を防ぐ設計

### TypeScript設定

- Module Augmentationを使用してカスタムブレイクポイントの型安全性を確保
- 未登録のキーを使用した場合はコンパイルエラーで検出

## ライセンス

MIT

## 関連パッケージ

- [@fastkit/media-match](../media-match/README.md): コアメディアクエリ機能
- [@fastkit/helpers](../helpers/README.md): 基本的なユーティリティ関数
- [@fastkit/vue-utils](../vue-utils/README.md): Vue.jsユーティリティ関数