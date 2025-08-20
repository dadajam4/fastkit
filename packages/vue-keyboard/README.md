# @fastkit/vue-keyboard

🌐 English | [日本語](https://github.com/dadajam4/fastkit/blob/main/packages/vue-keyboard/README-ja.md)

A Composition API library for efficiently managing keyboard events in Vue.js applications. Easily implement complex keyboard shortcuts, keyboard navigation, and accessibility features.

## Features

- **Vue Composition API**: Full integration with Vue 3 Composition API
- **Automatic Lifecycle Management**: Automatic handling of component mount/unmount
- **Type-safe Key Detection**: Strict key type definitions with TypeScript
- **Flexible Event Handling**: Support for keydown, keypress, and keyup events
- **Multi-target Support**: Event registration for document and specific elements
- **Key Category Classification**: Classification of modifier keys, navigation keys, editing keys, etc.
- **Internationalization Support**: Support for Japanese and Korean IME keys
- **Performance Optimization**: Efficient event handling and memory management
- **SSR Support**: Safe operation in server-side rendering environments

## Installation

```bash
npm install @fastkit/vue-keyboard
```

## Basic Usage

### Simple Key Handling

```vue
<template>
  <div>
    <h1>Keyboard Shortcut Examples</h1>
    <p>Try the following keys:</p>
    <ul>
      <li>Enter: Submit form</li>
      <li>Escape: Close modal</li>
      <li>Ctrl+S: Save</li>
      <li>Ctrl+Z: Undo</li>
    </ul>

    <div class="status">
      <p>Last pressed key: {{ lastKey }}</p>
      <p>Save status: {{ saveStatus }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useKeyboard } from '@fastkit/vue-keyboard'

const lastKey = ref<string>('')
const saveStatus = ref<string>('Unsaved')

// Basic keyboard shortcut settings
useKeyboard([
  {
    key: 'Enter',
    handler: (ev) => {
      console.log('Submit form')
      lastKey.value = 'Enter'
      ev.preventDefault()
    }
  },
  {
    key: 'Escape',
    handler: (ev) => {
      console.log('Close modal')
      lastKey.value = 'Escape'
    }
  },
  {
    key: 's',
    handler: (ev) => {
      if (ev.ctrlKey || ev.metaKey) {
        console.log('Save executed')
        saveStatus.value = 'Saved'
        lastKey.value = 'Ctrl+S'
        ev.preventDefault()
      }
    }
  },
  {
    key: 'z',
    handler: (ev) => {
      if (ev.ctrlKey || ev.metaKey) {
        console.log('Undo')
        lastKey.value = 'Ctrl+Z'
        ev.preventDefault()
      }
    }
  }
], { autorun: true })
</script>
```

### Manual Keyboard Service Control

```vue
<template>
  <div>
    <h2>Manual Control Example</h2>
    <div class="controls">
      <button @click="startKeyboard">Start Keyboard Monitoring</button>
      <button @click="stopKeyboard">Stop Keyboard Monitoring</button>
    </div>

    <div class="status">
      <p>Monitoring status: {{ isActive ? 'Active' : 'Stopped' }}</p>
      <p>Navigate with arrow keys (only when monitoring)</p>
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
      console.log('Move up')
    }
  },
  {
    key: 'ArrowDown',
    handler: () => {
      console.log('Move down')
    }
  },
  {
    key: 'ArrowLeft',
    handler: () => {
      console.log('Move left')
    }
  },
  {
    key: 'ArrowRight',
    handler: () => {
      console.log('Move right')
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

### Key Type Classification Usage

```vue
<template>
  <div>
    <h2>Key Type Classification Example</h2>
    <div class="key-display">
      <div class="key-category">
        <h3>Modifier Keys</h3>
        <p>{{ modifierKeys.join(', ') || 'None' }}</p>
      </div>
      <div class="key-category">
        <h3>Navigation Keys</h3>
        <p>{{ navigationKeys.join(', ') || 'None' }}</p>
      </div>
      <div class="key-category">
        <h3>Editing Keys</h3>
        <p>{{ editingKeys.join(', ') || 'None' }}</p>
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

// Key type classification definition
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

// Clear modifierKeys on keyup
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

## Practical Usage Examples

### Keyboard Control in Modal Dialogs

```vue
<template>
  <div>
    <!-- Modal trigger -->
    <button @click="showModal = true">Open Modal</button>

    <!-- Modal dialog -->
    <div v-if="showModal" class="modal-overlay" @click="closeModal">
      <div class="modal-content" @click.stop ref="modalRef">
        <h3>Confirmation Dialog</h3>
        <p>Do you want to execute this operation?</p>

        <div class="modal-actions">
          <button ref="confirmBtnRef" @click="confirmAction">
            Confirm (Enter)
          </button>
          <button @click="closeModal">
            Cancel (Escape)
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

// Modal keyboard control
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
      // Focus trap implementation
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

// Switch keyboard control based on modal display state
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
  console.log('Operation confirmed')
  closeModal()
}
</script>
```

### Keyboard Navigation for List Elements

```vue
<template>
  <div>
    <h2>List with Keyboard Navigation</h2>
    <p>Navigate with arrow keys, select with Enter, clear with Escape</p>

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
      <p>Selected Item: {{ selectedItem?.name || 'None' }}</p>
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
  { id: 1, name: 'Item 1' },
  { id: 2, name: 'Item 2' },
  { id: 3, name: 'Item 3' },
  { id: 4, name: 'Item 4' },
  { id: 5, name: 'Item 5' }
])

const activeIndex = ref(0)
const selectedItem = ref<ListItem | null>(null)
const listRef = ref<HTMLElement>()

const maxIndex = computed(() => items.value.length - 1)

// Keyboard navigation settings
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

### Global Application Shortcuts

```vue
<template>
  <div>
    <h2>Global Shortcuts Example</h2>
    <div class="shortcut-info">
      <h3>Available Shortcuts:</h3>
      <ul>
        <li>Ctrl/Cmd + N: New</li>
        <li>Ctrl/Cmd + O: Open File</li>
        <li>Ctrl/Cmd + S: Save</li>
        <li>Ctrl/Cmd + Shift + S: Save As</li>
        <li>Ctrl/Cmd + Z: Undo</li>
        <li>Ctrl/Cmd + Y: Redo</li>
        <li>F11: Toggle Fullscreen</li>
      </ul>
    </div>

    <div class="action-log">
      <h3>Executed Actions:</h3>
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

// Global shortcuts settings
useKeyboard([
  {
    key: 'n',
    handler: (ev) => {
      if (ev.ctrlKey || ev.metaKey) {
        ev.preventDefault()
        addAction('New')
      }
    }
  },
  {
    key: 'o',
    handler: (ev) => {
      if (ev.ctrlKey || ev.metaKey) {
        ev.preventDefault()
        addAction('Open File')
      }
    }
  },
  {
    key: 's',
    handler: (ev) => {
      if (ev.ctrlKey || ev.metaKey) {
        ev.preventDefault()
        if (ev.shiftKey) {
          addAction('Save As')
        } else {
          addAction('Save')
        }
      }
    }
  },
  {
    key: 'z',
    handler: (ev) => {
      if (ev.ctrlKey || ev.metaKey) {
        ev.preventDefault()
        addAction('Undo')
      }
    }
  },
  {
    key: 'y',
    handler: (ev) => {
      if (ev.ctrlKey || ev.metaKey) {
        ev.preventDefault()
        addAction('Redo')
      }
    }
  },
  {
    key: 'F11',
    handler: (ev) => {
      ev.preventDefault()
      if (document.fullscreenElement) {
        document.exitFullscreen()
        addAction('Exit Fullscreen')
      } else {
        document.documentElement.requestFullscreen()
        addAction('Enter Fullscreen')
      }
    }
  }
], { autorun: true })
</script>
```

### Keyboard Event Registration for Specific Elements

```vue
<template>
  <div>
    <h2>Keyboard Control for Specific Elements</h2>

    <div class="input-areas">
      <div class="input-area">
        <h3>Text Area 1</h3>
        <textarea
          ref="textarea1Ref"
          v-model="text1"
          placeholder="Ctrl+Enter で送信"
          class="textarea"
        ></textarea>
        <button @click="submitText1">Submit</button>
      </div>

      <div class="input-area">
        <h3>Text Area 2</h3>
        <textarea
          ref="textarea2Ref"
          v-model="text2"
          placeholder="Ctrl+Enter で送信"
          class="textarea"
        ></textarea>
        <button @click="submitText2">Submit</button>
      </div>
    </div>

    <div class="submission-log">
      <h3>Submission Log:</h3>
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

## API Specification

### `useKeyboard(settings, options?)`

Configures keyboard event handling and integrates with Vue.js component lifecycle.

**Parameters:**
- `settings` (UseKeyboardSettings): Array of keyboard settings or single setting
- `options` (UseKeyboardOptions, optional): Additional options

**Returns:**
- `UseKeyboardRef`: Keyboard service reference

```typescript
interface UseKeyboardSettings extends RawKBSetting {
  target?: GlobalEventHandlers;     // Event target (default: document)
  key?: KeyType | KeyType[];        // Target key
  event?: 'keydown' | 'keypress' | 'keyup'; // Event type (default: 'keydown')
  handler: (ev: KeyboardEvent) => void;      // Event handler
  capture?: boolean;                // Capture phase usage flag
}

interface UseKeyboardOptions {
  autorun?: boolean; // Auto-run flag (default: false)
}

interface UseKeyboardRef {
  run(): void;  // Start keyboard monitoring
  stop(): void; // Stop keyboard monitoring
}
```

### `Key` Helper

Provides type-safe key definitions and category classification.

```typescript
// Basic usage
Key('Enter')           // Single key
Key(['Enter', 'Tab'])  // Multiple keys

// Category-based key definitions
Key.Modifier(['Alt', 'Control', 'Shift', 'Meta'])
Key.Navigation(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'])
Key.Editing(['Backspace', 'Delete', 'Cut', 'Copy', 'Paste'])
Key.Function(['F1', 'F2', 'F3', 'F4'])
Key.Whitespace(['Enter', 'Tab', ' '])
Key.UI(['Escape', 'ContextMenu', 'Help'])

// Internationalization keys
Key.Japanese(['Hiragana', 'Katakana', 'Romaji'])
Key.Korean(['HangulMode', 'HanjaMode'])

// Key validation
Key.is(event.key, 'Enter')                    // Single key validation
Key.is(event.key, ['Enter', 'Tab'])          // Multiple key validation
Key.is(event.key, Key.Navigation(['ArrowUp', 'ArrowDown'])) // Category validation
```

## Advanced Usage Examples

### Game-style Keyboard Control

```vue
<template>
  <div>
    <h2>Game-style Control Example</h2>
    <div class="game-area">
      <div class="player" :style="playerStyle"></div>
    </div>

    <div class="controls-info">
      <p>Move with WASD or arrow keys</p>
      <p>Jump with Space</p>
      <p>Position: ({{ player.x }}, {{ player.y }})</p>
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

// Key press handling
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

// Key release handling
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

// Game loop
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

## Considerations

### Performance Considerations

- Unnecessary keyboard event listeners are automatically removed
- When registering many key handlers, consider the impact on performance
- When using the autorun option, it automatically syncs with component lifecycle

### Browser Support

- Supported in all modern browsers
- Works with Internet Explorer 11 and later
- Key events follow browser-specific limitations

### Accessibility

- When implementing keyboard navigation, pay attention to focus management
- Set ARIA attributes appropriately for screen reader compatibility
- Provide visual feedback to clearly indicate current focus position

## License

MIT

## Related Packages

- [@fastkit/keyboard](../keyboard/README.md): Core keyboard processing library
- [@fastkit/helpers](../helpers/README.md): Basic utility functions
