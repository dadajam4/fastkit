# @fastkit/vue-action

🌐 [English](https://github.com/dadajam4/fastkit/blob/main/packages/vue-action/README.md) | 日本語

Vue 3用のアクショナブル（クリック可能）要素を扱うための包括的なコンポーネントライブラリです。ボタン、リンク、RouterLinkの統一されたインターフェースを提供し、ガード機能、状態管理、アクセシビリティサポートを含みます。

## 機能

- **統一されたAPI**: ボタン、aタグ、RouterLinkを同じインターフェースで扱える
- **VActionコンポーネント**: 宣言的で使いやすいコンポーネントAPI
- **Vue Router統合**: シームレスなルーティング機能とナビゲーション
- **ガード機能**: アクション実行前の条件チェック（非同期対応）
- **状態管理**: disabled、actionable、hasActionなどの状態を自動管理
- **CSS クラス制御**: 各状態に応じた自動CSSクラス適用
- **TypeScript完全サポート**: 厳密な型定義によるタイプセーフ
- **アクセシビリティ**: ARIA属性とキーボードナビゲーション対応

## インストール

```bash
npm install @fastkit/vue-action
```

## 基本的な使用方法

### VActionコンポーネント

統一されたインターフェースでボタン、リンク、RouterLinkを扱えるコンポーネントです。

```vue
<template>
  <div>
    <!-- ボタンとして使用 -->
    <VAction
      @click="handleSubmit"
      :disabled="isLoading"
      class="btn btn-primary"
    >
      送信
    </VAction>

    <!-- 外部リンクとして使用 -->
    <VAction
      href="https://example.com"
      target="_blank"
      rel="noopener"
      class="btn btn-link"
    >
      外部サイトへ
    </VAction>

    <!-- RouterLinkとして使用 -->
    <VAction
      :to="{ name: 'profile', params: { id: userId } }"
      class="nav-link"
    >
      プロフィール
    </VAction>

    <!-- ガード機能付き -->
    <VAction
      :to="'/admin'"
      :guard="checkAdminPermission"
      :guardInProgressClass="'loading'"
      class="admin-link"
    >
      管理画面
    </VAction>

    <!-- 条件付きタグ -->
    <VAction
      :href="externalUrl"
      :to="internalRoute"
      :tag="customTag"
      class="dynamic-action"
    >
      動的アクション
    </VAction>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { VAction } from '@fastkit/vue-action';

const isLoading = ref(false);
const userId = ref('123');
const externalUrl = ref('https://example.com');
const internalRoute = ref('/dashboard');
const customTag = ref('div');

const handleSubmit = () => {
  isLoading.value = true;
  // 送信処理
  setTimeout(() => {
    isLoading.value = false;
    console.log('送信完了');
  }, 2000);
};

const checkAdminPermission = async () => {
  // 管理者権限チェック（非同期）
  const hasPermission = await checkUserPermissions();
  if (!hasPermission) {
    alert('管理者権限が必要です');
    return false; // ナビゲーションを阻止
  }
  return true; // ナビゲーションを許可
};

const checkUserPermissions = (): Promise<boolean> => {
  return new Promise(resolve => {
    // API呼び出しのシミュレーション
    setTimeout(() => resolve(Math.random() > 0.5), 1000);
  });
};
</script>

<style scoped>
.btn {
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  transition: all 0.2s ease;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #0056b3;
}

.btn-primary:disabled {
  background: #6c757d;
  cursor: not-allowed;
}

.btn-link {
  background: transparent;
  color: #007bff;
  border: 1px solid #007bff;
}

.nav-link {
  color: #333;
  text-decoration: none;
  padding: 4px 8px;
}

.admin-link {
  color: #dc3545;
  font-weight: 500;
}

.loading {
  opacity: 0.6;
  pointer-events: none;
}

.dynamic-action {
  border: 2px dashed #ccc;
  padding: 8px;
  cursor: pointer;
}
</style>
```

#### VActionコンポーネントの高度な使用例

```vue
<template>
  <div class="action-showcase">
    <!-- 条件付きボタン群 -->
    <div class="button-group">
      <VAction
        v-for="action in actions"
        :key="action.id"
        v-bind="action.props"
        :class="action.class"
        @click="action.handler"
      >
        {{ action.label }}
      </VAction>
    </div>

    <!-- ナビゲーションメニュー -->
    <nav class="navigation">
      <VAction
        v-for="route in navRoutes"
        :key="route.path"
        :to="route.path"
        :guard="route.guard"
        :hasActionClass="'nav-item'"
        :actionableClass="'nav-item--actionable'"
        :disabledClass="'nav-item--disabled'"
        class="nav-item"
      >
        <span class="nav-icon">{{ route.icon }}</span>
        <span class="nav-label">{{ route.label }}</span>
      </VAction>
    </nav>

    <!-- ダウンロードリンク -->
    <div class="download-section">
      <VAction
        v-for="file in downloadFiles"
        :key="file.id"
        :href="file.url"
        :download="file.filename"
        :guard="checkDownloadPermission"
        class="download-link"
      >
        📁 {{ file.name }}
      </VAction>
    </div>

    <!-- ソーシャルシェア -->
    <div class="social-share">
      <VAction
        v-for="social in socialPlatforms"
        :key="social.name"
        :href="social.shareUrl"
        target="_blank"
        rel="noopener noreferrer"
        :class="['social-btn', `social-btn--${social.name}`]"
      >
        {{ social.icon }} {{ social.label }}
      </VAction>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { VAction } from '@fastkit/vue-action';

// 動的ボタン設定
const actions = ref([
  {
    id: 'save',
    label: '保存',
    props: { type: 'button', disabled: false },
    class: 'btn btn-success',
    handler: () => console.log('保存中...')
  },
  {
    id: 'cancel',
    label: 'キャンセル',
    props: { type: 'button' },
    class: 'btn btn-secondary',
    handler: () => console.log('キャンセル')
  },
  {
    id: 'delete',
    label: '削除',
    props: {
      type: 'button',
      guard: async () => {
        return confirm('本当に削除しますか？');
      }
    },
    class: 'btn btn-danger',
    handler: () => console.log('削除実行')
  }
]);

// ナビゲーションルート
const navRoutes = ref([
  {
    path: '/dashboard',
    label: 'ダッシュボード',
    icon: '📊',
    guard: null
  },
  {
    path: '/users',
    label: 'ユーザー管理',
    icon: '👥',
    guard: () => checkPermission('users.read')
  },
  {
    path: '/settings',
    label: '設定',
    icon: '⚙️',
    guard: () => checkPermission('settings.access')
  },
  {
    path: '/reports',
    label: 'レポート',
    icon: '📈',
    guard: async () => {
      const hasAccess = await checkPermission('reports.view');
      if (!hasAccess) {
        alert('レポート閲覧権限がありません');
        return false;
      }
      return true;
    }
  }
]);

// ダウンロードファイル
const downloadFiles = ref([
  {
    id: 1,
    name: 'ユーザーガイド',
    filename: 'user-guide.pdf',
    url: '/downloads/user-guide.pdf'
  },
  {
    id: 2,
    name: 'API仕様書',
    filename: 'api-docs.pdf',
    url: '/downloads/api-documentation.pdf'
  }
]);

// ソーシャルプラットフォーム
const socialPlatforms = computed(() => [
  {
    name: 'twitter',
    label: 'Twitter',
    icon: '🐦',
    shareUrl: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText.value)}&url=${encodeURIComponent(currentUrl.value)}`
  },
  {
    name: 'facebook',
    label: 'Facebook',
    icon: '📘',
    shareUrl: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl.value)}`
  },
  {
    name: 'linkedin',
    label: 'LinkedIn',
    icon: '💼',
    shareUrl: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl.value)}`
  }
]);

