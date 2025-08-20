
# @fastkit/color-scheme-gen

🌐 English | [日本語](https://github.com/dadajam4/fastkit/blob/main/packages/color-scheme-gen/README-ja.md)

A generator for automatically creating files in various formats (JSON, TypeScript, SCSS) from color scheme definitions. With hot reload support during development, color scheme changes can be immediately reflected in applications.

## Features

- **Automatic File Generation**: Generate files in multiple formats from color scheme definitions
- **Hot Reload Support**: Automatic regeneration and cache management on file changes
- **Template Engine**: Flexible customization using Eta template engine
- **SCSS Support**: Automatic generation of CSS variables and variant classes
- **TypeScript Type Generation**: Automatic generation of type-safe color definitions
- **Built-in Variants**: Standard variants like light, deep, text, border, focus
- **Custom Variants**: Project-specific variant definitions
- **Dependency Tracking**: File change detection and incremental builds

## Installation

```bash
npm install @fastkit/color-scheme-gen
```

## Basic Usage

### Creating Color Scheme Definition Files

```typescript
// color-scheme.ts
import { ColorScheme } from '@fastkit/color-scheme'
import { scopeResolvers } from '@fastkit/color-scheme-gen'

export default ColorScheme({
  colors: {
    primary: '#2196F3',
    secondary: '#FF5722',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#00BCD4'
  },
  themes: {
    light: {
      background: '#FFFFFF',
      surface: '#F5F5F5',
      onSurface: '#212121'
    },
    dark: {
      background: '#121212',
      surface: '#1E1E1E',
      onSurface: '#FFFFFF'
    }
  },
  resolvers: scopeResolvers({
    lightText: '#FFFFFF',
    darkText: '#000000',
    scopeInvertThreshold: 0.6
  })
})
```

### Running the Generator

```typescript
import { LoadColorSchemeRunner } from '@fastkit/color-scheme-gen'

const runner = new LoadColorSchemeRunner({
  entry: './color-scheme.ts',
  dest: './generated',
  watch: true // Set to true during development
})

runner.on('load', (result) => {
  console.log('Generated files:')
  console.log('- JSON:', result.data.cachePaths.json)
  console.log('- TypeScript:', result.data.cachePaths.info)
  console.log('- SCSS:', result.data.cachePaths.scss)
})

await runner.run()
```

## Advanced Usage Examples

### Defining Custom Variants

```typescript
// advanced-color-scheme.ts
import { ColorScheme, createColorScope } from '@fastkit/color-scheme'
import { scopeResolvers } from '@fastkit/color-scheme-gen'

export default ColorScheme({
  colors: {
    primary: createColorScope('#2196F3', {
      variants: ['filled', 'outlined', 'text', 'gradient']
    }),
    secondary: createColorScope('#FF5722', {
      variants: ['filled', 'outlined', 'text']
    })
  },
  themes: {
    light: {
      background: '#FFFFFF',
      surface: '#F8F9FA',
      surfaceVariant: '#E3F2FD'
    },
    dark: {
      background: '#0D1117',
      surface: '#161B22',
      surfaceVariant: '#21262D'
    }
  },
  variantSources: [
    {
      name: 'gradient',
      from: 'filled',
      scss: (scope) => `
        background: linear-gradient(135deg, ${scope.scheme.main} 0%, ${scope.scheme.main.lighten(0.2)} 100%);
        border: none;
        color: ${scope.scheme.text};

        &:hover {
          background: linear-gradient(135deg, ${scope.scheme.focus} 0%, ${scope.scheme.focus.lighten(0.2)} 100%);
        }

        &:active {
          background: linear-gradient(135deg, ${scope.scheme.active} 0%, ${scope.scheme.active.lighten(0.2)} 100%);
        }
      `
    },
    {
      name: 'glass',
      scss: (scope) => `
        background: ${scope.scheme.main.alpha(0.1)};
        backdrop-filter: blur(10px);
        border: 1px solid ${scope.scheme.main.alpha(0.2)};
        color: ${scope.scheme.main};

        &:hover {
          background: ${scope.scheme.main.alpha(0.15)};
          border-color: ${scope.scheme.main.alpha(0.3)};
        }
      `
    }
  ],
  resolvers: scopeResolvers({
    lightText: '#FFFFFF',
    darkText: '#1A1A1A',
    overrides: {
      // Custom resolvers
      glass: ({ main }) => main.alpha(0.1),
      glassBorder: ({ main }) => main.alpha(0.2)
    }
  })
})
```

### Integration with Vite Plugin

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import { LoadColorSchemeRunner } from '@fastkit/color-scheme-gen'

export default defineConfig({
  plugins: [
    {
      name: 'color-scheme-gen',
      configureServer(server) {
        const runner = new LoadColorSchemeRunner({
          entry: './src/theme/color-scheme.ts',
          dest: './src/theme/generated',
          watch: true
        })

        runner.on('load', () => {
          server.ws.send({
            type: 'full-reload'
          })
        })

        runner.run()
      }
    }
  ]
})
```

## Generated Files

### JSON Output Example

```json
{
  "colors": {
    "primary": {
      "main": "#2196F3",
      "light": "#2196F30A",
      "deep": "#2196F31A",
      "text": "#FFFFFF",
      "focus": "#1976D2",
      "active": "#1565C0"
    }
  },
  "themes": {
    "light": {
      "background": "#FFFFFF",
      "surface": "#F5F5F5"
    },
    "dark": {
      "background": "#121212",
      "surface": "#1E1E1E"
    }
  }
}
```

### TypeScript Type Definition Output Example

```typescript
// generated/color-scheme.info.ts
export interface ColorSchemeColors {
  primary: ColorScopeInfo
  secondary: ColorScopeInfo
  success: ColorScopeInfo
  warning: ColorScopeInfo
  error: ColorScopeInfo
}

export interface ColorScopeInfo {
  main: string
  light: string
  deep: string
  text: string
  focus: string
  active: string
}

export interface ColorSchemeThemes {
  light: LightTheme
  dark: DarkTheme
}

export interface LightTheme {
  background: string
  surface: string
  onSurface: string
}

export interface DarkTheme {
  background: string
  surface: string
  onSurface: string
}
```

### SCSS Output Example

```scss
// generated/color-scheme.scss
:root {
  --color-primary: #2196F3;
  --color-primary-light: #2196F30A;
  --color-primary-deep: #2196F31A;
  --color-primary-text: #FFFFFF;
  --color-primary-focus: #1976D2;
  --color-primary-active: #1565C0;

  --theme-background: #FFFFFF;
  --theme-surface: #F5F5F5;
  --theme-on-surface: #212121;
}

[data-theme="dark"] {
  --theme-background: #121212;
  --theme-surface: #1E1E1E;
  --theme-on-surface: #FFFFFF;
}

// Variant classes
.color-primary-filled {
  background-color: var(--color-primary);
  color: var(--color-primary-text);
  border: none;

  &:hover {
    background-color: var(--color-primary-focus);
  }

  &:active {
    background-color: var(--color-primary-active);
  }
}

.color-primary-outlined {
  background-color: transparent;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);

  &:hover {
    background-color: var(--color-primary-light);
    border-color: var(--color-primary-focus);
  }
}

