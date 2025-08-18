# @fastkit/accept-language

🌐 English | [日本語](./README-ja.md)

A lightweight parser library that analyzes HTTP Accept-Language headers and sorts them by quality order. Used in multilingual web applications to properly determine the language preferred by clients.

## Features

- **Accept-Language Header Parsing**: Full compatibility with standard HTTP header format
- **Quality Value Sorting**: Prioritization based on q-values (quality values)
- **Language Code Analysis**: Detailed parsing of code, script, and region
- **Optimal Language Selection**: Automatic selection of the best language from supported language list
- **Loose Matching Option**: Support for partial language matching
- **Full TypeScript Support**: Type safety through strict type definitions
- **Lightweight Design**: Efficient implementation with minimal dependencies
- **Error Handling**: Robust handling of malformed headers

## Installation

```bash
npm install @fastkit/accept-language
```

## Basic Usage

### Accept-Language Header Parsing

```typescript
import { parse } from '@fastkit/accept-language'

// Parse typical Accept-Language header
const acceptLanguage = 'en-US,en;q=0.9,ja;q=0.8,zh-CN;q=0.7'
const parsed = parse(acceptLanguage)

console.log(parsed)
// [
//   { code: 'en', script: null, region: 'US', quality: 1.0 },
//   { code: 'en', script: null, region: '', quality: 0.9 },
//   { code: 'ja', script: null, region: '', quality: 0.8 },
//   { code: 'zh', script: null, region: 'CN', quality: 0.7 }
// ]

// Parse language codes with scripts
const complexHeader = 'zh-Hans-CN;q=0.9,zh-Hant-TW;q=0.8,en;q=0.7'
const complexParsed = parse(complexHeader)

console.log(complexParsed)
// [
//   { code: 'zh', script: 'Hans', region: 'CN', quality: 0.9 },
//   { code: 'zh', script: 'Hant', region: 'TW', quality: 0.8 },
//   { code: 'en', script: null, region: '', quality: 0.7 }
// ]
```

### Optimal Language Selection

```typescript
import { pick } from '@fastkit/accept-language'

// List of supported languages
const supportedLanguages = ['en-US', 'ja-JP', 'zh-CN', 'fr-FR']

// Client's Accept-Language header
const clientLanguages = 'ja;q=0.9,en-US;q=0.8,zh-CN;q=0.7'

// Select the best language
const bestLanguage = pick(supportedLanguages, clientLanguages)
console.log(bestLanguage) // 'ja-JP'

// Can also select from parsed language array
const parsedLanguages = parse(clientLanguages)
const bestFromParsed = pick(supportedLanguages, parsedLanguages)
console.log(bestFromParsed) // 'ja-JP'
```

### Language Selection with Loose Matching

```typescript
import { pick } from '@fastkit/accept-language'

const supportedLanguages = ['en', 'ja', 'zh-CN']
const clientLanguages = 'en-US,ja-JP,zh-TW'

// Strict matching (default)
const strictMatch = pick(supportedLanguages, clientLanguages)
console.log(strictMatch) // null (no exact match)

// Enable loose matching
const looseMatch = pick(supportedLanguages, clientLanguages, { loose: true })
console.log(looseMatch) // 'en' (matches by language code only)
```

## Practical Usage Examples

### Multilingual Support with Express.js

```typescript
import express from 'express'
import { pick } from '@fastkit/accept-language'

const app = express()

// Supported language configuration
const SUPPORTED_LANGUAGES = ['en-US', 'ja-JP', 'ko-KR', 'zh-CN']
const DEFAULT_LANGUAGE = 'en-US'

// Language detection middleware
app.use((req, res, next) => {
  const acceptLanguage = req.headers['accept-language']
  
  // Determine the optimal language
  const preferredLanguage = pick(
    SUPPORTED_LANGUAGES,
    acceptLanguage,
    { loose: true }
  ) || DEFAULT_LANGUAGE
  
  // Add language information to request
  req.locale = preferredLanguage
  res.locals.locale = preferredLanguage
  
  next()
})

// API response example
app.get('/api/messages', (req, res) => {
  const messages = getLocalizedMessages(req.locale)
  res.json({
    locale: req.locale,
    messages
  })
})
```