const shareText = ref('素晴らしいアプリをチェックしてください！');
const currentUrl = ref('https://example.com');

// 権限チェック関数
const checkPermission = async (permission: string): Promise<boolean> => {
  // 実際のアプリケーションでは、APIを呼び出して権限をチェック
  console.log(`権限チェック: ${permission}`);
  return new Promise(resolve => {
    setTimeout(() => {
      // ランダムに権限を付与（デモ用）
      resolve(Math.random() > 0.3);
    }, 500);
  });
};

// ダウンロード権限チェック
const checkDownloadPermission = async (): Promise<boolean> => {
  const hasPermission = await checkPermission('files.download');
  if (!hasPermission) {
    alert('ファイルダウンロード権限がありません');
    return false;
  }
  return true;
};
</script>

<style scoped>
.action-showcase {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.button-group {
  display: flex;
  gap: 12px;
  margin-bottom: 32px;
}

.btn {
  padding: 8px 16px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn-success { background: #28a745; color: white; }
.btn-secondary { background: #6c757d; color: white; }
.btn-danger { background: #dc3545; color: white; }

.btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
.btn:disabled { opacity: 0.5; cursor: not-allowed; }

.navigation {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 32px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  margin-bottom: 4px;
  border-radius: 6px;
  text-decoration: none;
  color: #333;
  transition: all 0.2s ease;
}

.nav-item--actionable:hover {
  background: #e9ecef;
}

.nav-item--disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.nav-icon {
  font-size: 18px;
}

.nav-label {
  font-weight: 500;
}

.download-section {
  margin-bottom: 32px;
}

.download-link {
  display: inline-block;
  padding: 8px 12px;
  margin: 4px 8px 4px 0;
  background: #17a2b8;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: background 0.2s ease;
}

.download-link:hover {
  background: #138496;
}

.social-share {
  display: flex;
  gap: 12px;
}

.social-btn {
  padding: 8px 16px;
  border-radius: 6px;
  text-decoration: none;
  color: white;
  font-weight: 500;
  transition: all 0.2s ease;
}

.social-btn--twitter { background: #1da1f2; }
.social-btn--facebook { background: #4267b2; }
.social-btn--linkedin { background: #0077b5; }

.social-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.2);
}
</style>
```

### useActionable composable

```vue
<template>
  <component
    :is="actionable.Tag"
    v-bind="actionable.attrs"
    @click="handleClick"
  >
    クリックして！
  </component>
</template>

<script setup lang="ts">
import { useActionable } from '@fastkit/vue-action'

const actionable = useActionable(
  { attrs: {}, emit: () => {} }, // SetupContext
  {
    hasActionClass: 'has-action',
    actionableClass: 'actionable',
    disabledClass: 'disabled'
  }
)

const handleClick = () => {
  console.log('クリックされました！')
}
</script>
```

### ボタンとしての使用

```vue
<template>
  <component
    :is="buttonAction.Tag"
    v-bind="buttonAction.attrs"
  >
    送信
  </component>
</template>

<script setup lang="ts">
import { useActionable } from '@fastkit/vue-action'

const buttonAction = useActionable(
  { attrs: { type: 'submit' }, emit: () => {} },
  { actionableClass: 'btn btn-primary' }
)
</script>
```

### RouterLinkとしての使用

```vue
<template>
  <component
    :is="linkAction.Tag"
    v-bind="linkAction.attrs"
  >
    ホームページへ
  </component>
</template>

<script setup lang="ts">
import { useActionable } from '@fastkit/vue-action'

const linkAction = useActionable(
  {
    attrs: {
      to: '/home',
      activeClass: 'active-link'
    },
    emit: () => {}
  },
  {
    activeClass: 'router-link-active',
    exactActiveClass: 'router-link-exact-active'
  }
)
</script>
```

## ガード機能

アクション実行前に条件をチェックできます：

```vue
<template>
  <component
    :is="guardedAction.Tag"
    v-bind="guardedAction.attrs"
    :class="{
      'loading': guardedAction.guardInProgress
    }"
  >
    {{ guardedAction.guardInProgress ? '処理中...' : '危険な操作' }}
  </component>
</template>

<script setup lang="ts">
import { useActionable } from '@fastkit/vue-action'

const guardedAction = useActionable(
  {
    attrs: {
      guard: async (ev: PointerEvent) => {
        // 非同期ガード処理
        const result = await confirm('本当に実行しますか？')
        return result // false を返すとアクションがキャンセルされる
      }
    },
    emit: () => {}
  },
  {
    guardInProgressClass: 'guard-processing'
  }
)
</script>
```

## 外部リンクとしての使用

```vue
<template>
  <component
    :is="externalLink.Tag"
    v-bind="externalLink.attrs"
  >
    外部サイトを開く
  </component>
</template>

<script setup lang="ts">
import { useActionable } from '@fastkit/vue-action'

const externalLink = useActionable(
  {
    attrs: {
      href: 'https://example.com',
      target: '_blank',
      rel: 'noopener noreferrer'
    },
    emit: () => {}
  }
)
</script>
```

## 状態ベースのスタイリング

コンポーネントの状態に基づいて自動的にCSSクラスが適用されます：

```vue
<template>
  <component
    :is="styledAction.Tag"
    v-bind="styledAction.attrs"
    :class="{
      'is-disabled': styledAction.disabled,
      'has-action': styledAction.hasAction,
      'is-actionable': styledAction.actionable
    }"
  >
    スタイル付きボタン
  </component>
</template>

<script setup lang="ts">
import { useActionable } from '@fastkit/vue-action'

const props = defineProps<{
  disabled?: boolean
}>()

const styledAction = useActionable(
  {
    attrs: {
      disabled: props.disabled
    },
    emit: () => {}
  },
  {
    disabledClass: 'btn-disabled',
    hasActionClass: 'btn-has-action',
    actionableClass: 'btn-actionable'
  }
)
</script>

<style scoped>
.btn-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-actionable {
  cursor: pointer;
  transition: all 0.2s;
}

.btn-actionable:hover {
  transform: translateY(-1px);
}
</style>
```

## カスタムRouterLinkの設定

Nuxt LinkやカスタムRouterLinkコンポーネントを使用する場合：

```typescript
import { setDefaultRouterLink } from '@fastkit/vue-action'
import { NuxtLink } from '#components'

// デフォルトのRouterLinkコンポーネントを設定
setDefaultRouterLink(NuxtLink, ['prefetch', 'noPrefetch'])
```

## 高度な使用例

### フォーム送信との組み合わせ

```vue
<template>
  <form @submit.prevent="handleSubmit">
    <input v-model="form.name" type="text" placeholder="名前" />

    <component
      :is="submitAction.Tag"
      v-bind="submitAction.attrs"
      :disabled="!form.name || isSubmitting"
    >
      {{ isSubmitting ? '送信中...' : '送信' }}
    </component>
  </form>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useActionable } from '@fastkit/vue-action'

const form = ref({ name: '' })
const isSubmitting = ref(false)

const submitAction = useActionable(
  {
    attrs: {
      type: 'submit',
      guard: async () => {
        if (!form.value.name) {
          alert('名前を入力してください')
          return false
        }
        return true
      }
    },
    emit: () => {}
  },
  {
    disabledClass: 'btn-disabled',
    guardInProgressClass: 'btn-loading'
  }
)

const handleSubmit = async () => {
  isSubmitting.value = true
  try {
    // フォーム送信処理
    await submitForm(form.value)
  } finally {
    isSubmitting.value = false
  }
}
</script>
```

### 条件付きルーティング

```vue
<template>
  <component
    :is="conditionalLink.Tag"
    v-bind="conditionalLink.attrs"
  >
    {{ canNavigate ? 'ページに移動' : 'ログインが必要' }}
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useActionable } from '@fastkit/vue-action'

const isLoggedIn = ref(false)
const canNavigate = computed(() => isLoggedIn.value)

const conditionalLink = useActionable(
  {
    attrs: {
      to: canNavigate.value ? '/protected' : undefined,
      guard: async () => {
        if (!isLoggedIn.value) {
          // ログインページにリダイレクト
          await router.push('/login')
          return false
        }
        return true
      }
    },
    emit: () => {}
  }
)
</script>
```

## API リファレンス

### VAction

統一されたアクショナブル要素のコンポーネント。

```typescript
// コンポーネントプロパティ
interface VActionProps extends ActionableAttrs {
  tag?: string;                    // HTMLタグ名
  class?: any;                     // CSSクラス
  style?: CSSProperties;           // スタイル
  linkFallbackTag?: string | (() => string | undefined); // フォールバックタグ

  // Router Link関連
  to?: RouteLocationRaw;           // Vue Routerの遷移先
  replace?: boolean;               // replaceナビゲーション
  activeClass?: string;            // アクティブ時のクラス
  exactActiveClass?: string;       // 完全一致アクティブ時のクラス

  // Link関連
  href?: string;                   // ハイパーリンクURL
  target?: string;                 // リンクターゲット
  rel?: string;                    // rel属性
  download?: boolean | string;     // ダウンロード属性

  // Button関連
  type?: 'button' | 'submit' | 'reset'; // ボタンタイプ
  disabled?: boolean;              // 無効状態
  name?: string;                   // フォーム名

  // ガード機能
  guard?: ActionableGuard;         // アクション実行前ガード関数

  // 状態別CSSクラス
  disabledClass?: string | (() => string | undefined);
  hasActionClass?: string | (() => string | undefined);
  actionableClass?: string | (() => string | undefined);
  guardInProgressClass?: string | (() => string | undefined);
}

// ガード関数の型定義
type ActionableGuard = (ev: PointerEvent) => boolean | void | Promise<boolean | void>;

// スロット
interface VActionSlots {
  default?: (actionable: Actionable) => any;
}
```

#### VActionの動作

VActionコンポーネントは以下の優先順位でHTMLタグを決定します：

1. **RouterLink**: `to`プロパティが指定された場合
2. **<a>タグ**: `href`プロパティが指定された場合
3. **<button>タグ**: `@click`ハンドラまたは`type`プロパティが指定された場合
4. **フォールバックタグ**: `linkFallbackTag`または`tag`プロパティで指定されたタグ（デフォルト: `div`）

#### ガード機能

```typescript
// 同期ガード
const syncGuard: ActionableGuard = (ev) => {
  if (someCondition) {
    return false; // アクションを阻止
  }
  return true; // アクションを許可
};

// 非同期ガード
const asyncGuard: ActionableGuard = async (ev) => {
  const result = await someAsyncValidation();
  return result.isValid;
};

// ガード中の状態表示
<VAction
  :guard="asyncGuard"
  :guardInProgressClass="'is-loading'"
  @click="handleAction"
>
  実行
</VAction>
```

#### 状態管理

VActionコンポーネントは以下の状態を自動的に管理します：

- **disabled**: `disabled`または`aria-disabled`が設定されている状態
- **hasAction**: リンク、クリックハンドラ、またはbuttonタグが設定されている状態
- **actionable**: アクションがあり、かつ無効状態でない状態
- **guardInProgress**: ガード関数の実行中状態

### useActionable

```typescript
function useActionable(
  setupContext: SetupContext<any>,
  opts: UseActionableOptions = {}
): Actionable
```

#### UseActionableOptions

| オプション | 型 | 説明 |
|------------|-----|------|
| `attrs` | `Record<string, unknown> \| ((context: { disabled: boolean }) => Record<string, unknown>)` | 追加の属性 |
| `disabledClass` | `string \| (() => string \| undefined)` | 無効状態のCSSクラス |
| `hasActionClass` | `string \| (() => string \| undefined)` | アクション有りのCSSクラス |
| `actionableClass` | `string \| (() => string \| undefined)` | アクション可能状態のCSSクラス |
| `guardInProgressClass` | `string \| (() => string \| undefined)` | ガード処理中のCSSクラス |
| `activeClass` | `string` | RouterLink アクティブクラス |
| `exactActiveClass` | `string` | RouterLink 完全一致アクティブクラス |
| `RouterLink` | `any` | カスタムRouterLinkコンポーネント |
| `linkFallbackTag` | `string \| (() => string \| undefined)` | フォールバックタグ名 |

#### Actionable Interface

```typescript
interface Actionable {
  readonly router: Router
  readonly Tag: ActionableTag
  readonly attrs: Record<string, unknown>
  readonly routerLink?: ActionableRouterLinkSettings
  readonly disabled: boolean
  readonly hasAction: boolean
  readonly actionable: boolean
  readonly guardInProgress: boolean
  render(children?: VNodeChild): VNode
}
```

### ActionableAttrs Interface

```typescript
interface ActionableAttrs extends ActionableRouterLinkProps {
  disabledClass?: string | (() => string | undefined)
  hasActionClass?: string | (() => string | undefined)
  actionableClass?: string | (() => string | undefined)
  guardInProgressClass?: string | (() => string | undefined)
  href?: string
  target?: string
  rel?: string
  name?: string
  hreflang?: string
  download?: boolean | string
  media?: string
  ping?: string
  referrerpolicy?: string
  type?: ButtonHTMLAttributes['type']
  title?: string
  disabled?: boolean
  guard?: ActionableGuard
}
```

### ActionableGuard

```typescript
type ActionableGuard = (ev: MouseEvent) => boolean | void | Promise<boolean | void>
```

ガード関数は`false`を返すことでアクションをキャンセルできます。

## 関連パッケージ

- `@fastkit/vue-utils` - Vue.js ユーティリティ関数
- `vue-router` - Vue Router（ピア依存関係）

## ライセンス

MIT
