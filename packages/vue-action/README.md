# @fastkit/vue-action

Vue 3用のアクショナブル（クリック可能）要素を扱うための包括的なコンポーネントライブラリです。ボタン、リンク、RouterLinkの統一されたインターフェースを提供し、ガード機能、状態管理、アクセシビリティサポートを含みます。

## 機能

- **統一されたAPI**: ボタン、aタグ、RouterLinkを同じインターフェースで扱える
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
      guard: async (ev: MouseEvent) => {
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
