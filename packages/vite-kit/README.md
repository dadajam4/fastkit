
# @fastkit/vite-kit

🌐 English | [日本語](https://github.com/dadajam4/fastkit/blob/main/packages/vite-kit/README-ja.md)

A comprehensive toolkit collection for Vite application setup. Provides development efficiency plugins including color scheme generation, icon font creation, sprite image generation, and media query management.

## Features

- **Color Scheme Generation**: Automatic generation of CSS variables and TypeScript type definitions
- **Icon Font Creation**: Automatic web font generation from SVG files
- **Sprite Image Generation**: Image combining and CSS generation
- **Media Query Management**: Type-safe management for responsive design
- **Dynamic Source**: Dynamic source file processing
- **Hash Sync**: File hash management and cache control
- **Additional Styles**: Sass additional data management

## Installation

```bash
npm install @fastkit/vite-kit
```

## Color Scheme Plugin

### Basic Usage

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import { colorSchemeVitePlugin } from '@fastkit/vite-kit'

export default defineConfig({
  plugins: [
    colorSchemeVitePlugin({
      // Color scheme definition file
      src: 'src/styles/color-scheme.ts',

      // Output directory (defaults to .color-scheme)
      dest: '.color-scheme',

      // Callback on generation completion
      onBooted: () => {
        console.log('Color scheme generation completed')
      },

      // Callback on error
      onBootError: (err) => {
        console.error('Color scheme generation error:', err)
      }
    })
  ]
})
```

### Color Scheme Definition

```typescript
// src/styles/color-scheme.ts
import { defineColorScheme } from '@fastkit/color-scheme-gen'

export default defineColorScheme({
  // Basic color definitions
  colors: {
    primary: '#3b82f6',
    secondary: '#64748b',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',

    // Grayscale
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827'
    }
  },

  // Theme definitions
  themes: {
    light: {
      background: '$gray.50',
      surface: '#ffffff',
      text: '$gray.900'
    },
    dark: {
      background: '$gray.900',
      surface: '$gray.800',
      text: '$gray.50'
    }
  }
})
```

### Using Generated Styles

```scss
// Use as CSS variables
.button {
  background-color: var(--color-primary);
  color: var(--color-primary-contrast);
}

// Theme switching
[data-theme="dark"] {
  background-color: var(--theme-background);
  color: var(--theme-text);
}
```

```typescript
// Use as TypeScript type definitions
import { colors, themes } from '.color-scheme'

// Type-safe color references
const primaryColor: string = colors.primary
const darkTheme = themes.dark
```

## Icon Font Plugin

### Basic Usage

```typescript
// vite.config.ts
import { iconFontVitePlugin } from '@fastkit/vite-kit'

export default defineConfig({
  plugins: [
    iconFontVitePlugin({
      // SVG icons directory
      src: 'src/assets/icons',

      // Output directory
      dest: 'public/fonts',

      // Font name
      fontName: 'MyIcons',

      // CSS output path
      cssPath: 'src/styles/icons.css',

      // TypeScript type definitions output path
      typesPath: 'src/types/icons.ts',

      // Callback on generation completion
      onBooted: () => {
        console.log('Icon font generation completed')
      }
    })
  ]
})
```

### Using Icons

```html
<!-- Use as CSS classes -->
<i class="icon icon-home"></i>
<i class="icon icon-user"></i>
<i class="icon icon-settings"></i>
```

```scss
// Use in SCSS
.button {
  &::before {
    @include icon('chevron-right');
  }
}
```

```typescript
// Type-safe usage in TypeScript
import { IconName } from './types/icons'

const iconName: IconName = 'home' // Type completion works
```

## Sprite Images Plugin

### Basic Usage

```typescript
// vite.config.ts
import { spriteImagesVitePlugin } from '@fastkit/vite-kit'

