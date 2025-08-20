
# @fastkit/vui

🌐 English | [日本語](https://github.com/dadajam4/fastkit/blob/main/packages/vui/README-ja.md)

A simple and extensible UI component library for Vue.js 3 applications. Focused on full TypeScript support, color theme system, accessibility, and tight integration with @fastkit/vue-form-control.

## Features

- **45+ UI Components**: Comprehensive component set including buttons, forms, navigation, data display
- **Integrated Ecosystem**: 20+ @fastkit packages with unified API
- **Full TypeScript Support**: Type-safe props, events, and slot definitions
- **Composition API Design**: Full adoption of Vue 3 modern patterns
- **Color Theme System**: Flexible theming with CSS Variables foundation
- **Form Integration**: Seamless integration with @fastkit/vue-form-control
- **Accessibility**: WAI-ARIA compliant, keyboard navigation support
- **Responsive Design**: Mobile-first grid system
- **Internationalization**: Multi-language font settings, RTL language support
- **Programmatic UI**: Imperative operations for dialogs, notifications, etc.

## Installation

```bash
npm install @fastkit/vui
# or
pnpm add @fastkit/vui
```

## Basic Usage

### Plugin Setup

```typescript
import { createApp } from 'vue';
import { VuiPlugin } from '@fastkit/vui';
import { createRouter } from 'vue-router';

const app = createApp(App);
const router = createRouter(/* routes */);

// Install VUI plugin
app.use(VuiPlugin, {
  router,
  colorScheme: {
    // Color theme settings
    primary: '#1976d2',
    secondary: '#424242'
  },
  uiSettings: {
    primaryScope: 'primary',
    buttonDefault: {
      color: 'primary',
      variant: 'contained'
    }
  }
});
```

### Application Setup

```vue
<template>
  <VApp>
    <!-- Application content -->
    <router-view />
  </VApp>
</template>

<script setup lang="ts">
import { VApp } from '@fastkit/vui';
</script>
```

## Component List

### Layout & Structure

- **VApp** - Application root container
- **VGrid** (`VGridContainer`, `VGridItem`) - Responsive grid system
- **VPaper** - Material Design-style paper container
- **VCard** (`VCardContent`, `VCardActions`) - Card layout
- **VToolbar** (`VToolbarTitle`, `VToolbarMenu`, `VToolbarEdge`) - Toolbar

### Navigation

- **VNavigation**, **VNavigationItem** - Side navigation
- **VBreadcrumbs** - Breadcrumb navigation
- **VTabs**, **VTab** - Tab interface
- **VPagination** - Pagination

### Form Controls

- **VButton**, **VButtonGroup** - Button and button group
- **VTextField** - Text input field
- **VTextarea** - Multi-line text input
- **VNumberField** - Number input field
- **VSelect** - Select dropdown
- **VCheckbox**, **VCheckboxGroup** - Checkbox
- **VRadio**, **VRadioGroup** - Radio button
- **VSwitch**, **VSwitchGroup** - Switch toggle
- **VOption**, **VOptionGroup** - Option element

### Data Display

- **VDataTable** - Data table
- **VListTile** - List item
- **VAvatar** - User avatar
- **VChip** - Chip/tag element
- **VIcon** - Icon display

### Feedback & Interaction

- **VDialog** - Modal dialog
- **VSnackbar** - Notification snackbar
- **VTooltip** - Tooltip
- **VMenu** - Context menu
- **VSheetModal** - Sheet modal

### Others

- **VSkeltonLoader** - Skeleton loading
- **VBusyImage** - Lazy loading image
- **VHero** - Hero section
- **VContentSwitcher** - Content switcher

## Usage Examples

### Button Components

```vue
<template>
  <div>
    <!-- Basic button -->
    <VButton @click="handleClick">Click</VButton>

    <!-- Primary button -->
    <VButton color="primary" variant="contained">
      Save
    </VButton>

    <!-- Button with icon -->
    <VButton
      startIcon="mdi-search"
      color="primary"
      variant="outlined"
      :loading="searching"
      @click="handleSearch"
    >
      Search
    </VButton>

    <!-- Button group -->
    <VButtonGroup>
      <VButton>Left</VButton>
      <VButton>Center</VButton>
      <VButton>Right</VButton>
    </VButtonGroup>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { VButton, VButtonGroup } from '@fastkit/vui';

const searching = ref(false);

const handleClick = () => {
  console.log('Button clicked');
};

const handleSearch = async () => {
  searching.value = true;
  try {
    // Search processing
    await performSearch();
  } finally {
    searching.value = false;
  }
};
</script>
```

### Form Components

```vue
<template>
  <VCard>
    <VCardContent>
      <h2>User Registration</h2>

      <!-- Text input -->
      <VTextField
        v-model="form.name.value"
        label="Name"
        required
        :rules="[required(), minLength(2)]"
        :invalid="form.name.invalid"
        :error-message="form.name.errorMessage"
      />

      <!-- Email input -->
      <VTextField
        v-model="form.email.value"
        label="Email Address"
        type="email"
        required
        :rules="[required(), email()]"
        :invalid="form.email.invalid"
        :error-message="form.email.errorMessage"
      />

      <!-- Select -->
      <VSelect
        v-model="form.category.value"
        label="Category"
        :items="categories"
        placeholder="Select category"
        required
      />

      <!-- Checkbox -->
      <VCheckbox
        v-model="form.agreement.value"
        :rules="[required()]"
      >
        I agree to the terms of use
      </VCheckbox>
    </VCardContent>

    <VCardActions>
      <VButton
        color="primary"
        variant="contained"
        :disabled="form.invalid"
        @click="handleSubmit"
      >
        Register
      </VButton>
      <VButton variant="text" @click="handleCancel">
        Cancel
      </VButton>
    </VCardActions>
  </VCard>
</template>

<script setup lang="ts">
import {
  VCard, VCardContent, VCardActions,
  VTextField, VSelect, VCheckbox, VButton
} from '@fastkit/vui';
import { useForm } from '@fastkit/vue-form-control';
import { required, email, minLength } from '@fastkit/rules';

const categories = [
  { value: 'personal', label: 'Personal' },
  { value: 'business', label: 'Business' },
  { value: 'education', label: 'Education' }
];

const form = useForm({
  name: {
    value: '',
    rules: [required(), minLength(2)]
  },
  email: {
    value: '',
    rules: [required(), email()]
  },
  category: {
    value: '',
    rules: [required()]
  },
  agreement: {
    value: false,
    rules: [required()]
  }
}, {
  onSubmit: async (values) => {
    console.log('Form submitted:', values);
    await api.register(values);
  }
});

const handleSubmit = () => {
  form.submit();
};

const handleCancel = () => {
  form.reset();
};
</script>
```

### Data Table

```vue
<template>
  <VDataTable
    :items="users"
    :headers="headers"
    :loading="loading"
    item-key="id"
    selectable
    @select="handleSelect"
  >
    <!-- Custom column -->
    <template #item.status="{ item }">
      <VChip
        :color="item.status === 'active' ? 'success' : 'warning'"
        size="sm"
      >
        {{ item.status === 'active' ? 'Active' : 'Inactive' }}
      </VChip>
    </template>

    <template #item.actions="{ item }">
      <VButton size="sm" variant="text" @click="editUser(item)">
        Edit
      </VButton>
      <VButton
        size="sm"
        variant="text"
        color="error"
        @click="deleteUser(item)"
      >
        Delete
      </VButton>
    </template>
  </VDataTable>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { VDataTable, VChip, VButton } from '@fastkit/vui';

const loading = ref(false);
const users = ref([
  { id: 1, name: 'John Tanaka', email: 'tanaka@example.com', status: 'active' },
  { id: 2, name: 'Hanako Sato', email: 'sato@example.com', status: 'inactive' }
]);

const headers = [
  { key: 'name', title: 'Name', sortable: true },
  { key: 'email', title: 'Email', sortable: true },
  { key: 'status', title: 'Status' },
  { key: 'actions', title: 'Actions', width: 120 }
];

const handleSelect = (selectedItems: any[]) => {
  console.log('Selected items:', selectedItems);
};

const editUser = (user: any) => {
  console.log('Edit:', user);
};

const deleteUser = (user: any) => {
  console.log('Delete:', user);
};
</script>
```

### Layout System

```vue
<template>
  <VApp>
    <!-- Toolbar -->
    <VToolbar color="primary" variant="flat">
      <VToolbarTitle>My App</VToolbarTitle>
      <VToolbarMenu>
        <VButton variant="text" color="on-primary">
          Menu
        </VButton>
      </VToolbarMenu>
    </VToolbar>

    <!-- Main content -->
    <VGridContainer>
      <VGridItem cols="12" md="3">
        <!-- Side navigation -->
        <VNavigation>
          <VNavigationItem to="/dashboard" icon="mdi-dashboard">
            Dashboard
          </VNavigationItem>
          <VNavigationItem to="/users" icon="mdi-account-group">
            Users
          </VNavigationItem>
          <VNavigationItem to="/settings" icon="mdi-cog">
            Settings
          </VNavigationItem>
        </VNavigation>
      </VGridItem>

      <VGridItem cols="12" md="9">
        <!-- Page content -->
        <VPaper class="pa-4">
          <router-view />
        </VPaper>
      </VGridItem>
    </VGridContainer>
  </VApp>
</template>

<script setup lang="ts">
import {
  VApp, VToolbar, VToolbarTitle, VToolbarMenu,
  VGridContainer, VGridItem, VNavigation, VNavigationItem,
  VPaper, VButton
} from '@fastkit/vui';
</script>
```

## Programmatic UI Operations

You can control UI elements from JavaScript using VUI services.

```typescript
import { useVui } from '@fastkit/vui';

const vui = useVui();

// Alert dialog
await vui.alert('Processing completed');

// Confirmation dialog
const confirmed = await vui.confirm({
  title: 'Confirmation',
  message: 'Do you want to execute this operation?',
  okText: 'Execute',
  cancelText: 'Cancel'
});

if (confirmed) {
  // Process when confirmed
}

// Prompt dialog
const result = await vui.prompt({
  title: 'Enter name',
  message: 'Please enter a new name',
  defaultValue: 'Default value'
});

// Form prompt
const formResult = await vui.formPrompt(
  {
    state: { name: '', description: '' },
    title: 'Create New'
  },
  (state) => (
    <>
      <VTextField
        label="Name"
        v-model={state.name}
        required
      />
      <VTextarea
        label="Description"
        v-model={state.description}
        rows={3}
      />
    </>
  )
);

// Snackbar notification
vui.snackbar.show({
  message: 'Saved',
  color: 'success',
  timeout: 3000
});

// Custom dialog
const dialog = await vui.dialog.show({
  component: MyCustomDialog,
  props: {
    data: someData
  }
});
```

## Theme Customization

### CSS Variables

```css
:root {
  /* Color palette */
  --color-primary: #1976d2;
  --color-secondary: #424242;
  --color-success: #4caf50;
  --color-warning: #ff9800;
  --color-error: #f44336;

  /* Size settings */
  --control-field-rem-sm: 0.875rem;
  --control-field-rem-md: 1rem;
  --control-field-rem-lg: 1.125rem;

  /* Spacing */
  --root-spacing: 8px;

  /* Font */
  --typo-base-font: Roboto, 'Noto Sans JP', sans-serif;

  /* Shadow */
  --shadow-1: 0px 2px 1px -1px rgba(0, 0, 0, 0.2);
  --shadow-4: 0px 2px 4px -1px rgba(0, 0, 0, 0.2);

  /* Transition */
  --transition-primary: cubic-bezier(0.25, 0.8, 0.5, 1);
}
```

### Custom Color Scheme

```typescript
// Define custom colors
app.use(VuiPlugin, {
  colorScheme: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
      contrast: '#ffffff'
    },
    secondary: {
      main: '#dc004e',
      light: '#ff5983',
      dark: '#9a0036',
      contrast: '#ffffff'
    }
  }
});
```

### Dark Theme Support

```vue
<template>
  <VApp :theme="currentTheme">
    <VButton @click="toggleTheme">
      {{ currentTheme === 'dark' ? 'Light' : 'Dark' }} Theme
    </VButton>
    <!-- App content -->
  </VApp>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useColorScheme } from '@fastkit/vui';

const { theme: currentTheme, toggle: toggleTheme } = useColorScheme();
</script>
```

## Advanced Usage Examples

### Custom Component Creation

```vue
<template>
  <VCard class="user-profile">
    <VCardContent>
      <div class="user-profile__header">
        <VAvatar :src="user.avatar" size="lg" />
        <div class="user-profile__info">
          <h3>{{ user.name }}</h3>
          <p>{{ user.role }}</p>
        </div>
      </div>

      <VTabs v-model="activeTab">
        <VTab value="profile">Profile</VTab>
        <VTab value="settings">Settings</VTab>
        <VTab value="activity">Activity</VTab>
      </VTabs>

      <VContentSwitcher :value="activeTab">
        <template #profile>
          <UserProfileTab :user="user" />
        </template>
        <template #settings>
          <UserSettingsTab :user="user" />
        </template>
        <template #activity>
          <UserActivityTab :user="user" />
        </template>
      </VContentSwitcher>
    </VCardContent>
  </VCard>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  VCard, VCardContent, VAvatar, VTabs, VTab, VContentSwitcher
} from '@fastkit/vui';

interface User {
  name: string;
  role: string;
  avatar: string;
}

const props = defineProps<{
  user: User;
}>();

const activeTab = ref('profile');
</script>

<style scoped>
.user-profile__header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.user-profile__info h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 500;
}

.user-profile__info p {
  margin: 0.25rem 0 0;
  color: var(--color-text-secondary);
}
</style>
```

### Complex Form Wizard

```vue
<template>
  <VCard class="form-wizard">
    <VCardContent>
      <VToolbar variant="flat" class="mb-4">
        <VToolbarTitle>Registration Wizard</VToolbarTitle>
        <VToolbarEdge>
          Step {{ currentStep + 1 }} / {{ steps.length }}
        </VToolbarEdge>
      </VToolbar>

      <!-- Step indicator -->
      <div class="step-indicator">
        <div
          v-for="(step, index) in steps"
          :key="step.name"
          class="step-indicator__item"
          :class="{
            'step-indicator__item--active': index === currentStep,
            'step-indicator__item--completed': index < currentStep
          }"
        >
          <VIcon
            :name="index < currentStep ? 'mdi-check' : step.icon"
            size="sm"
          />
          <span>{{ step.title }}</span>
        </div>
      </div>

      <!-- Step content -->
      <VContentSwitcher :value="currentStep">
        <template #0>
          <PersonalInfoStep v-model="formData.personal" />
        </template>
        <template #1>
          <ContactInfoStep v-model="formData.contact" />
        </template>
        <template #2>
          <PreferencesStep v-model="formData.preferences" />
        </template>
        <template #3>
          <ConfirmationStep :data="formData" />
        </template>
      </VContentSwitcher>
    </VCardContent>

    <VCardActions>
      <VButton
        variant="text"
        :disabled="currentStep === 0"
        @click="previousStep"
      >
        Back
      </VButton>

      <div class="flex-grow" />

      <VButton
        v-if="currentStep < steps.length - 1"
        color="primary"
        variant="contained"
        :disabled="!canProceed"
        @click="nextStep"
      >
        Next
      </VButton>

      <VButton
        v-else
        color="primary"
        variant="contained"
        :loading="submitting"
        @click="submitForm"
      >
        Complete
      </VButton>
    </VCardActions>
  </VCard>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  VCard, VCardContent, VCardActions,
  VToolbar, VToolbarTitle, VToolbarEdge,
  VContentSwitcher, VButton, VIcon
} from '@fastkit/vui';

const currentStep = ref(0);
const submitting = ref(false);

const steps = [
  { name: 'personal', title: 'Personal Info', icon: 'mdi-account' },
  { name: 'contact', title: 'Contact Info', icon: 'mdi-email' },
  { name: 'preferences', title: 'Preferences', icon: 'mdi-cog' },
  { name: 'confirm', title: 'Confirmation', icon: 'mdi-check-circle' }
];

const formData = ref({
  personal: { name: '', birthday: '' },
  contact: { email: '', phone: '' },
  preferences: { newsletter: false, theme: 'light' }
});

const canProceed = computed(() => {
  // Validation for each step
  switch (currentStep.value) {
    case 0:
      return formData.value.personal.name && formData.value.personal.birthday;
    case 1:
      return formData.value.contact.email;
    case 2:
      return true;
    default:
      return false;
  }
});

const nextStep = () => {
  if (currentStep.value < steps.length - 1) {
    currentStep.value++;
  }
};

const previousStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
};

const submitForm = async () => {
  submitting.value = true;
  try {
    await api.submitRegistration(formData.value);
    // Success processing
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.step-indicator {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.step-indicator__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.step-indicator__item--active,
.step-indicator__item--completed {
  opacity: 1;
}

.flex-grow {
  flex-grow: 1;
}
</style>
```

## API

### Composables

#### useVui()

Access VUI service instance.

```typescript
const vui = useVui();

// Dialog operations
vui.alert(message)
vui.confirm(options)
vui.prompt(options)
vui.formPrompt(state, renderer)

// Notifications
vui.snackbar.show(options)
vui.snackbar.hide()

// Navigation
vui.router.push(location)
vui.location.assign(url)
```

#### useControl()

Provides common functionality for control elements.

```typescript
const control = useControl(props, options);

// Properties
control.size        // 'sm' | 'md' | 'lg'
control.classes     // Computed CSS classes
control.isDisabled  // Disabled state
```

#### useColorScheme()

Provides color theme control.

```typescript
const { theme, toggle, setTheme } = useColorScheme();

theme.value         // Current theme
toggle()            // Toggle theme
setTheme('dark')    // Set specific theme
```

### Plugin Options

```typescript
interface VuiPluginOptions {
  router: Router;
  colorScheme?: VueColorSchemePluginSettings;
  uiSettings?: {
    primaryScope: ScopeName;
    buttonDefault: {
      color: ScopeName;
      variant: ColorVariant;
    };
    dialogOk?: {
      color?: ScopeName;
      variant?: ColorVariant;
    };
  };
  icons?: {
    menuDown: IconName;
    navigationExpand: RawIconProp;
    // Other icon settings
  };
  stack?: VueStackPluginOptions;
  form?: VueFormServiceOptions;
}
```

## Accessibility

### Keyboard Navigation

- **Tab/Shift+Tab**: Focus movement
- **Enter/Space**: Button/checkbox operation
- **Arrow Keys**: Radio button/tab/menu navigation
- **Escape**: Close dialog/menu
- **Home/End**: Move to beginning/end of list/table

### ARIA Support

```html
<!-- Automatically applied ARIA attributes -->
<button aria-disabled="true" aria-label="Save button">
<input aria-invalid="true" aria-describedby="error-message">
<div role="dialog" aria-modal="true" aria-labelledby="dialog-title">
```

### Screen Reader Support

- Voice reading of form errors
- State change notifications
- Proper placement of landmark elements

## Dependencies

```json
{
  "dependencies": {
    "@fastkit/vue-form-control": "Form functionality",
    "@fastkit/vue-color-scheme": "Color theme",
    "@fastkit/vue-stack": "Stack management",
    "@fastkit/vue-action": "Action functionality",
    "@fastkit/vue-app-layout": "Layout",
    "@fastkit/rules": "Validation",
    "@fastkit/helpers": "Utilities"
  },
  "peerDependencies": {
    "vue": "^3.4.0",
    "vue-router": "^4.0.0"
  }
}
```

## Documentation

For detailed documentation, please visit [here](https://dadajam4.github.io/fastkit/vui/).

## License

MIT
