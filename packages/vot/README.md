# @fastkit/vot

🌐 English | [日本語](https://github.com/dadajam4/fastkit/blob/main/packages/vot/README-ja.md)

A comprehensive orchestration tool and framework for building Vue applications. Provides an integrated development experience including SSR (Server-Side Rendering), static site generation, plugin system, development server, and more.

## Features

- **SSR & Static Generation**: Supports both Server-Side Rendering and static site generation
- **Integrated Development Server**: Fast development server based on Vite
- **Plugin System**: Extensible plugin architecture
- **File-based Routing**: Automatic page route generation
- **Full TypeScript Support**: Type safety with strict type definitions
- **Vue 3 + Vue Router 4**: Compatible with the latest Vue ecosystem
- **Head Management**: Meta tag and SEO optimization with Unhead
- **Proxy Support**: API proxy functionality during development

## Installation

```bash
npm install @fastkit/vot
```

## CLI Usage

```bash
# Start development server
npx vot dev

# Production build
npx vot build

# Static site generation
npx vot generate

# Other options
npx vot --help
```

## Basic Configuration

### vot.config.ts

```typescript
import { defineVotConfig } from '@fastkit/vot/tool'

export default defineVotConfig({
  // Application configuration
  app: {
    // Application name
    name: 'My Vue App',

    // Base URL
    base: '/',

    // Output directory
    outDir: 'dist',

    // Development server configuration
    dev: {
      port: 3000,
      host: 'localhost'
    }
  },

  // SSR configuration
  ssr: {
    // Enable SSR
    enabled: true,

    // Server entry point
    ssrEntry: 'src/entry-server.ts',

    // Plugin configuration
    plugin: 'src/plugins/ssr.ts'
  },

  // Build configuration
  build: {
    // Client Vite configuration
    clientOptions: {
      build: {
        sourcemap: true
      }
    },

    // Server Vite configuration
    serverOptions: {
      build: {
        minify: false
      }
    }
  },

  // Vite plugins
  vite: {
    plugins: [
      // Custom plugins
    ]
  }
})
```

## Entry Point Configuration

### src/main.ts (Client & Server Common)

```typescript
import { createVotApp } from '@fastkit/vot'
import { createHead } from '@unhead/vue'
import App from './App.vue'

// Create Vot application
export const { createApp } = createVotApp({
  // Main component
  App,

  // Vue application setup
  async setupApp(ctx) {
    const { app, router } = ctx

    // Setup head management
    const head = createHead()
    app.use(head)

    // Register global components
    // app.component('MyComponent', MyComponent)

    // Setup plugins
    // app.use(myPlugin)
  },

  // Router setup
  async setupRouter(ctx) {
    const { router } = ctx

    // Setup route guards
    router.beforeEach((to, from, next) => {
      // Authentication check, etc.
      next()
    })
  },

  // Plugins
  plugins: [
    // Custom plugins
  ]
})
```

### src/entry-client.ts (Client)

```typescript
import { createApp } from './main'

createApp().then(({ app, router }) => {
  // Wait for router to be ready
  router.isReady().then(() => {
    // Mount to DOM
    app.mount('#app')
  })
})
```

### src/entry-server.ts (Server)

```typescript
import { createApp } from './main'
import type { VotServerRenderContext } from '@fastkit/vot/server'

export async function render(ctx: VotServerRenderContext) {
  const { app, router } = await createApp()

  // Server-side routing
  await router.push(ctx.url)
  await router.isReady()

  return { app }
}
```

## Plugin System

### Creating Plugins

```typescript
import { createVotPlugin } from '@fastkit/vot'
import type { VuePageControl } from '@fastkit/vue-page'

// Simple plugin
export const mySimplePlugin = createVotPlugin((ctx: VuePageControl) => {
  // Plugin initialization
  console.log('Plugin initialized:', ctx.app)
})

// Plugin with hooks
export const myAdvancedPlugin = createVotPlugin({
  setup(ctx: VuePageControl) {
    // Setup process
    console.log('Advanced plugin setup')
  },

  // Hook before router setup
  beforeRouterSetup(params) {
    console.log('Before router setup:', params)
  },

  // Hook after router setup
  afterRouterSetup(params) {
    console.log('After router setup:', params)
  }
})
```

### Using Plugins

```typescript
import { createVotApp } from '@fastkit/vot'
import { mySimplePlugin, myAdvancedPlugin } from './plugins'

export const { createApp } = createVotApp({
  // Register plugins
  plugins: [
    mySimplePlugin,
    myAdvancedPlugin
  ]
})
```

## Page Components

### src/pages/index.vue

```vue
<template>
  <div>
    <h1>{{ title }}</h1>
    <p>{{ description }}</p>
  </div>
</template>

<script setup lang="ts">
import { useHead } from '@unhead/vue'

// Page metadata
useHead({
  title: 'Home Page',
  meta: [
    { name: 'description', content: 'This is the home page of the site' }
  ]
})

// Page data
const title = 'Welcome'
const description = 'Welcome to the Vot framework!'
</script>
```

### Dynamic Routes: src/pages/users/[id].vue

```vue
<template>
  <div>
    <h1>User: {{ user?.name }}</h1>
    <p>{{ user?.email }}</p>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { ref, onMounted } from 'vue'

const route = useRoute()
const user = ref<{ name: string; email: string } | null>(null)

onMounted(async () => {
  // Fetch user data
  const response = await fetch(`/api/users/${route.params.id}`)
  user.value = await response.json()
})
</script>
```

## Development Server Customization

### src/server/dev.ts

```typescript
import type { VotConfigureServerFn } from '@fastkit/vot'
import express from 'express'

export const configureServer: VotConfigureServerFn = ({ use }) => {
  // Add API endpoints
  const apiRouter = express.Router()

  apiRouter.get('/users/:id', (req, res) => {
    res.json({
      id: req.params.id,
      name: `User ${req.params.id}`,
      email: `user${req.params.id}@example.com`
    })
  })

  use('/api', apiRouter)

  // Serve static files
  use('/uploads', express.static('uploads'))

  // Return cleanup function
  return () => {
    console.log('Development server cleanup')
  }
}
```

## Static Site Generation

### Generate Configuration

```typescript
// vot.config.ts
export default defineVotConfig({
  generate: {
    // Routes to generate
    routes: [
      '/',
      '/about',
      '/users/1',
      '/users/2'
    ],

    // Dynamic route generation
    async generateRoutes() {
      const users = await fetchUsers()
      return users.map(user => `/users/${user.id}`)
    },

    // Output directory
    outDir: 'dist-static'
  }
})
```

### Running Generation

```bash
# Generate static site
npx vot generate

# Generate specific routes only
npx vot generate --routes="/" "/about"
```

## Advanced Usage Examples

### Authentication Plugin

```typescript
import { createVotPlugin } from '@fastkit/vot'
import { ref, provide } from 'vue'

export const authPlugin = createVotPlugin({
  setup(ctx) {
    const user = ref(null)
    const isAuthenticated = computed(() => !!user.value)

    // Provide authentication state
    provide('auth', {
      user: readonly(user),
      isAuthenticated: readonly(isAuthenticated),
      login: async (credentials) => {
        // Login process
        const response = await fetch('/api/login', {
          method: 'POST',
          body: JSON.stringify(credentials)
        })
        user.value = await response.json()
      },
      logout: () => {
        user.value = null
      }
    })
  },

  afterRouterSetup({ router }) {
    // Protect routes that require authentication
    router.beforeEach((to, from, next) => {
      if (to.meta.requiresAuth && !user.value) {
        next('/login')
      } else {
        next()
      }
    })
  }
})
```

### Internationalization Plugin

```typescript
import { createVotPlugin } from '@fastkit/vot'
import { createI18n } from 'vue-i18n'

export const i18nPlugin = createVotPlugin({
  setup(ctx) {
    const i18n = createI18n({
      locale: 'en',
      fallbackLocale: 'en',
      messages: {
        ja: {
          hello: 'Hello',
          welcome: 'Welcome'
        },
        en: {
          hello: 'Hello',
          welcome: 'Welcome'
        }
      }
    })

    ctx.app.use(i18n)
  }
})
```

### State Management Plugin

```typescript
import { createVotPlugin } from '@fastkit/vot'
import { createPinia } from 'pinia'

export const storePlugin = createVotPlugin({
  setup(ctx) {
    const pinia = createPinia()
    ctx.app.use(pinia)
  }
})
```

## Performance Optimization

### Preload Configuration

```typescript
// vot.config.ts
export default defineVotConfig({
  build: {
    clientOptions: {
      build: {
        rollupOptions: {
          output: {
            manualChunks: {
              vendor: ['vue', 'vue-router'],
              ui: ['@headlessui/vue', '@heroicons/vue']
            }
          }
        }
      }
    }
  }
})
```

### Lazy Loading

```typescript
// src/router/routes.ts
import { defineAsyncComponent } from 'vue'

export default [
  {
    path: '/heavy-page',
    component: defineAsyncComponent(() => import('../pages/HeavyPage.vue'))
  }
]
```

## Debugging and Testing

### Debugging in Development Mode

```typescript
// vot.config.ts
export default defineVotConfig({
  dev: {
    // Enable source maps
    sourcemap: true,

    // Hot Module Replacement
    hmr: true,

    // Debug logging
    logLevel: 'info'
  }
})
```

### E2E Test Integration

```typescript
// tests/e2e/basic.spec.ts
import { test, expect } from '@playwright/test'

test('Home page displays correctly', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('h1')).toContainText('Welcome')
})
```

## API Reference

### createVotApp

```typescript
function createVotApp(options: VotAppOptions): { createApp: () => Promise<VotAppInstance> }
```

Creates the main Vot application.

### createVotPlugin

```typescript
function createVotPlugin(plugin: RawVotPlugin): VotPlugin
```

Creates a Vot plugin.

### defineVotConfig

```typescript
function defineVotConfig(config: VotConfig): VotConfig
```

Defines Vot configuration.

### Key Type Definitions

```typescript
interface VotAppOptions {
  App: Component
  setupApp?(ctx: VuePageControl): Promise<void> | void
  setupRouter?(ctx: VuePageControl): Promise<void> | void
  plugins?: RawVotPlugin[]
}

interface VotConfig {
  app?: AppConfig
  ssr?: SsrOptions
  build?: BuildOptions
  generate?: GenerateOptions
  vite?: ViteConfig
}
```

## CLI Commands

| Command | Description |
|---------|-------------|
| `vot dev` | Start development server |
| `vot build` | Build for production |
| `vot generate` | Generate static site |
| `vot preview` | Preview build result |

### CLI Options

```bash
# Specify port
vot dev --port 8080

# Specify host
vot dev --host 0.0.0.0

# Specify config file
vot build --config vot.prod.config.ts

# Specify log level
vot dev --log-level debug
```

## Directory Structure

```
my-vot-app/
├── src/
│   ├── pages/           # Page components
│   ├── components/      # Reusable components
│   ├── layouts/         # Layout components
│   ├── plugins/         # Vot plugins
│   ├── server/          # Server configuration
│   ├── main.ts          # Main entry
│   ├── entry-client.ts  # Client entry
│   └── entry-server.ts  # Server entry
├── vot.config.ts        # Vot configuration
└── package.json
```

## Related Packages

- `@fastkit/vue-page` - Vue page management system
- `@fastkit/vue-utils` - Vue utility functions
- `@fastkit/helpers` - Helper functions
- `vite` - Build tool
- `vue` - Vue.js framework
- `vue-router` - Vue Router
- `@unhead/vue` - Head management

## License

MIT