export default defineConfig({
  plugins: [
    spriteImagesVitePlugin({
      // Images directory
      src: 'src/assets/sprites',

      // Output directory
      dest: 'public/images',

      // Sprite configuration
      sprites: [
        {
          name: 'icons',
          src: 'src/assets/sprites/icons/*.png',
          dest: 'public/images/icons.png',
          cssPath: 'src/styles/sprites.css'
        }
      ],

      // Optimization options
      optimization: {
        algorithm: 'binary-tree',
        padding: 2,
        sort: true
      },

      onBooted: () => {
        console.log('Sprite images generation completed')
      }
    })
  ]
})
```

### Using Generated Sprites

```scss
// Auto-generated CSS
.sprite {
  background-image: url('/images/icons.png');
  background-repeat: no-repeat;
}

.sprite-home {
  @extend .sprite;
  background-position: -0px -0px;
  width: 24px;
  height: 24px;
}

.sprite-user {
  @extend .sprite;
  background-position: -24px -0px;
  width: 24px;
  height: 24px;
}
```

## Media Match Plugin

### Basic Usage

```typescript
// vite.config.ts
import { mediaMatchVitePlugin } from '@fastkit/vite-kit'

export default defineConfig({
  plugins: [
    mediaMatchVitePlugin({
      // Breakpoint definitions
      breakpoints: {
        xs: 480,
        sm: 640,
        md: 768,
        lg: 1024,
        xl: 1280,
        '2xl': 1536
      },

      // CSS variables output path
      cssPath: 'src/styles/media.css',

      // TypeScript type definitions output path
      typesPath: 'src/types/media.ts',

      onBooted: () => {
        console.log('Media query generation completed')
      }
    })
  ]
})
```

### Using Media Queries

```scss
// Generated CSS variables
:root {
  --breakpoint-xs: 480px;
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
}

// Usage example
.container {
  width: 100%;

  @media (min-width: var(--breakpoint-md)) {
    max-width: 768px;
  }

  @media (min-width: var(--breakpoint-lg)) {
    max-width: 1024px;
  }
}
```

```typescript
// Usage in TypeScript
import { breakpoints, mediaQueries } from './types/media'

// Type-safe breakpoint references
const lgBreakpoint = breakpoints.lg // 1024

// Media query string generation
const lgAndUp = mediaQueries.lgAndUp // '(min-width: 1024px)'
```

## Hash Sync Plugin

### Basic Usage

```typescript
// vite.config.ts
import { hashedSyncVitePlugin } from '@fastkit/vite-kit'

export default defineConfig({
  plugins: [
    hashedSyncVitePlugin({
      // Target files to watch
      files: [
        'src/assets/**/*',
        'public/**/*'
      ],

      // Hash file output path
      hashFile: '.hashed-sync.json',

      // Exclude patterns
      exclude: [
        '**/*.tmp',
        '**/.DS_Store'
      ],

      onBooted: () => {
        console.log('Hash sync completed')
      }
    })
  ]
})
```

### Utilizing Hash Files

```typescript
// Load hash information
import hashInfo from './.hashed-sync.json'

// Use as cache buster
const assetUrl = `/assets/image.png?v=${hashInfo.files['src/assets/image.png']}`

// File change detection
const hasChanged = hashInfo.lastUpdate > previousUpdate
```

## Additional Styles Plugin

### Basic Usage

```typescript
// vite.config.ts
import { styleAdditionalVitePlugin } from '@fastkit/vite-kit'

export default defineConfig({
  plugins: [
    styleAdditionalVitePlugin({
      // Additional Sass data to include
      additionalData: [
        '@import "src/styles/variables.scss";',
        '@import "src/styles/mixins.scss";'
      ],

      // Dynamic additional data
      dynamicAdditionalData: () => {
        const timestamp = Date.now()
        return `$build-timestamp: ${timestamp};`
      }
    })
  ]
})
```

## Dynamic Source Plugin

### Basic Usage

```typescript
// vite.config.ts
import { dynamicSrcVitePlugin } from '@fastkit/vite-kit'

