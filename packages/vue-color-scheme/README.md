
# @fastkit/vue-color-scheme

🌐 English | [日本語](https://github.com/dadajam4/fastkit/blob/main/packages/vue-color-scheme/README-ja.md)

A library for using type-safe color schemes in Vue.js applications. Integrates @fastkit/color-scheme with Vue 3 Composition API, providing dynamic theme switching, CSS Variables integration, and type-safe color access.

## Features

- **Full Vue 3 Integration**: Supports both Composition API and Options API
- **Type Safety**: Complete type safety with TypeScript
- **Dynamic Theme Switching**: Real-time light/dark theme switching
- **CSS Variables Integration**: Automatic CSS variable generation and binding
- **Composables**: Convenient composables like useColorScheme, useColorClasses
- **Props Integration**: Standardized prop definitions with colorSchemeProps
- **HTML Class Management**: Automatic HTML binding of theme classes
- **Head Management**: Meta information management through @unhead/vue integration
- **Plugin System**: Easy setup at Vue application level
- **SSR Support**: Full server-side rendering support

## Installation

```bash
npm install @fastkit/vue-color-scheme
# or
pnpm add @fastkit/vue-color-scheme

# Dependencies
npm install @fastkit/color-scheme vue @unhead/vue
```

## Basic Usage

### Plugin Configuration

```typescript
// main.ts
import { createApp } from 'vue';
import { createHead } from '@unhead/vue';
import { VueColorSchemeService } from '@fastkit/vue-color-scheme';
import colorScheme from './color-scheme'; // Color scheme definition

const app = createApp(App);

// Head plugin
const head = createHead();
app.use(head);

// Color scheme service
const colorSchemeService = new VueColorSchemeService(colorScheme);
colorSchemeService.provide(app);

app.mount('#app');
```

### Color Scheme Definition

```typescript
// color-scheme.ts
import { createSimpleColorScheme } from '@fastkit/color-scheme-gen';

export default createSimpleColorScheme({
  primary: '#1976d2',
  secondary: '#424242',
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
  background: '#ffffff',
  foundation: '#f5f5f5'
});
```

### Using in Vue Components

```vue
<template>
  <div :class="themeClass">
    <!-- Primary color button -->
    <button :class="primaryClasses">
      Primary Button
    </button>

    <!-- Secondary color outline button -->
    <button :class="secondaryClasses">
      Secondary Button
    </button>

    <!-- Theme toggle button -->
    <button @click="toggleTheme">
      Switch to {{ isDark ? 'Light' : 'Dark' }} Theme
    </button>
  </div>
</template>

<script setup lang="ts">
import {
  useColorScheme,
  useColorClasses,
  useThemeClass
} from '@fastkit/vue-color-scheme';

// Color scheme service
const colorScheme = useColorScheme();

// Theme class management
const { themeClass, currentTheme, toggleTheme, isDark } = useThemeClass({});

// Color class generation
const primaryClasses = useColorClasses({ color: 'primary', variant: 'contained' });
const secondaryClasses = useColorClasses({ color: 'secondary', variant: 'outlined' });
</script>
```

## Composables

### useColorScheme

Access to the color scheme service:

```typescript
import { useColorScheme } from '@fastkit/vue-color-scheme';

const colorSchemeService = useColorScheme();

// Service information
console.log(colorSchemeService.defaultTheme);    // 'light'
console.log(colorSchemeService.themeNames);      // ['light', 'dark']
console.log(colorSchemeService.paletteNames);    // ['primary', 'secondary', ...]
console.log(colorSchemeService.scopeNames);      // ['primary', 'secondary', ...]

// Current theme
console.log(colorSchemeService.rootTheme);       // 'light' | 'dark'
colorSchemeService.rootTheme = 'dark';           // Change theme
```

### useThemeClass

Theme class management:

```typescript
import { useThemeClass } from '@fastkit/vue-color-scheme';

// Basic usage
const themeResult = useThemeClass({});
console.log(themeResult.value); // { value: 'light', className: 'light-theme' }

// Specify a specific theme
const themeResult = useThemeClass({ theme: 'dark' });
console.log(themeResult.value); // { value: 'dark', className: 'dark-theme' }

// Reactive theme
const theme = ref('light');
const themeResult = useThemeClass({ theme });

// Use root theme as default
const themeResult = useThemeClass({}, true);
```

### useColorClasses

Comprehensive color class management:

```typescript
import { useColorClasses } from '@fastkit/vue-color-scheme';

const colorClassesResult = useColorClasses({
  theme: 'light',
  color: 'primary',
  variant: 'contained',
  textColor: 'white',
  borderColor: 'primary'
});

// Result structure
console.log(colorClassesResult.theme.value);        // { value: 'light', className: 'light-theme' }
console.log(colorClassesResult.color.value);        // { value: 'primary', className: 'primary-scope' }
console.log(colorClassesResult.variant.value);      // { value: 'contained', className: 'contained' }
console.log(colorClassesResult.textColor.value);    // { value: 'white', className: 'white-text' }
console.log(colorClassesResult.borderColor.value);  // { value: 'primary', className: 'primary-border' }

// Get all classes as an array
console.log(colorClassesResult.colorClasses.value);
// ['light-theme', 'primary-scope', 'contained', 'white-text', 'primary-border']
```

### useScopeColorClass

Dedicated scope color class:

```typescript
import { useScopeColorClass } from '@fastkit/vue-color-scheme';

const scopeResult = useScopeColorClass({ color: 'primary' });
console.log(scopeResult.value); // { value: 'primary', className: 'primary-scope' }

// Dynamic color
const color = ref('secondary');
const scopeResult = useScopeColorClass({ color });
// Class name automatically changes when color changes
```

### useTextColorClass

Dedicated text color class:

```typescript
import { useTextColorClass } from '@fastkit/vue-color-scheme';

const textResult = useTextColorClass({ textColor: 'primary' });
console.log(textResult.value); // { value: 'primary', className: 'primary-text' }

// Function-based dynamic color
const textResult = useTextColorClass({
  textColor: () => isDark.value ? 'white' : 'black'
});
```

### useBorderColorClass

Dedicated border color class:

```typescript
import { useBorderColorClass } from '@fastkit/vue-color-scheme';

const borderResult = useBorderColorClass({ borderColor: 'primary' });
console.log(borderResult.value); // { value: 'primary', className: 'primary-border' }
```

### useColorVariantClasses

Dedicated variant class:

```typescript
import { useColorVariantClasses } from '@fastkit/vue-color-scheme';

const variantResult = useColorVariantClasses({ variant: 'outlined' });
console.log(variantResult.value); // { value: 'outlined', className: 'outlined' }
```

### useInjectTheme

Automatic theme application to HTML class:

```typescript
import { useInjectTheme } from '@fastkit/vue-color-scheme';

// When this composable is called,
// theme classes are automatically added to the HTML class attribute
const colorSchemeService = useInjectTheme();

// HTML example: <html class="light-theme">
// Class automatically changes when theme changes
```

## Props Integration

### colorSchemeProps

Standardized color scheme props definition:

```typescript
import { colorSchemeProps } from '@fastkit/vue-color-scheme';

// Default prop names
const props = colorSchemeProps();
// Generated props:
// {
//   variant: String,
//   theme: String,
//   color: String,
//   textColor: String,
//   borderColor: String
// }

// Custom prop names
const customProps = colorSchemeProps({
  theme: 'appTheme',
  color: 'brandColor',
  textColor: 'fontColor',
  borderColor: 'edgeColor'
});
// Generated props:
// {
//   variant: String,
//   appTheme: String,
//   brandColor: String,
//   fontColor: String,
//   edgeColor: String
// }

// Usage example
export default defineComponent({
  props: {
    ...colorSchemeProps(),
    title: String,
    size: String
  },
  setup(props) {
    const colorClasses = useColorClasses(props);

    return {
      colorClasses
    };
  }
});
```

## Advanced Usage Examples

### Component Library Integration

```vue
<!-- Button.vue -->
<template>
  <button
    :class="buttonClasses"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { colorSchemeProps, useColorClasses } from '@fastkit/vue-color-scheme';

interface Props {
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

const props = defineProps({
  ...colorSchemeProps(),
  ...withDefaults(defineProps<Props>(), {
    size: 'md',
    disabled: false
  })
});

defineEmits<{
  click: [event: MouseEvent];
}>();

// Color class generation
const colorClasses = useColorClasses(props);

// Final class name calculation
const buttonClasses = computed(() => [
  'button',
  `button--${props.size}`,
  ...colorClasses.colorClasses.value,
  {
    'button--disabled': props.disabled
  }
]);
</script>

<style scoped>
.button {
  /* Base styles */
  padding: var(--spacing-md);
  border-radius: var(--border-radius);
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
}

.button--sm { padding: var(--spacing-sm); }
.button--md { padding: var(--spacing-md); }
.button--lg { padding: var(--spacing-lg); }

.button--disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Using color scheme CSS variables */
.button.primary-scope.contained {
  background: var(--main-color);
  color: var(--text-color);
  border: 1px solid var(--main-color);
}

.button.primary-scope.contained:hover {
  background: var(--deep-color);
}

.button.primary-scope.outlined {
  background: transparent;
  color: var(--main-color);
  border: 1px solid var(--outlineBorder-color);
}
</style>
```

### Theme Toggle Component

```vue
<!-- ThemeSwitcher.vue -->
<template>
  <div class="theme-switcher">
    <button
      v-for="themeName in availableThemes"
      :key="themeName"
      :class="themeButtonClass(themeName)"
      @click="setTheme(themeName)"
    >
      {{ getThemeDisplayName(themeName) }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useColorScheme } from '@fastkit/vue-color-scheme';

const colorSchemeService = useColorScheme();

// Available themes
const availableThemes = computed(() => colorSchemeService.themeNames);

// Current theme
const currentTheme = computed(() => colorSchemeService.rootTheme);

// Theme setting
const setTheme = (themeName: string) => {
  colorSchemeService.rootTheme = themeName;
};

// Theme button class
const themeButtonClass = (themeName: string) => [
  'theme-button',
  {
    'theme-button--active': currentTheme.value === themeName
  }
];

// Theme display name
const getThemeDisplayName = (themeName: string) => {
  const displayNames: Record<string, string> = {
    light: 'Light',
    dark: 'Dark',
    auto: 'Auto'
  };
  return displayNames[themeName] || themeName;
};
</script>

<style scoped>
.theme-switcher {
  display: flex;
  gap: var(--spacing-sm);
}

.theme-button {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--border-color);
  background: var(--background-color);
  color: var(--text-color);
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all 0.2s ease;
}

.theme-button:hover {
  background: var(--light-color);
}

.theme-button--active {
  background: var(--primary-color);
  color: var(--primary-text-color);
  border-color: var(--primary-color);
}
</style>
```

### System Settings Integration

```vue
<!-- AutoThemeManager.vue -->
<template>
  <div class="auto-theme-manager">
    <label>
      <input
        type="checkbox"
        :checked="followSystem"
        @change="toggleSystemFollow"
      >
      Follow system settings
    </label>

    <div v-if="!followSystem" class="manual-controls">
      <ThemeSwitcher />
    </div>

    <div class="current-info">
      Current theme: {{ currentTheme }}
      <span v-if="followSystem">(System: {{ systemTheme }})</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useColorScheme } from '@fastkit/vue-color-scheme';

const colorSchemeService = useColorScheme();
const followSystem = ref(true);
const systemTheme = ref<'light' | 'dark'>('light');

// Current theme
const currentTheme = computed(() => colorSchemeService.rootTheme);

// System settings monitoring
let mediaQuery: MediaQueryList | null = null;

const updateSystemTheme = () => {
  if (mediaQuery) {
    systemTheme.value = mediaQuery.matches ? 'dark' : 'light';
    if (followSystem.value) {
      colorSchemeService.rootTheme = systemTheme.value;
    }
  }
};

const toggleSystemFollow = (event: Event) => {
  const target = event.target as HTMLInputElement;
  followSystem.value = target.checked;

  if (followSystem.value) {
    // When following system settings, apply current system theme
    colorSchemeService.rootTheme = systemTheme.value;
  }
};

onMounted(() => {
  // Monitor system dark mode settings
  mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  updateSystemTheme();

  mediaQuery.addEventListener('change', updateSystemTheme);
});

onUnmounted(() => {
  if (mediaQuery) {
    mediaQuery.removeEventListener('change', updateSystemTheme);
  }
});
</script>
```

### Dynamic Color Generation

```vue
<!-- DynamicColorGenerator.vue -->
<template>
  <div class="color-generator">
    <div class="controls">
      <label>
        Base Color:
        <input
          type="color"
          v-model="baseColor"
          @input="generateColors"
        >
      </label>

      <label>
        Color Mode:
        <select v-model="colorMode" @change="generateColors">
          <option value="monochromatic">Monochromatic</option>
          <option value="analogous">Analogous</option>
          <option value="complementary">Complementary</option>
          <option value="triadic">Triadic</option>
        </select>
      </label>
    </div>

    <div class="color-preview">
      <div
        v-for="(color, index) in generatedColors"
        :key="index"
        class="color-swatch"
        :style="{ backgroundColor: color }"
      >
        {{ color }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useColorScheme } from '@fastkit/vue-color-scheme';

const colorSchemeService = useColorScheme();
const baseColor = ref('#1976d2');
const colorMode = ref('monochromatic');
const generatedColors = ref<string[]>([]);

const generateColors = () => {
  // Color generation logic (use @fastkit/color in actual implementation)
  const colors: string[] = [];

  switch (colorMode.value) {
    case 'monochromatic':
      // Monochromatic palette with different brightness
      colors.push(
        baseColor.value,
        adjustBrightness(baseColor.value, 0.2),
        adjustBrightness(baseColor.value, -0.2)
      );
      break;

    case 'analogous':
      // Analogous color palette
      colors.push(
        baseColor.value,
        rotateHue(baseColor.value, 30),
        rotateHue(baseColor.value, -30)
      );
      break;

    case 'complementary':
      // Complementary color palette
      colors.push(
        baseColor.value,
        rotateHue(baseColor.value, 180)
      );
      break;

    case 'triadic':
      // Triadic color palette
      colors.push(
        baseColor.value,
        rotateHue(baseColor.value, 120),
        rotateHue(baseColor.value, 240)
      );
      break;
  }

  generatedColors.value = colors;
};

// Color manipulation helper functions (simplified version)
const adjustBrightness = (color: string, amount: number): string => {
  // Use @fastkit/color Color.lighten/darken methods in implementation
  return color;
};

const rotateHue = (color: string, degrees: number): string => {
  // Use @fastkit/color Color.rotate method in implementation
  return color;
};

onMounted(() => {
  generateColors();
});
</script>

<style scoped>
.color-generator {
  padding: var(--spacing-lg);
}

.controls {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.controls label {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.color-preview {
  display: flex;
  gap: var(--spacing-sm);
}

.color-swatch {
  width: 120px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  border-radius: var(--border-radius);
}
</style>
```

## VueColorSchemeService

Detailed usage of service class:

```typescript
import { VueColorSchemeService } from '@fastkit/vue-color-scheme';
import colorScheme from './color-scheme';

// Service creation
const service = new VueColorSchemeService(colorScheme);

// Property access
console.log(service.scheme);          // ColorScheme instance
console.log(service.defaultTheme);    // Default theme name
console.log(service.themeNames);      // All theme names
console.log(service.paletteNames);    // All palette names
console.log(service.scopeNames);      // All scope names

// Theme management
console.log(service.rootTheme);       // Current theme
service.rootTheme = 'dark';          // Theme change

// Provide to Vue app
service.provide(app);
```

## SSR Support

Usage in server-side rendering:

```typescript
// server.ts (Node.js server)
import { createSSRApp } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { createHead, renderHeadToString } from '@unhead/vue';
import { VueColorSchemeService } from '@fastkit/vue-color-scheme';

export async function render(url: string, theme = 'light') {
  const app = createSSRApp(App);

  // Head setup
  const head = createHead();
  app.use(head);

  // Color scheme setup
  const colorSchemeService = new VueColorSchemeService(colorScheme);
  colorSchemeService.rootTheme = theme; // Set theme on server side
  colorSchemeService.provide(app);

  // Rendering
  const appHtml = await renderToString(app);
  const { headTags, htmlAttrs, bodyAttrs } = await renderHeadToString(head);

  return {
    html: `
      <!DOCTYPE html>
      <html${htmlAttrs}>
        <head>
          ${headTags}
        </head>
        <body${bodyAttrs}>
          <div id="app">${appHtml}</div>
        </body>
      </html>
    `,
  };
}
```

## TypeScript Type Extensions

Extending type information:

```typescript
// types/vue-color-scheme.d.ts
declare module '@fastkit/vue-color-scheme' {
  interface ColorSchemeHooksProps {
    // Add custom props
    brand?: string;
    accent?: string;
  }
}

// Usage example
const customColorClasses = useColorClasses({
  color: 'primary',
  brand: 'corporate',  // Custom prop
  accent: 'highlight'  // Custom prop
});
```

## Testing and Debugging

### Unit Tests

```typescript
import { describe, test, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { VueColorSchemeService } from '@fastkit/vue-color-scheme';
import { createSimpleColorScheme } from '@fastkit/color-scheme-gen';

describe('VueColorScheme', () => {
  let colorScheme: any;
  let service: VueColorSchemeService;

  beforeEach(() => {
    colorScheme = createSimpleColorScheme({
      primary: '#1976d2',
      secondary: '#424242'
    });
    service = new VueColorSchemeService(colorScheme);
  });

  test('service creation', () => {
    expect(service.defaultTheme).toBe('light');
    expect(service.themeNames).toContain('light');
    expect(service.themeNames).toContain('dark');
  });

  test('theme switching', () => {
    expect(service.rootTheme).toBe('light');
    service.rootTheme = 'dark';
    expect(service.rootTheme).toBe('dark');
  });

  test('component integration', () => {
    const TestComponent = {
      template: '<div :class="colorClasses.colorClasses.value"></div>',
      setup() {
        const colorClasses = useColorClasses({
          color: 'primary',
          variant: 'contained'
        });
        return { colorClasses };
      }
    };

    const wrapper = mount(TestComponent, {
      global: {
        provide: {
          [VueColorSchemeServiceInjectionKey]: service
        }
      }
    });

    expect(wrapper.classes()).toContain('primary-scope');
    expect(wrapper.classes()).toContain('contained');
  });
});
```

## Dependencies

```json
{
  "dependencies": {
    "@fastkit/color-scheme": "Color scheme foundation library",
    "@fastkit/tiny-logger": "Lightweight logging functionality",
    "@fastkit/vue-utils": "Vue.js utilities"
  },
  "peerDependencies": {
    "vue": "^3.4.0",
    "@unhead/vue": "^1.8.0"
  }
}
```

## Documentation

https://dadajam4.github.io/fastkit/vue-color-scheme/

## License

MIT
