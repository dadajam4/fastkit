
# @fastkit/vue-page

🌐 English | [日本語](https://github.com/dadajam4/fastkit/blob/main/packages/vue-page/README-ja.md)

Middleware for convenient control of routing in Vue applications. Provides advanced routing features including data prefetching, error handling, page state management, and progress display.

## Features

- **Data Prefetching**: Automatic data retrieval before page transitions
- **Error Handling**: Unified error page display system
- **Progress Display**: Visualization of page loading status
- **State Management**: Data sharing and management between pages
- **SSR Support**: Full server-side rendering support
- **Query Watching**: Monitoring URL query parameter changes
- **Middleware**: Execution of processing before page access
- **Full TypeScript Support**: Type safety through strict type definitions

## Installation

```bash
npm install @fastkit/vue-page
```

## Basic Usage

### Application Setup

```typescript
// main.ts
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { VuePageControl } from '@fastkit/vue-page'
import App from './App.vue'

const app = createApp(App)

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // Route definitions
  ]
})

// VuePageControl setup
const pageControl = new VuePageControl({
  app,
  router,

  // Error page component
  errorComponent: () => import('./components/ErrorPage.vue'),

  // Global loading settings
  loading: {
    component: () => import('./components/Loading.vue'),
    delay: 200
  }
})

app.use(router)
app.mount('#app')
```

### Root Component Setup

```vue
<!-- App.vue -->
<template>
  <div class="app">
    <!-- Page progress display -->
    <VPageProgress />

    <!-- Page root -->
    <VPageRoot>
      <router-view />
    </VPageRoot>
  </div>
</template>

<script setup lang="ts">
import { VPageProgress, VPageRoot } from '@fastkit/vue-page'
</script>
```

## Data Prefetching

### Basic Prefetch

```vue
<!-- UserProfile.vue -->
<template>
  <div class="user-profile">
    <h1>{{ user.name }}</h1>
    <p>{{ user.email }}</p>
  </div>
</template>

<script setup lang="ts">
import { definePageOptions } from '@fastkit/vue-page'

// Page data definition
const user = ref(null)

// Prefetch function definition
definePageOptions({
  async prefetch({ route, pageControl }) {
    // Get user ID from route parameters
    const userId = route.params.id

    // Retrieve user data from API
    const response = await fetch(`/api/users/${userId}`)
    const userData = await response.json()

    // Set to reactive state
    user.value = userData

    return {
      user: userData
    }
  }
})
</script>
```

### Conditional Prefetch

```vue
<script setup lang="ts">
import { definePageOptions, useVuePageControl } from '@fastkit/vue-page'

definePageOptions({
  async prefetch({ route, pageControl, isClient, isServer }) {
    // Execute only on client side
    if (isClient) {
      const analytics = await import('./analytics')
      analytics.trackPageView(route.path)
    }

    // Execute only on server side
    if (isServer) {
      const seoData = await generateSEOData(route)
      return { seoData }
    }

    // Conditional logic based on authentication state
    const { user } = pageControl.state
    if (user.isAuthenticated) {
      const privateData = await fetchPrivateData()
      return { privateData }
    }

    return {}
  }
})
</script>
```

### Prefetch with Dependencies

```vue
<script setup lang="ts">
definePageOptions({
  async prefetch({ route, pageControl }) {
    // Sequential execution
    const category = await fetchCategory(route.params.categoryId)
    const products = await fetchProducts(category.id)
    const reviews = await fetchReviews(products.map(p => p.id))

    return {
      category,
      products,
      reviews
    }
  },

  // Parallel execution
  async prefetch({ route }) {
    const [category, tags, brands] = await Promise.all([
      fetchCategory(route.params.categoryId),
      fetchTags(),
      fetchBrands()
    ])

    return {
      category,
      tags,
      brands
    }
  }
})
</script>
```

## Error Handling

### Custom Error Page

```vue
<!-- ErrorPage.vue -->
<template>
  <div class="error-page">
    <h1>{{ errorTitle }}</h1>
    <p>{{ errorMessage }}</p>
    <button @click="retry">Retry</button>
    <router-link to="/">Back to Home</router-link>
  </div>
</template>

<script setup lang="ts">
import { useVuePageControl } from '@fastkit/vue-page'

const pageControl = useVuePageControl()
const error = computed(() => pageControl.error)

const errorTitle = computed(() => {
  if (!error.value) return 'Error'

  switch (error.value.statusCode) {
    case 404: return 'Page Not Found'
    case 403: return 'Access Denied'
    case 500: return 'Server Error'
    default: return 'An Error Occurred'
  }
})

const errorMessage = computed(() => {
  return error.value?.message || 'An unexpected error occurred'
})

const retry = () => {
  pageControl.reload()
}
</script>
```

### Handling Prefetch Errors

```vue
<script setup lang="ts">
definePageOptions({
  async prefetch({ route }) {
    try {
      const data = await fetchData(route.params.id)
      return { data }
    } catch (error) {
      // Throw custom error
      if (error.status === 404) {
        throw new VuePageControlError('Data not found', 404)
      }

      // Re-throw error
      throw error
    }
  },

  // Fallback on error
  onError({ error, route, pageControl }) {
    console.error('Prefetch error:', error)

    // Return default data
    return {
      data: getDefaultData()
    }
  }
})
</script>
```

## Page State Management

### Global State Management

```typescript
// pageControl.ts
import { VuePageControl } from '@fastkit/vue-page'

export const pageControl = new VuePageControl({
  // Initial state
  initialState: {
    user: null,
    theme: 'light',
    locale: 'en'
  },

  // State persistence
  persistentKeys: ['theme', 'locale']
})

// Update state
pageControl.setState({
  user: {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com'
  }
})

// Get state
const user = pageControl.getState('user')
const theme = pageControl.getState('theme')
```

### Page-specific State

```vue
<script setup lang="ts">
import { usePageState } from '@fastkit/vue-page'

// Page-specific state
const pageState = usePageState({
  selectedTab: 'overview',
  searchQuery: '',
  filterOptions: {}
})

// Update state
const updateTab = (tab: string) => {
  pageState.selectedTab = tab
}

// Watch state
watch(() => pageState.searchQuery, (query) => {
  performSearch(query)
})
</script>
```

## Middleware

### Authentication Middleware

```typescript
// middleware/auth.ts
import { VuePageControlMiddlewareFn } from '@fastkit/vue-page'

export const authMiddleware: VuePageControlMiddlewareFn = async ({
  route,
  pageControl,
  redirect
}) => {
  const user = pageControl.getState('user')

  // Check if page requires authentication
  if (route.meta.requiresAuth && !user) {
    // Redirect to login page
    return redirect('/login', {
      query: { redirect: route.fullPath }
    })
  }

  // Check if admin privileges are required
  if (route.meta.requiresAdmin && !user?.isAdmin) {
    throw new VuePageControlError('Admin privileges required', 403)
  }
}
```

### Page Access Logging

```typescript
// middleware/analytics.ts
export const analyticsMiddleware: VuePageControlMiddlewareFn = async ({
  route,
  pageControl
}) => {
  // Track page views
  if (typeof window !== 'undefined') {
    gtag('config', 'GA_MEASUREMENT_ID', {
      page_title: route.meta.title,
      page_location: window.location.href
    })
  }

  // Record user behavior
  const user = pageControl.getState('user')
  if (user) {
    await trackUserPageVisit(user.id, route.path)
  }
}
```

### Middleware Registration

```typescript
// router/index.ts
import { authMiddleware, analyticsMiddleware } from './middleware'

const pageControl = new VuePageControl({
  // Global middleware
  middleware: [
    authMiddleware,
    analyticsMiddleware
  ]
})

// Route-specific middleware
const routes = [
  {
    path: '/admin',
    component: AdminPage,
    meta: {
      requiresAuth: true,
      requiresAdmin: true,
      middleware: [adminMiddleware]
    }
  }
]
```

## Progress Display

### Custom Progress

```vue
<!-- CustomProgress.vue -->
<template>
  <div
    v-if="isProgressing"
    class="page-progress"
    :class="{ 'progress-error': hasError }"
  >
    <div
      class="progress-bar"
      :style="{ width: `${progress}%` }"
    ></div>
    <div class="progress-message">
      {{ progressMessage }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { useVuePageControl } from '@fastkit/vue-page'

const pageControl = useVuePageControl()

const isProgressing = computed(() => pageControl.isProgressing)
const hasError = computed(() => !!pageControl.error)
const progress = computed(() => pageControl.progress)

const progressMessage = computed(() => {
  if (hasError.value) return 'An error occurred'
  if (isProgressing.value) return 'Loading page...'
  return ''
})
</script>

<style scoped>
.page-progress {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: rgba(0, 0, 0, 0.1);
  z-index: 9999;
}

.progress-bar {
  height: 100%;
  background: #3b82f6;
  transition: width 0.3s ease;
}

.progress-error .progress-bar {
  background: #ef4444;
}
</style>
```

## SSR Support

### Server-side Setup

```typescript
// server.ts
import { VuePageControl } from '@fastkit/vue-page/server'

export async function renderPage(url: string) {
  const pageControl = new VuePageControl({
    // Server-side settings
    ssrContext: {
      url,
      userAgent: req.headers['user-agent']
    }
  })

  // Execute prefetch
  await pageControl.prefetchRoute(url)

  // Render application
  const html = await renderToString(app)

  // Extract state
  const state = pageControl.extractState()

  return {
    html,
    state
  }
}
```

### Client-side Restoration

```typescript
// entry-client.ts
import { VuePageControl } from '@fastkit/vue-page'

// Restore state passed from server
const initialState = window.__INITIAL_STATE__

const pageControl = new VuePageControl({
  initialState,

  // Hydration settings
  hydration: true
})

// Mount application
app.mount('#app')
```

## Advanced Usage Examples

### Dynamic Routing

```vue
<script setup lang="ts">
definePageOptions({
  async prefetch({ route, pageControl, redirect }) {
    const slug = route.params.slug

    // Resolve actual page from slug
    const page = await resolvePageBySlug(slug)

    if (!page) {
      throw new VuePageControlError('Page not found', 404)
    }

    // Dynamically determine component
    if (page.type === 'product') {
      return redirect(`/products/${page.id}`)
    }

    return { page }
  }
})
</script>
```

### Cache Strategy

```vue
<script setup lang="ts">
definePageOptions({
  async prefetch({ route, pageControl }) {
    const cacheKey = `page:${route.path}`

    // Try to get from cache
    let data = pageControl.cache.get(cacheKey)

    if (!data) {
      // Fetch from API
      data = await fetchPageData(route.params.id)

      // Save to cache (5 minutes)
      pageControl.cache.set(cacheKey, data, 5 * 60 * 1000)
    }

    return { data }
  },

  // Cleanup on page leave
  onLeave({ pageControl }) {
    // Release resources
    pageControl.cache.clear()
  }
})
</script>
```

### Real-time Updates

```vue
<script setup lang="ts">
import { useVuePageControl } from '@fastkit/vue-page'

const pageControl = useVuePageControl()
const data = ref(null)

definePageOptions({
  async prefetch({ route }) {
    data.value = await fetchData(route.params.id)
    return { data: data.value }
  },

  // Processing after page mount
  onMounted({ route }) {
    // WebSocket connection
    const ws = new WebSocket(`ws://localhost/updates/${route.params.id}`)

    ws.onmessage = (event) => {
      const update = JSON.parse(event.data)

      // Update data
      data.value = { ...data.value, ...update }

      // Sync state
      pageControl.setState({ data: data.value })
    }

    // Register cleanup
    pageControl.onCleanup(() => {
      ws.close()
    })
  }
})
</script>
```

## API Reference

### VuePageControl

```typescript
class VuePageControl {
  constructor(options: VuePageControlOptions)

