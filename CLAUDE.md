# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.
Responses should be in Japanese.

## Project Overview

Fastkit is a comprehensive TypeScript monorepo containing 60+ specialized packages for Vue.js application development. It uses a custom build tool called Plugboy and emphasizes type safety, modularity, and developer experience.

## Essential Commands

### Initial Setup
```bash
# Install dependencies (requires Node.js 18.x and Corepack enabled)
pnpm install

# Build all packages (required before development)
pnpm build
```

### Development
```bash
# Build and start docs development server
pnpm dev

# Start docs server only (after initial build)
pnpm dev:docs

# For packages that don't affect Vite config (like @fastkit/vui)
cd packages/[package-name]
pnpm stub  # then start dev server
```

### Build & Test
```bash
# Build all packages (uses Turbo for caching)
pnpm build

# Build only plugboy packages first (required dependency order)
pnpm build:plugboy

# Run linting
pnpm lint

# Run type checking
pnpm typecheck

# Run type checking (packages only, excluding docs)
pnpm typecheck:packages

# Run tests
pnpm test

# Format code
pnpm format
```

### Individual Package Commands
```bash
cd packages/[package-name]

# Build package
pnpm build  # or: plugboy build

# Stub build (for development)
pnpm stub   # or: plugboy stub

# Type check
pnpm typecheck  # or: tsc --noEmit

# Test single package
pnpm test   # or: vitest run

# Lint
pnpm lint   # ESLint + Stylelint (if CSS package)
```

### Plugboy Generator
```bash
# Generate new packages/components
pnpm gen  # or: pnpm plugboy gen
```

## Architecture Overview

### Monorepo Structure
- **packages/**: 60+ specialized packages organized by function
- **apps/docs/**: Documentation site with live component demos
- **Build System**: Custom Plugboy tool + Turbo + pnpm workspaces
- **Dependencies**: Managed with strict peer dependency rules

### Package Categories
1. **UI Components**: `@fastkit/vui` (main UI kit), `@fastkit/vue-form-control`, `@fastkit/vue-app-layout`
2. **Build Tools**: `@fastkit/plugboy`, `@fastkit/vot`, `@fastkit/vite-kit`
3. **Vue Utilities**: `@fastkit/vue-*` packages for specific functionality
4. **Core Libraries**: `@fastkit/helpers`, `@fastkit/universal-logger`, `@fastkit/i18n`
5. **Development Tools**: ESLint/Stylelint configs, generators

### Key Architectural Patterns

#### Vue Component Design
- **Naming**: `VComponentName` prefix with PascalCase
- **Props Factory Pattern**: Reusable prop definitions via `createXxxProps()`
- **Control Class Pattern**: Complex state management using classes extending base controls
- **Injection Pattern**: Type-safe provide/inject with `InjectionKey<T>`

#### File Structure (per package)
```
packages/[name]/
├── src/
│   ├── index.ts           # Main export
│   ├── components/        # Vue components
│   ├── composables/       # Composition API hooks
│   ├── schemes/           # Type definitions
│   └── injections.ts      # Provide/inject keys
├── plugboy.workspace.ts   # Build configuration
└── tsconfig.json
```

#### TypeScript Configuration
- **Strict Mode**: All packages use strict TypeScript settings
- **Path Mapping**: `@@/*` for monorepo internal references, `~/*` for package-relative paths
- **Shared Config**: All packages extend `tsconfig.base.json`

### Plugboy Build System
- **Custom Tool**: Internal build system optimized for this monorepo
- **Plugins**: Sass, Vanilla Extract, Vue JSX support
- **DTS Processing**: Automatic type definition generation with custom normalizers
- **CSS Optimization**: CSS rule combination and optimization

### Testing Strategy
- **Vitest**: Lightweight testing framework
- **Structure**: `__tests__/` directories or `*.spec.ts` files
- **Configuration**: Allows packages with no tests (`passWithNoTests: true`)

### Development Dependencies
- **Vue 3.4.33**: Fixed version across all packages
- **TypeScript 5.5.3**: Latest stable version
- **Build Tools**: Turbo (caching), pnpm (package management), esbuild (bundling)

### Code Style
- **ESLint**: Airbnb-base + TypeScript + Prettier integration
- **Naming**: camelCase for functions/variables, PascalCase for components/types
- **Vue Style**: Composition API preferred, JSX for complex components

### Key Integration Points
- **@fastkit/vui**: Central UI component library that integrates multiple packages
- **@fastkit/vue-form-control**: Form foundation used by multiple UI components
- **@fastkit/plugboy**: Build system used by all packages
- **@fastkit/i18n**: Multi-language support with type-safe translations

### Development Notes
- **Build Order**: Plugboy packages must build first due to dependencies
- **Caching**: Turbo provides intelligent build caching
- **Stub Development**: Use `pnpm stub` for fast development iteration on packages that don't affect Vite config
- **Type Definitions**: Some packages use custom DTS preservers and normalizers for complex type generation
