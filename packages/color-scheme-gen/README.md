# @fastkit/color-scheme-gen

カラースキーマの定義から各種フォーマット（JSON、TypeScript、SCSS）のファイルを自動生成するためのジェネレータ。開発時のホットリロード対応により、カラースキーマの変更を即座にアプリケーションに反映できます。

## 機能

- **自動ファイル生成**: カラースキーマ定義から複数フォーマットのファイルを生成
- **ホットリロード対応**: ファイル変更時の自動再生成とキャッシュ管理
- **テンプレートエンジン**: Etaテンプレートエンジンによる柔軟なカスタマイズ
- **SCSSサポート**: CSS変数とバリアントクラスの自動生成
- **TypeScript型生成**: 型安全なカラー定義の自動生成
- **ビルトインバリアント**: light、deep、text、border、focusなどの標準バリアント
- **カスタムバリアント**: プロジェクト固有のバリアント定義
- **依存関係追跡**: ファイル変更の検出と増分ビルド

## インストール

```bash
npm install @fastkit/color-scheme-gen
```

## 基本的な使用方法

### カラースキーマ定義ファイルの作成

```typescript
// color-scheme.ts
import { ColorScheme } from '@fastkit/color-scheme'
import { scopeResolvers } from '@fastkit/color-scheme-gen'

export default ColorScheme({
  colors: {
    primary: '#2196F3',
    secondary: '#FF5722',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#00BCD4'
  },
  themes: {
    light: {
      background: '#FFFFFF',
      surface: '#F5F5F5',
      onSurface: '#212121'
    },
    dark: {
      background: '#121212',
      surface: '#1E1E1E',
      onSurface: '#FFFFFF'
    }
  },
  resolvers: scopeResolvers({
    lightText: '#FFFFFF',
    darkText: '#000000',
    scopeInvertThreshold: 0.6
  })
})
```

### ジェネレータの実行

```typescript
import { LoadColorSchemeRunner } from '@fastkit/color-scheme-gen'

const runner = new LoadColorSchemeRunner({
  entry: './color-scheme.ts',
  dest: './generated',
  watch: true // 開発時はtrueに設定
})

runner.on('load', (result) => {
  console.log('Generated files:')
  console.log('- JSON:', result.data.cachePaths.json)
  console.log('- TypeScript:', result.data.cachePaths.info)
  console.log('- SCSS:', result.data.cachePaths.scss)
})

await runner.run()
```

## 高度な使用例

### カスタムバリアントの定義

```typescript
// advanced-color-scheme.ts
import { ColorScheme, createColorScope } from '@fastkit/color-scheme'
import { scopeResolvers } from '@fastkit/color-scheme-gen'

export default ColorScheme({
  colors: {
    primary: createColorScope('#2196F3', {
      variants: ['filled', 'outlined', 'text', 'gradient']
    }),
    secondary: createColorScope('#FF5722', {
      variants: ['filled', 'outlined', 'text']
    })
  },
  themes: {
    light: {
      background: '#FFFFFF',
      surface: '#F8F9FA',
      surfaceVariant: '#E3F2FD'
    },
    dark: {
      background: '#0D1117',
      surface: '#161B22',
      surfaceVariant: '#21262D'
    }
  },
  variantSources: [
    {
      name: 'gradient',
      from: 'filled',
      scss: (scope) => `
        background: linear-gradient(135deg, ${scope.scheme.main} 0%, ${scope.scheme.main.lighten(0.2)} 100%);
        border: none;
        color: ${scope.scheme.text};
        
        &:hover {
          background: linear-gradient(135deg, ${scope.scheme.focus} 0%, ${scope.scheme.focus.lighten(0.2)} 100%);
        }
        
        &:active {
          background: linear-gradient(135deg, ${scope.scheme.active} 0%, ${scope.scheme.active.lighten(0.2)} 100%);
        }
      `
    },
    {
      name: 'glass',
      scss: (scope) => `
        background: ${scope.scheme.main.alpha(0.1)};
        backdrop-filter: blur(10px);
        border: 1px solid ${scope.scheme.main.alpha(0.2)};
        color: ${scope.scheme.main};
        
        &:hover {
          background: ${scope.scheme.main.alpha(0.15)};
          border-color: ${scope.scheme.main.alpha(0.3)};
        }
      `
    }
  ],
  resolvers: scopeResolvers({
    lightText: '#FFFFFF',
    darkText: '#1A1A1A',
    overrides: {
      // カスタムリゾルバー
      glass: ({ main }) => main.alpha(0.1),
      glassBorder: ({ main }) => main.alpha(0.2)
    }
  })
})
```

