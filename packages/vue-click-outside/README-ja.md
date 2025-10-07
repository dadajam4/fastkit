# @fastkit/vue-click-outside

🌐 [English](https://github.com/dadajam4/fastkit/blob/main/packages/vue-click-outside/README.md) | 日本語

Vue.jsアプリケーションで要素外のクリックを検出するためのディレクティブライブラリ。モーダル、ドロップダウン、ポップアップなどのUIコンポーネントで、外部をクリックした際の処理を簡単に実装できます。

## 機能

- **Vue 3ディレクティブ**: シンプルなディレクティブとして提供
- **TypeScript完全サポート**: 厳密な型定義による型安全性
- **柔軟な条件設定**: クリック検出の条件をカスタマイズ可能
- **要素の除外**: 特定の要素をクリック範囲から除外
- **高いパフォーマンス**: 効率的なイベント処理とメモリ管理
- **アクセシビリティ対応**: trusted eventsのみを処理
- **SSR対応**: サーバーサイドレンダリング環境での安全な動作
- **軽量設計**: 最小限の依存関係

## インストール

```bash
npm install @fastkit/vue-click-outside
```

## 基本的な使用方法

### プラグインの登録

```typescript
// main.ts
import { createApp } from 'vue'
import { installClickOutsideDirective } from '@fastkit/vue-click-outside'
import App from './App.vue'

const app = createApp(App)

// click-outsideディレクティブをグローバル登録
installClickOutsideDirective(app)

app.mount('#app')
```

### 基本的なクリック外検出

```vue
<template>
  <div>
    <h2>基本的なクリック外検出</h2>

    <!-- 簡単な使用例 -->
    <div class="example-section">
      <h3>シンプルなモーダル</h3>
      <button @click="showSimpleModal = true">モーダルを開く</button>

      <div v-if="showSimpleModal" class="modal-overlay">
        <div
          class="modal-content"
          v-click-outside="() => showSimpleModal = false"
        >
          <h4>シンプルモーダル</h4>
          <p>外側をクリックするとモーダルが閉じます</p>
          <button @click="showSimpleModal = false">閉じる</button>
        </div>
      </div>
    </div>

    <!-- ドロップダウンメニュー -->
    <div class="example-section">
      <h3>ドロップダウンメニュー</h3>
      <div class="dropdown">
        <button @click="toggleDropdown">
          メニュー {{ isDropdownOpen ? '▲' : '▼' }}
        </button>

        <div
          v-if="isDropdownOpen"
          class="dropdown-menu"
          v-click-outside="closeDropdown"
        >
          <div class="dropdown-item" @click="selectItem('オプション1')">オプション1</div>
          <div class="dropdown-item" @click="selectItem('オプション2')">オプション2</div>
          <div class="dropdown-item" @click="selectItem('オプション3')">オプション3</div>
        </div>
      </div>
      <p>選択されたアイテム: {{ selectedItem }}</p>
    </div>

    <!-- ツールチップ -->
    <div class="example-section">
      <h3>ツールチップ</h3>
      <button
        ref="tooltipTrigger"
        @click="showTooltip = !showTooltip"
        class="tooltip-trigger"
      >
        ツールチップを表示
      </button>

      <div
        v-if="showTooltip"
        class="tooltip"
        v-click-outside="{
          handler: () => showTooltip = false,
          include: () => tooltipTrigger ? [tooltipTrigger] : []
        }"
      >
        <div class="tooltip-content">
          これはツールチップです。<br>
          外側をクリックして閉じてください。
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const showSimpleModal = ref(false)
const isDropdownOpen = ref(false)
const selectedItem = ref('')
const showTooltip = ref(false)
const tooltipTrigger = ref<HTMLElement>()

const toggleDropdown = () => {
  isDropdownOpen.value = !isDropdownOpen.value
}

const closeDropdown = () => {
  isDropdownOpen.value = false
}

const selectItem = (item: string) => {
  selectedItem.value = item
  isDropdownOpen.value = false
}
</script>

<style scoped>
.example-section {
  margin: 30px 0;
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
}

.modal-overlay {
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

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.dropdown {
  position: relative;
  display: inline-block;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  background: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  min-width: 150px;
  z-index: 100;
}

.dropdown-item {
  padding: 8px 12px;
  cursor: pointer;
  border-bottom: 1px solid #eee;
}

.dropdown-item:last-child {
  border-bottom: none;
}

.dropdown-item:hover {
  background: #f5f5f5;
}

.tooltip-trigger {
  padding: 8px 16px;
  background: #007acc;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.tooltip {
  position: absolute;
  background: #333;
  color: white;
  padding: 8px 12px;
  border-radius: 4px;
  font-size: 0.9em;
  z-index: 200;
  margin-top: 8px;
}

.tooltip::before {
  content: '';
  position: absolute;
  top: -5px;
  left: 50%;
  transform: translateX(-50%);
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-bottom: 5px solid #333;
}
</style>
```

## 実用的な使用例

### 高度な条件付きクリック検出

```vue
<template>
  <div>
    <h2>高度なクリック外検出</h2>

    <!-- 条件付きモーダル -->
    <div class="advanced-section">
      <h3>条件付きモーダル</h3>
      <div class="controls">
        <label>
          <input type="checkbox" v-model="enableClickOutside" />
          クリック外で閉じる機能を有効にする
        </label>
        <label>
          <input type="checkbox" v-model="confirmBeforeClose" />
          閉じる前に確認する
        </label>
      </div>

      <button @click="showAdvancedModal = true">高度なモーダルを開く</button>

      <div v-if="showAdvancedModal" class="modal-overlay">
        <div
          class="modal-content"
          v-click-outside="{
            handler: handleModalClickOutside,
            conditional: (ev, pre) => enableClickOutside && (pre || !confirmBeforeClose || hasUnsavedChanges)
          }"
        >
          <h4>高度なモーダル</h4>
          <div class="form-section">
            <label>
              名前:
              <input
                v-model="formData.name"
                @input="hasUnsavedChanges = true"
                placeholder="名前を入力"
              />
            </label>
            <label>
              メールアドレス:
              <input
                v-model="formData.email"
                @input="hasUnsavedChanges = true"
                placeholder="メールアドレスを入力"
              />
            </label>
          </div>

          <div class="modal-actions">
            <button @click="saveForm">保存</button>
            <button @click="closeAdvancedModal">キャンセル</button>
          </div>

          <div v-if="hasUnsavedChanges" class="warning">
            未保存の変更があります
          </div>
        </div>
      </div>
    </div>

    <!-- マルチレベルドロップダウン -->
    <div class="advanced-section">
      <h3>マルチレベルドロップダウン</h3>
      <div class="multi-dropdown">
        <button @click="toggleMainMenu">
          メインメニュー {{ isMainMenuOpen ? '▲' : '▼' }}
        </button>

        <div
          v-if="isMainMenuOpen"
          class="dropdown-menu"
          v-click-outside="{
            handler: closeAllMenus,
            include: getMenuIncludes
          }"
        >
          <div class="dropdown-item" @click="selectMainItem('ファイル')">
            ファイル
          </div>
          <div
            class="dropdown-item submenu-trigger"
            @click="toggleSubMenu"
            ref="subMenuTrigger"
          >
            編集 {{ isSubMenuOpen ? '▶' : '▶' }}
          </div>
          <div class="dropdown-item" @click="selectMainItem('表示')">
            表示
          </div>
        </div>

        <div
          v-if="isSubMenuOpen"
          class="dropdown-menu submenu"
          ref="subMenu"
        >
          <div class="dropdown-item" @click="selectSubItem('切り取り')">切り取り</div>
          <div class="dropdown-item" @click="selectSubItem('コピー')">コピー</div>
          <div class="dropdown-item" @click="selectSubItem('貼り付け')">貼り付け</div>
        </div>
      </div>

      <p>最後の選択: {{ lastSelection }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

// 条件付きモーダル
const showAdvancedModal = ref(false)
const enableClickOutside = ref(true)
const confirmBeforeClose = ref(false)
const hasUnsavedChanges = ref(false)

const formData = reactive({
  name: '',
  email: ''
})

const handleModalClickOutside = () => {
  if (hasUnsavedChanges.value && confirmBeforeClose.value) {
    if (confirm('未保存の変更があります。本当に閉じますか？')) {
      closeAdvancedModal()
    }
  } else {
    closeAdvancedModal()
  }
}

const closeAdvancedModal = () => {
  showAdvancedModal.value = false
  hasUnsavedChanges.value = false
  formData.name = ''
  formData.email = ''
}

const saveForm = () => {
  console.log('フォームを保存:', formData)
  hasUnsavedChanges.value = false
  closeAdvancedModal()
}

// マルチレベルドロップダウン
const isMainMenuOpen = ref(false)
const isSubMenuOpen = ref(false)
const lastSelection = ref('')
const subMenuTrigger = ref<HTMLElement>()
const subMenu = ref<HTMLElement>()

const toggleMainMenu = () => {
  isMainMenuOpen.value = !isMainMenuOpen.value
  if (!isMainMenuOpen.value) {
    isSubMenuOpen.value = false
  }
}

const toggleSubMenu = () => {
  isSubMenuOpen.value = !isSubMenuOpen.value
}

const closeAllMenus = () => {
  isMainMenuOpen.value = false
  isSubMenuOpen.value = false
}

const selectMainItem = (item: string) => {
  lastSelection.value = item
  closeAllMenus()
}

const selectSubItem = (item: string) => {
  lastSelection.value = `編集 > ${item}`
  closeAllMenus()
}

const getMenuIncludes = () => {
  const includes: Element[] = []
  if (subMenuTrigger.value) includes.push(subMenuTrigger.value)
  if (subMenu.value) includes.push(subMenu.value)
  return includes
}
</script>

<style scoped>
.advanced-section {
  margin: 30px 0;
  padding: 20px;
  border: 1px solid #eee;
  border-radius: 8px;
}

.controls {
  margin: 10px 0;
}

.controls label {
  display: block;
  margin: 5px 0;
}

.form-section {
  margin: 15px 0;
}

.form-section label {
  display: block;
  margin: 10px 0;
}

.form-section input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-top: 4px;
}

.modal-actions {
  margin-top: 20px;
  display: flex;
  gap: 10px;
}

.modal-actions button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.modal-actions button:first-child {
  background: #007acc;
  color: white;
}

.modal-actions button:last-child {
  background: #ccc;
  color: #333;
}

.warning {
  margin-top: 10px;
  padding: 8px;
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 4px;
  color: #856404;
  font-size: 0.9em;
}

.multi-dropdown {
  position: relative;
  display: inline-block;
}

.submenu {
  position: absolute;
  left: 100%;
  top: 0;
  margin-left: 5px;
}

.submenu-trigger {
  position: relative;
}
</style>
```

### ローダブルディレクティブ (個別インポート)

```vue
<template>
  <div>
    <h2>ローカルディレクティブ使用例</h2>

    <div class="local-example">
      <button @click="showLocalModal = true">ローカルモーダルを開く</button>

      <div v-if="showLocalModal" class="modal-overlay">
        <div
          class="modal-content"
          v-click-outside="closeLocalModal"
        >
          <h4>ローカルディレクティブモーダル</h4>
          <p>このモーダルではローカルに登録されたディレクティブを使用しています。</p>
          <button @click="closeLocalModal">閉じる</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { clickOutsideDirective } from '@fastkit/vue-click-outside'

// ローカルディレクティブとして登録
const vClickOutside = clickOutsideDirective

const showLocalModal = ref(false)

const closeLocalModal = () => {
  showLocalModal.value = false
}
</script>

<style scoped>
.local-example {
  padding: 20px;
  border: 1px solid #007acc;
  border-radius: 8px;
  background: #f0f9ff;
}
</style>
```

### Composition APIとの組み合わせ

```vue
<template>
  <div>
    <h2>Composition API統合例</h2>

    <!-- 通知システム -->
    <div class="notification-system">
      <button @click="addNotification">通知を追加</button>

      <div class="notifications">
        <div
          v-for="notification in notifications"
          :key="notification.id"
          class="notification"
          :class="notification.type"
          v-click-outside="{
            handler: () => removeNotification(notification.id),
            conditional: () => notification.dismissible
          }"
        >
          <div class="notification-content">
            <h5>{{ notification.title }}</h5>
            <p>{{ notification.message }}</p>
          </div>
          <button
            v-if="notification.dismissible"
            @click="removeNotification(notification.id)"
            class="close-btn"
          >
            ×
          </button>
        </div>
      </div>
    </div>

    <!-- コンテキストメニュー -->
    <div class="context-menu-area">
      <h3>右クリックでコンテキストメニュー</h3>
      <div
        class="context-area"
        @contextmenu.prevent="showContextMenu"
      >
        右クリックしてください
      </div>

      <div
        v-if="contextMenu.visible"
        class="context-menu"
        :style="contextMenuStyle"
        v-click-outside="hideContextMenu"
      >
        <div class="context-item" @click="executeAction('コピー')">コピー</div>
        <div class="context-item" @click="executeAction('切り取り')">切り取り</div>
        <div class="context-item" @click="executeAction('貼り付け')">貼り付け</div>
        <hr>
        <div class="context-item" @click="executeAction('削除')">削除</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'

// 通知システム
interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  dismissible: boolean
}

const notifications = ref<Notification[]>([])

const addNotification = () => {
  const types: Notification['type'][] = ['info', 'success', 'warning', 'error']
  const type = types[Math.floor(Math.random() * types.length)]

  const notification: Notification = {
    id: Math.random().toString(36).substr(2, 9),
    title: `${type.charAt(0).toUpperCase() + type.slice(1)} 通知`,
    message: `これは${type}タイプの通知です。外側をクリックして閉じることができます。`,
    type,
    dismissible: true
  }

  notifications.value.push(notification)

  // 自動削除（10秒後）
  setTimeout(() => {
    removeNotification(notification.id)
  }, 10000)
}

const removeNotification = (id: string) => {
  const index = notifications.value.findIndex(n => n.id === id)
  if (index > -1) {
    notifications.value.splice(index, 1)
  }
}

// コンテキストメニュー
const contextMenu = reactive({
  visible: false,
  x: 0,
  y: 0
})

const contextMenuStyle = computed(() => ({
  position: 'fixed' as const,
  left: `${contextMenu.x}px`,
  top: `${contextMenu.y}px`,
  zIndex: 1000
}))

const showContextMenu = (event: PointerEvent) => {
  contextMenu.x = event.clientX
  contextMenu.y = event.clientY
  contextMenu.visible = true
}

const hideContextMenu = () => {
  contextMenu.visible = false
}

const executeAction = (action: string) => {
  console.log(`実行されたアクション: ${action}`)
  hideContextMenu()
}
</script>

<style scoped>
.notification-system {
  margin: 20px 0;
}

.notifications {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.notification {
  display: flex;
  align-items: flex-start;
  padding: 12px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  max-width: 300px;
  background: white;
  border-left: 4px solid;
}

.notification.info {
  border-left-color: #007acc;
}

.notification.success {
  border-left-color: #28a745;
}

.notification.warning {
  border-left-color: #ffc107;
}

.notification.error {
  border-left-color: #dc3545;
}

.notification-content {
  flex: 1;
}

.notification h5 {
  margin: 0 0 4px 0;
  font-size: 0.9em;
}

.notification p {
  margin: 0;
  font-size: 0.8em;
  color: #666;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.2em;
  cursor: pointer;
  color: #999;
  margin-left: 8px;
}

.close-btn:hover {
  color: #666;
}

.context-menu-area {
  margin: 30px 0;
}

.context-area {
  width: 200px;
  height: 100px;
  border: 2px dashed #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  user-select: none;
}

.context-menu {
  background: white;
  border: 1px solid #ccc;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  min-width: 120px;
}

.context-item {
  padding: 8px 12px;
  cursor: pointer;
  font-size: 0.9em;
}

.context-item:hover {
  background: #f5f5f5;
}

.context-menu hr {
  margin: 4px 0;
  border: none;
  border-top: 1px solid #eee;
}
</style>
```

## API仕様

### `v-click-outside` ディレクティブ

要素外のクリックを検出してハンドラーを実行するディレクティブ。

**基本的な使用法:**

```vue
<div v-click-outside="handler">コンテンツ</div>
```

**高度な設定:**

```vue
<div v-click-outside="{
  handler: clickHandler,
  conditional: (ev, pre) => someCondition,
  include: () => [additionalElement1, additionalElement2]
}">
  コンテンツ
</div>
```

### 型定義

```typescript
// ハンドラー関数の型
type ClickOutsideDirectiveHandler =
  | ((ev: PointerEvent) => any)
  | undefined
  | void
  | false
  | null

// 詳細設定オブジェクトの型
interface ClickOutsideDirectiveBindingValue {
  handler?: ClickOutsideDirectiveHandler
  conditional?: (ev: PointerEvent, pre?: boolean) => boolean
  include?: () => Element[]
}

// ディレクティブの値の型（関数または設定オブジェクト）
type RawClickOutsideDirectiveBindingValue =
  | ClickOutsideDirectiveHandler
  | ClickOutsideDirectiveBindingValue
```

### プロパティ

- **`handler`**: クリック外で実行される関数
- **`conditional`**: クリック検出の条件を制御する関数
  - `ev`: マウス/ポインターイベント
  - `pre`: true=事前チェック、false=実行前の最終チェック
- **`include`**: クリック範囲に含める追加要素を返す関数

### インストール関数

```typescript
// グローバル登録
import { installClickOutsideDirective } from '@fastkit/vue-click-outside'
installClickOutsideDirective(app)

// ローカル使用
import { clickOutsideDirective } from '@fastkit/vue-click-outside'
const vClickOutside = clickOutsideDirective
```

## 高度な使用例

### 複雑なUIコンポーネント統合

```typescript
// composables/useModal.ts
import { ref, computed } from 'vue'

export function useModal(options: {
  closeOnClickOutside?: boolean
  confirmBeforeClose?: boolean
} = {}) {
  const isOpen = ref(false)
  const hasChanges = ref(false)

  const clickOutsideHandler = computed(() => {
    if (!options.closeOnClickOutside) return null

    return (ev: PointerEvent) => {
      if (options.confirmBeforeClose && hasChanges.value) {
        if (confirm('変更が保存されていません。閉じますか？')) {
          close()
        }
      } else {
        close()
      }
    }
  })

  const open = () => {
    isOpen.value = true
  }

  const close = () => {
    isOpen.value = false
    hasChanges.value = false
  }

  const markAsChanged = () => {
    hasChanges.value = true
  }

  return {
    isOpen,
    hasChanges,
    clickOutsideHandler,
    open,
    close,
    markAsChanged
  }
}
```

## 注意事項

### パフォーマンス考慮事項

- イベントリスナーはコンポーネントの`mounted`/`beforeUnmount`で自動管理
- 大量のclick-outsideディレクティブを同時使用する場合は、パフォーマンスに注意
- `include`関数は必要な時のみ要素を返すよう最適化

### ブラウザ対応

- モダンブラウザすべてでサポート
- Internet Explorer 11以降で動作

### アクセシビリティ

- trusted eventsのみを処理してセキュリティを確保
- キーボードナビゲーションとの組み合わせに注意
- スクリーンリーダーユーザーへの配慮

### セキュリティ

- `isTrusted`プロパティをチェックして合成イベントを除外
- PointerEventの`pointerType`をチェックして不正なイベントを除外

## ライセンス

MIT

## 関連パッケージ

- [@fastkit/vue-utils](../vue-utils/README.md): Vue.jsユーティリティ関数
