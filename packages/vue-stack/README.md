# @fastkit/vue-stack

Vue.js アプリケーションでダイアログ、ツールチップ、メニューなどのスタック可能なUI要素を管理するための包括的なライブラリです。動的コンポーネント表示、フォーカス管理、アニメーション、キーボード操作など、モーダル系UIに必要な全ての機能を提供します。

## 特徴

- **統合スタック管理**: 複数のダイアログ、ツールチップ、メニューの一元管理
- **動的コンポーネント表示**: プログラマティックなコンポーネント起動
- **フォーカス管理**: 自動フォーカストラップとリストア機能
- **キーボード操作**: ESC、Tab、矢印キーなどのキーボード制御
- **アニメーション統合**: Vue Transitionとの完全統合
- **z-index管理**: 自動スタック順序制御
- **アクセシビリティ**: ARIA属性とスクリーンリーダー対応
- **ルーター統合**: Vue Routerナビゲーションガード
- **ボディスクロール制御**: モーダル表示時のスクロール制限
- **遅延表示/非表示**: タイムアウトベースの自動制御
- **Outside Click検知**: スタック外クリック監視
- **永続化モード**: 強制的な表示維持機能

## インストール

```bash
npm install @fastkit/vue-stack
# or
pnpm add @fastkit/vue-stack

# 依存関係
npm install vue vue-router
```

## 基本的な使い方

### プラグイン設定

```typescript
// main.ts
import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import { VueStackService } from '@fastkit/vue-stack';
import '@fastkit/vue-stack/vue-stack.css';

const app = createApp(App);

// ルーター設定
const router = createRouter({
  history: createWebHistory(),
  routes: [/* ルート定義 */]
});

// スタックサービス
const stackService = new VueStackService({
  zIndex: 32767,                    // ベースz-index
  snackbarDefaultPosition: 'top'    // スナックバーデフォルト位置
});

// プラグインとして提供
app.provide(VueStackInjectionKey, stackService);

app.use(router);
app.mount('#app');
```

### 基本的なダイアログ

```vue
<template>
  <div>
    <!-- ダイアログトリガー -->
    <button @click="showDialog">ダイアログを開く</button>
    
    <!-- ダイアログコンポーネント -->
    <VDialog
      v-model="dialogVisible"
      transition="v-stack-slide-down"
      backdrop
      focus-trap
      close-on-esc
      close-on-outside-click
      @show="onDialogShow"
      @close="onDialogClose"
    >
      <div class="dialog">
        <h2>確認ダイアログ</h2>
        <p>この操作を実行しますか？</p>
        <div class="dialog-actions">
          <button @click="confirm">OK</button>
          <button @click="cancel">キャンセル</button>
        </div>
      </div>
    </VDialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { VDialog, useVueStack } from '@fastkit/vue-stack';

const dialogVisible = ref(false);
const $vstack = useVueStack();

const showDialog = () => {
  dialogVisible.value = true;
};

const confirm = () => {
  console.log('確認されました');
  dialogVisible.value = false;
};

const cancel = () => {
  console.log('キャンセルされました');
  dialogVisible.value = false;
};

const onDialogShow = (control) => {
  console.log('ダイアログが表示されました', control);
};

const onDialogClose = (control) => {
  console.log('ダイアログが閉じられました', control);
  console.log('クローズ理由:', control._.state.closeReason);
};
</script>
```

### アクティベーター付きメニュー

```vue
<template>
  <VMenu
    open-on-hover
    :open-delay="500"
    :close-delay="200"
    transition="v-stack-fade"
  >
    <template #activator="{ attrs }">
      <button v-bind="attrs">
        ホバーでメニュー表示
      </button>
    </template>
    
    <div class="menu">
      <div class="menu-item">アイテム1</div>
      <div class="menu-item">アイテム2</div>
      <div class="menu-item">アイテム3</div>
    </div>
  </VMenu>
</template>

<script setup lang="ts">
import { VMenu } from '@fastkit/vue-stack';
</script>

<style scoped>
.menu {
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  min-width: 150px;
}

.menu-item {
  padding: 8px 16px;
  cursor: pointer;
  border-bottom: 1px solid #f1f3f4;
}

.menu-item:hover {
  background: #f8f9fa;
}

.menu-item:last-child {
  border-bottom: none;
}
</style>
```

