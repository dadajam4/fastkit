
# @fastkit/vui-wysiwyg

🌐 English | [日本語](https://github.com/dadajam4/fastkit/blob/main/packages/vui-wysiwyg/README-ja.md)

A high-featured WYSIWYG editor component for Vue.js 3. Built on Tiptap and ProseMirror, it provides rich editing capabilities and customizability, fully integrated with the @fastkit/vui design system.

## Features

- **Rich Text Editing**: Comprehensive editing features including text formatting, lists, links, coloring, etc.
- **@fastkit/vui Integration**: Complete integration with the vui design system and component compatibility
- **Customizable Toolbar**: Support for both fixed toolbar and floating menu
- **Extension System**: Powerful extension architecture based on Tiptap/ProseMirror
- **Form Controls**: Standard form validation and input control functionality
- **Complete TypeScript Support**: Type safety through strict type definitions
- **Accessibility**: Keyboard navigation and screen reader support
- **SSR Support**: Full server-side rendering support
- **High Performance**: Efficient virtual DOM manipulation and optimized rendering
- **Custom Styling**: Detailed style customization through Sass variables

## Installation

```bash
npm install @fastkit/vui-wysiwyg
```

## Basic Usage

### Basic Editor

```vue
<template>
  <div class="editor-container">
    <VWysiwygEditor
      v-model="content"
      label="Article Content"
      placeholder="Enter content here..."
      :tools="defaultTools"
      :extensions="extensions"
    />

    <div class="preview">
      <h3>Preview</h3>
      <div v-html="content"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { VWysiwygEditor } from '@fastkit/vui-wysiwyg'
import {
  WysiwygFormatBoldTool,
  WysiwygFormatItalicTool,
  WysiwygFormatUnderlineTool,
  WysiwygBulletListTool,
  WysiwygOrderedListTool,
  WysiwygLinkTool,
  WysiwygHistoryTool,
} from '@fastkit/vui-wysiwyg'

const content = ref('<p>Initial content</p>')

// Basic tool set
const defaultTools = [
  WysiwygFormatBoldTool,
  WysiwygFormatItalicTool,
  WysiwygFormatUnderlineTool,
  WysiwygBulletListTool,
  WysiwygOrderedListTool,
  WysiwygLinkTool,
  WysiwygHistoryTool,
]

const extensions = []
</script>

<style scoped>
.editor-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.preview {
  margin-top: 30px;
  padding: 20px;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  background-color: #f8f9fa;
}
</style>
```

### Customized Editor Configuration

```vue
<template>
  <div class="advanced-editor">
    <VWysiwygEditor
      v-model="articleContent"
      label="Article Editor"
      hint="Markdown can also be used"
      :tools="advancedTools"
      :extensions="customExtensions"
      :floating-toolbar="false"
      :disabled-min-height="false"
      :disabled-max-height="false"
      :remove-default-wrapper="true"
      :max-length="5000"
      counter
      required
      size="large"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  VWysiwygEditor,
  WysiwygFormatBoldTool,
  WysiwygFormatItalicTool,
  WysiwygFormatUnderlineTool,
  WysiwygBulletListTool,
  WysiwygOrderedListTool,
  WysiwygLinkTool,
  WysiwygHistoryTool,
  WysiwygColorTool,
  WysiwygTextAlignTool,
  WysiwygCustomTagTool,
  createWysiwygExtension,
} from '@fastkit/vui-wysiwyg'
import { TextAlign } from '@tiptap/extension-text-align'
import { Color } from '@tiptap/extension-color'

const articleContent = ref('')

// Advanced tool set
const advancedTools = [
  WysiwygFormatBoldTool,
  WysiwygFormatItalicTool,
  WysiwygFormatUnderlineTool,
  WysiwygBulletListTool,
  WysiwygOrderedListTool,
  WysiwygLinkTool,
  WysiwygColorTool,
  WysiwygTextAlignTool,
  WysiwygCustomTagTool,
  WysiwygHistoryTool,
]

// Custom extensions
const customExtensions = [
  createWysiwygExtension(TextAlign.configure({
    types: ['heading', 'paragraph'],
    alignments: ['left', 'center', 'right', 'justify'],
  })),
  createWysiwygExtension(Color.configure({
    types: ['textStyle'],
  })),
]
</script>

<style scoped>
.advanced-editor {
  max-width: 1000px;
  margin: 0 auto;
  padding: 30px;
}
</style>
```

### Component API and Event Handling

```vue
<template>
  <div class="api-example">
    <VWysiwygEditor
      ref="editorRef"
      v-model="content"
      label="API-Integrated Editor"
      :tools="tools"
      @input="handleInput"
      @focus="handleFocus"
      @blur="handleBlur"
      @update:modelValue="handleUpdate"
    />

    <div class="editor-controls">
      <VButton @click="insertText">Insert Text</VButton>
      <VButton @click="focusEditor">Focus</VButton>
      <VButton @click="getContent">Get Content</VButton>
      <VButton @click="clearContent">Clear</VButton>
      <VButton @click="formatSelection">Bold Selection</VButton>
    </div>

    <div class="editor-stats">
      <div>Character count: {{ textLength }}</div>
      <div>HTML length: {{ htmlLength }}</div>
      <div>Focus state: {{ isFocused ? 'Focused' : 'Unfocused' }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  VWysiwygEditor,
  VWysiwygEditorAPI,
  WysiwygFormatBoldTool,
  WysiwygFormatItalicTool,
  WysiwygHistoryTool,
} from '@fastkit/vui-wysiwyg'
import { VButton } from '@fastkit/vui'

const editorRef = ref<VWysiwygEditorAPI>()
const content = ref('<p>Sample text</p>')
const isFocused = ref(false)

const tools = [
  WysiwygFormatBoldTool,
  WysiwygFormatItalicTool,
  WysiwygHistoryTool,
]

const textLength = computed(() => {
  const editor = editorRef.value?.editor
  return editor ? editor.getText().length : 0
})

const htmlLength = computed(() => content.value.length)

// Event handlers
const handleInput = (value: string) => {
  console.log('Input changed:', value)
}

const handleFocus = (event: FocusEvent) => {
  isFocused.value = true
  console.log('Editor focused:', event)
}

const handleBlur = (event: FocusEvent) => {
  isFocused.value = false
  console.log('Editor blurred:', event)
}

const handleUpdate = (value: string) => {
  console.log('Content updated:', value)
}

// Editor operation methods
const insertText = () => {
  const editor = editorRef.value?.editor
  if (editor) {
    editor.chain().focus().insertContent(' inserted text ').run()
  }
}

const focusEditor = () => {
  const editor = editorRef.value?.editor
  if (editor) {
    editor.chain().focus('end').run()
  }
}

const getContent = () => {
  const editor = editorRef.value?.editor
  if (editor) {
    const html = editor.getHTML()
    const text = editor.getText()
    console.log('HTML:', html)
    console.log('Text:', text)
    alert(`HTML: ${html.slice(0, 100)}...\nText: ${text.slice(0, 100)}...`)
  }
}

const clearContent = () => {
  const editor = editorRef.value?.editor
  if (editor) {
    editor.chain().focus().clearContent().run()
  }
}

const formatSelection = () => {
  const editor = editorRef.value?.editor
  if (editor) {
    editor.chain().focus().toggleBold().run()
  }
}
</script>

<style scoped>
.api-example {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.editor-controls {
  margin: 20px 0;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.editor-stats {
  margin-top: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
  font-family: monospace;
}

.editor-stats > div {
  margin: 5px 0;
}
</style>
```

## Creating Custom Extensions

### Creating Custom Marks

```typescript
// custom-extensions/highlight.ts
import { Mark, mergeAttributes } from '@tiptap/core'
import { WysiwygExtensionFactory } from '@fastkit/vui-wysiwyg'

export interface HighlightOptions {
  multicolor: boolean
  HTMLAttributes: Record<string, any>
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    highlight: {
      setHighlight: (attributes?: { color?: string }) => ReturnType
      toggleHighlight: (attributes?: { color?: string }) => ReturnType
      unsetHighlight: () => ReturnType
    }
  }
}

export const Highlight = Mark.create<HighlightOptions>({
  name: 'highlight',

  addOptions() {
    return {
      multicolor: false,
      HTMLAttributes: {},
    }
  },

  addAttributes() {
    if (!this.options.multicolor) {
      return {}
    }

    return {
      color: {
        default: null,
        parseHTML: element => element.getAttribute('data-color') || element.style.backgroundColor,
        renderHTML: attributes => {
          if (!attributes.color) return {}
          return {
            'data-color': attributes.color,
            style: `background-color: ${attributes.color}; color: inherit`,
          }
        },
      },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'mark',
      },
    ]
  },

  renderHTML({ HTMLAttributes }) {
    return ['mark', mergeAttributes(this.options.HTMLAttributes, HTMLAttributes), 0]
  },

  addCommands() {
    return {
      setHighlight:
        attributes =>
        ({ commands }) => {
          return commands.setMark(this.name, attributes)
        },
      toggleHighlight:
        attributes =>
        ({ commands }) => {
          return commands.toggleMark(this.name, attributes)
        },
      unsetHighlight:
        () =>
        ({ commands }) => {
          return commands.unsetMark(this.name)
        },
    }
  },
})

// Custom extensions factory
export const CustomHighlightExtension: WysiwygExtensionFactory<HighlightOptions> = (ctx) => {
  return Highlight.configure({
    multicolor: true,
    HTMLAttributes: {
      class: 'custom-highlight',
    },
  })
}
```

### Creating Custom Tools

```typescript
// custom-tools/highlight-tool.ts
import { WysiwygEditorToolFactory, WysiwygEditorTool } from '@fastkit/vui-wysiwyg'
import { CustomHighlightExtension } from '../custom-extensions/highlight'

export interface HighlightToolOptions {
  colors?: string[]
}

export const CustomHighlightTool: WysiwygEditorToolFactory<HighlightToolOptions> = (
  vui,
  options = {}
) => {
  const colors = options.colors || ['#ffeb3b', '#4caf50', '#2196f3', '#f44336']

  const tools: WysiwygEditorTool[] = colors.map((color, index) => ({
    key: `highlight-${index}`,
    icon: ({ vui }) => vui.icon('palette'),
    active: ({ editor }) => editor.isActive('highlight', { color }),
    onClick: ({ editor }) => {
      editor.chain().focus().toggleHighlight({ color }).run()
    },
    floating: true,
    extensions: [CustomHighlightExtension],
  }))

  return tools
}
```

### Editor with Custom Elements

```vue
<template>
  <div class="custom-editor">
    <VWysiwygEditor
      v-model="content"
      label="Editor with Custom Features"
      :tools="customTools"
      :extensions="customExtensions"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  VWysiwygEditor,
  WysiwygFormatBoldTool,
  WysiwygFormatItalicTool,
  WysiwygHistoryTool,
  createWysiwygExtension,
} from '@fastkit/vui-wysiwyg'
import { CustomHighlightTool, CustomHighlightExtension } from './custom-tools/highlight-tool'

const content = ref('')

const customTools = [
  WysiwygFormatBoldTool,
  WysiwygFormatItalicTool,
  // Custom highlight tool
  CustomHighlightTool,
  WysiwygHistoryTool,
]

const customExtensions = [
  createWysiwygExtension(CustomHighlightExtension),
]
</script>
```

## Form Integration and Validation

### Form with Validation

```vue
<template>
  <div class="form-example">
    <VForm @submit="handleSubmit" @invalid="handleInvalid">
      <VWysiwygEditor
        v-model="formData.content"
        label="Article Content"
        hint="Please enter at least 100 characters"
        :tools="tools"
        :min-length="100"
        :max-length="5000"
        counter
        required
        :error-messages="errors.content"
      />

      <VWysiwygEditor
        v-model="formData.summary"
        label="Article Summary"
        hint="Enter article summary within 200 characters"
        :tools="basicTools"
        :max-length="200"
        counter
        required
        size="small"
        :error-messages="errors.summary"
      />

      <div class="form-actions">
        <VButton type="submit" variant="contained" color="primary">
          Save Article
        </VButton>
        <VButton type="button" @click="previewArticle">
          Preview
        </VButton>
      </div>
    </VForm>

    <!-- Preview modal -->
    <VDialog v-model="showPreview" max-width="800px">
      <VCard>
        <VCardTitle>Article Preview</VCardTitle>
        <VCardContent>
          <div class="preview-content">
            <h3>{{ formData.title }}</h3>
            <div class="summary" v-html="formData.summary"></div>
            <div class="content" v-html="formData.content"></div>
          </div>
        </VCardContent>
        <VCardActions>
          <VButton @click="showPreview = false">Close</VButton>
        </VCardActions>
      </VCard>
    </VDialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import {
  VWysiwygEditor,
  WysiwygFormatBoldTool,
  WysiwygFormatItalicTool,
  WysiwygFormatUnderlineTool,
  WysiwygBulletListTool,
  WysiwygOrderedListTool,
  WysiwygLinkTool,
  WysiwygHistoryTool,
} from '@fastkit/vui-wysiwyg'
import {
  VForm,
  VButton,
  VDialog,
  VCard,
  VCardTitle,
  VCardContent,
  VCardActions,
} from '@fastkit/vui'

const showPreview = ref(false)

const formData = reactive({
  title: '',
  content: '',
  summary: '',
})

const errors = reactive({
  content: [] as string[],
  summary: [] as string[],
})

const tools = [
  WysiwygFormatBoldTool,
  WysiwygFormatItalicTool,
  WysiwygFormatUnderlineTool,
  WysiwygBulletListTool,
  WysiwygOrderedListTool,
  WysiwygLinkTool,
  WysiwygHistoryTool,
]

const basicTools = [
  WysiwygFormatBoldTool,
  WysiwygFormatItalicTool,
  WysiwygHistoryTool,
]

const handleSubmit = async () => {
  // Form validation
  errors.content = []
  errors.summary = []

  if (!formData.content || formData.content.length < 100) {
    errors.content.push('Article content must be at least 100 characters')
  }

  if (!formData.summary) {
    errors.summary.push('Summary is required')
  }

  if (errors.content.length === 0 && errors.summary.length === 0) {
    try {
      // API投稿処理
      await saveArticle(formData)
      alert('記事が保存されました')
    } catch (error) {
      console.error('保存エラー:', error)
      alert('保存に失敗しました')
    }
  }
}

const handleInvalid = (event: Event) => {
  console.log('フォーム検証エラー:', event)
}

const previewArticle = () => {
  showPreview.value = true
}

const saveArticle = async (data: typeof formData) => {
  // API呼び出し実装
  const response = await fetch('/api/articles', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })

  if (!response.ok) {
    throw new Error('保存に失敗しました')
  }

  return response.json()
}
</script>

<style scoped>
.form-example {
  max-width: 900px;
  margin: 0 auto;
  padding: 30px;
}

.form-actions {
  margin-top: 30px;
  display: flex;
  gap: 15px;
}

.preview-content {
  max-height: 600px;
  overflow-y: auto;
}

.preview-content h3 {
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #e1e5e9;
}

.summary {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f8f9fa;
  border-radius: 8px;
  font-style: italic;
}

.content {
  line-height: 1.6;
}
</style>
```

## スタイリングとテーマ

### カスタムテーマの作成

```scss
// custom-wysiwyg-theme.scss
@import '@fastkit/vui-wysiwyg/vui-wysiwyg.css';

// カスタムエディタ変数
:root {
  --wysiwyg-editor-bg: #ffffff;
  --wysiwyg-editor-border: #e1e5e9;
  --wysiwyg-editor-border-focus: #007acc;
  --wysiwyg-editor-text: #333333;
  --wysiwyg-editor-placeholder: #999999;
  --wysiwyg-toolbar-bg: #f8f9fa;
  --wysiwyg-toolbar-border: #e1e5e9;
  --wysiwyg-button-hover: #e2e6ea;
  --wysiwyg-button-active: #007acc;
  --wysiwyg-button-active-bg: #e3f2fd;
}

// ダークテーマ
[data-theme="dark"] {
  --wysiwyg-editor-bg: #1a1a1a;
  --wysiwyg-editor-border: #444444;
  --wysiwyg-editor-border-focus: #4fc3f7;
  --wysiwyg-editor-text: #ffffff;
  --wysiwyg-editor-placeholder: #bbbbbb;
  --wysiwyg-toolbar-bg: #2d2d2d;
  --wysiwyg-toolbar-border: #444444;
  --wysiwyg-button-hover: #404040;
  --wysiwyg-button-active: #4fc3f7;
  --wysiwyg-button-active-bg: #0d47a1;
}

// カスタムエディタスタイル
.v-wysiwyg-editor {
  background-color: var(--wysiwyg-editor-bg);
  border: 1px solid var(--wysiwyg-editor-border);
  border-radius: 8px;
  transition: border-color 0.2s ease;

  &:focus-within {
    border-color: var(--wysiwyg-editor-border-focus);
    box-shadow: 0 0 0 2px rgba(0, 122, 204, 0.2);
  }

  // ツールバーのスタイル
  .v-wysiwyg-editor__toolbar {
    background-color: var(--wysiwyg-toolbar-bg);
    border-bottom: 1px solid var(--wysiwyg-toolbar-border);
    padding: 8px 12px;

    .v-button {
      margin: 0 2px;
      transition: all 0.2s ease;

      &:hover {
        background-color: var(--wysiwyg-button-hover);
      }

      &.v-button--active {
        color: var(--wysiwyg-button-active);
        background-color: var(--wysiwyg-button-active-bg);
      }
    }
  }

  // エディタコンテンツのスタイル
  .v-wysiwyg-editor__input__prose {
    color: var(--wysiwyg-editor-text);
    padding: 16px;
    min-height: 200px;
    line-height: 1.6;

    &::placeholder {
      color: var(--wysiwyg-editor-placeholder);
    }

    // プロージングスタイル
    h1, h2, h3, h4, h5, h6 {
      font-weight: bold;
      margin: 1em 0 0.5em 0;

      &:first-child {
        margin-top: 0;
      }
    }

    h1 { font-size: 2em; }
    h2 { font-size: 1.5em; }
    h3 { font-size: 1.25em; }

    p {
      margin: 0.5em 0;

      &:first-child {
        margin-top: 0;
      }

      &:last-child {
        margin-bottom: 0;
      }
    }

    ul, ol {
      padding-left: 1.5em;
      margin: 0.5em 0;

      li {
        margin: 0.25em 0;
      }
    }

    blockquote {
      border-left: 4px solid var(--wysiwyg-editor-border-focus);
      padding-left: 16px;
      margin: 1em 0;
      font-style: italic;
      opacity: 0.8;
    }

    code {
      background-color: rgba(0, 0, 0, 0.1);
      padding: 2px 4px;
      border-radius: 4px;
      font-family: 'Monaco', 'Menlo', monospace;
    }

    a {
      color: var(--wysiwyg-button-active);
      text-decoration: underline;

      &:hover {
        text-decoration: none;
      }
    }
  }

  // フローティングメニューのスタイル
  .v-wysiwyg-editor__bubble-menu {
    background-color: var(--wysiwyg-toolbar-bg);
    border: 1px solid var(--wysiwyg-toolbar-border);
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    padding: 4px;
  }
}

// サイズバリエーション
.v-wysiwyg-editor--small {
  .v-wysiwyg-editor__input__prose {
    padding: 12px;
    min-height: 120px;
    font-size: 0.875em;
  }

  .v-wysiwyg-editor__toolbar {
    padding: 6px 8px;
  }
}

.v-wysiwyg-editor--large {
  .v-wysiwyg-editor__input__prose {
    padding: 20px;
    min-height: 300px;
    font-size: 1.125em;
  }

  .v-wysiwyg-editor__toolbar {
    padding: 10px 16px;
  }
}

// 読み取り専用モード
.v-wysiwyg-editor--readonly {
  .v-wysiwyg-editor__input__prose {
    background-color: #f8f9fa;
    cursor: not-allowed;
  }
}

// エラー状態
.v-wysiwyg-editor--error {
  border-color: #f44336;

  &:focus-within {
    border-color: #f44336;
    box-shadow: 0 0 0 2px rgba(244, 67, 54, 0.2);
  }
}
```

## API Specification

### `VWysiwygEditor`コンポーネント

```typescript
interface VWysiwygEditorProps {
  // 基本プロパティ
  modelValue?: string              // エディタコンテンツ (HTML)
  label?: string                   // ラベルテキスト
  hint?: string                    // ヒントテキスト
  placeholder?: string             // プレースホルダー

  // バリデーション
  required?: boolean               // 必須入力
  disabled?: boolean               // 無効状態
  readonly?: boolean               // 読み取り専用
  minLength?: number              // 最小文字数
  maxLength?: number              // 最大文字数
  counter?: boolean               // 文字数カウンター表示

  // エディタ設定
  tools?: RawWysiwygEditorTool[]   // ツールバー設定
  extensions?: RawWysiwygExtension[] // 拡張機能
  floatingToolbar?: boolean        // フローティングツールバー
  disabledMinHeight?: boolean      // 最小高さ無効化
  disabledMaxHeight?: boolean      // 最大高さ無効化
  removeDefaultWrapper?: boolean   // デフォルトラッパー除去

  // フォーム統合
  size?: 'small' | 'medium' | 'large' // サイズ
  errorMessages?: string[]         // エラーメッセージ

  // アドornment
  startAdornment?: VNodeChild      // 開始装飾
  endAdornment?: VNodeChild        // 終了装飾
}

interface VWysiwygEditorEvents {
  'update:modelValue': (value: string) => void
  input: (value: string) => void
  focus: (event: FocusEvent) => void
  blur: (event: FocusEvent) => void
}

interface VWysiwygEditorAPI {
  readonly editor: Editor | undefined
  readonly control: TextableControl
}
```

### ツール定義

```typescript
interface WysiwygEditorTool {
  key: string                                    // ツール識別子
  icon: WysiwygEditorToolIcon                   // アイコン
  active?: boolean | ((ctx: WysiwygEditorContext) => boolean) // アクティブ状態
  disabled?: boolean | ((ctx: WysiwygEditorContext) => boolean) // 無効状態
  onClick: (ctx: WysiwygEditorContext, ev: MouseEvent) => any // クリックハンドラ
  floating?: boolean                            // フローティングメニュー表示
  extensions?: Extensions                       // 依存拡張機能
}

type WysiwygEditorToolFactory<Options = void> = (
  vui: VuiService,
  options?: Options
) => WysiwygEditorTool | WysiwygEditorTool[]
```

### 拡張機能

```typescript
type WysiwygExtensionFactory<Options = any, Storage = any> = (
  ctx: WysiwygEditorInitializeContext
) => Extension<Options, Storage> | Node<Options, Storage> | Mark<Options, Storage>

function createWysiwygExtension<Options = any, Storage = any>(
  extension: WysiwygExtensionSource<Options, Storage>
): CreatedWysiwygExtension<Options, Storage>
```

## 組み込みツール

### テキストフォーマット
- `WysiwygFormatBoldTool` - 太字
- `WysiwygFormatItalicTool` - 斜体
- `WysiwygFormatUnderlineTool` - 下線

### リスト
- `WysiwygBulletListTool` - 箇条書きリスト
- `WysiwygOrderedListTool` - 番号付きリスト

### その他
- `WysiwygLinkTool` - リンク
- `WysiwygHistoryTool` - 元に戻す/やり直し
- `WysiwygColorTool` - テキスト色
- `WysiwygTextAlignTool` - テキスト整列
- `WysiwygCustomTagTool` - カスタムタグ

## Considerations

### ブラウザ対応
- モダンブラウザのみサポート
- Internet Explorer非対応
- ProseMirrorの制約に準拠

### パフォーマンス
- 大量のコンテンツ編集時は仮想スクロール推奨
- 複雑な拡張機能は性能に影響する可能性
- SSRでは初期化に注意が必要

### セキュリティ
- HTMLコンテンツのサニタイゼーションは実装者責任
- XSS攻撃への対策が必要
- 信頼できないコンテンツの表示には注意

## License

MIT

## Related Packages

- [@fastkit/vui](../vui/README.md): 基盤UIコンポーネントライブラリ
- [@fastkit/vue-form-control](../vue-form-control/README.md): フォーム制御機能
- [@tiptap/vue-3](https://tiptap.dev/installation/vue3): 基盤エディタライブラリ