  // State management
  getState<T>(key: string): T
  setState(state: Record<string, any>): void

  // Navigation
  push(location: RouteLocationRaw): Promise<void>
  replace(location: RouteLocationRaw): Promise<void>
  go(delta: number): void
  back(): void
  forward(): void

  // Prefetch
  prefetch(location: RouteLocationRaw): Promise<any>

  // Error handling
  error: Ref<VuePageControlError | null>
  clearError(): void

  // Progress
  isProgressing: Ref<boolean>
  progress: Ref<number>

  // Cleanup
  onCleanup(fn: () => void): void
}
```

### definePageOptions

```typescript
interface PageOptions {
  prefetch?: VuePagePrefetchFn
  middleware?: VuePageControlMiddlewareFn[]
  watchQuery?: WatchQueryOption
  key?: VuePageKeyOverride
  loading?: boolean | LoadingOptions
  onError?: (context: ErrorContext) => any
  onMounted?: (context: MountedContext) => void
  onLeave?: (context: LeaveContext) => void
}

function definePageOptions(options: PageOptions): void
```

### Components

- `VPageRoot`: Page root container
- `VPageProgress`: Progress display
- `VErrorPage`: Default error page
- `VPage`: Page wrapper
- `VPageLink`: Page link

## Related Packages

- `@fastkit/vue-utils` - Vue utility functions
- `@fastkit/cookies` - Cookie management
- `@fastkit/ev` - Event system
- `@fastkit/helpers` - Helper functions
- `@fastkit/tiny-logger` - Logger
- `vue` - Vue.js framework (peer dependency)
- `vue-router` - Vue Router (peer dependency)

## License

MIT
