
# @fastkit/i18n

🌐 English | [日本語](https://github.com/dadajam4/fastkit/blob/main/packages/i18n/README-ja.md)

A comprehensive library for internationalizing applications to multiple languages without depending on server/browser execution environments.

## Features

- **Universal Support**: Same API can be used in Node.js and browser environments
- **Type Safety**: Full TypeScript support with type-safe translation system
- **Hierarchical Structure**: 3-layer architecture of Space, Component, and Locale
- **Intl API Integration**: Full utilization of native browser internationalization features
- **Fallback**: Hierarchical translation fallback mechanism
- **Asynchronous Loading**: Support for dynamic translation data loading
- **Customizable**: Flexible formatter and storage system

## Installation

```bash
npm install @fastkit/i18n
# or
pnpm add @fastkit/i18n
```

## Basic Usage

### 1. Defining Internationalization Space

```typescript
import { defineI18nSpace } from '@fastkit/i18n';

// Space definition (language settings for entire project)
const Space = defineI18nSpace({
  locales: [
    'ja',
    { name: 'en', formatLocales: ['en-US'] },
    { name: 'zh', formatLocales: ['zh-CN'] }
  ],
  baseLocale: 'ja',        // Base language
  defaultLocale: 'en',     // Default language
  fallbackLocale: 'ja'     // Fallback language
});
```

### 2. Defining Component Schema

```typescript
// Translation data type definition
interface Translations {
  greeting: string;
  farewell: string;
  itemCount: string;
}

// Format definition
const dateTimeFormats = {
  short: { year: 'numeric', month: 'short', day: 'numeric' },
  long: {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  }
} as const;

const numberFormats = {
  currency: { style: 'currency', currency: 'JPY' },
  percent: { style: 'percent' }
} as const;

// Schema definition
const schema = Space.defineSchema({
  translations: (t: Translations) => true,
  dateTimeFormats,
  numberFormats
});
```

### 3. Defining Locale-Specific Data

```typescript
// Japanese
const ja = schema.defineLocale.strict({
  translations: {
    greeting: 'Hello',
    farewell: 'Goodbye',
    itemCount: '{count}個のアイテム'
  },
  dateTimeFormats: {
    short: { year: 'numeric', month: 'short', day: 'numeric' }
  },
  numberFormats: {
    currency: { style: 'currency', currency: 'JPY' }
  }
});

// English
const en = schema.defineLocale.strict({
  translations: {
    greeting: 'Hello',
    farewell: 'Goodbye',
    itemCount: '{count} items'
  },
  numberFormats: {
    currency: { style: 'currency', currency: 'USD' }
  }
});
```

### 4. Creating and Using Components

```typescript
// Component definition
const Component = schema.defineComponent({
  locales: { ja, en }
});

// Instance creation
const i18n = Component.createInstance();

// Language switching
await i18n.setLocale('ja');

// Get translation
const greeting = i18n.t.greeting; // → 'Hello'

// Translation with parameters
const count = i18n.t.itemCount.replace('{count}', '5'); // → '5個のアイテム'

// Date/time formatting
const date = i18n.d(new Date(), 'short'); // → '2024年1月15日'

// Number formatting
const price = i18n.n(1500, 'currency'); // → '¥1,500'
```

## Advanced Usage Examples

### Asynchronous Loading

```typescript
const Component = schema.defineComponent({
  locales: {
    ja: () => import('./locales/ja'),
    en: () => import('./locales/en'),
    zh: () => import('./locales/zh')
  }
});

const i18n = Component.createInstance();

// Automatic loading on language switching
await i18n.setLocale('zh');
console.log(i18n.t.greeting); // Displays Chinese translation
```

### Components with Dependencies

```typescript
// Common component
const CommonComponent = schema.defineComponent({
  locales: { ja: commonJa, en: commonEn }
});

// Schema with dependencies
const pageSchema = Space.defineSchema({
  translations: (t: PageTranslations) => true,
  dependencies: {
    common: CommonComponent
  }
});

const PageComponent = pageSchema.defineComponent({
  locales: { ja: pageJa, en: pageEn }
});

const pageI18n = PageComponent.createInstance();

// Access dependent components
const commonGreeting = pageI18n.common.t.greeting;
const pageTitle = pageI18n.t.title;
```

### Custom Storage

```typescript
import { createI18nObjectStorage } from '@fastkit/i18n';

// Redis storage example
const redisStorage = createI18nObjectStorage({
  get: async (key) => {
    return await redis.get(key);
  },
  set: async (key, value) => {
    await redis.set(key, JSON.stringify(value));
  }
});

const Component = schema.defineComponent({
  locales: { ja, en },
  storage: redisStorage
});
```

## API

### defineI18nSpace

Defines an internationalization space.

```typescript
const Space = defineI18nSpace({
  locales: LocaleSource[],           // Locale settings
  baseLocale: string,                // Base language
  defaultLocale?: string,            // Default language
  fallbackLocale?: FallbackConfig    // Fallback settings
});
```

### Space.defineSchema

Defines a component schema.

```typescript
const schema = Space.defineSchema({
  translations: (t: T) => boolean,            // Translation type definition
  dateTimeFormats?: DateTimeFormats,          // Date/time formats
  relativeTimeFormats?: RelativeTimeFormats,  // Relative time formats
  numberFormats?: NumberFormats,              // Number formats
  listFormats?: ListFormats,                  // List formats
  dependencies?: Dependencies                 // Dependent components
});
```

### schema.defineLocale

Defines locale-specific data.

```typescript
const locale = schema.defineLocale({
  translations: TranslationsData,     // Translation data
  dateTimeFormats?: DateTimeFormats,  // Date/time formats
  numberFormats?: NumberFormats,      // Number formats
  // ...other formats
});
```

### schema.defineComponent

Defines a component.

```typescript
const Component = schema.defineComponent({
  locales: LocaleMap,          // Locale map
  storage?: Storage,           // Storage settings
  strict?: boolean            // Strict mode
});
```

### Instance API

#### Language Operations

```typescript
// Get current language
const currentLocale = i18n.locale;

// Switch language
await i18n.setLocale('en');

// List of available languages
const available = i18n.availableLocales;
```

#### Translation

```typescript
// Get translation
const text = i18n.t.keyName;

// Translation function (with parameter support)
const formatted = i18n.translate('keyName', { param: 'value' });
```

#### Formatters

```typescript
// Date/time formatting
i18n.d(new Date())                    // Default
i18n.d(new Date(), 'short')           // Named format
i18n.d(new Date(), { year: '2-digit' }) // Custom options

// Number formatting
i18n.n(1234.56)                       // Default
i18n.n(1234.56, 'currency')          // Currency format
i18n.n(0.95, 'percent')              // Percent

// Relative time
i18n.rt(-2, 'day')                    // '2 days ago'

// List
i18n.l(['apple', 'banana', 'orange']) // 'apple, banana, orange'
```

## Fallback Mechanism

```typescript
const Space = defineI18nSpace({
  locales: ['ja', 'en', 'zh'],
  baseLocale: 'ja',
  fallbackLocale: {
    en: 'ja',      // English → Japanese
    zh: ['en', 'ja'] // Chinese → English → Japanese
  }
});
```

Search order when translation is not found:
1. Current locale
2. Specified fallback locale
3. Base locale

## TypeScript Integration

```typescript
// Automatic inference of translation types
interface AppTranslations {
  nav: {
    home: string;
    about: string;
    contact: string;
  };
  messages: {
    welcome: string;
    error: string;
  };
}

const schema = Space.defineSchema({
  translations: (t: AppTranslations) => true
});

// Type-safe translation access
const welcome = i18n.t.messages.welcome; // ✅ Type checked
const invalid = i18n.t.invalid;          // ❌ Compile error
```

## Dependencies

- `@fastkit/helpers`: Helper utilities
- `@fastkit/tiny-logger`: Logging functionality

## Documentation

For detailed documentation, please visit [here](https://dadajam4.github.io/fastkit/i18n/).

## License

MIT
