# @fastkit/vue-tiny-meta

🌐 [English](https://github.com/dadajam4/fastkit/blob/main/packages/vue-tiny-meta/README.md) | 日本語

Vueコンポーネントの型情報とメタデータを自動抽出・解析するライブラリ。TypeScriptのコンパイラAPIを使用してVueコンポーネントのProps、Events、Slotsなどの詳細な型情報を抽出し、ドキュメント生成やStorybookの自動設定に活用できます。

## 機能

- **自動型抽出**: TypeScriptコンパイラAPIによるVueコンポーネントの型情報抽出
- **包括的なメタデータ**: Props、Events、Slots、JSDocコメントの完全サポート
- **Viteプラグイン**: 開発時の自動メタデータ注入
- **Storybook統合**: Storybook Controlsの自動生成
- **TypeScript完全サポート**: 厳密な型定義による型安全性
- **カスタマイズ可能**: フィルタリング、解決処理、ソート機能
- **高いパフォーマンス**: 効率的な解析とキャッシュ機能
- **開発者体験**: 詳細なJSDocコメントの自動抽出

## インストール

```bash
npm install @fastkit/vue-tiny-meta
```

## 基本的な使用方法

### Vueコンポーネントの型アノテーション

```typescript
// components/MyButton.tsx
import { defineComponent } from 'vue'

interface Props {
  /**
   * ボタンのラベルテキスト
   * @default "Click me"
   */
  label?: string

  /**
   * ボタンのサイズ
   */
  size?: 'small' | 'medium' | 'large'

  /**
   * ボタンの種類
   */
  variant?: 'primary' | 'secondary' | 'danger'

  /**
   * 無効状態
   */
  disabled?: boolean

  /**
   * ローディング状態
   */
  loading?: boolean
}

/**
 * @vue-tiny-meta
 * カスタマイズ可能なボタンコンポーネント
 *
 * @example
 * ```vue
 * <MyButton
 *   label="保存"
 *   size="large"
 *   variant="primary"
 *   @click="handleSave"
 * />
 * ```
 */
export default defineComponent<Props>({
  name: 'MyButton',

  props: {
    label: {
      type: String,
      default: 'Click me'
    },
    size: {
      type: String as PropType<Props['size']>,
      default: 'medium'
    },
    variant: {
      type: String as PropType<Props['variant']>,
      default: 'primary'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    }
  },

  emits: {
    /**
     * ボタンがクリックされた時に発行
     * @param event - マウスイベント
     */
    click: (event: PointerEvent) => true,

    /**
     * フォーカスが当たった時に発行
     * @param event - フォーカスイベント
     */
    focus: (event: FocusEvent) => true,

    /**
     * フォーカスが外れた時に発行
     * @param event - ブラーイベント
     */
    blur: (event: FocusEvent) => true
  },

  slots: {
    /**
     * ボタンのコンテンツ
     * デフォルトでlabelプロパティが表示される
     */
    default: (props: {}) => any,

    /**
     * ボタンの左側に表示されるアイコン
     */
    'v-slot:prefix': (props: {}) => any,

    /**
     * ボタンの右側に表示されるアイコン
     */
    'v-slot:suffix': (props: {}) => any,

    /**
     * ローディング時に表示されるアイコン
     */
    'v-slot:loading': (props: {}) => any
  },

  setup(props, { emit, slots }) {
    const handleClick = (event: PointerEvent) => {
      if (props.disabled || props.loading) return
      emit('click', event)
    }

    const handleFocus = (event: FocusEvent) => {
      emit('focus', event)
    }

    const handleBlur = (event: FocusEvent) => {
      emit('blur', event)
    }

    return () => (
      <button
        class={[
          'my-button',
          `my-button--${props.size}`,
          `my-button--${props.variant}`,
          {
            'my-button--disabled': props.disabled,
            'my-button--loading': props.loading
          }
        ]}
        disabled={props.disabled || props.loading}
        onClick={handleClick}
        onFocus={handleFocus}
        onBlur={handleBlur}
      >
        {props.loading && (
          <span class="my-button__loading">
            {slots.loading?.() || '⟳'}
          </span>
        )}

        {slots.prefix?.() && (
          <span class="my-button__prefix">
            {slots.prefix()}
          </span>
        )}

        <span class="my-button__content">
          {slots.default?.() || props.label}
        </span>

        {slots.suffix?.() && (
          <span class="my-button__suffix">
            {slots.suffix()}
          </span>
        )}
      </button>
    )
  }
})
```

### プログラムによるメタデータ抽出

```typescript
// scripts/extract-components.ts
import { extractAll } from '@fastkit/vue-tiny-meta'

// コンポーネントファイルからメタデータを抽出
async function extractComponentMeta() {
  const componentPath = './src/components/MyButton.tsx'

  const metadata = extractAll(componentPath, {
    // 特定のpropsを無視
    ignoreProps: ['class', 'style', 'key'],

    // 特定のeventsを無視
    ignoreEvents: ['onVnodeBeforeMount', 'onVnodeMounted'],

    // propsの解決処理
    resolvers: {
      prop: (prop) => {
        // デフォルト値の形式を統一
        if (prop.defaultValue) {
          prop.defaultValue.value = prop.defaultValue.value.replace(/['"]/g, '"')
        }
        return prop
      }
    },

    // ソート順序の指定
    sort: ['label', 'size', 'variant', 'disabled', 'loading']
  })

  console.log('抽出されたメタデータ:', JSON.stringify(metadata, null, 2))

  return metadata
}

extractComponentMeta()
```

### Viteプラグインでの自動注入

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { ViteVueTinyMeta } from '@fastkit/vue-tiny-meta/vite'

export default defineConfig({
  plugins: [
    vue(),
    ViteVueTinyMeta({
      // TypeScript/TSXファイルのみを対象
      include: /\.(ts|tsx)$/,

      // node_modulesを除外
      exclude: /node_modules/,

      // メタデータを注入するプロパティ名
      injectProperty: '__docgenInfo',

      // コンポーネント解析オプション
      ignoreProps: (baseRules) => [
        ...baseRules,
        'class',
        'style',
        /^data-/
      ],

      resolvers: {
        prop: (prop) => {
          // カスタム解決処理
          if (prop.name.startsWith('_')) {
            return false // 非表示
          }
          return prop
        }
      }
    })
  ]
})
```

### 実行時メタデータアクセス

```vue
<template>
  <div class="component-docs">
    <h2>{{ componentName }} コンポーネント</h2>

    <div class="description">
      {{ description }}
    </div>

    <!-- Props一覧 -->
    <section class="props-section">
      <h3>Props</h3>
      <div class="props-table">
        <div
          v-for="prop in props"
          :key="prop.name"
          class="prop-row"
        >
          <div class="prop-name">
            {{ prop.name }}
            <span v-if="prop.required" class="required">*</span>
          </div>
          <div class="prop-type">{{ prop.type.name }}</div>
          <div class="prop-default">
            {{ prop.defaultValue?.value || '-' }}
          </div>
          <div class="prop-description">
            {{ prop.description || '-' }}
          </div>
        </div>
      </div>
    </section>

    <!-- Events一覧 -->
    <section class="events-section">
      <h3>Events</h3>
      <div class="events-table">
        <div
          v-for="event in events"
          :key="event.name"
          class="event-row"
        >
          <div class="event-name">{{ event.name }}</div>
          <div class="event-type">{{ event.type.names.join(' | ') }}</div>
          <div class="event-description">
            {{ event.description || '-' }}
          </div>
        </div>
      </div>
    </section>

    <!-- Slots一覧 -->
    <section class="slots-section">
      <h3>Slots</h3>
      <div class="slots-table">
        <div
          v-for="slot in slots"
          :key="slot.name"
          class="slot-row"
        >
          <div class="slot-name">{{ slot.name }}</div>
          <div class="slot-required">
            {{ slot.required ? 'Yes' : 'No' }}
          </div>
          <div class="slot-description">
            {{ slot.description || '-' }}
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import MyButton from './MyButton'

// Viteプラグインによって注入されたメタデータを取得
const componentMeta = computed(() => {
  return (MyButton as any).__docgenInfo || {}
})

const componentName = computed(() => componentMeta.value.displayName || 'Unknown')
const description = computed(() => componentMeta.value.description || '')
const props = computed(() => componentMeta.value.props || [])
const events = computed(() => componentMeta.value.events || [])
const slots = computed(() => componentMeta.value.slots || [])
</script>

<style scoped>
.component-docs {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

.description {
  margin: 20px 0;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 4px;
  border-left: 4px solid #007acc;
}

.props-section,
.events-section,
.slots-section {
  margin: 30px 0;
}

.props-table,
.events-table,
.slots-table {
  border: 1px solid #eee;
  border-radius: 4px;
  overflow: hidden;
}

.prop-row,
.event-row,
.slot-row {
  display: grid;
  padding: 12px;
  border-bottom: 1px solid #eee;
  font-size: 0.9em;
}

.prop-row {
  grid-template-columns: 200px 150px 100px 1fr;
}

.event-row {
  grid-template-columns: 200px 200px 1fr;
}

.slot-row {
  grid-template-columns: 200px 100px 1fr;
}

.prop-name,
.event-name,
.slot-name {
  font-weight: bold;
  color: #333;
}

.required {
  color: #e74c3c;
  margin-left: 4px;
}

.prop-type,
.event-type {
  font-family: monospace;
  background: #f1f3f4;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 0.8em;
}

.prop-default {
  font-family: monospace;
  color: #666;
}

.prop-description,
.event-description,
.slot-description {
  color: #666;
}
</style>
```

## Storybook統合

### Storybook Controls自動生成

```typescript
// .storybook/main.ts
import type { StorybookConfig } from '@storybook/vue3-vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-controls'
  ],
  framework: {
    name: '@storybook/vue3-vite',
    options: {}
  },
  async viteFinal(config) {
    // vue-tiny-metaのViteプラグインを追加
    config.plugins?.push(
      ViteVueTinyMeta({
        include: /\.(ts|tsx)$/,
        injectProperty: '__docgenInfo'
      })
    )
    return config
  }
}

