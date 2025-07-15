# @fastkit/node-util

Node.jsのサーバやツール実装のためのユーティリティライブラリ。パッケージ管理、esbuildを使用した動的モジュール読み込み、ファイルシステム操作、ハッシュ比較などの機能を提供し、Node.js環境での開発を効率化します。

## 機能

- **パッケージ管理**: package.jsonの検索・解析とパッケージマネージャー自動検出
- **動的モジュール読み込み**: esbuildを使用したTypeScript/JavaScriptの実行時コンパイル・実行
- **ファイル監視**: chokidarを使用したファイル変更監視とホットリロード
- **パス操作**: エントリーポイントの解決とファイル存在確認
- **ハッシュ比較**: フォルダハッシュによる変更検出と増分ビルド
- **型安全性**: TypeScriptによる厳密な型定義
- **ESM/CommonJS対応**: モジュール形式の自動判定と適切な処理

## インストール

```bash
npm install @fastkit/node-util
```

## 基本的な使用方法

### パッケージ情報の取得

```typescript
import { findPackage, findPackageDir, detectPackageManager } from '@fastkit/node-util'

async function packageExample() {
  // 現在のディレクトリまたは親ディレクトリからpackage.jsonを検索
  const packageInfo = await findPackage()
  
  if (packageInfo) {
    console.log('パッケージ名:', packageInfo.data.name)
    console.log('バージョン:', packageInfo.data.version)
    console.log('ディレクトリ:', packageInfo.dir)
  }
  
  // パッケージディレクトリのみを取得
  const packageDir = await findPackageDir()
  console.log('パッケージディレクトリ:', packageDir)
  
  // 使用中のパッケージマネージャーを自動検出
  const packageManager = await detectPackageManager()
  console.log('パッケージマネージャー:', packageManager) // 'npm' | 'yarn' | 'pnpm'
}
```

### ファイル・パス操作

```typescript
import { 
  pathExists, 
  pathExistsSync, 
  resolveEntryPoint, 
  getDirname 
} from '@fastkit/node-util'

async function pathExample() {
  // ファイル・ディレクトリの存在確認
  const fileExists = await pathExists('./package.json', 'file')
  const dirExists = await pathExists('./src', 'dir')
  
  console.log('package.json存在:', fileExists)
  console.log('srcディレクトリ存在:', dirExists)
  
  // 同期版
  const syncExists = pathExistsSync('./README.md', 'file')
  console.log('README.md存在 (同期):', syncExists)
  
  // エントリーポイントの解決（拡張子やindex.tsを自動補完）
  const entryPoint = await resolveEntryPoint('./src/main')
  console.log('解決されたエントリーポイント:', entryPoint)
  
  // import.meta.urlからディレクトリ名を取得
  const dirname = getDirname(import.meta.url)
  console.log('現在のディレクトリ:', dirname)
}
```

## 高度な使用例

### esbuildを使用した動的モジュール実行

```typescript
import { esbuildRequire, ESbuildRunner } from '@fastkit/node-util'

// 基本的なesbuild実行
async function esbuildExample() {
  // TypeScriptファイルを実行時にコンパイル・実行
  const result = await esbuildRequire('./src/config.ts')
  
  console.log('エントリーポイント:', result.entryPoint)
  console.log('エクスポートされた値:', result.exports)
  console.log('依存ファイル:', result.dependencies)
  
  // 設定ファイルの内容を取得
  const config = result.exports.default || result.exports
  console.log('設定:', config)
}

// 監視モードでの実行
async function watchExample() {
  const runner = new ESbuildRunner({
    entry: './src/config.ts',
    watch: true, // ファイル変更を監視
    resolver: (result) => {
      // エクスポートされた値を加工
      return result.exports.default || result.exports
    }
  })
  
  // ビルド完了時のイベントハンドラー
  runner.on('build', (result) => {
    console.log('設定が更新されました:', result.exports)
    
    // 設定の変更に応じて何らかの処理を実行
    applyNewConfiguration(result.exports)
  })
  
  // 初回実行
  const initialResult = await runner.run()
  console.log('初期設定:', initialResult.exports)
  
  // 5分後にクリーンアップ
  setTimeout(() => {
    runner.dispose()
  }, 5 * 60 * 1000)
}

function applyNewConfiguration(config: any) {
  console.log('新しい設定を適用中:', config)
  // 設定変更に応じた処理を実装
}
```

