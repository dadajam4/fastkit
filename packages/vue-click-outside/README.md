
# @fastkit/vue-click-outside

🌐 English | [日本語](https://github.com/dadajam4/fastkit/blob/main/packages/vue-click-outside/README-ja.md)

A directive library for detecting clicks outside elements in Vue.js applications. Easily implement handling for external clicks in UI components such as modals, dropdowns, and popups.

## Features

- **Vue 3 Directive**: Provided as a simple directive
- **Complete TypeScript Support**: Type safety through strict type definitions
- **Flexible Condition Settings**: Customizable click detection conditions
- **Element Exclusion**: Exclude specific elements from click range
- **High Performance**: Efficient event processing and memory management
- **Accessibility Support**: Processes only trusted events
- **SSR Support**: Safe operation in server-side rendering environments
- **Lightweight Design**: Minimal dependencies

## Installation

```bash
npm install @fastkit/vue-click-outside
```

## Basic Usage

### Plugin Registration

```typescript
// main.ts
import { createApp } from 'vue'
import { installClickOutsideDirective } from '@fastkit/vue-click-outside'
import App from './App.vue'

const app = createApp(App)

// Register click-outside directive globally
installClickOutsideDirective(app)

app.mount('#app')
```

### Basic Click Outside Detection

```vue
<template>
  <div>
    <h2>Basic Click Outside Detection</h2>

    <!-- Simple usage example -->
    <div class="example-section">
      <h3>Simple Modal</h3>
      <button @click="showSimpleModal = true">Open Modal</button>

      <div v-if="showSimpleModal" class="modal-overlay">
        <div
          class="modal-content"
          v-click-outside="() => showSimpleModal = false"
        >
          <h4>Simple Modal</h4>
          <p>Clicking outside will close the modal</p>
          <button @click="showSimpleModal = false">Close</button>
        </div>
      </div>
    </div>

    <!-- Dropdown menu -->
    <div class="example-section">
      <h3>Dropdown Menu</h3>
      <div class="dropdown">
        <button @click="toggleDropdown">
          Menu {{ isDropdownOpen ? '▲' : '▼' }}
        </button>

        <div
          v-if="isDropdownOpen"
          class="dropdown-menu"
          v-click-outside="closeDropdown"
        >
          <div class="dropdown-item" @click="selectItem('Option 1')">Option 1</div>
          <div class="dropdown-item" @click="selectItem('Option 2')">Option 2</div>
          <div class="dropdown-item" @click="selectItem('Option 3')">Option 3</div>
        </div>
      </div>
      <p>Selected item: {{ selectedItem }}</p>
    </div>

    <!-- Tooltip -->
    <div class="example-section">
      <h3>Tooltip</h3>
      <button
        ref="tooltipTrigger"
        @click="showTooltip = !showTooltip"
        class="tooltip-trigger"
      >
        Show Tooltip
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
          This is a tooltip.<br>
          Click outside to close.
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

## Practical Usage Examples

### Advanced Conditional Click Detection

```vue
<template>
  <div>
    <h2>Advanced Click Outside Detection</h2>

    <!-- Conditional modal -->
    <div class="advanced-section">
      <h3>Conditional Modal</h3>
      <div class="controls">
        <label>
          <input type="checkbox" v-model="enableClickOutside" />
          Enable click outside to close functionality
        </label>
        <label>
          <input type="checkbox" v-model="confirmBeforeClose" />
          Confirm before closing
        </label>
      </div>

      <button @click="showAdvancedModal = true">Open Advanced Modal</button>

      <div v-if="showAdvancedModal" class="modal-overlay">
        <div
          class="modal-content"
          v-click-outside="{
            handler: handleModalClickOutside,
            conditional: (ev, pre) => enableClickOutside && (pre || !confirmBeforeClose || hasUnsavedChanges)
          }"
        >
          <h4>Advanced Modal</h4>
          <div class="form-section">
            <label>
              Name:
              <input
                v-model="formData.name"
                @input="hasUnsavedChanges = true"
                placeholder="Enter name"
              />
            </label>
            <label>
              Email:
              <input
                v-model="formData.email"
                @input="hasUnsavedChanges = true"
                placeholder="Enter email address"
              />
            </label>
          </div>

          <div class="modal-actions">
            <button @click="saveForm">Save</button>
            <button @click="closeAdvancedModal">Cancel</button>
          </div>

          <div v-if="hasUnsavedChanges" class="warning">
            Unsaved changes exist
          </div>
        </div>
      </div>
    </div>

    <!-- Multi-level dropdown -->
    <div class="advanced-section">
      <h3>Multi-level Dropdown</h3>
      <div class="multi-dropdown">
        <button @click="toggleMainMenu">
          Main Menu {{ isMainMenuOpen ? '▲' : '▼' }}
        </button>

        <div
          v-if="isMainMenuOpen"
          class="dropdown-menu"
          v-click-outside="{
            handler: closeAllMenus,
            include: getMenuIncludes
          }"
        >
          <div class="dropdown-item" @click="selectMainItem('File')">
            File
          </div>
          <div
            class="dropdown-item submenu-trigger"
            @click="toggleSubMenu"
            ref="subMenuTrigger"
          >
            Edit {{ isSubMenuOpen ? '▶' : '▶' }}
          </div>
          <div class="dropdown-item" @click="selectMainItem('View')">
            View
          </div>
        </div>

        <div
          v-if="isSubMenuOpen"
          class="dropdown-menu submenu"
          ref="subMenu"
        >
          <div class="dropdown-item" @click="selectSubItem('Cut')">Cut</div>
          <div class="dropdown-item" @click="selectSubItem('Copy')">Copy</div>
          <div class="dropdown-item" @click="selectSubItem('Paste')">Paste</div>
        </div>
      </div>

      <p>Last selection: {{ lastSelection }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

// Conditional modal
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
    if (confirm('You have unsaved changes. Are you sure you want to close?')) {
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
  console.log('Saving form:', formData)
  hasUnsavedChanges.value = false
  closeAdvancedModal()
}

// Multi-level dropdown
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
  lastSelection.value = `Edit > ${item}`
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

### Loadable Directive (Individual Import)

```vue
<template>
  <div>
    <h2>Local Directive Usage Example</h2>

    <div class="local-example">
      <button @click="showLocalModal = true">Open Local Modal</button>

      <div v-if="showLocalModal" class="modal-overlay">
        <div
          class="modal-content"
          v-click-outside="closeLocalModal"
        >
          <h4>Local Directive Modal</h4>
          <p>This modal uses a locally registered directive.</p>
          <button @click="closeLocalModal">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { clickOutsideDirective } from '@fastkit/vue-click-outside'

// Register as local directive
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

### Composition API Integration

```vue
<template>
  <div>
    <h2>Composition API Integration Example</h2>

    <!-- Notification system -->
    <div class="notification-system">
      <button @click="addNotification">Add Notification</button>

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

    <!-- Context menu -->
    <div class="context-menu-area">
      <h3>Right-click for context menu</h3>
      <div
        class="context-area"
        @contextmenu.prevent="showContextMenu"
      >
        Right-click here
      </div>

      <div
        v-if="contextMenu.visible"
        class="context-menu"
        :style="contextMenuStyle"
        v-click-outside="hideContextMenu"
      >
        <div class="context-item" @click="executeAction('Copy')">Copy</div>
        <div class="context-item" @click="executeAction('Cut')">Cut</div>
        <div class="context-item" @click="executeAction('Paste')">Paste</div>
        <hr>
        <div class="context-item" @click="executeAction('Delete')">Delete</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'

// Notification system
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
    title: `${type.charAt(0).toUpperCase() + type.slice(1)} Notification`,
    message: `This is a ${type} type notification. You can close it by clicking outside.`,
    type,
    dismissible: true
  }

  notifications.value.push(notification)

  // Auto removal (after 10 seconds)
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