### Viteプラグインとの統合

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import { LoadColorSchemeRunner } from '@fastkit/color-scheme-gen'

export default defineConfig({
  plugins: [
    {
      name: 'color-scheme-gen',
      configureServer(server) {
        const runner = new LoadColorSchemeRunner({
          entry: './src/theme/color-scheme.ts',
          dest: './src/theme/generated',
          watch: true
        })
        
        runner.on('load', () => {
          server.ws.send({
            type: 'full-reload'
          })
        })
        
        runner.run()
      }
    }
  ]
})
```

## 生成されるファイル

### JSON出力例

```json
{
  "colors": {
    "primary": {
      "main": "#2196F3",
      "light": "#2196F30A",
      "deep": "#2196F31A",
      "text": "#FFFFFF",
      "focus": "#1976D2",
      "active": "#1565C0"
    }
  },
  "themes": {
    "light": {
      "background": "#FFFFFF",
      "surface": "#F5F5F5"
    },
    "dark": {
      "background": "#121212",
      "surface": "#1E1E1E"
    }
  }
}
```

### TypeScript型定義出力例

```typescript
// generated/color-scheme.info.ts
export interface ColorSchemeColors {
  primary: ColorScopeInfo
  secondary: ColorScopeInfo
  success: ColorScopeInfo
  warning: ColorScopeInfo
  error: ColorScopeInfo
}

export interface ColorScopeInfo {
  main: string
  light: string
  deep: string
  text: string
  focus: string
  active: string
}

export interface ColorSchemeThemes {
  light: LightTheme
  dark: DarkTheme
}

export interface LightTheme {
  background: string
  surface: string
  onSurface: string
}

export interface DarkTheme {
  background: string
  surface: string
  onSurface: string
}
```

### SCSS出力例

```scss
// generated/color-scheme.scss
:root {
  --color-primary: #2196F3;
  --color-primary-light: #2196F30A;
  --color-primary-deep: #2196F31A;
  --color-primary-text: #FFFFFF;
  --color-primary-focus: #1976D2;
  --color-primary-active: #1565C0;
  
  --theme-background: #FFFFFF;
  --theme-surface: #F5F5F5;
  --theme-on-surface: #212121;
}

[data-theme="dark"] {
  --theme-background: #121212;
  --theme-surface: #1E1E1E;
  --theme-on-surface: #FFFFFF;
}

// バリアントクラス
.color-primary-filled {
  background-color: var(--color-primary);
  color: var(--color-primary-text);
  border: none;
  
  &:hover {
    background-color: var(--color-primary-focus);
  }
  
  &:active {
    background-color: var(--color-primary-active);
  }
}

.color-primary-outlined {
  background-color: transparent;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
  
  &:hover {
    background-color: var(--color-primary-light);
    border-color: var(--color-primary-focus);
  }
}

.color-primary-text {
  background-color: transparent;
  color: var(--color-primary);
  border: none;
  
  &:hover {
    background-color: var(--color-primary-light);
  }
}

.color-primary-gradient {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-light) 100%);
  border: none;
  color: var(--color-primary-text);
  
  &:hover {
    background: linear-gradient(135deg, var(--color-primary-focus) 0%, var(--color-primary-deep) 100%);
  }
}
```

## ビルトインリゾルバー

### scopeResolvers

```typescript
import { scopeResolvers } from '@fastkit/color-scheme-gen'

const resolvers = scopeResolvers({
  // ライトテーマでのテキストカラー
  lightText: '#FFFFFF',
  
  // ダークテーマでのテキストカラー
  darkText: '#000000',
  
  // テーマ反転の明度閾値（0-1）
  scopeInvertThreshold: 0.6,
  
  // カスタムリゾルバーで上書き
  overrides: {
    light: ({ main }) => main.alpha(0.08),
    deep: ({ main }) => main.alpha(0.16),
    custom: ({ main, theme }) => {
      return theme.isLight ? main.lighten(0.1) : main.darken(0.1)
    }
  }
})
```

### 利用可能なリゾルバーキー

```typescript
// 基本バリアント
- light: 薄い背景色（通常はメインカラーの低透明度）
- deep: 濃い背景色（通常はメインカラーの中透明度）
- text: テキストカラー（明度に応じて自動選択）
- border: ボーダーカラー

