# @fastkit/vue-keyboard

🌐 [English](https://github.com/dadajam4/fastkit/blob/main/packages/vue-keyboard/README.md) | 日本語

Vue.jsアプリケーションでキーボードイベントを効率的に管理するためのComposition APIライブラリ。複雑なキーボードショートカット、キーボードナビゲーション、アクセシビリティ対応を簡単に実装できます。

## 機能

- **Vue Composition API**: Vue 3のComposition APIと完全統合
- **自動ライフサイクル管理**: コンポーネントのマウント/アンマウントに自動対応
- **型安全なキー判定**: TypeScriptによる厳密なキー型定義
- **柔軟なイベント処理**: keydown、keypress、keyupイベント対応
- **マルチターゲット対応**: document、特定要素へのイベント登録
- **キーカテゴリ分類**: 修飾キー、ナビゲーション、編集キーなどの分類
- **国際化対応**: 日本語、韓国語IMEキーに対応
- **パフォーマンス最適化**: 効率的なイベントハンドリングとメモリ管理
- **SSR対応**: サーバーサイドレンダリング環境での安全な動作

## インストール

```bash
npm install @fastkit/vue-keyboard
```

## 基本的な使用方法

### シンプルなキーハンドリング

```vue
<template>
  <div>
    <h1>キーボードショートカット例</h1>
    <p>以下のキーを試してください：</p>
    <ul>
      <li>Enter: フォーム送信</li>
      <li>Escape: モーダルを閉じる</li>
      <li>Ctrl+S: 保存</li>
      <li>Ctrl+Z: 元に戻す</li>
    </ul>

    <div class="status">
      <p>最後に押されたキー: {{ lastKey }}</p>
      <p>保存状態: {{ saveStatus }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useKeyboard } from '@fastkit/vue-keyboard'

const lastKey = ref<string>('')
const saveStatus = ref<string>('未保存')

// 基本的なキーボードショートカット設定
useKeyboard([
  {
    key: 'Enter',
    handler: (ev) => {
      console.log('フォーム送信')
      lastKey.value = 'Enter'
      ev.preventDefault()
    }
  },
  {
    key: 'Escape',
    handler: (ev) => {
      console.log('モーダルを閉じる')
      lastKey.value = 'Escape'
    }
  },
  {
    key: 's',
    handler: (ev) => {
      if (ev.ctrlKey || ev.metaKey) {
        console.log('保存実行')
        saveStatus.value = '保存済み'
        lastKey.value = 'Ctrl+S'
        ev.preventDefault()
      }
    }
  },
  {
    key: 'z',
    handler: (ev) => {
      if (ev.ctrlKey || ev.metaKey) {
        console.log('元に戻す')
        lastKey.value = 'Ctrl+Z'
        ev.preventDefault()
      }
    }
  }
], { autorun: true })
</script>
```

### 手動でキーボードサービスを制御

```vue
<template>
  <div>
    <h2>手動制御例</h2>
    <div class="controls">
      <button @click="startKeyboard">キーボード監視開始</button>
      <button @click="stopKeyboard">キーボード監視停止</button>
    </div>

    <div class="status">
      <p>監視状態: {{ isActive ? 'アクティブ' : '停止中' }}</p>
      <p>矢印キーでナビゲーション（監視中のみ）</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useKeyboard } from '@fastkit/vue-keyboard'

const isActive = ref(false)

const keyboardRef = useKeyboard([
  {
    key: 'ArrowUp',
    handler: () => {
      console.log('上へ移動')
    }
  },
  {
    key: 'ArrowDown',
    handler: () => {
      console.log('下へ移動')
    }
  },
  {
    key: 'ArrowLeft',
    handler: () => {
      console.log('左へ移動')
    }
  },
  {
    key: 'ArrowRight',
    handler: () => {
      console.log('右へ移動')
    }
  }
])

function startKeyboard() {
  keyboardRef.run()
  isActive.value = true
}

function stopKeyboard() {
  keyboardRef.stop()
  isActive.value = false
}
</script>
```

### キータイプ分類の活用

```vue
<template>
  <div>
    <h2>キータイプ分類例</h2>
    <div class="key-display">
      <div class="key-category">
        <h3>修飾キー</h3>
        <p>{{ modifierKeys.join(', ') || 'なし' }}</p>
      </div>
      <div class="key-category">
        <h3>ナビゲーションキー</h3>
        <p>{{ navigationKeys.join(', ') || 'なし' }}</p>
      </div>
      <div class="key-category">
        <h3>編集キー</h3>
        <p>{{ editingKeys.join(', ') || 'なし' }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useKeyboard } from '@fastkit/vue-keyboard'

const modifierKeys = ref<string[]>([])
const navigationKeys = ref<string[]>([])
const editingKeys = ref<string[]>([])

// キータイプ別の分類定義
const { Key } = useKeyboard

useKeyboard([
  {
    key: Key.Modifier(['Alt', 'Control', 'Shift', 'Meta']),
    handler: (ev) => {
      if (!modifierKeys.value.includes(ev.key)) {
        modifierKeys.value.push(ev.key)
      }
    },
    event: 'keydown'
  },
  {
    key: Key.Navigation(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End']),
    handler: (ev) => {
      navigationKeys.value = [ev.key]
      setTimeout(() => {
        navigationKeys.value = []
      }, 1000)
    }
  },
  {
    key: Key.Editing(['Backspace', 'Delete', 'Cut', 'Copy', 'Paste']),
    handler: (ev) => {
      editingKeys.value = [ev.key]
      setTimeout(() => {
        editingKeys.value = []
      }, 1000)
    }
  }
], { autorun: true })

// キーアップでmodifierKeysをクリア
useKeyboard([
  {
    key: Key.Modifier(['Alt', 'Control', 'Shift', 'Meta']),
    handler: (ev) => {
      const index = modifierKeys.value.indexOf(ev.key)
      if (index > -1) {
        modifierKeys.value.splice(index, 1)
      }
    },
    event: 'keyup'
  }
], { autorun: true })
</script>
```

## 実用的な使用例

### モーダルダイアログでのキーボード制御

```vue
<template>
  <div>
    <!-- モーダルトリガー -->
    <button @click="showModal = true">モーダルを開く</button>

    <!-- モーダルダイアログ -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop ref="modalRef">
        <h3>確認ダイアログ</h3>
        <p>この操作を実行しますか？</p>

        <div class="modal-actions">
          <button ref="confirmBtnRef" @click="confirmAction">
            確認 (Enter)
          </button>
          <button @click="closeModal">
            キャンセル (Escape)
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import { useKeyboard } from '@fastkit/vue-keyboard'

const showModal = ref(false)
const modalRef = ref<HTMLElement>()
const confirmBtnRef = ref<HTMLButtonElement>()

// モーダル用キーボード制御
const modalKeyboard = useKeyboard([
  {
    key: 'Escape',
    handler: closeModal
  },
  {
    key: 'Enter',
    handler: confirmAction
  },
  {
    key: 'Tab',
    handler: (ev) => {
      // フォーカストラップの実装
      const focusableElements = modalRef.value?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )

      if (!focusableElements?.length) return

      const firstElement = focusableElements[0] as HTMLElement
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

      if (ev.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus()
          ev.preventDefault()
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus()
          ev.preventDefault()
        }
      }
    }
  }
])

// モーダル表示状態に応じてキーボード制御を切り替え
watch(showModal, async (isShow) => {
  if (isShow) {
    modalKeyboard.run()
    await nextTick()
    confirmBtnRef.value?.focus()
  } else {
    modalKeyboard.stop()
  }
})

function closeModal() {
  showModal.value = false
}

function confirmAction() {
  console.log('操作を確認しました')
  closeModal()
}
</script>
```

### リスト要素のキーボードナビゲーション

```vue
<template>
  <div>
    <h2>キーボードナビゲーション付きリスト</h2>
    <p>矢印キーでナビゲーション、Enterで選択、Escapeでクリア</p>

    <div class="list-container" ref="listRef">
      <div
        v-for="(item, index) in items"
        :key="item.id"
        :class="['list-item', { active: activeIndex === index }]"
        @click="selectItem(index)"
      >
        {{ item.name }}
      </div>
    </div>

    <div class="selected-info">
      <p>選択されたアイテム: {{ selectedItem?.name || 'なし' }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useKeyboard } from '@fastkit/vue-keyboard'

interface ListItem {
  id: number
  name: string
}

const items = ref<ListItem[]>([
  { id: 1, name: 'アイテム 1' },
  { id: 2, name: 'アイテム 2' },
  { id: 3, name: 'アイテム 3' },
  { id: 4, name: 'アイテム 4' },
  { id: 5, name: 'アイテム 5' }
])

const activeIndex = ref(0)
const selectedItem = ref<ListItem | null>(null)
const listRef = ref<HTMLElement>()

const maxIndex = computed(() => items.value.length - 1)

// キーボードナビゲーション設定
useKeyboard([
  {
    key: 'ArrowUp',
    handler: (ev) => {
      ev.preventDefault()
      if (activeIndex.value > 0) {
        activeIndex.value--
      }
    }
  },
  {
    key: 'ArrowDown',
    handler: (ev) => {
      ev.preventDefault()
      if (activeIndex.value < maxIndex.value) {
        activeIndex.value++
      }
    }
  },
  {
    key: 'Home',
    handler: (ev) => {
      ev.preventDefault()
      activeIndex.value = 0
    }
  },
  {
    key: 'End',
    handler: (ev) => {
      ev.preventDefault()
      activeIndex.value = maxIndex.value
    }
  },
  {
    key: 'Enter',
    handler: (ev) => {
      ev.preventDefault()
      selectItem(activeIndex.value)
    }
  },
  {
    key: 'Escape',
    handler: () => {
      selectedItem.value = null
      activeIndex.value = 0
    }
  }
], { autorun: true })

function selectItem(index: number) {
  selectedItem.value = items.value[index]
  activeIndex.value = index
}
</script>

<style scoped>
.list-container {
  border: 1px solid #ccc;
  max-height: 200px;
  overflow-y: auto;
}

.list-item {
  padding: 8px 12px;
  cursor: pointer;
  border-bottom: 1px solid #eee;
}

.list-item:hover {
  background-color: #f5f5f5;
}

.list-item.active {
  background-color: #007acc;
  color: white;
}

.selected-info {
  margin-top: 16px;
  padding: 8px;
  background-color: #f0f0f0;
  border-radius: 4px;
}
</style>
```

### グローバルアプリケーションショートカット

```vue
<template>
  <div>
    <h2>グローバルショートカット例</h2>
    <div class="shortcut-info">
      <h3>利用可能なショートカット:</h3>
      <ul>
        <li>Ctrl/Cmd + N: 新規作成</li>
        <li>Ctrl/Cmd + O: ファイルを開く</li>
        <li>Ctrl/Cmd + S: 保存</li>
        <li>Ctrl/Cmd + Shift + S: 名前を付けて保存</li>
        <li>Ctrl/Cmd + Z: 元に戻す</li>
        <li>Ctrl/Cmd + Y: やり直し</li>
        <li>F11: フルスクリーン切り替え</li>
      </ul>
    </div>

    <div class="action-log">
      <h3>実行されたアクション:</h3>
      <ul>
        <li v-for="(action, index) in actionLog" :key="index">
          {{ action }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useKeyboard } from '@fastkit/vue-keyboard'

const actionLog = ref<string[]>([])

function addAction(action: string) {
  actionLog.value.unshift(`${new Date().toLocaleTimeString()}: ${action}`)
  if (actionLog.value.length > 10) {
    actionLog.value = actionLog.value.slice(0, 10)
  }
}

// グローバルショートカット設定
useKeyboard([
  {
    key: 'n',
    handler: (ev) => {
      if (ev.ctrlKey || ev.metaKey) {
        ev.preventDefault()
        addAction('新規作成')
      }
    }
  },
  {
    key: 'o',
    handler: (ev) => {
      if (ev.ctrlKey || ev.metaKey) {
        ev.preventDefault()
        addAction('ファイルを開く')
      }
    }
  },
  {
    key: 's',
    handler: (ev) => {
      if (ev.ctrlKey || ev.metaKey) {
        ev.preventDefault()
        if (ev.shiftKey) {
          addAction('名前を付けて保存')
        } else {
          addAction('保存')
        }
      }
    }
  },
  {
    key: 'z',
    handler: (ev) => {
      if (ev.ctrlKey || ev.metaKey) {
        ev.preventDefault()
        addAction('元に戻す')
      }
    }
  },
  {
    key: 'y',
    handler: (ev) => {
      if (ev.ctrlKey || ev.metaKey) {
        ev.preventDefault()
        addAction('やり直し')
      }
    }
  },
  {
    key: 'F11',
    handler: (ev) => {
      ev.preventDefault()
      if (document.fullscreenElement) {
        document.exitFullscreen()
        addAction('フルスクリーン終了')
      } else {
        document.documentElement.requestFullscreen()
        addAction('フルスクリーン開始')
      }
    }
  }
], { autorun: true })
</script>
```

### 特定要素へのキーボードイベント登録

```vue
<template>
  <div>
    <h2>特定要素でのキーボード制御</h2>

    <div class="input-areas">
      <div class="input-area">
        <h3>テキストエリア 1</h3>
        <textarea
          ref="textarea1Ref"
          v-model="text1"
          placeholder="Ctrl+Enter で送信"
          class="textarea"
        ></textarea>
        <button @click="submitText1">送信</button>
      </div>

      <div class="input-area">
        <h3>テキストエリア 2</h3>
        <textarea
          ref="textarea2Ref"
          v-model="text2"
          placeholder="Ctrl+Enter で送信"
          class="textarea"
        ></textarea>
        <button @click="submitText2">送信</button>
      </div>
    </div>

    <div class="submission-log">
      <h3>送信ログ:</h3>
      <ul>
        <li v-for="(submission, index) in submissions" :key="index">
          {{ submission }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useKeyboard } from '@fastkit/vue-keyboard'

const text1 = ref('')
const text2 = ref('')
const textarea1Ref = ref<HTMLTextAreaElement>()
const textarea2Ref = ref<HTMLTextAreaElement>()
const submissions = ref<string[]>([])

function addSubmission(area: string, text: string) {
  const timestamp = new Date().toLocaleTimeString()
  submissions.value.unshift(`${timestamp} - ${area}: "${text}"`)
  if (submissions.value.length > 5) {
    submissions.value = submissions.value.slice(0, 5)
  }
}

function submitText1() {
  if (text1.value.trim()) {
    addSubmission('エリア1', text1.value)
    text1.value = ''
  }
}

function submitText2() {
  if (text2.value.trim()) {
    addSubmission('エリア2', text2.value)
    text2.value = ''
  }
}

// 各テキストエリア個別のキーボード設定
onMounted(() => {
  // テキストエリア1用
  useKeyboard([
    {
      target: textarea1Ref.value!,
      key: 'Enter',
      handler: (ev) => {
        if (ev.ctrlKey || ev.metaKey) {
          ev.preventDefault()
          submitText1()
        }
      }
    }
  ], { autorun: true })

  // テキストエリア2用
  useKeyboard([
    {
      target: textarea2Ref.value!,
      key: 'Enter',
      handler: (ev) => {
        if (ev.ctrlKey || ev.metaKey) {
          ev.preventDefault()
          submitText2()
        }
      }
    }
  ], { autorun: true })
})
</script>

<style scoped>
.input-areas {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}

.input-area {
  flex: 1;
}

.textarea {
  width: 100%;
  height: 100px;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  resize: vertical;
}

.submission-log {
  border-top: 1px solid #eee;
  padding-top: 20px;
}
</style>
```

## API仕様

### `useKeyboard(settings, options?)`

キーボードイベントハンドリングを設定し、Vue.jsコンポーネントのライフサイクルに統合します。

**パラメータ:**
- `settings` (UseKeyboardSettings): キーボード設定の配列または単一設定
- `options` (UseKeyboardOptions, optional): 追加オプション

**戻り値:**
- `UseKeyboardRef`: キーボードサービスの参照

```typescript
interface UseKeyboardSettings extends RawKBSetting {
  target?: GlobalEventHandlers;     // イベントターゲット（デフォルト: document）
  key?: KeyType | KeyType[];        // 対象キー
  event?: 'keydown' | 'keypress' | 'keyup'; // イベントタイプ（デフォルト: 'keydown'）
  handler: (ev: KeyboardEvent) => void;      // イベントハンドラ
  capture?: boolean;                // キャプチャーフェーズ使用フラグ
}

interface UseKeyboardOptions {
  autorun?: boolean; // 自動実行フラグ（デフォルト: false）
}

interface UseKeyboardRef {
  run(): void;  // キーボード監視開始
  stop(): void; // キーボード監視停止
}
```

### `Key` ヘルパー

キーの型安全な定義とカテゴリ分類を提供します。

```typescript
// 基本的な使用
Key('Enter')           // 単一キー
Key(['Enter', 'Tab'])  // 複数キー

// カテゴリ別キー定義
Key.Modifier(['Alt', 'Control', 'Shift', 'Meta'])
Key.Navigation(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'])
Key.Editing(['Backspace', 'Delete', 'Cut', 'Copy', 'Paste'])
Key.Function(['F1', 'F2', 'F3', 'F4'])
Key.Whitespace(['Enter', 'Tab', ' '])
Key.UI(['Escape', 'ContextMenu', 'Help'])

// 国際化キー
Key.Japanese(['Hiragana', 'Katakana', 'Romaji'])
Key.Korean(['HangulMode', 'HanjaMode'])

// キー判定
Key.is(event.key, 'Enter')                    // 単一キー判定
Key.is(event.key, ['Enter', 'Tab'])          // 複数キー判定
Key.is(event.key, Key.Navigation(['ArrowUp', 'ArrowDown'])) // カテゴリ判定
```

## 高度な使用例

### ゲーム風キーボード制御

```vue
<template>
  <div>
    <h2>ゲーム風制御例</h2>
    <div class="game-area">
      <div class="player" :style="playerStyle"></div>
    </div>

    <div class="controls-info">
      <p>WASD または矢印キーで移動</p>
      <p>Spaceでジャンプ</p>
      <p>位置: ({{ player.x }}, {{ player.y }})</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useKeyboard } from '@fastkit/vue-keyboard'

const player = ref({
  x: 50,
  y: 50,
  isJumping: false
})

const pressedKeys = ref(new Set<string>())

const playerStyle = computed(() => ({
  position: 'absolute',
  left: `${player.value.x}px`,
  top: `${player.value.y}px`,
  width: '20px',
  height: '20px',
  backgroundColor: player.value.isJumping ? 'red' : 'blue',
  borderRadius: '50%',
  transition: 'background-color 0.2s'
}))

// キー押下時の処理
useKeyboard([
  {
    key: ['w', 'W', 'ArrowUp'],
    handler: (ev) => {
      ev.preventDefault()
      pressedKeys.value.add('up')
    }
  },
  {
    key: ['s', 'S', 'ArrowDown'],
    handler: (ev) => {
      ev.preventDefault()
      pressedKeys.value.add('down')
    }
  },
  {
    key: ['a', 'A', 'ArrowLeft'],
    handler: (ev) => {
      ev.preventDefault()
      pressedKeys.value.add('left')
    }
  },
  {
    key: ['d', 'D', 'ArrowRight'],
    handler: (ev) => {
      ev.preventDefault()
      pressedKeys.value.add('right')
    }
  },
  {
    key: ' ',
    handler: (ev) => {
      ev.preventDefault()
      jump()
    }
  }
], { autorun: true })

// キー離上時の処理
useKeyboard([
  {
    key: ['w', 'W', 'ArrowUp'],
    event: 'keyup',
    handler: () => pressedKeys.value.delete('up')
  },
  {
    key: ['s', 'S', 'ArrowDown'],
    event: 'keyup',
    handler: () => pressedKeys.value.delete('down')
  },
  {
    key: ['a', 'A', 'ArrowLeft'],
    event: 'keyup',
    handler: () => pressedKeys.value.delete('left')
  },
  {
    key: ['d', 'D', 'ArrowRight'],
    event: 'keyup',
    handler: () => pressedKeys.value.delete('right')
  }
], { autorun: true })

function jump() {
  if (player.value.isJumping) return

  player.value.isJumping = true
  setTimeout(() => {
    player.value.isJumping = false
  }, 500)
}

// ゲームループ
onMounted(() => {
  const gameLoop = () => {
    const speed = 2

    if (pressedKeys.value.has('up')) {
      player.value.y = Math.max(0, player.value.y - speed)
    }
    if (pressedKeys.value.has('down')) {
      player.value.y = Math.min(280, player.value.y + speed)
    }
    if (pressedKeys.value.has('left')) {
      player.value.x = Math.max(0, player.value.x - speed)
    }
    if (pressedKeys.value.has('right')) {
      player.value.x = Math.min(380, player.value.x + speed)
    }

    requestAnimationFrame(gameLoop)
  }

  gameLoop()
})
</script>

<style scoped>
.game-area {
  position: relative;
  width: 400px;
  height: 300px;
  border: 2px solid #333;
  background-color: #f0f0f0;
  margin: 20px 0;
}

.controls-info {
  background-color: #f9f9f9;
  padding: 12px;
  border-radius: 4px;
}
</style>
```

## 注意事項

### パフォーマンス考慮事項

- 不要になったキーボードイベントリスナーは自動的に削除されます
- 大量のキーハンドラーを登録する場合は、パフォーマンスへの影響を考慮してください
- autorunオプションを使用する場合、コンポーネントのライフサイクルと自動同期されます

### ブラウザ対応

- モダンブラウザすべてでサポート
- Internet Explorer 11以降で動作
- キーイベントはブラウザ固有の制限に従います

### アクセシビリティ

- キーボードナビゲーションを実装する際は、フォーカス管理に注意してください
- スクリーンリーダーとの互換性を考慮してARIA属性を適切に設定してください
- 視覚的なフィードバックを提供して、現在のフォーカス位置を明確にしてください

## ライセンス

MIT

## 関連パッケージ

- [@fastkit/keyboard](../keyboard/README.md): コアキーボード処理ライブラリ
- [@fastkit/helpers](../helpers/README.md): 基本的なユーティリティ関数