export default defineConfig({
  plugins: [
    dynamicSrcVitePlugin({
      // Pattern matching
      patterns: [
        {
          match: /\.env\.ts$/,
          transform: (code, id) => {
            // Environment variable injection
            return code.replace(
              'process.env.NODE_ENV',
              JSON.stringify(process.env.NODE_ENV)
            )
          }
        }
      ],

      onBooted: () => {
        console.log('Dynamic source processing completed')
      }
    })
  ]
})
```

## Combining Multiple Plugins

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import {
  colorSchemeVitePlugin,
  iconFontVitePlugin,
  spriteImagesVitePlugin,
  mediaMatchVitePlugin
} from '@fastkit/vite-kit'

export default defineConfig({
  plugins: [
    // Color scheme
    colorSchemeVitePlugin({
      src: 'src/styles/color-scheme.ts'
    }),

    // Icon font
    iconFontVitePlugin({
      src: 'src/assets/icons',
      dest: 'public/fonts',
      fontName: 'AppIcons'
    }),

    // Sprite images
    spriteImagesVitePlugin({
      sprites: [
        {
          name: 'ui-icons',
          src: 'src/assets/sprites/ui/*.png',
          dest: 'public/images/ui-sprites.png'
        }
      ]
    }),

    // Media queries
    mediaMatchVitePlugin({
      breakpoints: {
        mobile: 768,
        tablet: 1024,
        desktop: 1280
      }
    })
  ]
})
```

## Performance Optimization

### Development Optimization

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [
    colorSchemeVitePlugin({
      src: 'src/styles/color-scheme.ts',
      // Enable cache during development
      cache: process.env.NODE_ENV === 'development'
    }),

    iconFontVitePlugin({
      src: 'src/assets/icons',
      // Enable change watching during development
      watch: process.env.NODE_ENV === 'development'
    })
  ]
})
```

### Production Build Optimization

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [
    spriteImagesVitePlugin({
      sprites: [{
        name: 'icons',
        src: 'src/assets/sprites/*.png',
        // Enable optimization in production
        optimization: {
          algorithm: 'binary-tree',
          padding: 1,
          sort: true,
          // PNG optimization
          pngquant: process.env.NODE_ENV === 'production'
        }
      }]
    })
  ]
})
```

## API Reference

### colorSchemeVitePlugin

```typescript
interface ColorSchemeVitePluginOptions {
  src: string
  dest?: string
  onBooted?: () => any | Promise<any>
  onBootError?: (err: unknown) => any
}
```

### iconFontVitePlugin

```typescript
interface IconFontVitePlugin extends IconFontOptions {
  onBooted?: () => any | Promise<any>
  onBootError?: (err: unknown) => any | Promise<any>
}
```

### spriteImagesVitePlugin

```typescript
interface SpriteImagesVitePluginOptions extends SpriteImagesOptions {
  onBooted?: () => any | Promise<any>
  onBootError?: (err: unknown) => any | Promise<any>
}
```

### mediaMatchVitePlugin

```typescript
interface MediaMatchVitePluginOptions {
  breakpoints: Record<string, number>
  cssPath?: string
  typesPath?: string
  onBooted?: () => any | Promise<any>
  onBootError?: (err: unknown) => any
}
```

## CLI Integration

### package.json Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "generate:colors": "color-scheme-gen src/styles/color-scheme.ts",
    "generate:icons": "icon-font-gen src/assets/icons",
    "generate:sprites": "sprite-images-gen src/assets/sprites"
  }
}
```

### Auto-generation Monitoring

```bash
# Auto-generation and monitoring when starting dev server
npm run dev

# Individual generation
npm run generate:colors
npm run generate:icons
npm run generate:sprites
```

## Troubleshooting

### Common Issues

1. **File not found**: Check if the `src` path is correct
2. **Permission errors**: Check write permissions for output directories
3. **Out of memory**: Increase Node.js memory limit when processing large amounts of files

### Debugging Methods

```typescript
// Enable debug logging
colorSchemeVitePlugin({
  src: 'src/styles/color-scheme.ts',
  onBooted: () => console.log('✓ Color scheme generation completed'),
  onBootError: (err) => console.error('✗ Error:', err)
})
```

## Related Packages

- `@fastkit/color-scheme-gen` - Color scheme generator
- `@fastkit/icon-font-gen` - Icon font generator
- `@fastkit/sprite-images` - Sprite image generator
- `@fastkit/media-match-gen` - Media query generator
- `@fastkit/hashed-sync` - File hash management
- `@fastkit/helpers` - Helper functions
- `@fastkit/tiny-logger` - Logger
- `vite` - Build tool (peer dependency)

## License

MIT