## 利用可能なコンポーネント

### VDialog - ダイアログコンポーネント

モーダルダイアログを表示するためのコンポーネントです。

```vue
<template>
  <VDialog
    v-model="visible"
    backdrop
    focus-trap
    close-on-esc
    transition="v-stack-slide-down"
  >
    <div class="dialog-content">
      <h2>ダイアログタイトル</h2>
      <p>ダイアログの内容</p>
      <button @click="visible = false">閉じる</button>
    </div>
  </VDialog>
</template>
```

### VSnackbar - スナックバーコンポーネント

通知メッセージを表示するためのコンポーネントです。

```vue
<template>
  <VSnackbar
    v-model="showMessage"
    :timeout="3000"
    transition="v-stack-slide-up"
  >
    <div class="snackbar-content">
      {{ message }}
      <button @click="showMessage = false">×</button>
    </div>
  </VSnackbar>
</template>
```

### VMenu - メニューコンポーネント

ドロップダウンメニューやコンテキストメニューを表示するためのコンポーネントです。

```vue
<template>
  <VMenu open-on-click>
    <template #activator="{ attrs }">
      <button v-bind="attrs">メニューを開く</button>
    </template>
    
    <div class="menu-content">
      <div class="menu-item" @click="handleAction('action1')">アクション1</div>
      <div class="menu-item" @click="handleAction('action2')">アクション2</div>
    </div>
  </VMenu>
</template>
```

### VDynamicStacks - 動的スタック管理

プログラマティックにスタック要素を管理するためのコンポーネントです。

```vue
<template>
  <div>
    <button @click="showProgrammaticDialog">プログラマティックダイアログ</button>
    <button @click="showSnackbar">スナックバー表示</button>
    <VDynamicStacks />
  </div>
</template>

<script setup lang="ts">
import { VDynamicStacks, useVueStack } from '@fastkit/vue-stack';

const $vstack = useVueStack();

const showProgrammaticDialog = async () => {
  try {
    const result = await $vstack.modal({
      component: 'VDialog',
      props: {
        backdrop: true,
        focusTrap: true,
        closeOnEsc: true,
      },
      slots: {
        default: () => h('div', { class: 'p-4' }, [
          h('h2', 'プログラマティックダイアログ'),
          h('p', 'このダイアログはJavaScriptから表示されました'),
          h('button', { 
            onClick: () => $vstack.resolve('confirmed'),
            class: 'btn btn-primary'
          }, '確認')
        ])
      }
    });
    console.log('ダイアログ結果:', result);
  } catch (error) {
    console.log('ダイアログがキャンセルされました');
  }
};

const showSnackbar = () => {
  $vstack.snackbar({
    message: 'スナックバーメッセージ',
    timeout: 3000,
    transition: 'v-stack-slide-up'
  });
};
</script>
```

## VStackControl API

### プロパティ

```typescript
interface VStackControl {
  // 状態
  readonly isActive: boolean;              // 表示状態
  readonly transitioning: boolean;         // アニメーション中
  readonly isResolved: boolean;           // 解決済み
  readonly isCanceled: boolean;           // キャンセル済み
  readonly isDestroyed: boolean;          // 破棄済み
  
  // 値
  value: any;                             // 入力値
  
  // 設定
  readonly timeout: number;               // タイムアウト
  readonly persistent: boolean;           // 永続表示
  readonly zIndex: number;                // z-index
  readonly activateOrder: number;         // 活性化順序
  
  // フォーカス・キーボード
  readonly focusRestorable: boolean;      // フォーカスリストア
  readonly closeOnEsc: boolean;           // ESCで閉じる
  readonly closeOnTab: false | string;    // Tabで閉じる
  readonly closeOnNavigation: boolean;    // ナビゲーションで閉じる
  readonly closeOnOutsideClick: boolean;  // 外側クリックで閉じる
  
  // 遅延
  readonly openDelay: number;             // 表示遅延
  readonly closeDelay: number;            // 非表示遅延
  
  // 要素参照
  readonly contentRef: Ref<HTMLElement>;  // コンテンツ要素
  readonly backdropRef: Ref<HTMLElement>; // バックドロップ要素
  readonly activator: HTMLElement;        // アクティベーター要素
  
  // スタイル
  readonly classes: any[];                // クラス一覧
  readonly styles: StyleValue[];          // スタイル一覧
  
  // その他
  readonly $service: VueStackService;     // スタックサービス
  readonly stackType?: string | symbol;   // スタックタイプ
  readonly disabled: boolean;             // 無効状態
  readonly guardInProgress: boolean;      // ガード実行中
}
```