export default config
```

```typescript
// src/components/MyButton.stories.ts
import type { Meta, StoryObj } from '@storybook/vue3'
import { generateControls } from '@fastkit/vue-tiny-meta/storybook'
import MyButton from './MyButton'

// コンポーネントのメタデータから自動でcontrolsを生成
const controls = generateControls(MyButton.__docgenInfo)

const meta: Meta<typeof MyButton> = {
  title: 'Components/MyButton',
  component: MyButton,
  parameters: {
    docs: {
      description: {
        component: MyButton.__docgenInfo?.description
      }
    }
  },
  argTypes: {
    ...controls,

    // カスタム制御の追加
    size: {
      control: 'select',
      options: ['small', 'medium', 'large']
    },
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'danger']
    },

    // イベントハンドラ
    onClick: { action: 'clicked' },
    onFocus: { action: 'focused' },
    onBlur: { action: 'blurred' }
  }
}

export default meta
type Story = StoryObj<typeof meta>

// デフォルトストーリー
export const Default: Story = {
  args: {
    label: 'Click me',
    size: 'medium',
    variant: 'primary'
  }
}

// バリエーションストーリー
export const Primary: Story = {
  args: {
    label: '保存',
    variant: 'primary'
  }
}

export const Secondary: Story = {
  args: {
    label: 'キャンセル',
    variant: 'secondary'
  }
}