.color-primary-text {
  background-color: transparent;
  color: var(--color-primary);
  border: none;

  &:hover {
    background-color: var(--color-primary-light);
  }
}

.color-primary-gradient {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  border: none;
  color: var(--color-primary-text);

  &:hover {
    background: linear-gradient(135deg, var(--color-primary-focus) 0%, var(--color-primary-deep) 100%);
  }
}
```

## Built-in Resolvers

### scopeResolvers

```typescript
import { scopeResolvers } from '@fastkit/color-scheme-gen'

const resolvers = scopeResolvers({
  // Text color for light theme
  lightText: '#FFFFFF',

  // Text color for dark theme
  darkText: '#000000',

  // Brightness threshold for theme inversion (0-1)
  scopeInvertThreshold: 0.6,

  // Override with custom resolvers
  overrides: {
    light: ({ main }) => main.alpha(0.08),
    deep: ({ main }) => main.alpha(0.16),
    custom: ({ main, theme }) => {
      return theme.isLight ? main.lighten(0.1) : main.darken(0.1)
    }
  }
})
```

### Available Resolver Keys

```typescript
// Basic variants
- light: Light background color (usually main color with low opacity)
- deep: Deep background color (usually main color with medium opacity)
- text: Text color (automatically selected based on brightness)
- border: Border color