// インタラクション状態
- focus: フォーカス時のカラー
- focusBorder: フォーカス時のボーダーカラー
- focusText: フォーカス時のテキストカラー
- focusShadow: フォーカス時のシャドウカラー
- active: アクティブ時のカラー
- activeBorder: アクティブ時のボーダーカラー
- activeText: アクティブ時のテキストカラー

// 特殊バリアント
- outlineText: アウトラインスタイルのテキストカラー
- outlineBorder: アウトラインスタイルのボーダーカラー
- invert: 反転カラー
- focusInvert: フォーカス時の反転カラー
- activeInvert: アクティブ時の反転カラー
- nav: ナビゲーション用カラー
- navActive: アクティブなナビゲーション用カラー
- caption: キャプション用カラー
- pin: ピン留め用カラー
```

## テンプレートカスタマイズ

### カスタムテンプレートの作成

```typescript
// カスタムジェネレータ
import { LoadColorSchemeRunner } from '@fastkit/color-scheme-gen'
import { Eta } from 'eta'
import fs from 'fs-extra'

class CustomColorSchemeGenerator extends LoadColorSchemeRunner {
  async generateCustomFile(scheme: ColorScheme) {
    const template = `
// Generated CSS-in-JS theme
export const theme = {
  colors: {
    <% it.scheme.colors.forEach(color => { %>
    <%= color.name %>: {
      main: '<%= color.main %>',
      variants: {
        <% color.variants.forEach(variant => { %>
        <%= variant %>: '<%= color[variant] %>',
        <% }) %>
      }
    },
    <% }) %>
  },
  breakpoints: {
    xs: '0px',
    sm: '600px',
    md: '960px',
    lg: '1280px',
    xl: '1920px'
  }
}
    `
    
    const eta = new Eta()
    const result = await eta.renderStringAsync(template, { scheme })
    
    await fs.writeFile('./theme.js', result)
  }
}
```

## パフォーマンス最適化

### キャッシュ戦略

```typescript
// 効率的なキャッシュ管理
const runner = new LoadColorSchemeRunner({
  entry: './color-scheme.ts',
  dest: './cache',
  watch: process.env.NODE_ENV === 'development'
})

// 依存関係の変更のみで再生成
runner.on('load', (result) => {
  if (result.dependencies.length > 0) {
    console.log('Dependencies changed:', result.dependencies)
  }
})
```

### 増分ビルド

```typescript
// 変更されたファイルのみ処理
import { watch } from 'chokidar'

const watcher = watch('./src/theme/**/*.ts')
watcher.on('change', async (filePath) => {
  if (filePath.includes('color-scheme')) {
    await runner.run()
  }
})
```

## API リファレンス

### LoadColorSchemeRunner

```typescript
class LoadColorSchemeRunner extends EV<LoadColorSchemeRunnerEventMap> {
  constructor(opts: LoadColorSchemeRunnerOptions)
  
  // メソッド
  run(): Promise<void>
  
  // イベント
  on('load', (result: ESbuildRequireResult<LoadColorSchemeRunnerLoadResult>) => void)
}

interface LoadColorSchemeRunnerOptions {
  entry: string      // カラースキーマ定義ファイルのパス
  dest: string       // 出力先ディレクトリ
  watch?: boolean    // ファイル監視の有効/無効
}

interface LoadColorSchemeRunnerLoadResult {
  cachePaths: {
    json: string     // JSON出力ファイルパス
    info: string     // TypeScript型定義ファイルパス
    scss: string     // SCSSファイルパス
  }
}
```

### scopeResolvers

```typescript
function scopeResolvers(opts?: {
  lightText?: ColorSource | ColorScopeResolver
  darkText?: ColorSource | ColorScopeResolver
  scopeInvertThreshold?: number
  overrides?: ColorScopeResolvers
}): ColorScopeResolvers
```

### テンプレートスコープ

```typescript
interface TemplateScope {
  scheme: ColorScheme
  scssValues: Record<string, string>
  
  // ヘルパー関数
  list(source: string[], divider?: string): string
  builtinVariantScss(variant: BuiltinColorVariant, selector?: string): Promise<string>
  variantScss(variant: string): Promise<string>
  allVariantsScss(): Promise<string>
}
```

## 関連パッケージ

- `@fastkit/color-scheme` - カラースキーマ定義システム
- `@fastkit/color` - カラー操作ライブラリ
- `@fastkit/node-util` - Node.js開発ユーティリティ
- `@fastkit/tiny-logger` - ロギングシステム
- `eta` - テンプレートエンジン（外部依存関係）
- `fs-extra` - ファイルシステム操作（外部依存関係）

## ライセンス

MIT