# @fastkit/vue-stack

🌐 English | [日本語](https://github.com/dadajam4/fastkit/blob/main/packages/vue-stack/README-ja.md)

A comprehensive library for managing stackable UI elements such as dialogs, tooltips, and menus in Vue.js applications. Provides all the features needed for modal-type UIs including dynamic component display, focus management, animations, and keyboard operations.

## Features

- **Integrated Stack Management**: Centralized management of multiple dialogs, tooltips, and menus
- **Dynamic Component Display**: Programmatic component launching
- **Focus Management**: Automatic focus trap and restore functionality
- **Keyboard Operations**: Keyboard control with ESC, Tab, arrow keys, etc.
- **Animation Integration**: Complete integration with Vue Transitions
- **z-index Management**: Automatic stack order control
- **Accessibility**: ARIA attributes and screen reader support
- **Router Integration**: Vue Router navigation guards
- **Body Scroll Control**: Scroll restriction when modals are displayed
- **Delayed Show/Hide**: Timeout-based automatic control
- **Outside Click Detection**: Monitoring clicks outside the stack
- **Persistent Mode**: Forced display maintenance functionality

## Installation

```bash
npm install @fastkit/vue-stack
# or
pnpm add @fastkit/vue-stack

# Dependencies
npm install vue vue-router
```

## Basic Usage

### Plugin Setup

```typescript
// main.ts
import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import { VueStackService } from '@fastkit/vue-stack';
import '@fastkit/vue-stack/vue-stack.css';

const app = createApp(App);

// Router setup
const router = createRouter({
  history: createWebHistory(),
  routes: [/* Route definitions */]
});

// Stack service
const stackService = new VueStackService({
  zIndex: 32767,                    // Base z-index
  snackbarDefaultPosition: 'top'    // Snackbar default position
});

// Provide as plugin
app.provide(VueStackInjectionKey, stackService);

app.use(router);
app.mount('#app');
```

### Basic Dialog

```vue
<template>
  <div>
    <!-- Dialog trigger -->
    <button @click="showDialog">Open Dialog</button>

    <!-- Dialog component -->
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
        <h2>Confirmation Dialog</h2>
        <p>Do you want to execute this operation?</p>
        <div class="dialog-actions">
          <button @click="confirm">OK</button>
          <button @click="cancel">Cancel</button>
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
  console.log('Confirmed');
  dialogVisible.value = false;
};

const cancel = () => {
  console.log('Cancelled');
  dialogVisible.value = false;
};

const onDialogShow = (control) => {
  console.log('Dialog shown', control);
};

const onDialogClose = (control) => {
  console.log('Dialog closed', control);
  console.log('Close reason:', control._.state.closeReason);
};
</script>
```

### Menu with Activator

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
        Hover to Show Menu
      </button>
    </template>

    <div class="menu">
      <div class="menu-item">Item 1</div>
      <div class="menu-item">Item 2</div>
      <div class="menu-item">Item 3</div>
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

## Available Components

### VDialog - Dialog Component

A component for displaying modal dialogs.

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
      <h2>Dialog Title</h2>
      <p>Dialog content</p>
      <button @click="visible = false">Close</button>
    </div>
  </VDialog>
</template>
```

### VSnackbar - Snackbar Component

A component for displaying notification messages.

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

### VMenu - Menu Component

A component for displaying dropdown menus and context menus.

```vue
<template>
  <VMenu open-on-click>
    <template #activator="{ attrs }">
      <button v-bind="attrs">Open Menu</button>
    </template>

    <div class="menu-content">
      <div class="menu-item" @click="handleAction('action1')">Action 1</div>
      <div class="menu-item" @click="handleAction('action2')">Action 2</div>
    </div>
  </VMenu>
</template>
```

### VDynamicStacks - Dynamic Stack Management

A component for programmatically managing stack elements.

```vue
<template>
  <div>
    <button @click="showProgrammaticDialog">Programmatic Dialog</button>
    <button @click="showSnackbar">Show Snackbar</button>
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
          h('h2', 'Programmatic Dialog'),
          h('p', 'This dialog was displayed from JavaScript'),
          h('button', {
            onClick: () => $vstack.resolve('confirmed'),
            class: 'btn btn-primary'
          }, 'Confirm')
        ])
      }
    });
    console.log('Dialog result:', result);
  } catch (error) {
    console.log('Dialog was cancelled');
  }
};