### Internationalization with Next.js

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { pick } from '@fastkit/accept-language'

const SUPPORTED_LOCALES = ['en', 'ja', 'ko', 'zh']
const DEFAULT_LOCALE = 'en'

export function middleware(request: NextRequest) {
  // Select optimal language from Accept-Language header
  const acceptLanguage = request.headers.get('accept-language')
  const preferredLocale = pick(
    SUPPORTED_LOCALES,
    acceptLanguage,
    { loose: true }
  ) || DEFAULT_LOCALE
  
  // Redirect if path doesn't include language code
  const pathname = request.nextUrl.pathname
  if (!SUPPORTED_LOCALES.some(locale => pathname.startsWith(`/${locale}`))) {
    const url = request.nextUrl.clone()
    url.pathname = `/${preferredLocale}${pathname}`
    return NextResponse.redirect(url)
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)']
}
```

### Automatic Language Setup in Vue.js Applications

```typescript
// plugins/i18n.ts
import { createI18n } from 'vue-i18n'
import { pick } from '@fastkit/accept-language'

// Get browser language settings
const browserLanguages = navigator.language || navigator.languages?.[0]
const supportedLocales = ['en-US', 'ja-JP', 'ko-KR']

// Auto-select optimal language
const defaultLocale = pick(
  supportedLocales,
  browserLanguages,
  { loose: true }
) || 'en-US'

export const i18n = createI18n({
  legacy: false,
  locale: defaultLocale,
  fallbackLocale: 'en-US',
  messages: {
    'en-US': enMessages,
    'ja-JP': jaMessages,
    'ko-KR': koMessages
  }
})
```

### Custom Language Detection Function

```typescript
import { parse, pick, type ParsedLanguage } from '@fastkit/accept-language'

class LanguageDetector {
  private supportedLanguages: string[]
  private fallbackLanguage: string

  constructor(
    supportedLanguages: string[],
    fallbackLanguage: string
  ) {
    this.supportedLanguages = supportedLanguages
    this.fallbackLanguage = fallbackLanguage
  }

  /**
   * Determine optimal language (combining multiple strategies)
   */
  detectBestLanguage(
    acceptLanguageHeader?: string | null,
    userPreference?: string,
    sessionLanguage?: string
  ): string {
    // 1. User preference takes highest priority
    if (userPreference && this.isSupported(userPreference)) {
      return userPreference
    }

    // 2. Consider session language next
    if (sessionLanguage && this.isSupported(sessionLanguage)) {
      return sessionLanguage
    }

    // 3. Determine from Accept-Language header
    if (acceptLanguageHeader) {
      const detected = pick(
        this.supportedLanguages,
        acceptLanguageHeader,
        { loose: true }
      )
      if (detected) return detected
    }

    // 4. Return fallback language
    return this.fallbackLanguage
  }

  /**
   * Detailed language analysis
   */
  analyzeLanguagePreferences(acceptLanguageHeader: string) {
    const parsed = parse(acceptLanguageHeader)
    
    return {
      languages: parsed,
      hasHighQuality: parsed.some(lang => lang.quality >= 0.8),
      primaryLanguage: parsed[0]?.code,
      supportedMatches: parsed.filter(lang => 
        this.supportedLanguages.some(supported => 
          supported.toLowerCase().startsWith(lang.code.toLowerCase())
        )
      )
    }
  }

  private isSupported(language: string): boolean {
    return this.supportedLanguages.includes(language)
  }
}

// Usage example
const detector = new LanguageDetector(
  ['en-US', 'ja-JP', 'ko-KR', 'zh-CN'],
  'en-US'
)

const bestLanguage = detector.detectBestLanguage(
  'ja;q=0.9,en-US;q=0.8,ko;q=0.7',
  undefined, // No user preference
  'zh-CN'    // Session language
)