// Interaction states
- focus: Focus state color
- focusBorder: Focus state border color
- focusText: Focus state text color
- focusShadow: Focus state shadow color
- active: Active state color
- activeBorder: Active state border color
- activeText: Active state text color

// Special variants
- outlineText: Outline style text color
- outlineBorder: Outline style border color
- invert: Inverted color
- focusInvert: Focus state inverted color
- activeInvert: Active state inverted color
- nav: Navigation color
- navActive: Active navigation color
- caption: Caption color
- pin: Pin color
```

## Template Customization

### Creating Custom Templates

```typescript
// Custom generator
import { LoadColorSchemeRunner } from '@fastkit/color-scheme-gen'
import { Eta } from 'eta'
import fs from 'fs-extra'

class CustomColorSchemeGenerator extends LoadColorSchemeRunner {
  async generateCustomFile(scheme: ColorScheme) {
    const template = `
// Generated CSS-in-JS theme
export const theme = {
  colors: {
    <% it.scheme.colors.forEach(color => { %>
    <%= color.name %>: {
      main: '<%= color.main %>',
      variants: {
        <% color.variants.forEach(variant => { %>
        <%= variant %>: '<%= color[variant] %>',
        <% }) %>
      }
    },
    <% }) %>
  },
  breakpoints: {
    xs: '0px',
    sm: '600px',
    md: '960px',
    lg: '1280px',
    xl: '1920px'
  }
}
    `

    const eta = new Eta()
    const result = await eta.renderStringAsync(template, { scheme })

    await fs.writeFile('./theme.js', result)
  }
}
```

## Performance Optimization

### Cache Strategy

```typescript
// Efficient cache management
const runner = new LoadColorSchemeRunner({
  entry: './color-scheme.ts',
  dest: './cache',
  watch: process.env.NODE_ENV === 'development'
})

// Regenerate only on dependency changes
runner.on('load', (result) => {
  if (result.dependencies.length > 0) {
    console.log('Dependencies changed:', result.dependencies)
  }
})
```

### Incremental Build

```typescript
// Process only changed files
import { watch } from 'chokidar'

const watcher = watch('./src/theme/**/*.ts')
watcher.on('change', async (filePath) => {
  if (filePath.includes('color-scheme')) {
    await runner.run()
  }
})
```

## API Reference

### LoadColorSchemeRunner

```typescript
class LoadColorSchemeRunner extends EV<LoadColorSchemeRunnerEventMap> {
  constructor(opts: LoadColorSchemeRunnerOptions)

  // Methods
  run(): Promise<void>

  // Events
  on('load', (result: ESbuildRequireResult<LoadColorSchemeRunnerLoadResult>) => void)
}

interface LoadColorSchemeRunnerOptions {
  entry: string      // Path to color scheme definition file
  dest: string       // Output directory
  watch?: boolean    // Enable/disable file watching
}

interface LoadColorSchemeRunnerLoadResult {
  cachePaths: {
    json: string     // JSON output file path
    info: string     // TypeScript type definition file path
    scss: string     // SCSS file path
  }
}
```

### scopeResolvers

```typescript
function scopeResolvers(opts?: {
  lightText?: ColorSource | ColorScopeResolver
  darkText?: ColorSource | ColorScopeResolver
  scopeInvertThreshold?: number
  overrides?: ColorScopeResolvers
}): ColorScopeResolvers
```

### Template Scope

```typescript
interface TemplateScope {
  scheme: ColorScheme
  scssValues: Record<string, string>

  // Helper functions
  list(source: string[], divider?: string): string
  builtinVariantScss(variant: BuiltinColorVariant, selector?: string): Promise<string>
  variantScss(variant: string): Promise<string>
  allVariantsScss(): Promise<string>
}
```

## Related Packages

- `@fastkit/color-scheme` - Color scheme definition system
- `@fastkit/color` - Color manipulation library
- `@fastkit/node-util` - Node.js development utilities
- `@fastkit/tiny-logger` - Logging system
- `eta` - Template engine (external dependency)
- `fs-extra` - File system operations (external dependency)

## License

MIT
