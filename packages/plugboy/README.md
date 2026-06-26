
# @fastkit/plugboy

🌐 English | [日本語](https://github.com/dadajam4/fastkit/blob/main/packages/plugboy/README-ja.md)

A monorepo-compatible module bundler and project management tool. Provides a high-speed build system based on tsdown, and other tools.

> **Upgrading from v0.x?** See the [v1 migration guide](./docs/migrations/v1.md) (tsdown migration).

## Features

- **High-Speed Build**: Ultra-fast bundling based on tsdown
- **Monorepo Support**: Integrated management of multi-package projects
- **Full TypeScript Support**: Automatic type definition generation and optimization
- **Plugin System**: Extensible architecture
- **CSS Integration**: Sass, Vanilla Extract, and CSS optimization support
- **Development Efficiency**: Fast development cycle with stub functionality
- **Automation**: Automatic generation of package.json and exports
- **Env Constants**: `__PLUGBOY_DEV__` / `__PLUGBOY_STUB__` for guarding dev-only code ([docs](./docs/env-constants.md))

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

A plugin extends a tsdown (Rollup-compatible) plugin with an additional `hooks` field for plugboy lifecycle hooks. Use `definePlugin` to get type inference.

```typescript
import { definePlugin } from '@fastkit/plugboy';

const customPlugin = () =>
  definePlugin({
    name: 'custom-plugin',
    hooks: {
      // Called just before the workspace instance is created
      setupWorkspace(ctx, getWorkspace) {
        console.log('Setting up workspace:', ctx.json.name);
      }
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
  deps: {
    neverBundle: ['vue']
  }
});
```

## Hook System

### Lifecycle Hooks

```typescript
export default defineWorkspaceConfig({
  hooks: {
    // Called just before the workspace instance is created
    setupWorkspace: (ctx, getWorkspace) => {
      console.log('Setting up workspace:', ctx.json.name);
    },
    // Called after the workspace instance is created
    createWorkspace: (workspace) => {
      console.log('Workspace created:', workspace.name);
    },
    // Called just before package.json is modified and saved
    preparePackageJSON: (json, workspace) => {
      json.sideEffects = false;
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

- `tsdown`: High-speed TypeScript build tool (based on Rolldown)
- `cac`: CLI creation library
- `glob`: File matching
- `cssnano`: CSS optimization

## License

MIT