const showSnackbar = () => {
  $vstack.snackbar({
    message: 'Snackbar message',
    timeout: 3000,
    transition: 'v-stack-slide-up'
  });
};
</script>
```

## VStackControl API

### Properties

```typescript
interface VStackControl {
  // State
  readonly isActive: boolean;              // Display state
  readonly transitioning: boolean;         // Animating
  readonly isResolved: boolean;           // Resolved
  readonly isCanceled: boolean;           // Cancelled
  readonly isDestroyed: boolean;          // Destroyed

  // Value
  value: any;                             // Input value

  // Settings
  readonly timeout: number;               // Timeout
  readonly persistent: boolean;           // Persistent display
  readonly zIndex: number;                // z-index
  readonly activateOrder: number;         // Activation order

  // Focus & Keyboard
  readonly focusRestorable: boolean;      // Focus restore
  readonly closeOnEsc: boolean;           // Close on ESC
  readonly closeOnTab: false | string;    // Close on Tab
  readonly closeOnNavigation: boolean;    // Close on navigation
  readonly closeOnOutsideClick: boolean;  // Close on outside click

  // Delays
  readonly openDelay: number;             // Show delay
  readonly closeDelay: number;            // Hide delay

  // Element refs
  readonly contentRef: Ref<HTMLElement>;  // Content element
  readonly backdropRef: Ref<HTMLElement>; // Backdrop element
  readonly activator: HTMLElement;        // Activator element

  // Styles
  readonly classes: any[];                // Class list
  readonly styles: StyleValue[];          // Style list

  // Others
  readonly $service: VueStackService;     // Stack service
  readonly stackType?: string | symbol;   // Stack type
  readonly disabled: boolean;             // Disabled state
  readonly guardInProgress: boolean;      // Guard in progress
}
```

### Methods

```typescript
interface VStackControl {
  // Display control
  show(): Promise<void>;                           // Show
  toggle(): Promise<void>;                         // Toggle display
  close(opts?: VStackCloseOptions): Promise<void>; // Hide

  // Resolve & Cancel
  resolve(payload?: any): Promise<void | false>;   // Resolve
  cancel(force?: boolean): Promise<void>;          // Cancel

  // Configuration
  setActivator(query: VStackActivatorQuery): this; // Set activator
  toFront(): void;                                 // Bring to front
  resetValue(): void;                              // Reset value

  // State check
  isFront(filter?: Function): boolean;             // Check if front
  containsOrSameElement(el: Element): boolean;     // Element containment check

  // Rendering
  render(fn: Function, opts?: object): VNode;      // Render

  // Effects
  guardEffect(): void;                             // Execute guard effect
}
```

## VueStackService

### Service Management

```typescript
import { VueStackService, useStack } from '@fastkit/vue-stack';

// Create service
const service = new VueStackService({
  zIndex: 32767,
  snackbarDefaultPosition: 'top'
});

// Access via composable
const stack = useStack();

// Service information
console.log(service.controls);          // All stack controls
console.log(service.zIndex);           // Base z-index
console.log(service.dynamicSettings);  // Dynamic settings list

// Stack management
const activeStacks = service.getActiveStacks();     // Get active stacks
const frontStack = service.getFront();              // Get front stack
const isTransitioning = service.someTransitioning(); // Check if animating
```

### Dynamic Stack Display

```typescript
// Display dynamic dialog
const result = await service.dynamic(
  DialogComponent,
  {
    title: 'Confirmation',
    message: 'Do you want to execute this operation?'
  },
  {
    default: () => h('p', 'Custom content')
  }
);

if (result) {
  console.log('User confirmed:', result);
} else {
  console.log('User cancelled');
}

// Create launcher
const showConfirmDialog = service.createLauncher(
  ConfirmDialogComponent,
  (props) => ({
    ...props,
    variant: 'primary'
  })
);