console.log(bestLanguage) // 'zh-CN'
```

## API Specification

### `parse(acceptLanguage)`

Parses Accept-Language header string and returns language array sorted by quality.

**Parameters:**
- `acceptLanguage` (string | null | undefined): Accept-Language header string

**Return Value:**
- `ParsedLanguage[]`: Array of parsed languages

```typescript
interface ParsedLanguage {
  code: string;        // Language code (e.g. 'en', 'ja')
  script: string | null; // Script (e.g. 'Hans', 'Hant')
  region: string;      // Region code (e.g. 'US', 'JP')
  quality: number;     // Quality value (0.0-1.0)
}
```

### `pick(supportedLanguages, acceptLanguages, options?)`

Selects the most suitable language from the list of supported languages based on client preferences.

**Parameters:**
- `supportedLanguages` (string[] | readonly string[]): List of supported languages
- `acceptLanguages` (string | ParsedLanguage[] | null | undefined): Accept-Language header or parsed language array
- `options` (PickOptions, optional): Selection options

**Return Value:**
- `string | null`: Optimal language (null if not found)

```typescript
interface PickOptions {
  loose?: boolean; // Allow loose matching (default: false)
}
```

## Advanced Usage Examples

### Region-Specific Language Processing

```typescript
import { parse, pick } from '@fastkit/accept-language'

// Regional language variations
const regionalLanguages = {
  'zh-CN': '简体中文',  // China (Simplified)
  'zh-TW': '繁體中文',  // Taiwan (Traditional)
  'zh-HK': '繁體中文',  // Hong Kong (Traditional)
  'en-US': 'English (US)',
  'en-GB': 'English (UK)',
  'pt-BR': 'Português (Brasil)',
  'pt-PT': 'Português (Portugal)'
}

function getRegionalLanguage(acceptLanguage: string) {
  const supportedLanguages = Object.keys(regionalLanguages)
  
  // Try strict matching first
  let selected = pick(supportedLanguages, acceptLanguage)
  
  if (!selected) {
    // Retry with loose matching
    selected = pick(supportedLanguages, acceptLanguage, { loose: true })
  }
  
  return selected ? {
    code: selected,
    name: regionalLanguages[selected as keyof typeof regionalLanguages],
    isExactMatch: !parse(acceptLanguage).some(lang => 
      `${lang.code}-${lang.region}` === selected
    )
  } : null
}
```

### Performance Optimization

```typescript
import { parse, pick } from '@fastkit/accept-language'

class OptimizedLanguageDetector {
  private cache = new Map<string, string | null>()
  private readonly maxCacheSize = 1000

  constructor(
    private supportedLanguages: readonly string[],
    private defaultLanguage: string
  ) {}

  detectLanguage(acceptLanguageHeader: string): string {
    // Search from cache
    const cached = this.cache.get(acceptLanguageHeader)
    if (cached !== undefined) {
      return cached || this.defaultLanguage
    }

    // Execute new detection
    const detected = pick(
      this.supportedLanguages,
      acceptLanguageHeader,
      { loose: true }
    )

    // Cache size limit
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value
      this.cache.delete(firstKey)
    }

    // Cache result
    this.cache.set(acceptLanguageHeader, detected)
    
    return detected || this.defaultLanguage
  }

  clearCache(): void {
    this.cache.clear()
  }
}
```

## Considerations

### Browser Support

- Supported in all modern browsers
- Works with Internet Explorer 11 and later
- Recommended for use in Node.js environments

### Performance Considerations

- Parsing is lightweight, but caching results is recommended for high-volume requests
- Processing time for long Accept-Language headers is proportional to number of languages
- Memory usage depends on number of languages processed

### Security

- Input validation is performed internally
- Robust handling of malformed header values
- Values that could lead to XSS attacks are automatically excluded

## License

MIT

## Related Packages

- [@fastkit/i18n](../i18n/README.md): Internationalization framework
- [@fastkit/vue-i18n](../vue-i18n/README.md): Vue.js internationalization tools
- [@fastkit/helpers](../helpers/README.md): Basic utility functions