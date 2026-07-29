
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
- **Env & Module Types**: `__PLUGBOY_DEV__` / `__PLUGBOY_STUB__` dev guards, plus Vite-compatible ambient types for asset, CSS, and `?raw` imports ([docs](./docs/env-constants.md))

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

#### Build Target

`target` is passed straight through to tsdown and decides which JavaScript
syntax is downleveled. Pass a single target, an array of targets, or `false` to
disable every transformation.

```typescript
export default defineWorkspaceConfig({
  // A library expected to run on both Node.js and browsers declares the lower
  // bound of each: the output satisfies every listed environment.
  target: ['node20.19', 'chrome111', 'firefox114', 'safari16.4']
});
```

Set it in `plugboy.project.ts` to apply one target to every workspace; a
workspace that declares its own `target` replaces the project value outright
(target lists are not merged). When neither layer sets it, tsdown falls back to
the package's `engines.node` field, and applies no transformation at all when
that field is absent.

Only *syntax* is lowered — runtime APIs (`structuredClone`, `Array#at`, …) are
never polyfilled. The value also becomes the default for `css.target` below,
where every non-browser entry of the list is ignored.

#### CSS Options

`css` is passed straight through to tsdown and controls how stylesheets are
processed and emitted — the output file name, preprocessor options, CSS modules,
syntax lowering, and so on.

```typescript
export default defineWorkspaceConfig({
  css: {
    // Name of the single emitted stylesheet.
    fileName: 'my-package.css',
    // Lower CSS syntax for browsers only, independently of `target`.
    target: ['chrome111', 'firefox114', 'safari16.4']
  }
});
```

Set it in `plugboy.project.ts` to apply defaults to every workspace; a workspace
value is shallow-merged over the project one, so it only needs to restate the
keys it changes.

Plugins may seed defaults here during workspace setup — the vanilla-extract
plugin, for instance, owns `splitting` and `fileName` so the emitted file matches
the CSS export plugboy declares. A configured value always wins over a plugin
default, so check the plugin's documentation before overriding a key it manages.

#### CSS Optimization

`optimizeCSS` applies plugboy's own postcss pass on top of whatever tsdown
produced: duplicate `@layer` / `@media` blocks are merged, and the selectors
listed in `combineRules` are combined into a single rule. Pass `false` to disable
it.

```typescript
export default defineWorkspaceConfig({
  optimizeCSS: {
    combineRules: {
      rules: [':root']
    }
  }
});
```

It runs in `writeBundle`, on the stylesheets on disk, so it covers **every**
stylesheet the build writes — including the ones tsdown's own CSS pipeline emits,
which it does after every plugin has had its say.

#### Preserved at the top of a stylesheet

Two things tsdown's CSS pipeline would rewrite are restored afterwards, in this
order, above every rule:

1. **The authored `@layer` order.** lightningcss prunes a name from an
   `@layer a, b, c;` statement once a block for it appears in the same
   stylesheet. For a library that is wrong whenever the statement also orders
   layers owned by *other* packages — the pruned layer's position then depends on
   where its block happens to land relative to those. plugboy reads the statements
   before the transform and re-emits them verbatim.
2. **External `@import`s.** A bare package specifier (e.g.
   `@import url('material-symbols/rounded.css') layer(...)`) stays external
   instead of being inlined, so the consumer's bundler resolves it and the
   imported package's own relative asset URLs keep working.

Both are captured from every stylesheet in the module graph, whether its contents
were authored or generated by a plugin — vanilla-extract emits its `@layer`
statements into a virtual module, and those are covered too.

#### One stylesheet per CSS entry

Every entry with `css: true` gets a `./<entry>.css` export, and each of those files
is guaranteed to exist and to be usable on its own.

With several such entries the build emits one stylesheet per output *chunk*
(`css.splitting`), which does not line up: CSS reached from more than one entry is
moved into a shared chunk and emitted under a hashed name that no export points at,
and an entry whose CSS comes only from there gets no stylesheet at all. plugboy
rebuilds each entry's stylesheet from its own CSS plus the CSS of every chunk it
imports, dependencies first, and drops the leftover per-chunk files. Shared CSS is
duplicated into each entry that needs it, which is what makes a single
`./<entry>.css` import complete.

This is skipped when `css.inject` is on, since the JavaScript then imports the
per-chunk stylesheets by name.

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

### Dependency Externalization

`deps.neverBundle` marks packages as external instead of bundling them. Matching
is by **package name and its subpaths** — listing `'foo'` externalizes both
`foo` and `foo/bar`.

**Self-references are always external, automatically.** When a module imports
its own package by name (e.g. `import logo from 'my-pkg/assets/logo.svg'`), the
import is served at runtime via the package's own `exports` map
(`"./*": "./dist/*"`) and is never bundled — you do **not** need to list your own
package in `neverBundle`. Because plugboy resolves these as external up front,
they never trigger rolldown's `UNRESOLVED_IMPORT` warning, while genuinely
unresolved specifiers (typos) still warn as usual.

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