// Context menu
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

const showContextMenu = (event: MouseEvent) => {
  contextMenu.x = event.clientX
  contextMenu.y = event.clientY
  contextMenu.visible = true
}

const hideContextMenu = () => {
  contextMenu.visible = false
}

const executeAction = (action: string) => {
  console.log(`Executed action: ${action}`)
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

## API Specification

### `v-click-outside` Directive

A directive that detects clicks outside an element and executes a handler.

**Basic usage:**
```vue
<div v-click-outside="handler">Content</div>
```

**Advanced configuration:**
```vue
<div v-click-outside="{
  handler: clickHandler,
  conditional: (ev, pre) => someCondition,
  include: () => [additionalElement1, additionalElement2]
}">
  Content
</div>
```

### Type Definitions

```typescript
// Handler function type
type ClickOutsideDirectiveHandler =
  | ((ev: MouseEvent | PointerEvent) => any)
  | undefined
  | void
  | false
  | null

// Detailed configuration object type
interface ClickOutsideDirectiveBindingValue {
  handler?: ClickOutsideDirectiveHandler
  conditional?: (ev: MouseEvent | PointerEvent, pre?: boolean) => boolean
  include?: () => Element[]
}

// Directive value type (function or configuration object)
type RawClickOutsideDirectiveBindingValue =
  | ClickOutsideDirectiveHandler
  | ClickOutsideDirectiveBindingValue
```

### Properties

- **`handler`**: Function executed on click outside
- **`conditional`**: Function to control click detection conditions
  - `ev`: Mouse/pointer event
  - `pre`: true=pre-check, false=final check before execution
- **`include`**: Function that returns additional elements to include in click range

### Installation Functions

```typescript
// Global registration
import { installClickOutsideDirective } from '@fastkit/vue-click-outside'
installClickOutsideDirective(app)

// Local usage
import { clickOutsideDirective } from '@fastkit/vue-click-outside'
const vClickOutside = clickOutsideDirective
```

## Advanced Usage Examples

### Complex UI Component Integration

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

    return (ev: MouseEvent | PointerEvent) => {
      if (options.confirmBeforeClose && hasChanges.value) {
        if (confirm('Changes are not saved. Do you want to close?')) {
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

## Considerations

### Performance Considerations

- Event listeners are automatically managed at component `mounted`/`beforeUnmount`
- Be careful about performance when using many click-outside directives simultaneously
- Optimize the `include` function to return elements only when necessary

### Browser Support

- Supported in all modern browsers
- Works with Internet Explorer 11 and later
- Supports both PointerEvent and MouseEvent

### Accessibility

- Processes only trusted events to ensure security
- Be careful when combining with keyboard navigation
- Consider screen reader users

### Security

- Checks the `isTrusted` property to exclude synthetic events
- Checks PointerEvent's `pointerType` to exclude malicious events

## License

MIT

## Related Packages

- [@fastkit/vue-utils](../vue-utils/README.md): Vue.js utility functions