### メソッド

```typescript
interface VStackControl {
  // 表示制御
  show(): Promise<void>;                           // 表示
  toggle(): Promise<void>;                         // 表示切り替え
  close(opts?: VStackCloseOptions): Promise<void>; // 非表示
  
  // 解決・キャンセル
  resolve(payload?: any): Promise<void | false>;   // 解決
  cancel(force?: boolean): Promise<void>;          // キャンセル
  
  // 設定
  setActivator(query: VStackActivatorQuery): this; // アクティベーター設定
  toFront(): void;                                 // 最前面へ
  resetValue(): void;                              // 値リセット
  
  // 状態確認
  isFront(filter?: Function): boolean;             // 最前面か確認
  containsOrSameElement(el: Element): boolean;     // 要素包含確認
  
  // レンダリング
  render(fn: Function, opts?: object): VNode;      // レンダリング
  
  // エフェクト
  guardEffect(): void;                             // ガードエフェクト実行
}
```

## VueStackService

### サービス管理

```typescript
import { VueStackService, useStack } from '@fastkit/vue-stack';

// サービス作成
const service = new VueStackService({
  zIndex: 32767,
  snackbarDefaultPosition: 'top'
});

// コンポーザブルでアクセス
const stack = useStack();

// サービス情報
console.log(service.controls);          // 全スタックコントロール
console.log(service.zIndex);           // ベースz-index
console.log(service.dynamicSettings);  // 動的設定一覧

// スタック管理
const activeStacks = service.getActiveStacks();     // アクティブスタック取得
const frontStack = service.getFront();              // 最前面スタック取得
const isTransitioning = service.someTransitioning(); // アニメーション中か確認
```

### 動的スタック表示

```typescript
// 動的ダイアログ表示
const result = await service.dynamic(
  DialogComponent,
  {
    title: '確認',
    message: 'この操作を実行しますか？'
  },
  {
    default: () => h('p', 'カスタムコンテンツ')
  }
);

if (result) {
  console.log('ユーザーが確認しました:', result);
} else {
  console.log('ユーザーがキャンセルしました');
}

// ランチャー作成
const showConfirmDialog = service.createLauncher(
  ConfirmDialogComponent,
  (props) => ({
    ...props,
    variant: 'primary'
  })
);

// ランチャー使用
const confirmed = await showConfirmDialog({
  title: '削除確認',
  message: 'このアイテムを削除しますか？'
});
```

## 高度な使用例

### カスタムダイアログコンポーネント

