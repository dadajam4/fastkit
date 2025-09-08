
# @fastkit/vue-disabled-reason

🌐 English | [日本語](https://github.com/dadajam4/fastkit/blob/main/packages/vue-disabled-reason/README-ja.md)

A library providing utility functions to define headless Vue.js components for monitoring disabled elements and displaying reasons.

## Features

- **Headless Design**: Create components that handle only logic without providing UI
- **Automatic Disabled State Detection**: Automatically monitors `disabled` and `aria-disabled` attributes
- **Flexible Display Control**: Display reasons through slots or render functions
- **Full TypeScript Support**: Type safety with strict type definitions
- **Advanced Customization**: Support for custom VNode traversal handling
- **Performance Optimization**: Efficient element monitoring and rendering control

## Installation

```bash
npm install @fastkit/vue-disabled-reason
# or
pnpm add @fastkit/vue-disabled-reason
```

### Required CSS Import

Before using the library, make sure to import the CSS file. This CSS sets `position: relative` on monitored elements, allowing the library to properly insert reason display elements.

```typescript
// Import at the main entry point first
import '@fastkit/vue-disabled-reason/vue-disabled-reason.css';
```

Or import in HTML:

```html
<link rel="stylesheet" href="@fastkit/vue-disabled-reason/vue-disabled-reason.css">
```

## Basic Usage

### Simple Disabled Reason Display

```vue
<template>
  <div>
    <!-- Wrap disabled button -->
    <MyDisabledReason>
      <button :disabled="hasNoPermission">
        Execute Delete
      </button>

      <!-- Display disabled reason via slot -->
      <template #reason>
        Insufficient permissions
      </template>
    </MyDisabledReason>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { MyDisabledReason } from './components/MyDisabledReason.vue';

const hasNoPermission = ref(true);
</script>
```

### Reason Display with reason Property

You can also use the `reason` property instead of slots.

```vue
<template>
  <div>
    <!-- Specify reason with reason property -->
    <MyDisabledReason reason="Administrator privileges required">
      <button :disabled="!isAdmin">
        System Settings
      </button>
    </MyDisabledReason>

    <!-- Dynamic reason setting -->
    <MyDisabledReason :reason="disableReason">
      <button :disabled="isDisabled">
        Delete Data
      </button>
    </MyDisabledReason>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const isAdmin = ref(false);
const hasDeletePermission = ref(false);

const disableReason = computed(() => 
  hasDeletePermission.value ? null : 'Delete permission required'
);
</script>
```

### Custom Component Definition

```typescript
import { defineDisabledReasonComponent } from '@fastkit/vue-disabled-reason';
import { VTooltip } from './components/VTooltip.vue';

export const MyDisabledReason = defineDisabledReasonComponent({
  name: 'MyDisabledReason',
  setup(api) {
    return (reason) => (
      <VTooltip
        disabled={!reason || !api.disabled}
        v-slots={{
          activator: ({ attrs }) => <span {...attrs} />,
          default: () => reason,
        }}
      />
    );
  },
});
```

## Advanced Usage

### Custom Container Specification

By default, reason display elements are inserted into the root element of the monitored target. You can customize the insertion position using `DISABLED_REASON_CONTAINER_BIND`.

```vue
<template>
  <MyDisabledReason>
    <div class="button-container">
      <!-- Specify insertion position with DISABLED_REASON_CONTAINER_BIND -->
      <div v-bind="DISABLED_REASON_CONTAINER_BIND">
        <button :disabled="isDisabled">Change Settings</button>
      </div>
      <span>System Settings</span>
    </div>
    
    <template #reason>
      No permission to change system settings
    </template>
  </MyDisabledReason>
</template>

<script setup lang="ts">
import { DISABLED_REASON_CONTAINER_BIND } from '@fastkit/vue-disabled-reason';
const isDisabled = ref(true);
</script>
```

### Individual Handling for Multiple Buttons

When there are multiple disableable elements, each must be wrapped with individual components.

```vue
<template>
  <div>
    <h3>Data Management</h3>
    <div>
      <!-- Edit button -->
      <MyDisabledReason>
        <div v-bind="DISABLED_REASON_CONTAINER_BIND">
          <button :disabled="!canEdit">Edit</button>
        </div>
        <template #reason>
          No edit permission
        </template>
      </MyDisabledReason>

      <!-- Delete button -->
      <MyDisabledReason>
        <div v-bind="DISABLED_REASON_CONTAINER_BIND">
          <button :disabled="!canDelete">Delete</button>
        </div>
        <template #reason>
          No delete permission
        </template>
      </MyDisabledReason>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { DISABLED_REASON_CONTAINER_BIND } from '@fastkit/vue-disabled-reason';

const userRole = ref('viewer'); // 'admin', 'editor', 'viewer'
const canEdit = computed(() => ['admin', 'editor'].includes(userRole.value));
const canDelete = computed(() => userRole.value === 'admin');
</script>
```

## API Reference

### defineDisabledReasonComponent

Defines a headless disabled reason component.

```typescript
function defineDisabledReasonComponent<Props>(
  options: DisabledReasonComponentOptions<Props>
): DefineComponent
```

**Options:**

- `name?`: Component name
- `props?`: Additional property definitions
- `skipVNode?`: VNode traversal skip handler
- `setup`: Setup function that returns a render function

### DisabledReasonAPI

API available within components.

```typescript
interface DisabledReasonAPI<Props = {}> {
  readonly props: ExtractPropTypes<Props>;
  readonly disabled: boolean;
}
```

### DISABLED_REASON_CONTAINER_BIND

Bind object for customizing the insertion position of disabled reason display elements.

```typescript
const DISABLED_REASON_CONTAINER_BIND: {
  'data-disabled-reason-container': '';
}
```

**Usage:**

```vue
<template>
  <MyDisabledReason>
    <!-- Disabled reason will be inserted within this element -->
    <div v-bind="DISABLED_REASON_CONTAINER_BIND">
      <button :disabled="isDisabled">Button</button>
    </div>
    
    <template #reason>
      Reason text for being disabled
    </template>
  </MyDisabledReason>
</template>
```

**Notes:**
- Only the first disableable element found within the specified container will be monitored
- When there are multiple disableable elements, wrap each with individual components

## Monitored Elements

### Standard Disableable Elements

- `<button>`
- `<input>` (all types)
- `<textarea>`
- `<select>`
- `<fieldset>`
- `<optgroup>`
- `<option>`

### ARIA-Compatible Elements

Elements with the following roles that have `aria-disabled` attribute (including `<a>` tags):

- `button`
- `link`
- `menuitem`
- `menuitemcheckbox`
- `menuitemradio`
- `option`
- `radio`
- `slider`
- `spinbutton`
- `switch`
- `tab`
- `checkbox`
- `gridcell`
- `textbox`

## Performance Considerations

- **Efficient Element Search**: Minimal DOM traversal
- **Rendering Optimization**: Re-render only when disabled state changes
- **Memory Management**: Proper cleanup processing
- **Event Optimization**: Register event listeners only when necessary

## Limitations

- **Single Element Monitoring**: One component instance monitors only the first disableable element found. For multiple elements, wrap each with individual components
- **Dynamic Elements**: Monitoring dynamically added elements requires remounting
- **CSS Pseudo-classes**: Cannot detect disabled states set by CSS pseudo-classes (`:disabled`, etc.)
- **JavaScript Dynamic Changes**: Dynamic disabled state changes via JavaScript are reflected after `nextTick`

## Related Packages

- `@fastkit/vue-utils` - Vue.js utilities (dependency)
- `vue` - Vue.js framework (peer dependency)

## License

MIT
