
# @fastkit/vue-utils

🌐 English | [日本語](https://github.com/dadajam4/fastkit/blob/main/packages/vue-utils/README-ja.md)

A comprehensive utility library for efficient Vue application development. Provides development efficiency tools including component development, routing, property management, slot processing, and directives.

## Features

- **Component Utilities**: Helper functions to streamline component development
- **Property Management**: Type-safe property definitions and validation
- **Slot Utilities**: Slot definition and TSX-compatible helpers
- **Router Utilities**: Integration helpers with Vue Router
- **Custom Directives**: Collection of useful directives
- **VNode Operations**: Virtual node manipulation and rendering support
- **Full TypeScript Support**: Type safety through strict type definitions
- **ClientOnly Component**: SSR-compatible client-only rendering

## Installation

```bash
npm install @fastkit/vue-utils
```

## コンポーネントユーティリティ

### defineSlots - スロット定義

```typescript
import { defineSlots } from '@fastkit/vue-utils'

// スロットの型安全な定義
const slots = defineSlots<{
  default?: (props: { item: any; index: number }) => any
  header?: (props: { title: string }) => any
  footer?: () => any
}>()

export const MyComponent = defineComponent({
  name: 'MyComponent',
  props: {
    ...slots()
  },
  slots,
  setup(props, { slots }) {
    return () => (
      <div class="my-component">
        {slots.header?.({ title: 'Header Title' })}
        <main>
          {items.map((item, index) =>
            slots.default?.({ item, index })
          )}
        </main>
        {slots.footer?.()}
      </div>
    )
  }
})
```

### withCtx - コンテキスト付きスロット

```typescript
import { withCtx } from '@fastkit/vue-utils'

export const DataTable = defineComponent({
  setup() {
    const data = ref([])

    return () => (
      <table>
        {data.value.map((row, index) => (
          <tr key={index}>
            {withCtx(() => (
              <td>{row.name}</td>
            ), { row, index })}
          </tr>
        ))}
      </table>
    )
  }
})
```

## プロパティ管理

### createPropsOptions - プロパティファクトリ

```typescript
import { createPropsOptions } from '@fastkit/vue-utils'

// 再利用可能なプロパティ定義
export const createSizeProps = () => createPropsOptions({
  size: {
    type: String as PropType<'small' | 'medium' | 'large'>,
    default: 'medium'
  },
  width: Number,
  height: Number
})

export const createColorProps = () => createPropsOptions({
  color: {
    type: String as PropType<'primary' | 'secondary' | 'success' | 'warning' | 'error'>,
    default: 'primary'
  },
  variant: {
    type: String as PropType<'filled' | 'outlined' | 'text'>,
    default: 'filled'
  }
})

// Usage in components
export const Button = defineComponent({
  name: 'Button',
  props: {
    ...createSizeProps(),
    ...createColorProps(),
    disabled: Boolean,
    loading: Boolean
  },
  setup(props) {
    const classes = computed(() => [
      'button',
      `button--${props.size}`,
      `button--${props.color}`,
      `button--${props.variant}`,
      {
        'button--disabled': props.disabled,
        'button--loading': props.loading
      }
    ])

    return { classes }
  }
})
```

### extractRouteMatchedItems - Route Analysis

```typescript
import { extractRouteMatchedItems } from '@fastkit/vue-utils'

export const useBreadcrumb = () => {
  const route = useRoute()

  const breadcrumbItems = computed(() => {
    const matchedItems = extractRouteMatchedItems(route)

    return matchedItems.map(item => ({
      name: item.meta?.title || item.name,
      path: item.path,
      component: item.component
    }))
  })

  return { breadcrumbItems }
}
```

## ルーターユーティリティ

### ルートクエリ処理

```typescript
import { getRouteQuery, RouteQueryType } from '@fastkit/vue-utils'

export const useSearchParams = () => {
  const route = useRoute()
  const router = useRouter()

  // 型安全なクエリパラメータ取得
  const search = computed(() => getRouteQuery(route, 'search', RouteQueryType.String))
  const page = computed(() => getRouteQuery(route, 'page', RouteQueryType.Number) || 1)
  const filters = computed(() => getRouteQuery(route, 'filters', RouteQueryType.Array))

  const updateQuery = (params: Record<string, any>) => {
    router.push({
      query: {
        ...route.query,
        ...params
      }
    })
  }

  return {
    search,
    page,
    filters,
    updateQuery
  }
}
```

### ルートガード

```typescript
import { RouteLocationNormalized } from 'vue-router'

export const createAuthGuard = (requiredRole?: string) => {
  return (to: RouteLocationNormalized) => {
    const user = getCurrentUser()

    if (!user) {
      return { name: 'Login', query: { redirect: to.fullPath } }
    }

    if (requiredRole && !user.roles.includes(requiredRole)) {
      throw new Error('Access denied')
    }

    return true
  }
}

// Usage in route definitions
const routes = [
  {
    path: '/admin',
    component: AdminLayout,
    beforeEnter: createAuthGuard('admin')
  }
]
```

## VNode Utilities

### Dynamic Component Rendering

```typescript
import { renderVNodeChild } from '@fastkit/vue-utils'

export const DynamicRenderer = defineComponent({
  props: {
    content: {
      type: [String, Function, Object] as PropType<VNodeChild>,
      required: true
    },
    props: Object
  },
  setup(props) {
    return () => renderVNodeChild(props.content, props.props)
  }
})

// Usage examples
<DynamicRenderer
  :content="MyComponent"
  :props="{ title: 'Dynamic Title' }"
/>

<DynamicRenderer
  :content="() => h('div', 'Dynamic content')"
/>

<DynamicRenderer
  content="Simple text content"
/>
```

### 条件付きレンダリング

```typescript
import { conditionalRender } from '@fastkit/vue-utils'

export const ConditionalComponent = defineComponent({
  props: {
    condition: Boolean,
    fallback: [String, Object, Function] as PropType<VNodeChild>
  },
  setup(props, { slots }) {
    return () => conditionalRender(
      props.condition,
      () => slots.default?.(),
      () => renderVNodeChild(props.fallback)
    )
  }
})
```

## ClientOnly Component

### SSR-compatible Client-only Rendering

```vue
<template>
  <div>
    <h1>Content rendered on server too</h1>

    <!-- Client-only rendering -->
    <ClientOnly>
      <template #default>
        <InteractiveChart :data="chartData" />
      </template>

      <template #fallback>
        <div class="chart-placeholder">
          Loading chart...
        </div>
      </template>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
import { ClientOnly } from '@fastkit/vue-utils'
import InteractiveChart from './InteractiveChart.vue'

const chartData = ref([])
</script>
```

### Lazy Loading

```vue
<template>
  <ClientOnly>
    <template #default>
      <Suspense>
        <template #default>
          <AsyncHeavyComponent />
        </template>
        <template #fallback>
          <LoadingSpinner />
        </template>
      </Suspense>
    </template>

    <template #fallback>
      <div>クライアント側で読み込み中...</div>
    </template>
  </ClientOnly>
</template>

<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import { ClientOnly } from '@fastkit/vue-utils'

const AsyncHeavyComponent = defineAsyncComponent(() =>
  import('./HeavyComponent.vue')
)
</script>
```

## カスタムディレクティブ

### v-visibility ディレクティブ

```vue
<template>
  <div>
    <!-- 要素の可視性監視 -->
    <div
      v-visibility="onVisibilityChange"
      class="observed-element"
    >
      観視されている要素
    </div>

    <!-- With options -->
    <div
      v-visibility="{
        handler: onIntersect,
        options: {
          threshold: 0.5,
          rootMargin: '10px'
        }
      }"
    >
      Triggers when 50% or more is visible
    </div>
  </div>
</template>

<script setup lang="ts">
import { vVisibility } from '@fastkit/vue-utils'

const onVisibilityChange = (isVisible: boolean, entry: IntersectionObserverEntry) => {
  console.log('Element visibility:', isVisible)

  if (isVisible) {
    // Process when element becomes visible
    console.log('Element became visible')
  }
}

const onIntersect = (isVisible: boolean) => {
  if (isVisible) {
    // Start lazy loading or animation
    console.log('50% or more visible')
  }
}
</script>
```

## Advanced Usage Examples

### Component Factory

```typescript
import { defineComponent, PropType } from 'vue'
import { createPropsOptions } from '@fastkit/vue-utils'

// Define base properties
const createBaseProps = () => createPropsOptions({
  id: String,
  class: [String, Array, Object] as PropType<any>,
  style: [String, Object] as PropType<any>
})

// 特定機能のプロパティ
const createFormFieldProps = () => createPropsOptions({
  ...createBaseProps(),
  name: String,
  label: String,
  required: Boolean,
  disabled: Boolean,
  readonly: Boolean,
  error: String,
  helperText: String
})

// コンポーネントファクトリ関数
export function createFormField<T>(
  fieldType: string,
  extraProps: Record<string, any> = {},
  renderFn: (props: any, context: any) => VNode
) {
  return defineComponent({
    name: `FormField${fieldType}`,
    props: {
      ...createFormFieldProps(),
      ...extraProps
    },
    setup(props, context) {
      return () => renderFn(props, context)
    }
  })
}

// 具体的なフィールドコンポーネント
export const FormInput = createFormField(
  'Input',
  {
    type: {
      type: String as PropType<'text' | 'email' | 'password' | 'number'>,
      default: 'text'
    },
    placeholder: String,
    maxlength: Number
  },
  (props, { emit }) => (
    <div class="form-field">
      {props.label && <label>{props.label}</label>}
      <input
        type={props.type}
        name={props.name}
        placeholder={props.placeholder}
        disabled={props.disabled}
        readonly={props.readonly}
        maxlength={props.maxlength}
        onInput={(e) => emit('update:modelValue', e.target.value)}
      />
      {props.error && <div class="error">{props.error}</div>}
      {props.helperText && <div class="helper">{props.helperText}</div>}
    </div>
  )
)
```

### 高度なルーターフック

```typescript
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getRouteQuery, RouteQueryType } from '@fastkit/vue-utils'

export function useAdvancedRouter() {
  const route = useRoute()
  const router = useRouter()

  // History management
  const history = ref<string[]>([])

  watch(() => route.path, (newPath) => {
    history.value.push(newPath)
    // History up to 50 entries maximum
    if (history.value.length > 50) {
      history.value = history.value.slice(-50)
    }
  }, { immediate: true })

  // Type-safe query parameter management
  const createQueryManager = <T extends Record<string, RouteQueryType>>(
    schema: T
  ) => {
    const queryValues = computed(() => {
      const result = {} as any
      for (const [key, type] of Object.entries(schema)) {
        result[key] = getRouteQuery(route, key, type)
      }
      return result
    })

    const updateQuery = (updates: Partial<Record<keyof T, any>>) => {
      const newQuery = { ...route.query }

      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === undefined) {
          delete newQuery[key]
        } else {
          newQuery[key] = String(value)
        }
      }

      router.replace({ query: newQuery })
    }

    return { queryValues, updateQuery }
  }

  // Navigation helper
  const goBack = () => {
    if (history.value.length > 1) {
      router.back()
    } else {
      router.push('/')
    }
  }

  const canGoBack = computed(() => history.value.length > 1)

  return {
    history: readonly(history),
    canGoBack,
    goBack,
    createQueryManager
  }
}

// 使用例
export function useProductFilters() {
  const { createQueryManager } = useAdvancedRouter()

  const { queryValues, updateQuery } = createQueryManager({
    search: RouteQueryType.String,
    category: RouteQueryType.String,
    minPrice: RouteQueryType.Number,
    maxPrice: RouteQueryType.Number,
    tags: RouteQueryType.Array,
    page: RouteQueryType.Number
  })

  const applyFilters = (filters: Partial<typeof queryValues.value>) => {
    updateQuery({ ...filters, page: 1 }) // フィルタ変更時はページをリセット
  }

  return {
    filters: queryValues,
    applyFilters,
    updateQuery
  }
}
```

### 動的コンポーネントローダー

```typescript
import { defineAsyncComponent, ref, computed } from 'vue'
import { renderVNodeChild } from '@fastkit/vue-utils'

export function useDynamicComponents() {
  const componentCache = new Map()

  const loadComponent = async (componentPath: string) => {
    if (componentCache.has(componentPath)) {
      return componentCache.get(componentPath)
    }

    try {
      const module = await import(/* @vite-ignore */ componentPath)
      const component = module.default || module
      componentCache.set(componentPath, component)
      return component
    } catch (error) {
      console.error(`Failed to load component: ${componentPath}`, error)
      return null
    }
  }

  const createDynamicComponent = (componentPath: string) => {
    return defineAsyncComponent({
      loader: () => loadComponent(componentPath),
      loadingComponent: () => h('div', 'Loading...'),
      errorComponent: () => h('div', 'Failed to load component'),
      delay: 200,
      timeout: 3000
    })
  }

  return {
    loadComponent,
    createDynamicComponent,
    componentCache: readonly(componentCache)
  }
}
```

## パフォーマンス最適化

### メモ化とキャッシュ

```typescript
import { computed, ref, shallowRef } from 'vue'

export function useOptimizedList<T>(
  items: Ref<T[]>,
  keyFn: (item: T) => string | number = (item, index) => index
) {
  const itemCache = new Map()

  const optimizedItems = computed(() => {
    const result = []
    const newCache = new Map()

    for (let i = 0; i < items.value.length; i++) {
      const item = items.value[i]
      const key = keyFn(item, i)

      if (itemCache.has(key)) {
        // Reuse cached item
        const cached = itemCache.get(key)
        newCache.set(key, cached)
        result.push(cached)
      } else {
        // Create new item
        const processedItem = {
          key,
          data: item,
          index: i
        }
        newCache.set(key, processedItem)
        result.push(processedItem)
      }
    }

    // Update cache
    itemCache.clear()
    newCache.forEach((value, key) => {
      itemCache.set(key, value)
    })

    return result
  })

  return {
    optimizedItems,
    clearCache: () => itemCache.clear()
  }
}
```

## API リファレンス

### コンポーネントユーティリティ

```typescript
// スロット定義
function defineSlots<T extends Record<string, (...args: any[]) => any>>(): PropType<T>

// コンテキスト付きレンダリング
function withCtx<T>(fn: () => VNodeChild, ctx?: T): VNodeChild

// コンポーネント型チェック
function isComponentCustomOptions(Component: unknown): Component is ComponentCustomOptions
```

### プロパティ管理

```typescript
// プロパティオプション作成
function createPropsOptions<T extends Record<string, any>>(props: T): T

// プロパティ型抽出
type ExtractComponentPropTypes<C extends { setup?: DefineComponent<any>['setup'] }>
```

### ルーターユーティリティ

```typescript
// ルートクエリ取得
function getRouteQuery(
  route: RouteLocationNormalizedLoaded,
  key: string,
  type: RouteQueryType
): any

// ルートアイテム抽出
function extractRouteMatchedItems(route: RouteLocationNormalizedLoaded): RouteMatchedItem[]

// クエリタイプ
enum RouteQueryType {
  String,
  Number,
  Boolean,
  Array
}
```

### コンポーネント

```typescript
// クライアント専用レンダリング
interface ClientOnlyProps {
  fallback?: VNodeChild
  placeholder?: VNodeChild
}
```

## Related Packages

- `@fastkit/helpers` - ヘルパー関数
- `@fastkit/ts-type-utils` - TypeScript型ユーティリティ
- `@fastkit/visibility` - 可視性検出
- `vue` - Vue.js フレームワーク（ピア依存関係）
- `vue-router` - Vue Router（ピア依存関係）

## License

MIT