export const Danger: Story = {
  args: {
    label: '削除',
    variant: 'danger'
  }
}

export const Loading: Story = {
  args: {
    label: '処理中...',
    loading: true
  }
}

export const Disabled: Story = {
  args: {
    label: '無効',
    disabled: true
  }
}

export const WithSlots: Story = {
  args: {
    label: 'アイコン付きボタン'
  },
  render: (args) => ({
    components: { MyButton },
    setup() {
      return { args }
    },
    template: `
      <MyButton v-bind="args">
        <template #prefix>📁</template>
        <template #suffix>🔗</template>
      </MyButton>
    `
  })
}
```

## 高度な使用例

### カスタムリゾルバーの実装

```typescript
// utils/component-resolvers.ts
import type { PropResolver, EventResolver, SlotResolver } from '@fastkit/vue-tiny-meta'

// Props解決処理
export const propResolvers: PropResolver[] = [
  // デフォルト値の正規化
  (prop) => {
    if (prop.defaultValue) {
      // 不要な引用符を削除
      prop.defaultValue.value = prop.defaultValue.value
        .replace(/^['"]|['"]$/g, '')
    }
    return prop
  },

  // 型情報の拡張
  (prop) => {
    // Union型の値を配列として抽出
    if (prop.type.name.includes('|')) {
      const values = prop.type.name
        .split('|')
        .map(v => v.trim().replace(/['"]/g, ''))
      prop.values = values
    }
    return prop
  },

  // 非表示プロパティのフィルタリング
  (prop) => {
    if (prop.name.startsWith('_') || prop.name.startsWith('$')) {
      return false
    }
    return prop
  }
]

// Events解決処理
export const eventResolvers: EventResolver[] = [
  // イベント名の正規化
  (event) => {
    // onClickをclickに変換
    if (event.name.startsWith('on') && event.name.length > 2) {
      const simpleName = event.name.slice(2).toLowerCase()
      event.name = `on${event.name.slice(2)}` as `on${string}`
    }
    return event
  }
]

// Slots解決処理
export const slotResolvers: SlotResolver[] = [
  // スロット名の正規化
  (slot) => {
    // v-slot:プレフィックスを除去して表示
    if (slot.name.startsWith('v-slot:')) {
      const displayName = slot.name.replace('v-slot:', '')
      return {
        ...slot,
        name: slot.name,
        displayName
      } as any
    }
    return slot
  }
]
```

### バッチ処理での複数ファイル解析

```typescript
// scripts/generate-docs.ts
import { glob } from 'glob'
import { extractAll } from '@fastkit/vue-tiny-meta'
import { writeFileSync } from 'fs'
import { propResolvers, eventResolvers, slotResolvers } from '../utils/component-resolvers'

interface ComponentDocumentation {
  [componentName: string]: any
}

async function generateComponentDocs() {
  const componentFiles = await glob('./src/components/**/*.{ts,tsx}')
  const documentation: ComponentDocumentation = {}

  for (const filePath of componentFiles) {
    try {
      console.log(`Processing: ${filePath}`)

      const metadata = extractAll(filePath, {
        // カスタムフィルタ
        ignoreProps: (baseRules) => [
          ...baseRules,
          'class',
          'style',
          /^data-/,
          /^aria-/
        ],

        ignoreEvents: (baseRules) => [
          ...baseRules,
          /^onVnode/
        ],

        ignoreSlots: ['v-slot:_'],

        // カスタムリゾルバー
        resolvers: {
          prop: propResolvers,
          event: eventResolvers,
          slot: slotResolvers
        },

        // ソート設定
        sort: (a, b) => {
          const order = ['modelValue', 'onUpdate:modelValue', 'v-slot:default']
          const aIndex = order.indexOf(a.name)
          const bIndex = order.indexOf(b.name)

          if (aIndex !== -1 && bIndex !== -1) {
            return aIndex - bIndex
          }
          if (aIndex !== -1) return -1
          if (bIndex !== -1) return 1

          return a.name.localeCompare(b.name)
        }
      })

      metadata.forEach(component => {
        documentation[component.exportName] = component
      })

    } catch (error) {
      console.error(`Error processing ${filePath}:`, error)
    }
  }

  // JSONファイルとして出力
  writeFileSync(
    './docs/components-meta.json',
    JSON.stringify(documentation, null, 2)
  )

  // TypeScript定義ファイルとして出力
  generateTypeDefinitions(documentation)

  console.log(`Generated documentation for ${Object.keys(documentation).length} components`)

  return documentation
}

function generateTypeDefinitions(documentation: ComponentDocumentation) {
  let content = `// Generated component type definitions\n\n`

  for (const [componentName, meta] of Object.entries(documentation)) {
    content += `export interface ${componentName}Props {\n`

    meta.props.forEach((prop: any) => {
      const optional = prop.required ? '' : '?'
      const description = prop.description ? ` /** ${prop.description} */\n  ` : '  '
      content += `${description}${prop.name}${optional}: ${prop.type.name}\n`
    })

    content += `}\n\n`

    content += `export interface ${componentName}Events {\n`
    meta.events.forEach((event: any) => {
      const description = event.description ? ` /** ${event.description} */\n  ` : '  '
      content += `${description}${event.name}: (${event.type.names.join(' | ')}) => void\n`
    })
    content += `}\n\n`
  }

  writeFileSync('./src/types/components.d.ts', content)
}

generateComponentDocs()
```

## API仕様

### `extractAll(filePath, options?)`

指定されたファイルからVueコンポーネントのメタデータを抽出する関数。

```typescript
function extractAll(
  filePath: string,
  options?: SerializeVueOptions
): Promise<ComponentMeta[]>
```

**パラメータ:**

- `filePath`: 解析対象のファイルパス
- `options`: 解析オプション

**戻り値:**

- `ComponentMeta[]`: 抽出されたコンポーネントメタデータの配列

### `SerializeVueOptions`

メタデータ抽出のオプション設定。

```typescript
interface SerializeVueOptions {
  ignoreProps?: UserFilter              // 無視するProps
  ignoreEvents?: UserFilter             // 無視するEvents
  ignoreSlots?: UserFilter              // 無視するSlots
  resolvers?: Resolvers | Resolvers[]   // カスタム解決処理
  sort?: SortOption                     // ソート設定
}
```

### `ComponentMeta`

抽出されたコンポーネントメタデータの型定義。

```typescript
interface ComponentMeta {
  displayName: string                   // 表示名
  exportName: string                    // エクスポート名
  description?: string                  // 説明文
  props: PropMeta[]                     // Props情報
  slots: SlotMeta[]                     // Slots情報
  events: EventMeta[]                   // Events情報
  docs: MetaDoc[]                       // JSDocコメント
  sourceFile: {                        // ソースファイル情報
    path: string
    line: number
  }
}
```

### Viteプラグイン

```typescript
function ViteVueTinyMeta(
  options?: ViteVueTinyMetaOptions
): PluginOption
```

**オプション:**

- `include`: 対象ファイルパターン
- `exclude`: 除外ファイルパターン
- `injectProperty`: 注入プロパティ名（デフォルト: `__docgenInfo`）

## 注意事項

### TypeScript設定

- TypeScriptの厳密モードが推奨
- `strict: true`の設定が必要
- JSDocコメントの正確な抽出には適切な型注釈が重要

### パフォーマンス考慮事項

- 大量のファイルを一度に解析する場合はバッチ処理を推奨
- 開発時のホットリロードでは変更されたファイルのみを解析
- プロダクションビルドでは必要に応じてメタデータを除外

### 制限事項

- `defineComponent`で定義されたコンポーネントのみサポート
- 動的に生成されるProps/Eventsは解析対象外
- ファイル間の依存関係が複雑な場合は解析に時間がかかる場合あり

## ライセンス

MIT

## 関連パッケージ

- [@fastkit/ts-tiny-meta](../ts-tiny-meta/README.md): TypeScriptメタデータ抽出コア機能
- [@fastkit/helpers](../helpers/README.md): 基本的なユーティリティ関数
