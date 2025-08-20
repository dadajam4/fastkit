
# @fastkit/node-util

🌐 English | [日本語](https://github.com/dadajam4/fastkit/blob/main/packages/node-util/README-ja.md)

A utility library for Node.js server and tool implementation. It provides package management, dynamic module loading using esbuild, file system operations, hash comparison, and other features to streamline development in Node.js environments.

## Features

- **Package Management**: package.json search/parsing and automatic package manager detection
- **Dynamic Module Loading**: Runtime compilation and execution of TypeScript/JavaScript using esbuild
- **File Watching**: File change monitoring and hot reload using chokidar
- **Path Operations**: Entry point resolution and file existence verification
- **Hash Comparison**: Change detection and incremental builds using folder hashing
- **Type Safety**: Strict type definitions with TypeScript
- **ESM/CommonJS Support**: Automatic module format detection and appropriate handling

## Installation

```bash
npm install @fastkit/node-util
```

## Basic Usage

### Getting Package Information

```typescript
import { findPackage, findPackageDir, detectPackageManager } from '@fastkit/node-util'

async function packageExample() {
  // Search for package.json from current directory or parent directories
  const packageInfo = await findPackage()

  if (packageInfo) {
    console.log('Package name:', packageInfo.data.name)
    console.log('Version:', packageInfo.data.version)
    console.log('Directory:', packageInfo.dir)
  }

  // Get only the package directory
  const packageDir = await findPackageDir()
  console.log('Package directory:', packageDir)

  // Auto-detect the package manager in use
  const packageManager = await detectPackageManager()
  console.log('Package manager:', packageManager) // 'npm' | 'yarn' | 'pnpm'
}
```

### File and Path Operations

```typescript
import {
  pathExists,
  pathExistsSync,
  resolveEntryPoint,
  getDirname
} from '@fastkit/node-util'

async function pathExample() {
  // Check file/directory existence
  const fileExists = await pathExists('./package.json', 'file')
  const dirExists = await pathExists('./src', 'dir')

  console.log('package.json exists:', fileExists)
  console.log('src directory exists:', dirExists)

  // Synchronous version
  const syncExists = pathExistsSync('./README.md', 'file')
  console.log('README.md exists (sync):', syncExists)

  // Resolve entry point (auto-complete extensions and index.ts)
  const entryPoint = await resolveEntryPoint('./src/main')
  console.log('Resolved entry point:', entryPoint)

  // Get directory name from import.meta.url
  const dirname = getDirname(import.meta.url)
  console.log('Current directory:', dirname)
}
```

## Advanced Usage Examples

### Dynamic Module Execution using esbuild

```typescript
import { esbuildRequire, ESbuildRunner } from '@fastkit/node-util'

// Basic esbuild execution
async function esbuildExample() {
  // Compile and execute TypeScript file at runtime
  const result = await esbuildRequire('./src/config.ts')

  console.log('Entry point:', result.entryPoint)
  console.log('Exported values:', result.exports)
  console.log('Dependencies:', result.dependencies)

  // Get configuration file content
  const config = result.exports.default || result.exports
  console.log('Configuration:', config)
}

// Execution in watch mode
async function watchExample() {
  const runner = new ESbuildRunner({
    entry: './src/config.ts',
    watch: true, // Watch for file changes
    resolver: (result) => {
      // Process exported values
      return result.exports.default || result.exports
    }
  })

  // Event handler for build completion
  runner.on('build', (result) => {
    console.log('Configuration updated:', result.exports)

    // Execute some processing in response to configuration changes
    applyNewConfiguration(result.exports)
  })

  // Initial execution
  const initialResult = await runner.run()
  console.log('Initial configuration:', initialResult.exports)

  // Cleanup after 5 minutes
  setTimeout(() => {
    runner.dispose()
  }, 5 * 60 * 1000)
}

function applyNewConfiguration(config: any) {
  console.log('Applying new configuration:', config)
  // Implement processing according to configuration changes
}
```

### Dynamic Configuration File Loading System

```typescript
import { ESbuildRunner } from '@fastkit/node-util'
import path from 'path'

interface AppConfig {
  server: {
    port: number
    host: string
  }
  database: {
    url: string
    maxConnections: number
  }
  features: {
    auth: boolean
    logging: boolean
  }
}

class ConfigManager {
  private runner: ESbuildRunner<AppConfig> | null = null
  private currentConfig: AppConfig | null = null
  private changeListeners: Array<(config: AppConfig) => void> = []

  async loadConfig(configPath: string, watch = false): Promise<AppConfig> {
    if (this.runner) {
      this.runner.dispose()
    }

    this.runner = new ESbuildRunner<AppConfig>({
      entry: configPath,
      watch,
      resolver: (result) => {
        // Parse TypeScript configuration file
        const config = result.exports.default || result.exports

        // Validate configuration
        this.validateConfig(config)

        return config
      }
    })

    // Handler for configuration changes
    this.runner.on('build', (result) => {
      const newConfig = result.exports
      const oldConfig = this.currentConfig

      console.log('Configuration file updated')

      if (this.hasConfigChanged(oldConfig, newConfig)) {
        this.currentConfig = newConfig
        this.notifyConfigChange(newConfig)
      }
    })

    // Initial loading
    const result = await this.runner.run()
    this.currentConfig = result.exports

    return result.exports
  }

  private validateConfig(config: any): asserts config is AppConfig {
    if (!config.server?.port) {
      throw new Error('Configuration requires server.port')
    }

    if (!config.database?.url) {
      throw new Error('Configuration requires database.url')
    }
  }

  private hasConfigChanged(oldConfig: AppConfig | null, newConfig: AppConfig): boolean {
    if (!oldConfig) return true

    return JSON.stringify(oldConfig) !== JSON.stringify(newConfig)
  }

  private notifyConfigChange(config: AppConfig) {
    this.changeListeners.forEach(listener => {
      try {
        listener(config)
      } catch (error) {
        console.error('Error in configuration change listener:', error)
      }
    })
  }

  onConfigChange(listener: (config: AppConfig) => void) {
    this.changeListeners.push(listener)

    // Return listener removal function
    return () => {
      const index = this.changeListeners.indexOf(listener)
      if (index >= 0) {
        this.changeListeners.splice(index, 1)
      }
    }
  }

  getCurrentConfig(): AppConfig | null {
    return this.currentConfig
  }

  dispose() {
    if (this.runner) {
      this.runner.dispose()
      this.runner = null
    }
    this.changeListeners = []
  }
}

// Usage example
async function configManagerExample() {
  const configManager = new ConfigManager()

  // Register configuration change processing
  const removeListener = configManager.onConfigChange((config) => {
    console.log('Database connection limit:', config.database.maxConnections)
    console.log('Authentication feature:', config.features.auth ? 'enabled' : 'disabled')

    // Process when server configuration changes
    if (config.server.port !== 3000) {
      console.log(`Server port changed to ${config.server.port}`)
      restartServer(config.server)
    }
  })

  // Load configuration in watch mode
  const config = await configManager.loadConfig('./config/app.config.ts', true)

  console.log('Initial configuration:', config)

  // Application cleanup on exit
  process.on('SIGINT', () => {
    removeListener()
    configManager.dispose()
    process.exit(0)
  })
}

function restartServer(serverConfig: AppConfig['server']) {
  console.log(`Restarting server at ${serverConfig.host}:${serverConfig.port}...`)
  // Server restart implementation
}
```

### Incremental Build using Hash Comparison

```typescript
import { HashComparator } from '@fastkit/node-util'
import fs from 'fs-extra'

async function incrementalBuildExample() {
  const comparator = new HashComparator(
    './src',           // Source directory
    './dist',          // Output directory
    { metaFile: '.build-hash' } // Hash file name
  )

  console.log('Checking for changes...')
  const changed = await comparator.hasChanged()

  if (changed) {
    console.log('Changes detected in source files')
    console.log('Executing build...')

    // Execute build process
    await performBuild()

    // Save hash after build completion
    await comparator.commit()
    console.log('Build completed, hash updated')
  } else {
    console.log('No changes, skipping build')
  }
}

async function performBuild() {
  // Actual build process (example: TypeScript compilation)
  console.log('Compiling TypeScript...')
  await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate build time

  // Create output directory
  await fs.ensureDir('./dist')

  // Output build artifacts
  await fs.writeFile('./dist/index.js', '// Compiled JavaScript code')

  console.log('Compilation completed')
}

// Incremental build in watch mode
async function watchedIncrementalBuild() {
  const comparator = new HashComparator('./src', './dist')

  console.log('Starting file watching...')

  // Check periodically (chokidar is recommended for actual projects)
  setInterval(async () => {
    try {
      const changed = await comparator.hasChanged()

      if (changed) {
        console.log(`${new Date().toLocaleTimeString()} - Changes detected, starting build`)
        await performBuild()
        await comparator.commit()
        console.log('Build completed')
      }
    } catch (error) {
      console.error('Build error:', error)
    }
  }, 1000)
}
```

### Automatic Package Installation

```typescript
import {
  installPackage,
  detectPackageManager,
  findPackage
} from '@fastkit/node-util'

async function packageManagementExample() {
  // Check and install required packages
  const requiredPackages = [
    'typescript',
    'esbuild',
    '@types/node'
  ]

  console.log('Checking package dependencies...')

  for (const pkg of requiredPackages) {
    try {
      const installedPath = await installPackage(pkg, {
        dev: true,              // Add as development dependency
        skipWhenInstalled: true // Skip if already installed
      })

      console.log(`✓ ${pkg} is available (${installedPath})`)
    } catch (error) {
      console.error(`✗ Failed to install ${pkg}:`, error)
    }
  }

  // Display package manager information
  const pm = await detectPackageManager()
  console.log(`Package manager in use: ${pm}`)

  // Current project information
  const packageInfo = await findPackage()
  if (packageInfo) {
    console.log(`Project: ${packageInfo.data.name}@${packageInfo.data.version}`)
  }
}

// Custom script runner
async function scriptRunner(scriptName: string) {
  const packageInfo = await findPackage()

  if (!packageInfo) {
    throw new Error('package.json not found')
  }

  const scripts = packageInfo.data.scripts as Record<string, string> || {}

  if (!scripts[scriptName]) {
    throw new Error(`Script "${scriptName}" not found`)
  }

  console.log(`Executing script "${scriptName}"...`)
  console.log(`Command: ${scripts[scriptName]}`)

  const pm = await detectPackageManager()

  // Execute script according to package manager
  const { execa } = await import('execa')

  const runCommand = pm === 'npm' ? 'npm' : pm
  const args = pm === 'npm' ? ['run', scriptName] : [scriptName]

  try {
    const result = await execa(runCommand, args, {
      stdio: 'inherit',
      cwd: packageInfo.dir
    })

    console.log(`Script "${scriptName}" completed successfully`)
    return result
  } catch (error) {
    console.error(`Failed to execute script "${scriptName}":`, error)
    throw error
  }
}
```

## API Specification

### Package Management

```typescript
// Package information search
function findPackage(from?: string, requireModuleDirectory?: boolean): Promise<FindPackageResult | undefined>
function findPackageDir(from?: string, requireModuleDirectory?: boolean): Promise<string | undefined>

// Synchronous versions
function findPackageSync(from?: string, requireModuleDirectory?: boolean): FindPackageResult | undefined
function findPackageDirSync(from?: string, requireModuleDirectory?: boolean): string | undefined

// Package manager detection
function detectPackageManager(cwdOrOptions?: string | GetTypeofLockFileOptions): Promise<PackageManagerName>
function getTypeofLockFile(cwdOrOptions?: string | GetTypeofLockFileOptions): Promise<PackageManagerName | null>

// Package installation
function installPackage(pkg: string, options?: {
  dev?: boolean
  skipWhenInstalled?: boolean
}): Promise<string>

// Module format inference
function inferPackageFormat(cwd: string, filename?: string): 'esm' | 'cjs'
```

### File and Path Operations

```typescript
// File existence check
function pathExists(filepath: string, type?: 'file' | 'dir'): Promise<boolean>
function pathExistsSync(filepath: string, type?: 'file' | 'dir'): boolean

// Entry point resolution
function resolveEntryPoint(rawEntryPoint: string, extensions?: string | string[]): Promise<string>

// Get directory name
function getDirname(fileOrDirectory: string): string
```

### esbuild Features

```typescript
// Dynamic module execution
function esbuildRequire<T = any>(
  rawEntryPoint: string,
  options?: ESbuildRequireOptions
): Promise<ESbuildRequireResult<T>>

// File watching runner
class ESbuildRunner<T = any> extends EV<ESbuildRunnerEventMap<T>> {
  constructor(opts: ESbuildRunnerOptions)

  run(): Promise<ESbuildRequireResult<T>>
  build(): Promise<ESbuildRequireResult<T>>
  dispose(): void

  readonly watch: boolean
  readonly dependencies: string[]
  readonly filteredDependencies: string[]
}
```

### Hash Comparison

```typescript
class HashComparator {
  constructor(src: string, dest: string, opts?: HashComparatorOptions)

  loadSrcHash(): Promise<HashElementNode | undefined>
  loadDestHash(): Promise<HashElementNode | undefined>
  hasChanged(): Promise<HashElementNode | undefined>
  commit(hash?: HashElementNode): Promise<HashElementNode>
}
```

### Type Definitions

```typescript
interface FindPackageResult {
  data: PackageMetadata
  dir: string
}

interface ESbuildRequireResult<T = any> {
  entryPoint: string
  exports: T
  dependencies: string[]
}

interface ESbuildRequireOptions {
  filename?: string
  external?: string[]
}

interface ESbuildRunnerOptions<T = any> {
  entry: string
  filename?: string
  watch?: boolean
  resolver?: (result: ESbuildRequireResult<any>) => T | Promise<T>
}

type PackageManagerName = 'npm' | 'yarn' | 'pnpm'
```

## Considerations

### Performance Considerations
- `esbuildRequire` compiles every time, so it's recommended for development use only
- File watching can consume memory with large numbers of files
- Hash calculation can take time with large directories

### Security Considerations
- `esbuildRequire` executes arbitrary code, so use only with trusted files
- Automatic package installation should be confirmed before execution
- Properly validate file paths

### Error Handling
- Properly implement exception handling for file operations
- Catch esbuild compilation errors
- Handle package manager execution failures

### Development Environment Usage
- Use pre-compiled code in production environments
- Be careful of memory leaks in watch mode
- Implement proper cleanup processing

## License

MIT

## Related Packages

- [@fastkit/ev](../ev/README.md): Event emitter functionality
- [@fastkit/tiny-logger](../tiny-logger/README.md): Log output functionality
