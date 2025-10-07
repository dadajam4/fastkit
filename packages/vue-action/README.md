
# @fastkit/vue-action

🌐 English | [日本語](https://github.com/dadajam4/fastkit/blob/main/packages/vue-action/README-ja.md)

A comprehensive component library for handling actionable (clickable) elements in Vue 3. Provides a unified interface for buttons, links, and RouterLinks, including guard functionality, state management, and accessibility support.

## Features

- **Unified API**: Handle buttons, anchor tags, and RouterLink with the same interface
- **VAction Component**: Declarative and easy-to-use component API
- **Vue Router Integration**: Seamless routing functionality and navigation
- **Guard Functionality**: Pre-action condition checking (with async support)
- **State Management**: Automatic management of states like disabled, actionable, hasAction
- **CSS Class Control**: Automatic CSS class application based on each state
- **Full TypeScript Support**: Type safety through strict type definitions
- **Accessibility**: ARIA attributes and keyboard navigation support

## Installation

```bash
npm install @fastkit/vue-action
```

## Basic Usage

### VAction Component

A component that handles buttons, links, and RouterLink with a unified interface.

```vue
<template>
  <div>
    <!-- Use as button -->
    <VAction
      @click="handleSubmit"
      :disabled="isLoading"
      class="btn btn-primary"
    >
      Submit
    </VAction>

    <!-- Use as external link -->
    <VAction
      href="https://example.com"
      target="_blank"
      rel="noopener"
      class="btn btn-link"
    >
      To External Site
    </VAction>

    <!-- Use as RouterLink -->
    <VAction
      :to="{ name: 'profile', params: { id: userId } }"
      class="nav-link"
    >
      Profile
    </VAction>

    <!-- With guard functionality -->
    <VAction
      :to="'/admin'"
      :guard="checkAdminPermission"
      :guardInProgressClass="'loading'"
      class="admin-link"
    >
      Admin Panel
    </VAction>

    <!-- Conditional tag -->
    <VAction
      :href="externalUrl"
      :to="internalRoute"
      :tag="customTag"
      class="dynamic-action"
    >
      Dynamic Action
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
  // Submit processing
  setTimeout(() => {
    isLoading.value = false;
    console.log('Submit completed');
  }, 2000);
};

const checkAdminPermission = async () => {
  // Admin permission check (async)
  const hasPermission = await checkUserPermissions();
  if (!hasPermission) {
    alert('Admin permission required');
    return false; // Block navigation
  }
  return true; // Allow navigation
};

const checkUserPermissions = (): Promise<boolean> => {
  return new Promise(resolve => {
    // API call simulation
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

#### Advanced Usage Examples of VAction Component

```vue
<template>
  <div class="action-showcase">
    <!-- Conditional button group -->
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

    <!-- Navigation menu -->
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

    <!-- Download links -->
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

    <!-- Social share -->
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

// Dynamic button configuration
const actions = ref([
  {
    id: 'save',
    label: 'Save',
    props: { type: 'button', disabled: false },
    class: 'btn btn-success',
    handler: () => console.log('Saving...')
  },
  {
    id: 'cancel',
    label: 'Cancel',
    props: { type: 'button' },
    class: 'btn btn-secondary',
    handler: () => console.log('Cancelled')
  },
  {
    id: 'delete',
    label: 'Delete',
    props: {
      type: 'button',
      guard: async () => {
        return confirm('Are you sure you want to delete?');
      }
    },
    class: 'btn btn-danger',
    handler: () => console.log('Delete executed')
  }
]);

// Navigation routes
const navRoutes = ref([
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: '📊',
    guard: null
  },
  {
    path: '/users',
    label: 'User Management',
    icon: '👥',
    guard: () => checkPermission('users.read')
  },
  {
    path: '/settings',
    label: 'Settings',
    icon: '⚙️',
    guard: () => checkPermission('settings.access')
  },
  {
    path: '/reports',
    label: 'Reports',
    icon: '📈',
    guard: async () => {
      const hasAccess = await checkPermission('reports.view');
      if (!hasAccess) {
        alert('You do not have permission to view reports');
        return false;
      }
      return true;
    }
  }
]);

// Download files
const downloadFiles = ref([
  {
    id: 1,
    name: 'User Guide',
    filename: 'user-guide.pdf',
    url: '/downloads/user-guide.pdf'
  },
  {
    id: 2,
    name: 'API Documentation',
    filename: 'api-docs.pdf',
    url: '/downloads/api-documentation.pdf'
  }
]);

// Social platforms
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

const shareText = ref('Check out this amazing app!');
const currentUrl = ref('https://example.com');

// Permission check function
const checkPermission = async (permission: string): Promise<boolean> => {
  // In actual applications, call API to check permissions
  console.log(`Permission check: ${permission}`);
  return new Promise(resolve => {
    setTimeout(() => {
      // Randomly grant permissions (for demo)
      resolve(Math.random() > 0.3);
    }, 500);
  });
};

