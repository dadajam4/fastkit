
# @fastkit/plugboy

🌐 English | [日本語](https://github.com/dadajam4/fastkit/blob/main/packages/plugboy/README-ja.md)

A monorepo-compatible module bundler and project management tool. Provides a high-speed build system based on tsdown, and other tools.

## Features

- **High-Speed Build**: Ultra-fast bundling based on tsdown
- **Monorepo Support**: Integrated management of multi-package projects
- **Full TypeScript Support**: Automatic type definition generation and optimization
- **Plugin System**: Extensible architecture
- **CSS Integration**: Sass, Vanilla Extract, and CSS optimization support
- **Development Efficiency**: Fast development cycle with stub functionality
- **Automation**: Automatic generation of package.json and exports

## Installation

```bash
npm install @fastkit/plugboy
# or
pnpm add @fastkit/plugboy
```

## Basic Usage

### CLI Commands

```bash
# Build entire project
plugboy build

# Generate development stub (fast development)
plugboy stub

# Sync package.json settings
plugboy json

# Delete distribution
plugboy clean

# Generate new workspace
plugboy generate [workspaceName]
# or
plugboy gen [workspaceName]
```

### Workspace Configuration

**`plugboy.workspace.ts`**:

```typescript
import { defineWorkspaceConfig } from '@fastkit/plugboy';

export default defineWorkspaceConfig({
  entries: {
    '.': './src/index.ts',
    './utils': './src/utils.ts'
  },
  plugins: [
    // Plugin configuration
  ],
  dts: {
    // TypeScript type definition configuration
  },
  optimizeCSS: true
});
```

### Project Configuration

**`plugboy.project.ts`**:

```typescript
import { defineProjectConfig } from '@fastkit/plugboy';

export default defineProjectConfig({
  workspacesDir: 'packages',
  peerDependencies: {
    'vue': '^3.5.0'
  },
  scripts: [
    {
      name: 'TypeScript',
      scripts: {
        build: 'plugboy build',
        stub: 'plugboy stub',
        typecheck: 'tsc --noEmit'
      }
    }
  ]
});
```

## API

### defineWorkspaceConfig

#### Entry Point Configuration

```typescript
export default defineWorkspaceConfig({
  entries: {
    '.': './src/index.ts',              // Main entry
    './components': './src/components.ts', // Sub entry
    './styles': {                        // Entry with CSS
      src: './src/styles.ts',
      css: true
    }
  }
});
```

#### Plugin Configuration

```typescript
import { createSassPlugin } from '@fastkit/plugboy-sass-plugin';
import { createVueJSXPlugin } from '@fastkit/plugboy-vue-jsx-plugin';

export default defineWorkspaceConfig({
  plugins: [
    createSassPlugin(),
    createVueJSXPlugin()
  ]
});
```

#### TypeScript Type Definition Configuration

```typescript
export default defineWorkspaceConfig({
  dts: {
    preserveType: [
      // Custom type preservation configuration
    ],
    normalizers: [
      // Type definition normalization functions
      (dts) => dts.replace(/unwanted-pattern/g, '')
    ]
  }
});
```

### defineProjectConfig

#### Workspace Management

```typescript
export default defineProjectConfig({
  workspacesDir: 'packages',
  peerDependencies: {
    'react': '^18.0.0',
    'vue': '^3.5.0'
  }
});
```

#### Script Templates

```typescript
export default defineProjectConfig({
  scripts: [
    {
      name: 'TypeScript',
      scripts: {
        build: 'plugboy build',
        clean: 'rm -rf dist',
        typecheck: 'tsc --noEmit'
      }
    },
    {
      name: 'TypeScript with CSS',
      scripts: {
        build: 'plugboy build',
        lint: 'eslint . && stylelint "**/*.css"'
      }
    }
  ]
});
```

## Plugin System

### Built-in Plugins

- **@fastkit/plugboy-sass-plugin**: Sass/SCSS support
- **@fastkit/plugboy-vanilla-extract-plugin**: Vanilla Extract support
- **@fastkit/plugboy-vue-jsx-plugin**: Vue JSX support

### Custom Plugins

```typescript
import type { Plugin } from '@fastkit/plugboy';

const customPlugin = (): Plugin => ({
  name: 'custom-plugin',
  setup(workspace) {
    // Plugin initialization
    workspace.hooks.buildStart?.tap('custom-plugin', () => {
      console.log('Build started');
    });
  }
});

export default defineWorkspaceConfig({
  plugins: [customPlugin()]
});
```

## Development Workflow

### Fast Development Cycle

```bash
# 1. Initial build
pnpm build

# 2. Development mode (fast)
pnpm stub

# 3. Start development server
pnpm dev
```

### Monorepo Management

```bash
# Create new package
plugboy gen my-new-package

# Build entire project
plugboy build

# Specific package only
cd packages/my-package
plugboy build
```

## Configuration Examples

### CSS Integration Project

```typescript
// plugboy.workspace.ts
import { defineWorkspaceConfig } from '@fastkit/plugboy';
import { createSassPlugin } from '@fastkit/plugboy-sass-plugin';

export default defineWorkspaceConfig({
  entries: {
    '.': {
      src: './src/index.ts',
      css: true
    }
  },
  plugins: [
    createSassPlugin()
  ],
  optimizeCSS: {
    combineRules: {
      rules: [':root']
    }
  }
});
```

### Vue.js Project

```typescript
// plugboy.workspace.ts
import { defineWorkspaceConfig } from '@fastkit/plugboy';
import { createVueJSXPlugin } from '@fastkit/plugboy-vue-jsx-plugin';
import { createSassPlugin } from '@fastkit/plugboy-sass-plugin';

export default defineWorkspaceConfig({
  entries: {
    '.': './src/index.ts'
  },
  plugins: [
    createVueJSXPlugin(),
    createSassPlugin()
  ],
  external: ['vue']
});
```

## Hook System

### Build Hooks

```typescript
export default defineWorkspaceConfig({
  hooks: {
    buildStart: () => {
      console.log('Build starting...');
    },
    buildEnd: (result) => {
      console.log('Build completed:', result);
    },
    buildError: (error) => {
      console.error('Build failed:', error);
    }
  }
});
```

## Type Definition Management

### Automatic Type Definition Generation

```typescript
export default defineWorkspaceConfig({
  dts: {
    preserveType: [
      // Preserve external package types
      'external-package-types'
    ],
    normalizers: [
      // Normalization and optimization of type definitions
      (dts) => dts
        .replace(/unnecessary-types/g, '')
        .replace(/import\("complex-path"\)/g, 'SimpleType')
    ]
  }
});
```

## Performance Optimization

### Build Optimization

- **Parallel Processing**: Simultaneous building of multiple entries
- **Incremental**: Rebuild only changed parts
- **Cache**: Utilize cached build results
- **Tree Shaking**: Remove unused code

### Development Optimization

- **Stub Mode**: Symbolic links to actual files
- **Hot Reload**: Immediate reflection of file changes
- **TypeScript**: Fast type checking

## Dependencies

### Main Dependencies

- `esbuild`: High-speed JavaScript builder
- `tsdown`: TypeScript build tool
- `cac`: CLI creation library
- `glob`: File matching
- `cssnano`: CSS optimization

## License

MIT