### 設定ファイルの動的読み込みシステム

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
        // TypeScriptの設定ファイルをパース
        const config = result.exports.default || result.exports
        
        // 設定のバリデーション
        this.validateConfig(config)
        
        return config
      }
    })
    
    // 設定変更時のハンドラー
    this.runner.on('build', (result) => {
      const newConfig = result.exports
      const oldConfig = this.currentConfig
      
      console.log('設定ファイルが更新されました')
      
      if (this.hasConfigChanged(oldConfig, newConfig)) {
        this.currentConfig = newConfig
        this.notifyConfigChange(newConfig)
      }
    })
    
    // 初回読み込み
    const result = await this.runner.run()
    this.currentConfig = result.exports
    
    return result.exports
  }
  
  private validateConfig(config: any): asserts config is AppConfig {
    if (!config.server?.port) {
      throw new Error('設定にserver.portが必要です')
    }
    
    if (!config.database?.url) {
      throw new Error('設定にdatabase.urlが必要です')
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
        console.error('設定変更リスナーでエラー:', error)
      }
    })
  }
  
  onConfigChange(listener: (config: AppConfig) => void) {
    this.changeListeners.push(listener)
    
    // リスナーの削除関数を返す
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

// 使用例
async function configManagerExample() {
  const configManager = new ConfigManager()
  
  // 設定変更時の処理を登録
  const removeListener = configManager.onConfigChange((config) => {
    console.log('データベース接続数上限:', config.database.maxConnections)
    console.log('認証機能:', config.features.auth ? '有効' : '無効')
    
    // サーバー設定が変更された場合の処理
    if (config.server.port !== 3000) {
      console.log(`サーバーポートが${config.server.port}に変更されました`)
      restartServer(config.server)
    }
  })
  
  // 設定を監視モードで読み込み
  const config = await configManager.loadConfig('./config/app.config.ts', true)
  
  console.log('初期設定:', config)
  
  // アプリケーション終了時のクリーンアップ
  process.on('SIGINT', () => {
    removeListener()
    configManager.dispose()
    process.exit(0)
  })
}

function restartServer(serverConfig: AppConfig['server']) {
  console.log(`サーバーを${serverConfig.host}:${serverConfig.port}で再起動中...`)
  // サーバー再起動の実装
}
```

### ハッシュ比較による増分ビルド

```typescript
import { HashComparator } from '@fastkit/node-util'
import fs from 'fs-extra'

async function incrementalBuildExample() {
  const comparator = new HashComparator(
    './src',           // ソースディレクトリ
    './dist',          // 出力ディレクトリ
    { metaFile: '.build-hash' } // ハッシュファイル名
  )
  
  console.log('変更チェック中...')
  const changed = await comparator.hasChanged()
  
  if (changed) {
    console.log('ソースファイルに変更が検出されました')
    console.log('ビルドを実行します...')
    
    // ビルド処理を実行
    await performBuild()
    
    // ビルド完了後にハッシュを保存
    await comparator.commit()
    console.log('ビルド完了、ハッシュを更新しました')
  } else {
    console.log('変更なし、ビルドをスキップします')
  }
}

async function performBuild() {
  // 実際のビルド処理（例：TypeScriptコンパイル）
  console.log('TypeScriptコンパイル中...')
  await new Promise(resolve => setTimeout(resolve, 2000)) // ビルド時間の模擬
  
  // 出力ディレクトリの作成
  await fs.ensureDir('./dist')
  
  // ビルド成果物の出力
  await fs.writeFile('./dist/index.js', '// Compiled JavaScript code')
  
  console.log('コンパイル完了')
}

// ウォッチモードでの増分ビルド
async function watchedIncrementalBuild() {
  const comparator = new HashComparator('./src', './dist')
  
  console.log('ファイル監視を開始します...')
  
  // 定期的にチェック（実際のプロジェクトではchokidarを使用推奨）
  setInterval(async () => {
    try {
      const changed = await comparator.hasChanged()
      
      if (changed) {
        console.log(`${new Date().toLocaleTimeString()} - 変更検出、ビルド開始`)
        await performBuild()
        await comparator.commit()
        console.log('ビルド完了')
      }
    } catch (error) {
      console.error('ビルドエラー:', error)
    }
  }, 1000)
}
```

### パッケージの自動インストール

```typescript
import { 
  installPackage, 
  detectPackageManager, 
  findPackage 
} from '@fastkit/node-util'

async function packageManagementExample() {
  // 必要なパッケージの確認とインストール
  const requiredPackages = [
    'typescript',
    'esbuild',
    '@types/node'
  ]
  
  console.log('パッケージ依存関係をチェック中...')
  
  for (const pkg of requiredPackages) {
    try {
      const installedPath = await installPackage(pkg, {
        dev: true,              // 開発依存として追加
        skipWhenInstalled: true // 既にインストール済みならスキップ
      })
      
      console.log(`✓ ${pkg} は利用可能です (${installedPath})`)
    } catch (error) {
      console.error(`✗ ${pkg} のインストールに失敗:`, error)
    }
  }
  
  // パッケージマネージャー情報の表示
  const pm = await detectPackageManager()
  console.log(`使用中のパッケージマネージャー: ${pm}`)
  
  // 現在のプロジェクト情報
  const packageInfo = await findPackage()
  if (packageInfo) {
    console.log(`プロジェクト: ${packageInfo.data.name}@${packageInfo.data.version}`)
  }
}

// カスタムスクリプトランナー
async function scriptRunner(scriptName: string) {
  const packageInfo = await findPackage()
  
  if (!packageInfo) {
    throw new Error('package.jsonが見つかりません')
  }
  
  const scripts = packageInfo.data.scripts as Record<string, string> || {}
  
  if (!scripts[scriptName]) {
    throw new Error(`スクリプト "${scriptName}" が見つかりません`)
  }
  
  console.log(`スクリプト "${scriptName}" を実行中...`)
  console.log(`コマンド: ${scripts[scriptName]}`)
  
  const pm = await detectPackageManager()
  
  // パッケージマネージャーに応じてスクリプトを実行
  const { execa } = await import('execa')
  
  const runCommand = pm === 'npm' ? 'npm' : pm
  const args = pm === 'npm' ? ['run', scriptName] : [scriptName]
  
  try {
    const result = await execa(runCommand, args, {
      stdio: 'inherit',
      cwd: packageInfo.dir
    })
    
    console.log(`スクリプト "${scriptName}" が正常に完了しました`)
    return result
  } catch (error) {
    console.error(`スクリプト "${scriptName}" の実行に失敗:`, error)
    throw error
  }
}
```

## API仕様

### パッケージ管理

```typescript
// パッケージ情報の検索
function findPackage(from?: string, requireModuleDirectory?: boolean): Promise<FindPackageResult | undefined>
function findPackageDir(from?: string, requireModuleDirectory?: boolean): Promise<string | undefined>

// 同期版
function findPackageSync(from?: string, requireModuleDirectory?: boolean): FindPackageResult | undefined
function findPackageDirSync(from?: string, requireModuleDirectory?: boolean): string | undefined

// パッケージマネージャーの検出
function detectPackageManager(cwdOrOptions?: string | GetTypeofLockFileOptions): Promise<PackageManagerName>
function getTypeofLockFile(cwdOrOptions?: string | GetTypeofLockFileOptions): Promise<PackageManagerName | null>

// パッケージのインストール
function installPackage(pkg: string, options?: {
  dev?: boolean
  skipWhenInstalled?: boolean
}): Promise<string>

// モジュール形式の推論
function inferPackageFormat(cwd: string, filename?: string): 'esm' | 'cjs'
```

### ファイル・パス操作

```typescript
// ファイル存在確認
function pathExists(filepath: string, type?: 'file' | 'dir'): Promise<boolean>
function pathExistsSync(filepath: string, type?: 'file' | 'dir'): boolean

// エントリーポイントの解決
function resolveEntryPoint(rawEntryPoint: string, extensions?: string | string[]): Promise<string>

// ディレクトリ名の取得
function getDirname(fileOrDirectory: string): string
```

### esbuild機能

```typescript
// 動的モジュール実行
function esbuildRequire<T = any>(
  rawEntryPoint: string,
  options?: ESbuildRequireOptions
): Promise<ESbuildRequireResult<T>>

// ファイル監視ランナー
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

### ハッシュ比較

```typescript
class HashComparator {
  constructor(src: string, dest: string, opts?: HashComparatorOptions)
  
  loadSrcHash(): Promise<HashElementNode | undefined>
  loadDestHash(): Promise<HashElementNode | undefined>
  hasChanged(): Promise<HashElementNode | undefined>
  commit(hash?: HashElementNode): Promise<HashElementNode>
}
```

### 型定義

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

## 注意事項

### パフォーマンス考慮事項
- `esbuildRequire`は毎回コンパイルするため開発時のみ使用推奨
- ファイル監視は大量のファイルでメモリを消費する可能性
- ハッシュ計算は大きなディレクトリで時間がかかる場合がある

### セキュリティ考慮事項
- `esbuildRequire`は任意のコードを実行するため信頼できるファイルのみ使用
- パッケージの自動インストールは実行前に確認を推奨
- ファイルパスの検証を適切に行う

### エラーハンドリング
- ファイル操作の例外処理を適切に実装
- esbuildのコンパイルエラーをキャッチ
- パッケージマネージャーの実行失敗に対応

### 開発環境での使用
- 本番環境では事前にコンパイルされたコードを使用
- 監視モードはメモリリークに注意
- 適切なクリーンアップ処理を実装

## ライセンス

MIT

## 関連パッケージ

- [@fastkit/ev](../ev/README.md): イベントエミッター機能
- [@fastkit/tiny-logger](../tiny-logger/README.md): ログ出力機能