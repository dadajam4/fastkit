
# @fastkit/cookies

🌐 English | [日本語](https://github.com/dadajam4/fastkit/blob/main/packages/cookies/README-ja.md)

A helper library for universally controlling Cookie headers on both server and browser. Designed TypeScript-first and provides a consistent API for both Node.js server environments and browser environments.

## Features

- **Universal API**: Unified Cookie operation interface for server (Node.js) and browser
- **Full TypeScript Support**: Type safety through strict type definitions
- **Event-Driven**: Real-time notification functionality for Cookie changes
- **Automatic Context Detection**: Automatic context setting based on execution environment
- **Secure Cookie Support**: Complete support for security options like HttpOnly, Secure, SameSite
- **Duplicate Prevention**: Automatic elimination of duplicate Set-Cookie headers in server environments
- **Error Handling**: Proper error handling and warning messages
- **Lightweight Design**: High performance with minimal dependencies

## Installation

```bash
npm install @fastkit/cookies
```

## Basic Usage

### Basic Browser Operations

```typescript
import { Cookies } from '@fastkit/cookies'

// Browser environment automatically uses document context
const cookies = new Cookies()

// Set cookies
cookies.set('username', 'john_doe')
cookies.set('theme', 'dark', {
  expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days later
  path: '/',
  secure: true,
  sameSite: 'strict'
})

// Get cookies
const username = cookies.get('username') // 'john_doe'
const theme = cookies.get('theme') // 'dark'

// Delete cookies
cookies.delete('username')

// Check all cookies
console.log(cookies.bucket) // All current cookies
```

### Using on Server (Node.js)

```typescript
import { Cookies } from '@fastkit/cookies'
import type { IncomingMessage, ServerResponse } from 'http'

// Express.js usage example
app.get('/api/user', (req: IncomingMessage, res: ServerResponse) => {
  const cookies = new Cookies({ req, res })

  // Read Cookie from request
  const sessionId = cookies.get('session_id')

  if (!sessionId) {
    // Generate and set new session ID
    const newSessionId = generateSessionId()
    cookies.set('session_id', newSessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    })
  }

  // Set user settings Cookie
  cookies.set('last_visit', new Date().toISOString(), {
    expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year later
  })

  res.end('Cookie setup completed')
})
```

### Usage Example with Next.js

```typescript
// pages/api/auth/login.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { Cookies } from '@fastkit/cookies'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const cookies = new Cookies({ req, res })

  if (req.method === 'POST') {
    const { username, password } = req.body

    // Authentication process (placeholder)
    if (authenticate(username, password)) {
      // Set authentication token to Cookie
      cookies.set('auth_token', generateToken(username), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      })

      // Save user settings to Cookie
      cookies.set('user_prefs', JSON.stringify({
        theme: 'light',
        language: 'ja'
      }), {
        expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
      })

      res.status(200).json({ success: true })
    } else {
      res.status(401).json({ error: 'Invalid credentials' })
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' })
  }
}

function authenticate(username: string, password: string): boolean {
  // Actual authentication logic
  return username === 'admin' && password === 'password'
}

function generateToken(username: string): string {
  // Actual token generation logic
  return `token_${username}_${Date.now()}`
}
```

## Advanced Usage Examples

### Real-time Monitoring of Cookie Changes

```typescript
import { Cookies } from '@fastkit/cookies'

const cookies = new Cookies()

// Register Cookie change event listener
cookies.on('change', (event) => {
  console.log(`Cookie "${event.name}" changed:`, event.value)

  // Monitor specific Cookie changes
  if (event.name === 'theme') {
    updateTheme(event.value)
  }

  if (event.name === 'language') {
    updateLanguage(event.value)
  }
})

// Theme change processing
function updateTheme(theme: string | undefined) {
  if (theme) {
    document.body.className = `theme-${theme}`
    console.log(`Changed theme to ${theme}`)
  }
}

// Language change processing
function updateLanguage(language: string | undefined) {
  if (language) {
    document.documentElement.lang = language
    console.log(`Changed language to ${language}`)
  }
}

// Dynamic Cookie setting
cookies.set('theme', 'dark')  // change event occurs
cookies.set('language', 'ja') // change event occurs
```

### Custom Cookie Utility Class

```typescript
import { Cookies } from '@fastkit/cookies'
import type { CookiesContext, CookieSerializeOptions } from '@fastkit/cookies'

interface UserPreferences {
  theme: 'light' | 'dark'
  language: string
  timezone: string
  notifications: boolean
}

interface SessionData {
  userId: string
  role: string
  permissions: string[]
}

class CookieManager {
  private cookies: Cookies

  constructor(context?: CookiesContext) {
    this.cookies = new Cookies(context)
  }

  // User settings management
  setUserPreferences(prefs: UserPreferences) {
    const options: CookieSerializeOptions = {
      expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      path: '/',
      sameSite: 'strict'
    }

    this.cookies.set('user_prefs', JSON.stringify(prefs), options)
  }

  getUserPreferences(): UserPreferences | null {
    const prefsStr = this.cookies.get('user_prefs')
    if (!prefsStr) return null

    try {
      return JSON.parse(prefsStr) as UserPreferences
    } catch (error) {
      console.error('User settings parsing error:', error)
      return null
    }
  }

  // Session management
  setSession(sessionData: SessionData) {
    const options: CookieSerializeOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }

    this.cookies.set('session', JSON.stringify(sessionData), options)
  }

  getSession(): SessionData | null {
    const sessionStr = this.cookies.get('session')
    if (!sessionStr) return null

    try {
      return JSON.parse(sessionStr) as SessionData
    } catch (error) {
      console.error('Session data parsing error:', error)
      return null
    }
  }

  clearSession() {
    this.cookies.delete('session')
  }

  // CSRF token management
  setCSRFToken(token: string) {
    this.cookies.set('csrf_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/'
    })
  }

  getCSRFToken(): string | undefined {
    return this.cookies.get('csrf_token')
  }

  // Consent Cookie management
  setConsent(accepted: boolean) {
    this.cookies.set('cookie_consent', accepted.toString(), {
      expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      path: '/',
      sameSite: 'strict'
    })
  }

  getConsent(): boolean | null {
    const consent = this.cookies.get('cookie_consent')
    if (consent === undefined) return null
    return consent === 'true'
  }

  // Tracking opt-out
  setTrackingPreference(enabled: boolean) {
    this.cookies.set('tracking_enabled', enabled.toString(), {
      expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      path: '/',
      sameSite: 'strict'
    })
  }

  isTrackingEnabled(): boolean {
    const tracking = this.cookies.get('tracking_enabled')
    return tracking === 'true'
  }

  // Delete all Cookies (for logout, etc.)
  clearAllCookies() {
    const cookieNames = Object.keys(this.cookies.bucket)
    cookieNames.forEach(name => {
      this.cookies.delete(name)
    })
  }
}

// Usage example
const cookieManager = new CookieManager()

// Save user settings
cookieManager.setUserPreferences({
  theme: 'dark',
  language: 'ja',
  timezone: 'Asia/Tokyo',
  notifications: true
})

// Create session
cookieManager.setSession({
  userId: 'user123',
  role: 'admin',
  permissions: ['read', 'write', 'delete']
})

// Handle Cookie consent
if (cookieManager.getConsent() === null) {
  // Show consent confirmation dialog
  showConsentDialog().then(accepted => {
    cookieManager.setConsent(accepted)
  })
}
```

### Integration with Express.js Middleware

```typescript
import express from 'express'
import { Cookies } from '@fastkit/cookies'
import type { Request, Response, NextFunction } from 'express'

// Add Cookies instance to request object
declare global {
  namespace Express {
    interface Request {
      cookies: Cookies
    }
  }
}

// Cookies middleware
export function cookiesMiddleware(req: Request, res: Response, next: NextFunction) {
  req.cookies = new Cookies({ req, res })
  next()
}

// Application setup
const app = express()

app.use(cookiesMiddleware)

// Protect routes that require authentication
app.use('/protected', (req: Request, res: Response, next: NextFunction) => {
  const sessionToken = req.cookies.get('session_token')

  if (!sessionToken || !isValidToken(sessionToken)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  next()
})

// Login endpoint
app.post('/auth/login', async (req: Request, res: Response) => {
  const { username, password } = req.body

  try {
    const user = await authenticateUser(username, password)

    if (user) {
      const sessionToken = generateSessionToken(user.id)

      // Set session Cookie
      req.cookies.set('session_token', sessionToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      })

      // Set user info Cookie
      req.cookies.set('user_info', JSON.stringify({
        id: user.id,
        name: user.name,
        role: user.role
      }), {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      })

      res.json({ success: true, user })
    } else {
      res.status(401).json({ error: 'Invalid credentials' })
    }
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Internal server error' })
  }
})

// Logout endpoint
app.post('/auth/logout', (req: Request, res: Response) => {
  // Delete session-related Cookies
  req.cookies.delete('session_token')
  req.cookies.delete('user_info')

  res.json({ success: true })
})

// Protected resource
app.get('/protected/profile', (req: Request, res: Response) => {
  const userInfo = req.cookies.get('user_info')

  if (userInfo) {
    try {
      const user = JSON.parse(userInfo)
      res.json({ user })
    } catch (error) {
      res.status(400).json({ error: 'Invalid user data' })
    }
  } else {
    res.status(401).json({ error: 'User not found' })
  }
})

async function authenticateUser(username: string, password: string) {
  // Actual authentication logic
  // Search for user from database and verify password
  return { id: '123', name: username, role: 'user' }
}

function generateSessionToken(userId: string): string {
  // Actual token generation logic
  return `session_${userId}_${Date.now()}`
}

function isValidToken(token: string): boolean {
  // Actual token verification logic
  return token.startsWith('session_')
}

app.listen(3000, () => {
  console.log('Server started: http://localhost:3000')
})
```

## Cookie Setting Options

### Basic Options

```typescript
import { Cookies } from '@fastkit/cookies'

const cookies = new Cookies()

// Basic setting
cookies.set('simple_cookie', 'value')

// Detailed settings
cookies.set('advanced_cookie', 'value', {
  // Expiration date (date specification)
  expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days later

  // Expiration date (seconds specification)
  maxAge: 60 * 60 * 24 * 7, // 7 days (seconds)

  // Path specification
  path: '/admin', // Valid only under /admin path

  // Domain specification
  domain: '.example.com', // Valid on example.com and its subdomains

  // HTTPS required
  secure: true,

  // JavaScript inaccessible (server only)
  httpOnly: true,

  // SameSite attribute (CSRF attack prevention)
  sameSite: 'strict' // 'strict' | 'lax' | 'none'
})
```

### SameSite Attribute Details

```typescript
// Strict: Send Cookie only for requests from the same site
cookies.set('strict_cookie', 'value', { sameSite: 'strict' })

// Lax: Send Cookie for same site + safe cross-site navigation (GET)
cookies.set('lax_cookie', 'value', { sameSite: 'lax' })

// None: Send Cookie for all cross-site requests (secure required)
cookies.set('none_cookie', 'value', {
  sameSite: 'none',
  secure: true // Required when sameSite: 'none'
})
```

## API Specification

### `Cookies` Class

```typescript
class Cookies extends EV<CookiesEventMap> {
  constructor(ctx?: CookiesContext, options?: CookiesOptions)

  // Cookie operations
  get(name: string): string | undefined
  set(name: string, value: string, options?: CookieSerializeOptions): void
  delete(name: string, options?: CookieSerializeOptions): void

  // Cookie parsing
  parse(options?: CookieParseOptions): CookiesBucket

  // Properties
  readonly ctx: CookiesContext
  readonly options?: CookiesOptions
  readonly bucket: CookiesBucket  // Current Cookie list
}
```

### Type Definitions

```typescript
// Context type
type CookiesContext = CookiesBrowserContext | CookiesServerContext

interface CookiesBrowserContext extends Document {}

interface CookiesServerContext {
  req?: IncomingMessage
  res?: ServerResponse
}

// Cookie storage type
type CookiesBucket = Record<string, string>

// Event type
interface OnCookiesChangeEvent {
  name: string
  value: string | undefined
}

interface CookiesEventMap {
  change: OnCookiesChangeEvent
}

// Option type
interface CookiesOptions extends CookieParseOptions {
  bucket?: CookiesBucket
}

// Cookie serialize options
interface CookieSerializeOptions {
  expires?: Date
  maxAge?: number
  path?: string
  domain?: string
  secure?: boolean
  httpOnly?: boolean
  sameSite?: 'strict' | 'lax' | 'none' | boolean
  encode?: (value: string) => string
}
```

### Helper Functions

```typescript
// Context determination
function isCookiesBrowserContext(source: any): source is CookiesBrowserContext
function isIncomingMessage(source: any): source is IncomingMessage
function isServerResponse(source: any): source is ServerResponse

// Cookie operations
function createCookie(name: string, value: string, options?: CookieSerializeOptions): Cookie
function areCookiesEqual(a: Cookie, b: Cookie): boolean
```

## Considerations

### Browser Limitations
- httpOnly option cannot be used in browsers
- Note Cookie size limit (approximately 4KB)
- Note Cookie count limit per domain

### Server Environment
- Warning displayed when setting Cookie after sending response
- Duplicate Set-Cookie headers are automatically excluded
- Do not use secure option when not HTTPS

### Security
- Use httpOnly and secure options for sensitive information
- Set sameSite attribute appropriately to prevent CSRF attacks
- Implement input validation and sanitization as XSS attack countermeasures

### Performance
- Minimize Cookie count and size
- Consider performance impact from frequent updates
- Use session storage instead of Cookies for large data

## License

MIT

## Related Packages

- [@fastkit/ev](../ev/README.md): Event emitter foundation
- [@fastkit/helpers](../helpers/README.md): Basic utility functions
- [@fastkit/tiny-logger](../tiny-logger/README.md): Log output functionality