```vue
<!-- ConfirmDialog.vue -->
<template>
  <VDialog
    ref="stackRef"
    v-model="internalVisible"
    :transition="transition"
    backdrop
    focus-trap
    close-on-esc
    :persistent="loading"
    @show="onShow"
    @close="onClose"
  >
    <div class="confirm-dialog" :class="variantClass">
      <!-- ヘッダー -->
      <div class="dialog-header">
        <h3 class="dialog-title">{{ title }}</h3>
        <button 
          v-if="!persistent && !loading" 
          class="dialog-close"
          @click="cancel"
        >
          ×
        </button>
      </div>
      
      <!-- コンテンツ -->
      <div class="dialog-content">
        <p v-if="message" class="dialog-message">{{ message }}</p>
        <slot />
      </div>
      
      <!-- アクション -->
      <div class="dialog-actions">
        <button 
          v-if="showCancel"
          class="dialog-button dialog-button--secondary"
          :disabled="loading"
          @click="cancel"
        >
          {{ cancelText }}
        </button>
        <button 
          class="dialog-button dialog-button--primary"
          :class="variantClass"
          :disabled="loading"
          @click="confirm"
        >
          <span v-if="loading" class="loading-spinner"></span>
          {{ confirmText }}
        </button>
      </div>
    </div>
  </VDialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { VDialog, type VStackControl } from '@fastkit/vue-stack';

interface Props {
  modelValue?: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'primary' | 'danger' | 'warning';
  showCancel?: boolean;
  persistent?: boolean;
  transition?: string;
  beforeConfirm?: () => Promise<boolean> | boolean;
  beforeCancel?: () => Promise<boolean> | boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  title: '確認',
  confirmText: 'OK',
  cancelText: 'キャンセル',
  variant: 'primary',
  showCancel: true,
  persistent: false,
  transition: 'v-stack-slide-down'
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'confirm': [control: VStackControl];
  'cancel': [control: VStackControl];
}>();

const stackRef = ref<VStackControl>();
const internalVisible = ref(props.modelValue);
const loading = ref(false);

const variantClass = computed(() => `dialog--${props.variant}`);

// 外部からの表示状態同期
watch(() => props.modelValue, (newValue) => {
  internalVisible.value = newValue;
});

// 内部表示状態の外部同期
watch(internalVisible, (newValue) => {
  emit('update:modelValue', newValue);
});

const confirm = async () => {
  if (loading.value) return;
  
  loading.value = true;
  
  try {
    // beforeConfirmハンドラー実行
    if (props.beforeConfirm) {
      const result = await props.beforeConfirm();
      if (result === false) {
        loading.value = false;
        return;
      }
    }
    
    const control = stackRef.value;
    if (control) {
      await control.resolve('confirmed');
      emit('confirm', control);
    }
    
    internalVisible.value = false;
  } catch (error) {
    console.error('確認処理でエラーが発生しました:', error);
  } finally {
    loading.value = false;
  }
};

const cancel = async () => {
  if (loading.value) return;
  
  try {
    // beforeCancelハンドラー実行
    if (props.beforeCancel) {
      const result = await props.beforeCancel();
      if (result === false) return;
    }
    
    const control = stackRef.value;
    if (control) {
      await control.cancel();
      emit('cancel', control);
    }
    
    internalVisible.value = false;
  } catch (error) {
    console.error('キャンセル処理でエラーが発生しました:', error);
  }
};

const onShow = (control: VStackControl) => {
  console.log('ダイアログが表示されました');
};

const onClose = (control: VStackControl) => {
  console.log('ダイアログが閉じられました');
  loading.value = false;
};
</script>

<style scoped>
.confirm-dialog {
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 90vw;
  max-height: 80vh;
  overflow: hidden;
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 16px;
  border-bottom: 1px solid #eee;
}

.dialog-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.dialog-close {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  padding: 4px;
  line-height: 1;
}

.dialog-content {
  padding: 20px 24px;
}

.dialog-message {
  margin: 0;
  line-height: 1.5;
}

.dialog-actions {
  display: flex;
  gap: 12px;
  padding: 16px 24px 20px;
  justify-content: flex-end;
}

.dialog-button {
  padding: 8px 16px;
  border-radius: 4px;
  border: 1px solid;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  position: relative;
}

.dialog-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.dialog-button--secondary {
  background: white;
  color: #666;
  border-color: #ddd;
}

.dialog-button--primary {
  background: #1976d2;
  color: white;
  border-color: #1976d2;
}

.dialog-button--primary.dialog--danger {
  background: #d32f2f;
  border-color: #d32f2f;
}

.dialog-button--primary.dialog--warning {
  background: #f57c00;
  border-color: #f57c00;
}

.loading-spinner {
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin-right: 8px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
```

### メニューコンポーネント

