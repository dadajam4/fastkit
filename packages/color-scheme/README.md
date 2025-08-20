
# @fastkit/color-scheme

🌐 English | [日本語](https://github.com/dadajam4/fastkit/blob/main/packages/color-scheme/README-ja.md)

A comprehensive color system library for managing application color themes and schemes. Built with TypeScript, it provides a color management system that emphasizes type safety, dynamic theme switching, and accessibility support.

## Features

- **Strict Type Safety**: Complete type checking through TypeScript generics
- **Dynamic Theme Switching**: Automatic detection and switching of light/dark modes
- **Flexible Palette Management**: Function-based dynamic color generation
- **Complete Vue.js Integration**: Dedicated composables and directives
- **Automatic CSS Variables Generation**: Efficient CSS custom property management
- **Accessibility Support**: Automatic contrast calculation and focus management
- **Context-Aware**: Automatic color adjustment based on background
- **Extensible Design**: Easy addition of custom themes and scopes
- **Performance Optimization**: Lazy evaluation and caching mechanisms
- **Build Tool Integration**: Complete integration with Plugboy

## Installation

```bash
npm install @fastkit/color-scheme
# or
pnpm add @fastkit/color-scheme

# If Vue.js integration is needed
npm install @fastkit/vue-color-scheme
```

## Basic Usage

### Creating a Simple Color Scheme

```typescript
import { createColorScheme } from '@fastkit/color-scheme';

const colorScheme = createColorScheme({
  // Color variant definitions
  variants: ['contained', 'outlined', 'inverted', 'plain'],

  // Optional color definitions
  optionals: ['light', 'deep', 'text', 'border', 'focus'],

  // Theme definitions
  themes: [
    {
      name: 'light',
      palette: [
        ['primary', '#1976d2'],
        ['secondary', '#424242'],
        ['success', '#4caf50'],
        ['warning', '#ff9800'],
        ['error', '#f44336'],
        ['background', '#ffffff'],
        ['surface', '#f5f5f5']
      ],
      scopes: [
        ['primary', ({ palette }) => palette('primary')],
        ['secondary', ({ palette }) => palette('secondary')],
        ['success', ({ palette }) => palette('success')]
      ]
    },
    {
      name: 'dark',
      palette: [
        ['primary', '#42a5f5'],
        ['secondary', '#616161'],
        ['background', '#121212'],
        ['surface', '#1e1e1e']
      ],
      // Undefined scopes inherit from light theme
    }
  ]
});
```

### Using with Vue.js

```vue
<template>
  <div :class="themeClass">
    <!-- Primary color button -->
    <button :class="primaryClasses.contained">
      Primary Button
    </button>

    <!-- Secondary color outline button -->
    <button :class="secondaryClasses.outlined">
      Secondary Button
    </button>

    <!-- Theme toggle button -->
    <button @click="toggleTheme">
      Switch to {{ currentTheme === 'dark' ? 'Light' : 'Dark' }} theme
    </button>
  </div>
</template>

<script setup lang="ts">
import { useColorScheme, useColorClasses, useThemeClass } from '@fastkit/vue-color-scheme';

// Color scheme service
const colorScheme = useColorScheme();

// Theme class management
const { themeClass, currentTheme, toggleTheme } = useThemeClass();

// Color class generation
const primaryClasses = useColorClasses('primary');
const secondaryClasses = useColorClasses('secondary');
</script>
```

## Color Scheme Definition

### Palette Definition

```typescript
// Static color definition
palette: [
  ['primary', '#1976d2'],
  ['secondary', '#424242']
]

// Dynamic color definition
palette: [
  ['primary', '#1976d2'],
  ['primaryLight', ({ palette }) => palette('primary').lighten(0.2)],
  ['primaryDark', ({ palette }) => palette('primary').darken(0.2)],
  ['onPrimary', ({ palette }) => {
    // Automatically select text color based on background brightness
    const bg = palette('primary');
    return bg.brightness() > 0.5 ? '#000000' : '#ffffff';
  }]
]
```

### Scope Definition

```typescript
scopes: [
  // Basic scope
  ['primary', ({ palette }) => palette('primary')],

  // Context-aware scope
  ['error', ({ palette, theme }) => {
    const base = palette('error');
    // Adjust slightly brighter in dark theme
    return theme.isDark ? base.lighten(0.1) : base;
  }],

  // Conditional scope
  ['accent', ({ palette, theme }) => {
    return theme.name === 'dark' ? palette('secondary') : palette('primary');
  }]
]
```

### Scope Defaults

```typescript
scopeDefaults: ({ palette, theme }) => ({
  // Automatic default scope generation
  default: [
    'transparent',
    {
      text: theme.isDark ? '#ffffff' : '#000000',
      border: theme.isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)',
      focus: palette('primary').alpha(0.12),
      focusShadow: palette('primary').alpha(0.3)
    }
  ],

  // Automatic variation generation for each color
  primary: [
    ({ palette }) => palette('primary'),
    {
      light: ({ main }) => main.alpha(0.04),
      deep: ({ main }) => main.alpha(0.1),
      text: ({ main }) => main.brightness() > 0.6 ? '#000000' : '#ffffff',
      border: ({ main }) => main.alpha(0.5),
      focus: ({ main }) => main.darken(0.07),
      focusShadow: ({ main }) => main.alpha(0.5)
    }
  ]
})
```

## Theme Management

### Automatic Light/Dark Detection

```typescript
const scheme = createColorScheme({
  themes: [
    {
      name: 'light',
      // Automatically detected as light theme with brightness >= 0.5
      palette: [['background', '#ffffff']]
    },
    {
      name: 'dark',
      // Automatically detected as dark theme with brightness < 0.5
      palette: [['background', '#121212']]
    }
  ]
});

// Get theme detection results
console.log(scheme.theme('light').isLight); // true
console.log(scheme.theme('dark').isDark);   // true
```

### Dynamic Theme Switching

```typescript
// Vue.js composable usage example
const {
  currentTheme,     // Current theme name
  setTheme,         // Theme setting
  toggleTheme,      // Theme switching
  isDark,          // Whether it's dark theme
  isLight          // Whether it's light theme
} = useThemeClass();

// Programmatic theme switching
setTheme('dark');

// Follow system settings
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
setTheme(prefersDark.matches ? 'dark' : 'light');

// Monitor automatic switching
prefersDark.addEventListener('change', (e) => {
  setTheme(e.matches ? 'dark' : 'light');
});
```

## Color Variants

### Built-in Variants

```typescript
const variants = ['contained', 'outlined', 'inverted', 'plain'];

// CSS class examples:
// - primary-contained: Filled style
// - primary-outlined: Outline style
// - primary-inverted: Inverted style
// - primary-plain: Plain style
```

### Custom Variant Definition

```typescript
const colorScheme = createColorScheme({
  variants: ['contained', 'outlined', 'inverted', 'plain', 'gradient', 'shadow'],

  // CSS definitions for custom variants need to be provided separately
  themes: [/* ... */]
});
```

## Advanced Usage Examples

### Responsive Color System

```typescript
const responsiveColorScheme = createColorScheme({
  variants: ['contained', 'outlined', 'text'],
  optionals: ['light', 'deep', 'hover', 'active', 'disabled'],

  themes: [
    {
      name: 'light',
      palette: [
        ['primary', '#1976d2'],
        ['secondary', '#424242'],
        ['background', '#ffffff'],
        ['surface', '#f5f5f5'],

        // Responsive support
        ['mobile-primary', ({ palette }) => palette('primary').saturate(0.1)],
        ['tablet-primary', ({ palette }) => palette('primary')],
        ['desktop-primary', ({ palette }) => palette('primary').desaturate(0.05)]
      ],

      scopes: [
        ['primary', ({ palette }) => {
          // Color selection based on media queries
          const isMobile = window.innerWidth < 768;
          const isTablet = window.innerWidth < 1024;

          if (isMobile) return palette('mobile-primary');
          if (isTablet) return palette('tablet-primary');
          return palette('desktop-primary');
        }]
      ]
    }
  ]
});
```

### Animation-Compatible Color System

```typescript
const animatedColorScheme = createColorScheme({
  variants: ['contained', 'outlined'],
  optionals: ['hover', 'active', 'focus', 'disabled'],

  themes: [
    {
      name: 'light',
      palette: [
        ['primary', '#1976d2'],
        ['primary-hover', ({ palette }) => palette('primary').lighten(0.08)],
        ['primary-active', ({ palette }) => palette('primary').darken(0.12)],
        ['primary-focus', ({ palette }) => palette('primary').alpha(0.12)],
        ['primary-disabled', ({ palette }) => palette('primary').alpha(0.38)]
      ],

      scopes: [
        ['primary', ({ palette }) => palette('primary')],
        ['primary-interactive', ({ palette }) => ({
          default: palette('primary'),
          hover: palette('primary-hover'),
          active: palette('primary-active'),
          focus: palette('primary-focus'),
          disabled: palette('primary-disabled')
        })]
      ]
    }
  ]
});
```

### Component Library Integration

```vue
<template>
  <div class="button-component" :class="buttonClasses">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useColorClasses } from '@fastkit/vue-color-scheme';

interface Props {
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  variant?: 'contained' | 'outlined' | 'text';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  color: 'primary',
  variant: 'contained',
  size: 'md',
  disabled: false
});

// Color class generation
const colorClasses = useColorClasses(props.color);

// Final class name calculation
const buttonClasses = computed(() => [
  'button',
  `button--${props.size}`,
  colorClasses[props.variant],
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

/* Use CSS variables from color scheme */
.button.primary-contained {
  background-color: var(--color-primary);
  color: var(--color-primary-text);
  border: 1px solid var(--color-primary);
}

.button.primary-contained:hover {
  background-color: var(--color-primary-deep);
}

.button.primary-outlined {
  background-color: transparent;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
}
</style>
```

## CSS Variables Integration

### Auto-generated CSS Variables

```css
:root.light-theme {
  /* Primary colors */
  --color-primary: #1976d2;
  --color-primary-light: rgba(25, 118, 210, 0.04);
  --color-primary-deep: rgba(25, 118, 210, 0.1);
  --color-primary-text: #ffffff;
  --color-primary-border: rgba(25, 118, 210, 0.5);
  --color-primary-focus: #1565c0;
  --color-primary-focus-shadow: rgba(25, 118, 210, 0.5);

  /* Secondary colors */
  --color-secondary: #424242;
  --color-secondary-light: rgba(66, 66, 66, 0.04);
  --color-secondary-deep: rgba(66, 66, 66, 0.1);
  --color-secondary-text: #ffffff;

  /* System colors */
  --color-background: #ffffff;
  --color-surface: #f5f5f5;
  --color-on-background: #000000;
  --color-on-surface: #000000;
}

:root.dark-theme {
  --color-primary: #42a5f5;
  --color-secondary: #616161;
  --color-background: #121212;
  --color-surface: #1e1e1e;
  --color-on-background: #ffffff;
  --color-on-surface: #ffffff;
}
```

### SCSS Integration

```scss
// _variables.scss (auto-generated)
$color-primary: var(--color-primary);
$color-primary-light: var(--color-primary-light);
$color-primary-deep: var(--color-primary-deep);

// Component styles
.my-component {
  background-color: $color-primary;
  color: $color-primary-text;

  &:hover {
    background-color: $color-primary-deep;
  }

  &:focus {
    box-shadow: 0 0 0 2px $color-primary-focus-shadow;
  }
}
```

## Plugboy Integration

### Plugin Configuration

```typescript
// plugboy.workspace.ts
import { defineWorkspaceConfig } from '@fastkit/plugboy';
import { colorSchemePlugin } from '@fastkit/color-scheme-gen';

export default defineWorkspaceConfig({
  entries: {
    '.': './src/index.ts'
  },
  plugins: [
    colorSchemePlugin({
      // Color scheme definition file
      input: './src/color-scheme.ts',
      // CSS output path
      output: './dist/colors.css',
      // SCSS variable output
      scssOutput: './src/styles/_colors.scss',
      // Additional settings
      generateCssVars: true,
      generateScssVars: true,
      minify: true
    })
  ]
});
```

### Build-time Color Generation

```typescript
// src/color-scheme.ts
import { createSimpleColorScheme } from '@fastkit/color-scheme-gen';

export const colorScheme = createSimpleColorScheme({
  themes: {
    light: {
      primary: '#1976d2',
      secondary: '#424242',
      success: '#4caf50',
      warning: '#ff9800',
      error: '#f44336',
      background: '#ffffff',
      surface: '#f5f5f5'
    },
    dark: {
      primary: '#42a5f5',
      secondary: '#616161',
      success: '#66bb6a',
      warning: '#ffa726',
      error: '#ef5350',
      background: '#121212',
      surface: '#1e1e1e'
    }
  }
});
```

## Accessibility Support

### Automatic Contrast Calculation

```typescript
const accessibleColorScheme = createColorScheme({
  themes: [
    {
      name: 'light',
      palette: [
        ['primary', '#1976d2'],
        // Automatically select text color based on background brightness
        ['primary-text', ({ palette }) => {
          const bg = palette('primary');
          const brightness = bg.brightness();

          // Ensure contrast based on WCAG AA standards
          if (brightness > 0.5) {
            return '#000000'; // Black text for bright backgrounds
          } else {
            return '#ffffff'; // White text for dark backgrounds
          }
        }]
      ]
    }
  ]
});
```

### Focus Management

```typescript
scopeDefaults: ({ palette, theme }) => ({
  primary: [
    ({ palette }) => palette('primary'),
    {
      // Ensure focus visibility
      focus: ({ main }) => main.darken(0.1),
      focusShadow: ({ main }) => main.alpha(0.3),

      // Keyboard navigation support
      focusVisible: ({ main }) => main.alpha(0.12),
      focusRing: ({ main }) => main.alpha(0.5)
    }
  ]
})
```

## Performance Optimization

### Lazy Evaluation

```typescript
// Color values are not calculated until needed
const lazyColor = ({ palette }) => palette('primary').lighten(0.2);

// Calculated only when accessed
const actualColor = scheme.scope('primary').light;
```

### Caching Mechanism

```typescript
// Once calculated values are cached
const cachedScheme = createColorScheme({
  cache: true, // Enable caching
  themes: [/* ... */]
});

// Re-access to same theme/scope is fast
const color1 = cachedScheme.scope('primary').main;
const color2 = cachedScheme.scope('primary').main; // Retrieved from cache
```

## Type Safety and Extension

### Module Extension

```typescript
// types/color-scheme.d.ts
declare module '@fastkit/color-scheme' {
  interface ThemeSettings {
    light: 'light';
    dark: 'dark';
    auto: 'auto';
  }

  interface PaletteSettings {
    primary: 'primary';
    secondary: 'secondary';
    tertiary: 'tertiary';
    success: 'success';
    warning: 'warning';
    error: 'error';
    info: 'info';
  }

  interface ScopeSettings {
    primary: 'primary';
    secondary: 'secondary';
    surface: 'surface';
    background: 'background';
  }

  interface VariantSettings {
    contained: 'contained';
    outlined: 'outlined';
    text: 'text';
    elevated: 'elevated';
  }
}
```

### Type-safe Color Access

```typescript
// Type-safe scheme access
const color: string = scheme.scope('primary').main; // ✓ Valid
const invalid = scheme.scope('invalid'); // ✗ TypeScript error

// Type-safe theme access
const lightTheme = scheme.theme('light'); // ✓ Valid
const invalidTheme = scheme.theme('invalid'); // ✗ TypeScript error
```

## Testing and Debugging

### Unit Test Examples

```typescript
import { describe, test, expect } from 'vitest';
import { createColorScheme } from '@fastkit/color-scheme';

describe('ColorScheme', () => {
  const scheme = createColorScheme({
    variants: ['contained', 'outlined'],
    themes: [
      {
        name: 'light',
        palette: [['primary', '#1976d2']],
        scopes: [['primary', ({ palette }) => palette('primary')]]
      }
    ]
  });

  test('theme access', () => {
    const theme = scheme.theme('light');
    expect(theme.name).toBe('light');
    expect(theme.isLight).toBe(true);
  });

  test('scope access', () => {
    const scope = scheme.scope('primary');
    expect(scope.main).toBe('#1976d2');
  });

  test('palette access', () => {
    const palette = scheme.theme('light').palette;
    expect(palette('primary')).toBe('#1976d2');
  });
});
```

### Debug Features

```typescript
// Enable debug mode
const debugScheme = createColorScheme({
  debug: true,
  themes: [/* ... */]
});

// Detailed color information output
console.log(debugScheme.debug.info());
// {
//   themes: ['light', 'dark'],
//   scopes: ['primary', 'secondary'],
//   variants: ['contained', 'outlined'],
//   optionals: ['light', 'deep', 'text']
// }
```

## Dependencies

```json
{
  "dependencies": {
    "@fastkit/color": "Color manipulation library",
    "@fastkit/tiny-logger": "Logging functionality"
  },
  "peerDependencies": {
    "vue": "^3.4.0"
  },
  "devDependencies": {
    "typescript": "^5.5.0",
    "vitest": "^1.0.0"
  }
}
```

## Documentation

For detailed documentation, please visit [here](https://dadajam4.github.io/fastkit/color-scheme/).

## License

MIT