// Use launcher
const confirmed = await showConfirmDialog({
  title: 'Delete Confirmation',
  message: 'Do you want to delete this item?'
});
```

## Advanced Usage Examples

### Custom Dialog Component

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
      <!-- Header -->
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

      <!-- Content -->
      <div class="dialog-content">
        <p v-if="message" class="dialog-message">{{ message }}</p>
        <slot />
      </div>

      <!-- Actions -->
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
  title: 'Confirmation',
  confirmText: 'OK',
  cancelText: 'Cancel',
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

// Sync display state from external
watch(() => props.modelValue, (newValue) => {
  internalVisible.value = newValue;
});

// Sync internal display state to external
watch(internalVisible, (newValue) => {
  emit('update:modelValue', newValue);
});

const confirm = async () => {
  if (loading.value) return;

  loading.value = true;

  try {
    // Execute beforeConfirm handler
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
    console.error('Error occurred during confirmation:', error);
  } finally {
    loading.value = false;
  }
};

const cancel = async () => {
  if (loading.value) return;

  try {
    // Execute beforeCancel handler
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
    console.error('Error occurred during cancellation:', error);
  }
};

const onShow = (control: VStackControl) => {
  console.log('Dialog shown');
};

const onClose = (control: VStackControl) => {
  console.log('Dialog closed');
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

### Menu Component

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
    console.error('Menu action execution error:', error);
  } finally {
    internalVisible.value = false;
  }
};

const onShow = async (control: VStackControl) => {
  await nextTick();

  // Adjust menu position
  if (menuRef.value) {
    const menu = menuRef.value;
    const rect = menu.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    // Adjust when going off screen
    if (rect.right > viewport.width) {
      menu.style.left = `${viewport.width - rect.width - 10}px`;
    }

    if (rect.bottom > viewport.height) {
      menu.style.top = `${viewport.height - rect.height - 10}px`;
    }
  }
};

const onClose = (control: VStackControl) => {
  console.log('Context menu closed');
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

### Snackbar Notification System

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

// Usage example
const snackbar = createSnackbarSystem(stackService);

// Various notifications
snackbar.info('Information message');
snackbar.success('Operation completed');
snackbar.warning('Attention required');
snackbar.error('An error occurred');

// Notification with action
snackbar.custom({
  message: 'File was deleted',
  type: 'info',
  duration: 5000,
  action: {
    label: 'Undo',
    handler: () => console.log('Undo processing')
  }
});
```

## Animations

### Built-in Transitions

```scss
/* Available transitions */
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

### Custom Transitions

```vue
<template>
  <VDialog
    :transition="{
      transition: 'custom-slide',
      props: { duration: 500 }
    }"
  >
    <!-- Content -->
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

## Accessibility

### ARIA Attributes

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
      <!-- Content -->
    </div>
  </VDialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const titleId = 'dialog-title';
const descId = 'dialog-desc';
</script>
```

### Keyboard Navigation

```typescript
// Keyboard operation configuration example
const stackProps = {
  closeOnEsc: true,           // Close with ESC key
  closeOnTab: 'not-focused',  // Close when Tab is pressed outside focus
  focusTrap: true,           // Enable focus trap
  focusRestorable: true      // Enable focus restore
};
```

## Testing and Debugging

### Unit Tests

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

## Dependencies

```json
{
  "dependencies": {
    "@fastkit/dom": "DOM manipulation utilities",
    "@fastkit/helpers": "Helper functions",
    "@fastkit/tiny-logger": "Lightweight logging",
    "@fastkit/vue-body-scroll-lock": "Body scroll control",
    "@fastkit/vue-click-outside": "Outside click detection",
    "@fastkit/vue-keyboard": "Keyboard operations",
    "@fastkit/vue-resize": "Resize monitoring",
    "@fastkit/vue-transitions": "Transition functionality",
    "@fastkit/vue-utils": "Vue.js utilities"
  },
  "peerDependencies": {
    "vue": "^3.5.0",
    "vue-router": "^4.4.0"
  }
}
```

## Documentation

<https://dadajam4.github.io/fastkit/vue-stack/>

## License

MIT