```vue
<!-- ContextMenu.vue -->
<template>
  <VMenu
    ref="stackRef"
    v-model="internalVisible"
    :activator="activator"
    open-on-contextmenu
    close-on-outside-click
    close-on-esc
    transition="v-stack-scale"
    @show="onShow"
    @close="onClose"
  >
    <div class="context-menu" ref="menuRef">
      <div 
        v-for="(item, index) in menuItems"
        :key="index"
        class="menu-item"
        :class="{
          'menu-item--disabled': item.disabled,
          'menu-item--separator': item.separator
        }"
        @click="handleItemClick(item)"
      >
        <div v-if="item.separator" class="menu-separator"></div>
        <template v-else>
          <span v-if="item.icon" class="menu-icon">{{ item.icon }}</span>
          <span class="menu-label">{{ item.label }}</span>
          <span v-if="item.shortcut" class="menu-shortcut">{{ item.shortcut }}</span>
        </template>
      </div>
    </div>
  </VMenu>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from 'vue';
import { VMenu, type VStackControl } from '@fastkit/vue-stack';

interface MenuItem {
  label?: string;
  icon?: string;
  shortcut?: string;
  disabled?: boolean;
  separator?: boolean;
  action?: () => void | Promise<void>;
}

interface Props {
  modelValue?: boolean;
  activator?: any;
  items: MenuItem[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  'item-click': [item: MenuItem];
}>();

const stackRef = ref<VStackControl>();
const menuRef = ref<HTMLElement>();
const internalVisible = ref(props.modelValue || false);

const menuItems = computed(() => props.items);

const handleItemClick = async (item: MenuItem) => {
  if (item.disabled || item.separator) return;
  
  try {
    if (item.action) {
      await item.action();
    }
    emit('item-click', item);
  } catch (error) {
    console.error('メニューアクション実行エラー:', error);
  } finally {
    internalVisible.value = false;
  }
};

const onShow = async (control: VStackControl) => {
  await nextTick();
  
  // メニュー位置調整
  if (menuRef.value) {
    const menu = menuRef.value;
    const rect = menu.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };
    
    // 画面外に出る場合の調整
    if (rect.right > viewport.width) {
      menu.style.left = `${viewport.width - rect.width - 10}px`;
    }
    
    if (rect.bottom > viewport.height) {
      menu.style.top = `${viewport.height - rect.height - 10}px`;
    }
  }
};

const onClose = (control: VStackControl) => {
  console.log('コンテキストメニューが閉じられました');
};
</script>

<style scoped>
.context-menu {
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  min-width: 160px;
  max-width: 300px;
  padding: 4px 0;
  z-index: 1000;
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 8px 16px;
  cursor: pointer;
  transition: background-color 0.15s;
  font-size: 14px;
}

.menu-item:hover:not(.menu-item--disabled):not(.menu-item--separator) {
  background-color: #f5f5f5;
}

.menu-item--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.menu-item--separator {
  padding: 0;
  margin: 4px 0;
  cursor: default;
}

.menu-separator {
  height: 1px;
  background-color: #eee;
  margin: 0 8px;
}

.menu-icon {
  margin-right: 12px;
  width: 16px;
  text-align: center;
}

.menu-label {
  flex: 1;
}

.menu-shortcut {
  color: #999;
  font-size: 12px;
  margin-left: 16px;
}
</style>
```

### スナックバー通知システム

```typescript
// snackbar.ts
import { VueStackService } from '@fastkit/vue-stack';
import SnackbarComponent from './SnackbarComponent.vue';

export interface SnackbarOptions {
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  position?: 'top' | 'bottom';
  action?: {
    label: string;
    handler: () => void;
  };
}

export function createSnackbarSystem(stackService: VueStackService) {
  const showSnackbar = (options: SnackbarOptions) => {
    const {
      message,
      type = 'info',
      duration = 4000,
      position = stackService.snackbarDefaultPosition,
      action
    } = options;

    return stackService.dynamic(
      SnackbarComponent,
      {
        message,
        type,
        duration,
        position,
        action
      }
    );
  };

  return {
    info: (message: string, options?: Partial<SnackbarOptions>) =>
      showSnackbar({ ...options, message, type: 'info' }),
      
    success: (message: string, options?: Partial<SnackbarOptions>) =>
      showSnackbar({ ...options, message, type: 'success' }),
      
    warning: (message: string, options?: Partial<SnackbarOptions>) =>
      showSnackbar({ ...options, message, type: 'warning' }),
      
    error: (message: string, options?: Partial<SnackbarOptions>) =>
      showSnackbar({ ...options, message, type: 'error' }),
      
    custom: showSnackbar
  };
}

// 使用例
const snackbar = createSnackbarSystem(stackService);

// 各種通知
snackbar.info('情報メッセージ');
snackbar.success('操作が完了しました');
snackbar.warning('注意が必要です');
snackbar.error('エラーが発生しました');

// アクション付き通知
snackbar.custom({
  message: 'ファイルが削除されました',
  type: 'info',
  duration: 5000,
  action: {
    label: '元に戻す',
    handler: () => console.log('元に戻す処理')
  }
});
```

