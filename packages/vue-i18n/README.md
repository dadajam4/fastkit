
# @fastkit/vue-i18n

🌐 English | [日本語](https://github.com/dadajam4/fastkit/blob/main/packages/vue-i18n/README-ja.md)

A library that provides type-safe and powerful internationalization (i18n) features for Vue.js applications. Built on top of the @fastkit/i18n core library, it enables seamless integration with Vue 3 and Vue Router.

## Features

- **Full Vue 3 Integration**: Supports both Composition API and Options API
- **Type Safety**: Strict type definitions and compile-time validation with TypeScript
- **Vue Router Integration**: Routing-based language switching and navigation
- **Server-Side Rendering**: Complete support for SSR environments
- **Flexible Strategies**: Custom language detection and switching strategies
- **Reactive Storage**: Integration with Vue's reactive system
- **Hierarchical Translation**: Management of nested translation components
- **Client Language Detection**: Support for browser settings and Accept-Language headers
- **Sub-spaces**: Independent translation scopes per component
- **Custom Storage**: Support for Cookie, LocalStorage, and custom storage solutions

## Installation

```bash
npm install @fastkit/vue-i18n @fastkit/i18n
```

## Basic Usage

### Defining Multilingual Spaces

```typescript
// i18n/space.ts
import { defineI18nSpace } from '@fastkit/i18n'

// Define available languages
export type AppLocaleName = 'ja' | 'en' | 'es'

// Specify base language (development language)
export type AppBaseLocale = 'ja'

// Define translation components
export const AppComponents = {
  common: () => import('./common'),
  user: () => import('./user'),
  product: () => import('./product')
} as const

// Create internationalization space
export const AppSpace = defineI18nSpace<AppLocaleName, AppBaseLocale>({
  locales: ['ja', 'en', 'es'],
  baseLocale: 'ja',
  components: AppComponents
})
```

### Creating Translation Resources

```typescript
// i18n/common.ts
import { defineI18nComponent } from '@fastkit/i18n'

export default defineI18nComponent({
  ja: {
    title: 'マイアプリケーション',
    navigation: {
      home: 'Home',
      about: 'About',
      contact: 'Contact'
    },
    buttons: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete'
    },
    messages: {
      loading: 'Loading...',
      success: 'Successfully processed',
      error: 'An error occurred'
    }
  },
  en: {
    title: 'My Application',
    navigation: {
      home: 'Home',
      about: 'About',
      contact: 'Contact'
    },
    buttons: {
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete'
    },
    messages: {
      loading: 'Loading...',
      success: 'Successfully processed',
      error: 'An error occurred'
    }
  },
  es: {
    title: 'Mi Aplicación',
    navigation: {
      home: 'Inicio',
      about: 'Acerca de',
      contact: 'Contacto'
    },
    buttons: {
      save: 'Guardar',
      cancel: 'Cancelar',
      delete: 'Eliminar'
    },
    messages: {
      loading: 'Cargando...',
      success: 'Procesado exitosamente',
      error: 'Ocurrió un error'
    }
  }
})
```

### Setting up Vue.js Application

```typescript
// main.ts
import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createVueI18n } from '@fastkit/vue-i18n'
import App from './App.vue'
import { AppSpace, AppComponents, type AppLocaleName, type AppBaseLocale } from './i18n/space'

// Create Vue I18n service
const i18n = createVueI18n(AppSpace, {
  components: AppComponents,
  defaultLocale: 'ja'
})

// Create router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/:locale(ja|en|es)?', component: () => import('./views/Home.vue') },
    { path: '/:locale(ja|en|es)?/about', component: () => import('./views/About.vue') }
  ]
})

// Initialize application
const app = createApp(App)

// Setup I18n space
const { space, install } = i18n.setup()

// Install into Vue.js application
app.use(router)
install(app)

// TypeScript type extension
declare module 'vue' {
  interface ComponentCustomProperties {
    $i18n: typeof space
  }
}

app.mount('#app')
```

### Using in Components

```vue
<template>
  <div>
    <h1>{{ $i18n.at.common.trans.title }}</h1>

    <nav>
      <router-link :to="localePath('/')">
        {{ $i18n.at.common.trans.navigation.home }}
      </router-link>
      <router-link :to="localePath('/about')">
        {{ $i18n.at.common.trans.navigation.about }}
      </router-link>
    </nav>

    <div class="language-switcher">
      <h3>Language Switcher</h3>
      <button
        v-for="locale in availableLocales"
        :key="locale"
        @click="changeLanguage(locale)"
        :class="{ active: currentLocale === locale }"
      >
        {{ getLocaleName(locale) }}
      </button>
    </div>

    <div class="actions">
      <button @click="save">
        {{ $i18n.at.common.trans.buttons.save }}
      </button>
      <button @click="cancel">
        {{ $i18n.at.common.trans.buttons.cancel }}
      </button>
    </div>

    <div v-if="isLoading" class="message">
      {{ $i18n.at.common.trans.messages.loading }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useI18nSpace } from '@fastkit/vue-i18n'

const router = useRouter()
const i18n = useI18nSpace()

const isLoading = ref(false)

// Get current language
const currentLocale = computed(() => i18n.locale)

// Available languages list
const availableLocales = computed(() => i18n.availableLocales)

// Language name mapping for display
const getLocaleName = (locale: string) => {
  const names = {
    ja: '日本語',
    en: 'English',
    es: 'Español'
  }
  return names[locale as keyof typeof names] || locale
}

// Language switching
const changeLanguage = async (locale: string) => {
  await i18n.setLocale(locale)
  // Update current path with new language
  const currentPath = router.currentRoute.value.path
  const newPath = currentPath.replace(/^\/[a-z]{2}/, `/${locale}`)
  router.push(newPath)
}

// Generate localized path
const localePath = (path: string) => {
  return `/${currentLocale.value}${path}`
}

// Action example
const save = () => {
  isLoading.value = true
  // Save process...
  setTimeout(() => {
    isLoading.value = false
    alert(i18n.at.common.trans.messages.success)
  }, 1000)
}

const cancel = () => {
  // Cancel process...
}
</script>

<style scoped>
.language-switcher {
  margin: 20px 0;
}

.language-switcher button {
  margin: 0 8px;
  padding: 8px 16px;
  border: 1px solid #ccc;
  background: white;
  cursor: pointer;
}

.language-switcher button.active {
  background: #007acc;
  color: white;
}

.actions {
  margin: 20px 0;
}

.actions button {
  margin: 0 8px;
  padding: 10px 20px;
  border: none;
  background: #007acc;
  color: white;
  cursor: pointer;
  border-radius: 4px;
}

.message {
  padding: 12px;
  background: #f0f0f0;
  border-radius: 4px;
  margin: 20px 0;
}
</style>
```

## Practical Usage Examples

### Sub-spaces (Component-specific Translation)

```typescript
// components/UserProfile/i18n.ts
import { defineI18nComponent } from '@fastkit/i18n'

export default defineI18nComponent({
  ja: {
    profile: {
      title: 'プロフィール',
      name: '名前',
      email: 'メールアドレス',
      bio: '自己紹介',
      edit: '編集',
      save: '保存'
    },
    validation: {
      required: '{field} is required',
      email: 'Please enter a valid email address'
    }
  },
  en: {
    profile: {
      title: 'Profile',
      name: 'Name',
      email: 'Email',
      bio: 'Biography',
      edit: 'Edit',
      save: 'Save'
    },
    validation: {
      required: '{field} is required',
      email: 'Please enter a valid email address'
    }
  }
})
```

```vue
<!-- components/UserProfile/UserProfile.vue -->
<template>
  <div class="user-profile">
    <h2>{{ subSpace.at.UserProfile.trans.profile.title }}</h2>

    <form @submit.prevent="handleSubmit">
      <div class="field">
        <label>{{ subSpace.at.UserProfile.trans.profile.name }}</label>
        <input
          v-model="form.name"
          :placeholder="subSpace.at.UserProfile.trans.profile.name"
        />
        <span v-if="errors.name" class="error">
          {{ subSpace.at.UserProfile.trans.validation.required.replace('{field}', subSpace.at.UserProfile.trans.profile.name) }}
        </span>
      </div>

      <div class="field">
        <label>{{ subSpace.at.UserProfile.trans.profile.email }}</label>
        <input
          v-model="form.email"
          type="email"
          :placeholder="subSpace.at.UserProfile.trans.profile.email"
        />
        <span v-if="errors.email" class="error">
          {{ subSpace.at.UserProfile.trans.validation.email }}
        </span>
      </div>

      <button type="submit">
        {{ subSpace.at.UserProfile.trans.profile.save }}
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { createVueI18n } from '@fastkit/vue-i18n'
import { AppSpace } from '../../i18n/space'
import UserProfileI18n from './i18n'

// Define sub-space
const i18n = createVueI18n(AppSpace, {
  components: { UserProfile: UserProfileI18n }
})

const SubSpace = i18n.defineSubSpace({ UserProfile: UserProfileI18n })

const subSpace = SubSpace.use()

const form = reactive({
  name: '',
  email: ''
})

const errors = ref<{ name?: boolean; email?: boolean }>({})

const handleSubmit = () => {
  errors.value = {}

  if (!form.name) errors.value.name = true
  if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) errors.value.email = true

  if (!Object.keys(errors.value).length) {
    console.log('Profile saved:', form)
  }
}
</script>
```

### Vue Router Integration Strategy

```typescript
// i18n/router-strategy.ts
import { defineVueI18nStrategy } from '@fastkit/vue-i18n'

export const routerStrategy = defineVueI18nStrategy({
  // Detect language from route path
  detectLocaleFromRoute: (route) => {
    const segments = route.path.split('/').filter(Boolean)
    const locale = segments[0]
    return ['ja', 'en', 'es'].includes(locale) ? locale : null
  },

  // Route update on language change
  updateRouteOnLocaleChange: async (to, locale, router) => {
    const segments = to.path.split('/').filter(Boolean)
    const currentLocale = segments[0]

    if (['ja', 'en', 'es'].includes(currentLocale)) {
      segments[0] = locale
    } else {
      segments.unshift(locale)
    }

    const newPath = '/' + segments.join('/')
    await router.push(newPath)
  },

  // Determine initial language
  getInitialLocale: (availableLocales, clientLanguage) => {
    // Prioritize client language, fall back to default if not supported
    if (clientLanguage && availableLocales.includes(clientLanguage)) {
      return clientLanguage
    }
    return 'ja' // Default language
  }
})

// Use in main application
const i18n = createVueI18n(AppSpace, {
  components: AppComponents,
  strategy: routerStrategy
})
```

### SSR (Server-Side Rendering) Support

```typescript
// server/i18n-setup.ts
import { createVueI18n } from '@fastkit/vue-i18n'
import { AppSpace, AppComponents } from '../shared/i18n/space'

export function createI18nForSSR(
  acceptLanguage?: string,
  initialPath?: string
) {
  return createVueI18n(AppSpace, {
    components: AppComponents,
    client: {
      // Detect language from Accept-Language header
      getClientLanguage: (availableLocales) => {
        if (!acceptLanguage) return null

        // Parse Accept-Language header
        const languages = acceptLanguage
          .split(',')
          .map(lang => lang.split(';')[0].trim())
          .map(lang => lang.split('-')[0]) // Remove region code

        // Search for supported languages in priority order
        for (const lang of languages) {
          if (availableLocales.includes(lang)) {
            return lang
          }
        }

        return null
      },

      // Redirect handling during SSR
      serverRedirect: (redirectTo) => {
        // Express.js example
        if (typeof globalThis !== 'undefined' && globalThis.ssrContext) {
          globalThis.ssrContext.redirect = redirectTo
        }
      },

      // Initial path configuration
      initialPath: () => initialPath
    }
  })
}
```

### Cookie Storage Implementation

```typescript
// utils/cookie-storage.ts
import { StrategyStorage } from '@fastkit/vue-i18n'

export class CookieStorage implements StrategyStorage {
  get(key: string): string | null {
    if (typeof document === 'undefined') return null

    const cookies = document.cookie.split(';')
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=')
      if (name === key) {
        return decodeURIComponent(value)
      }
    }
    return null
  }

  set(key: string, value: string): void {
    if (typeof document === 'undefined') return

    const expires = new Date()
    expires.setFullYear(expires.getFullYear() + 1) // 1年間有効

    document.cookie = `${key}=${encodeURIComponent(value)}; expires=${expires.toUTCString()}; path=/`
  }
}

// Usage example
const i18n = createVueI18n(AppSpace, {
  components: AppComponents,
  client: {
    strategyStorage: new CookieStorage()
  }
})
```

### Dynamic Translation Loading

```typescript
// composables/useAsyncTranslation.ts
import { ref, watch } from 'vue'
import { useI18nSpace } from '@fastkit/vue-i18n'

export function useAsyncTranslation<T>(
  loader: (locale: string) => Promise<T>
) {
  const i18n = useI18nSpace()
  const data = ref<T | null>(null)
  const loading = ref(false)
  const error = ref<Error | null>(null)

  const load = async (locale?: string) => {
    const targetLocale = locale || i18n.locale
    loading.value = true
    error.value = null

    try {
      data.value = await loader(targetLocale)
    } catch (err) {
      error.value = err as Error
    } finally {
      loading.value = false
    }
  }

  // Automatic reload on language change
  watch(() => i18n.locale, load, { immediate: true })

  return {
    data,
    loading,
    error,
    reload: () => load()
  }
}

// Usage example
export default {
  setup() {
    const { data: productCategories, loading } = useAsyncTranslation(
      async (locale) => {
        const response = await fetch(`/api/categories?locale=${locale}`)
        return response.json()
      }
    )

    return {
      productCategories,
      loading
    }
  }
}
```

## API Specification

### `createVueI18n(Space, options?)`

Creates an internationalization service for Vue.js applications.

**Parameters:**
- `Space` (I18nSpaceStatic): Internationalization space definition
- `options` (VueI18nSpaceOptions, optional): Initialization options

**Returns:**
- `VueI18n`: Vue I18n service instance

```typescript
interface VueI18nSpaceOptions {
  components?: I18nDependencies;          // Translation component mapping
  defaultLocale?: string;                 // Default language
  strategy?: VueI18nStrategyFactory;      // Language switching strategy
  client?: VueI18nClientSettings;         // Client settings
  storage?: I18nStorageFactory;           // Storage factory
}

interface VueI18n {
  Space: I18nSpaceStatic;                 // Space definition
  setup(): { space: I18nSpace; install: (app: App) => void };
  use(): I18nSpace;                       // Get current space
  defineSubSpace(components): SubSpaceProvider;
  setupRouter(router: Router): void;      // Router initialization
  extendRouterOptions(options: RouterOptions): void;
}
```

### `useI18nSpace()`

Composition API function to get the current internationalization space.

```typescript
function useI18nSpace(): I18nSpace

interface I18nSpace {
  locale: string;                         // Current language
  availableLocales: string[];             // Available languages list
  at: ComponentTranslations;              // Translation accessor
  setLocale(locale: string): Promise<void>; // Language change
  isLocaleAvailable(locale: string): boolean;
}
```

### `defineVueI18nStrategy(strategy)`

Defines a custom language switching strategy.

```typescript
interface VueI18nStrategy {
  detectLocaleFromRoute?(route: RouteLocation): string | null;
  updateRouteOnLocaleChange?(
    route: RouteLocation,
    locale: string,
    router: Router
  ): Promise<void>;
  getInitialLocale?(
    availableLocales: string[],
    clientLanguage?: string
  ): string;
  setupRouter?(router: Router): void;
  extendRouterOptions?(options: RouterOptions): void;
}
```

## Advanced Usage Examples

### Multi-tenant Support

```typescript
// multi-tenant-i18n.ts
import { createVueI18n } from '@fastkit/vue-i18n'
import { ref, computed } from 'vue'

interface TenantConfig {
  id: string
  supportedLocales: string[]
  defaultLocale: string
  components: any
}

export function createMultiTenantI18n(tenants: Record<string, TenantConfig>) {
  const currentTenant = ref<string>('')

  const i18nInstances = computed(() => {
    return Object.fromEntries(
      Object.entries(tenants).map(([id, config]) => [
        id,
        createVueI18n(config.space, {
          components: config.components,
          defaultLocale: config.defaultLocale
        })
      ])
    )
  })

  const currentI18n = computed(() => {
    return i18nInstances.value[currentTenant.value]
  })

  return {
    setTenant: (tenantId: string) => {
      currentTenant.value = tenantId
    },
    getCurrentI18n: () => currentI18n.value,
    getTenantI18n: (tenantId: string) => i18nInstances.value[tenantId]
  }
}
```

### Plugin-based Translation Extension

```typescript
// plugins/i18n-formatter.ts
import { I18nSpace } from '@fastkit/vue-i18n'

export interface FormatPluginOptions {
  currency?: {
    code: string
    locale?: string
  }
  date?: {
    locale?: string
    format?: Intl.DateTimeFormatOptions
  }
}

export function createFormatPlugin(options: FormatPluginOptions = {}) {
  return {
    install(space: I18nSpace) {
      // Currency formatting
      space.addFormatter('currency', (value: number) => {
        const { code = 'USD', locale } = options.currency || {}
        return new Intl.NumberFormat(locale || space.locale, {
          style: 'currency',
          currency: code
        }).format(value)
      })

      // Date formatting
      space.addFormatter('date', (value: Date | string) => {
        const { locale, format } = options.date || {}
        const date = typeof value === 'string' ? new Date(value) : value
        return new Intl.DateTimeFormat(
          locale || space.locale,
          format || { year: 'numeric', month: 'long', day: 'numeric' }
        ).format(date)
      })

      // Relative time formatting
      space.addFormatter('relativeTime', (value: Date | string) => {
        const date = typeof value === 'string' ? new Date(value) : value
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

        const rtf = new Intl.RelativeTimeFormat(space.locale)
        return rtf.format(-diffDays, 'day')
      })
    }
  }
}
```

## Considerations

### Performance Considerations

- Use dynamic imports for translation components to enable lazy loading
- Split large translation files and load only necessary parts
- Configure cache strategies appropriately to minimize network requests

### SSR/SSG Support

- Properly implement language detection on the server side
- Avoid language inconsistencies during hydration
- Properly configure hreflang attributes for SEO

### Accessibility

- Dynamically update lang attributes
- Support right-to-left (RTL) languages
- Provide language switching notifications for screen readers

## License

MIT

## Related Packages

- [@fastkit/i18n](../i18n/README.md): Core internationalization library
- [@fastkit/accept-language](../accept-language/README.md): Accept-Language header parsing
- [@fastkit/vue-utils](../vue-utils/README.md): Vue.js utility functions