// Download permission check
const checkDownloadPermission = async (): Promise<boolean> => {
  const hasPermission = await checkPermission('files.download');
  if (!hasPermission) {
    alert('You do not have file download permissions');
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
    Click me!
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
  console.log('Clicked!')
}
</script>
```

### Using as Button

```vue
<template>
  <component
    :is="buttonAction.Tag"
    v-bind="buttonAction.attrs"
  >
    Submit
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

### Using as RouterLink

```vue
<template>
  <component
    :is="linkAction.Tag"
    v-bind="linkAction.attrs"
  >
    To Homepage
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

## Guard Functionality

You can check conditions before action execution:

```vue
<template>
  <component
    :is="guardedAction.Tag"
    v-bind="guardedAction.attrs"
    :class="{
      'loading': guardedAction.guardInProgress
    }"
  >
    {{ guardedAction.guardInProgress ? 'Processing...' : 'Dangerous Operation' }}
  </component>
</template>

<script setup lang="ts">
import { useActionable } from '@fastkit/vue-action'

const guardedAction = useActionable(
  {
    attrs: {
      guard: async (ev: PointerEvent) => {
        // 非同期ガード処理
        const result = await confirm('Are you sure you want to execute?')
        return result // Returning false cancels the action
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

## Using as External Links

```vue
<template>
  <component
    :is="externalLink.Tag"
    v-bind="externalLink.attrs"
  >
    Open external site
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

## State-based Styling

CSS classes are automatically applied based on component state:

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

## Custom RouterLink Configuration

When using Nuxt Link or custom RouterLink components:

```typescript
import { setDefaultRouterLink } from '@fastkit/vue-action'
import { NuxtLink } from '#components'

// Set default RouterLink component
setDefaultRouterLink(NuxtLink, ['prefetch', 'noPrefetch'])
```

## Advanced Usage Examples

### Form Submission Integration

```vue
<template>
  <form @submit.prevent="handleSubmit">
    <input v-model="form.name" type="text" placeholder="Name" />

    <component
      :is="submitAction.Tag"
      v-bind="submitAction.attrs"
      :disabled="!form.name || isSubmitting"
    >
      {{ isSubmitting ? 'Submitting...' : 'Submit' }}
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
          alert('Please enter a name')
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

A unified actionable element component.

```typescript
// Component properties
interface VActionProps extends ActionableAttrs {
  tag?: string;                    // HTML tag name
  class?: any;                     // CSS class
  style?: CSSProperties;           // Style
  linkFallbackTag?: string | (() => string | undefined); // Fallback tag

  // Router Link related
  to?: RouteLocationRaw;           // Vue Router destination
  replace?: boolean;               // Replace navigation
  activeClass?: string;            // Active class
  exactActiveClass?: string;       // Exact active class

  // Link related
  href?: string;                   // Hyperlink URL
  target?: string;                 // Link target
  rel?: string;                    // rel attribute
  download?: boolean | string;     // Download attribute

  // Button related
  type?: 'button' | 'submit' | 'reset'; // Button type
  disabled?: boolean;              // Disabled state
  name?: string;                   // Form name

  // Guard functionality
  guard?: ActionableGuard;         // Pre-action guard function

  // State-specific CSS classes
  disabledClass?: string | (() => string | undefined);
  hasActionClass?: string | (() => string | undefined);
  actionableClass?: string | (() => string | undefined);
  guardInProgressClass?: string | (() => string | undefined);
}

// Guard function type definition
type ActionableGuard = (ev: PointerEvent) => boolean | void | Promise<boolean | void>;

// Slots
interface VActionSlots {
  default?: (actionable: Actionable) => any;
}
```

#### VAction Behavior

The VAction component determines HTML tags in the following priority order:

1. **RouterLink**: When `to` property is specified
2. **<a> tag**: When `href` property is specified
3. **<button> tag**: When `@click` handler or `type` property is specified
4. **Fallback tag**: Tag specified by `linkFallbackTag` or `tag` property (default: `div`)

#### Guard Functionality

```typescript
// Synchronous guard
const syncGuard: ActionableGuard = (ev) => {
  if (someCondition) {
    return false; // Prevent action
  }
  return true; // Allow action
};

// Asynchronous guard
const asyncGuard: ActionableGuard = async (ev) => {
  const result = await someAsyncValidation();
  return result.isValid;
};

// State display during guard
<VAction
  :guard="asyncGuard"
  :guardInProgressClass="'is-loading'"
  @click="handleAction"
>
  Execute
</VAction>
```

#### State Management

The VAction component automatically manages the following states:

- **disabled**: State when `disabled` or `aria-disabled` is set
- **hasAction**: State when link, click handler, or button tag is set
- **actionable**: State when action exists and is not disabled
- **guardInProgress**: State when guard function is executing

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
type ActionableGuard = (ev: PointerEvent) => boolean | void | Promise<boolean | void>
```

Guard functions can cancel actions by returning `false`.

## Related Packages

- `@fastkit/vue-utils` - Vue.js utility functions
- `vue-router` - Vue Router (peer dependency)

## License

MIT