## アニメーション

### 組み込みトランジション

```scss
/* 使用可能なトランジション */
.v-stack-fade-enter-active,
.v-stack-fade-leave-active {
  transition: opacity 0.3s ease;
}

.v-stack-fade-enter-from,
.v-stack-fade-leave-to {
  opacity: 0;
}

.v-stack-slide-down-enter-active,
.v-stack-slide-down-leave-active {
  transition: all 0.3s ease;
}

.v-stack-slide-down-enter-from {
  transform: translateY(-20px);
  opacity: 0;
}

.v-stack-slide-down-leave-to {
  transform: translateY(-20px);
  opacity: 0;
}

.v-stack-scale-enter-active,
.v-stack-scale-leave-active {
  transition: all 0.2s ease;
}

.v-stack-scale-enter-from,
.v-stack-scale-leave-to {
  transform: scale(0.8);
  opacity: 0;
}
```

### カスタムトランジション

```vue
<template>
  <VDialog
    :transition="{
      transition: 'custom-slide',
      props: { duration: 500 }
    }"
  >
    <!-- コンテンツ -->
  </VDialog>
</template>

<style>
.custom-slide-enter-active,
.custom-slide-leave-active {
  transition: all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.custom-slide-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}

.custom-slide-leave-to {
  transform: translateX(100%);
  opacity: 0;
}
</style>
```

## アクセシビリティ

### ARIA属性

```vue
<template>
  <VDialog
    v-model="dialogVisible"
    role="dialog"
    :aria-labelledby="titleId"
    :aria-describedby="descId"
    focus-trap
  >
    <div class="dialog">
      <h2 :id="titleId">{{ title }}</h2>
      <p :id="descId">{{ description }}</p>
      <!-- コンテンツ -->
    </div>
  </VDialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const titleId = 'dialog-title';
const descId = 'dialog-desc';
</script>
```

### キーボードナビゲーション

```typescript
// キーボード操作の設定例
const stackProps = {
  closeOnEsc: true,           // ESCキーで閉じる
  closeOnTab: 'not-focused',  // フォーカス外でTabキーを押すと閉じる
  focusTrap: true,           // フォーカストラップ有効
  focusRestorable: true      // フォーカス復元有効
};
```

## テストとデバッグ

### ユニットテスト

```typescript
import { describe, test, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { VueStackService, VDialog } from '@fastkit/vue-stack';

describe('VueStack', () => {
  let stackService: VueStackService;
  
  beforeEach(() => {
    stackService = new VueStackService();
  });
  
  test('show and hide dialog', async () => {
    const wrapper = mount(VDialog, {
      props: {
        modelValue: false
      },
      global: {
        provide: {
          [VueStackInjectionKey]: stackService
        }
      }
    });
    
    expect(wrapper.vm.isActive).toBe(false);
    
    await wrapper.setProps({ modelValue: true });
    expect(wrapper.vm.isActive).toBe(true);
  });
  
  test('dynamic stack creation', async () => {
    const TestComponent = {
      template: '<div>Test Content</div>'
    };
    
    const promise = stackService.dynamic(TestComponent, 'Test Content');
    expect(stackService.dynamicSettings).toHaveLength(1);
    
    // Promise resolve
    const setting = stackService.dynamicSettings[0];
    setting.resolve('test-result');
    
    const result = await promise;
    expect(result).toBe('test-result');
  });
});
```

## 依存関係

```json
{
  "dependencies": {
    "@fastkit/dom": "DOM操作ユーティリティ",
    "@fastkit/helpers": "ヘルパー関数",
    "@fastkit/tiny-logger": "軽量ログ機能",
    "@fastkit/vue-body-scroll-lock": "ボディスクロール制御",
    "@fastkit/vue-click-outside": "外側クリック検知",
    "@fastkit/vue-keyboard": "キーボード操作",
    "@fastkit/vue-resize": "リサイズ監視",
    "@fastkit/vue-transitions": "トランジション機能",
    "@fastkit/vue-utils": "Vue.js ユーティリティ"
  },
  "peerDependencies": {
    "vue": "^3.4.0",
    "vue-router": "^4.4.0"
  }
}
```

## ドキュメント

https://dadajam4.github.io/fastkit/vue-stack/

## ライセンス

MIT
