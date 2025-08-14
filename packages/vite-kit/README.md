# @fastkit/vite-kit

Viteアプリケーションセットアップ用の包括的なツールキット集。カラースキーム生成、アイコンフォント作成、スプライト画像生成、メディアクエリ管理などの開発効率化プラグインを提供します。

## 機能

- **カラースキーム生成**: CSS変数とTypeScript型定義の自動生成
- **アイコンフォント作成**: SVGファイルからWebフォントの自動生成
- **スプライト画像生成**: 複数画像の結合とCSS生成
- **メディアクエリ管理**: レスポンシブデザイン用の型安全な管理
- **ダイナミックソース**: 動的なソースファイル処理
- **ハッシュ同期**: ファイルハッシュ管理とキャッシュ制御
- **追加スタイル**: Sassの追加データ管理

## インストール

```bash
npm install @fastkit/vite-kit
```

## カラースキームプラグイン

### 基本的な使用方法

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import { colorSchemeVitePlugin } from '@fastkit/vite-kit'

export default defineConfig({
  plugins: [
    colorSchemeVitePlugin({
      // カラースキーム定義ファイル
      src: 'src/styles/color-scheme.ts',
      
      // 出力ディレクトリ（省略時は .color-scheme）
      dest: '.color-scheme',
      
      // 生成完了時のコールバック
      onBooted: () => {
        console.log('カラースキーム生成完了')
      },
      
      // エラー時のコールバック
      onBootError: (err) => {
        console.error('カラースキーム生成エラー:', err)
      }
    })
  ]
})
```

### カラースキーム定義

```typescript
// src/styles/color-scheme.ts
import { defineColorScheme } from '@fastkit/color-scheme-gen'

export default defineColorScheme({
  // 基本色の定義
  colors: {
    primary: '#3b82f6',
    secondary: '#64748b',
    success: '#22c55e',
    warning: '#f59e0b',
    error: '#ef4444',
    
    // グレースケール
    gray: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827'
    }
  },
  
  // テーマ定義
  themes: {
    light: {
      background: '$gray.50',
      surface: '#ffffff',
      text: '$gray.900'
    },
    dark: {
      background: '$gray.900',
      surface: '$gray.800',
      text: '$gray.50'
    }
  }
})
```

### 生成されたスタイルの使用

```scss
// CSS変数として利用
.button {
  background-color: var(--color-primary);
  color: var(--color-primary-contrast);
}

// テーマ切り替え
[data-theme="dark"] {
  background-color: var(--theme-background);
  color: var(--theme-text);
}
```

```typescript
// TypeScript型定義として利用
import { colors, themes } from '.color-scheme'

// 型安全なカラー参照
const primaryColor: string = colors.primary
const darkTheme = themes.dark
```

## アイコンフォントプラグイン

### 基本的な使用方法

```typescript
// vite.config.ts
import { iconFontVitePlugin } from '@fastkit/vite-kit'

export default defineConfig({
  plugins: [
    iconFontVitePlugin({
      // SVGアイコンのディレクトリ
      src: 'src/assets/icons',
      
      // 出力先ディレクトリ
      dest: 'public/fonts',
      
      // フォント名
      fontName: 'MyIcons',
      
      // CSS出力先
      cssPath: 'src/styles/icons.css',
      
      // TypeScript型定義出力先
      typesPath: 'src/types/icons.ts',
      
      // 生成完了時のコールバック
      onBooted: () => {
        console.log('アイコンフォント生成完了')
      }
    })
  ]
})
```

### アイコンの使用

```html
<!-- CSS クラスとして使用 -->
<i class="icon icon-home"></i>
<i class="icon icon-user"></i>
<i class="icon icon-settings"></i>
```

```scss
// SCSSでの使用
.button {
  &::before {
    @include icon('chevron-right');
  }
}
```

```typescript
// TypeScript での型安全な使用
import { IconName } from './types/icons'

const iconName: IconName = 'home' // 型補完が効く
```

## スプライト画像プラグイン

### 基本的な使用方法

```typescript
// vite.config.ts
import { spriteImagesVitePlugin } from '@fastkit/vite-kit'

export default defineConfig({
  plugins: [
    spriteImagesVitePlugin({
      // 画像ディレクトリ
      src: 'src/assets/sprites',
      
      // 出力ディレクトリ
      dest: 'public/images',
      
      // スプライト設定
      sprites: [
        {
          name: 'icons',
          src: 'src/assets/sprites/icons/*.png',
          dest: 'public/images/icons.png',
          cssPath: 'src/styles/sprites.css'
        }
      ],
      
      // 最適化オプション
      optimization: {
        algorithm: 'binary-tree',
        padding: 2,
        sort: true
      },
      
      onBooted: () => {
        console.log('スプライト画像生成完了')
      }
    })
  ]
})
```

### 生成されたスプライトの使用

```scss
// 自動生成されたCSS
.sprite {
  background-image: url('/images/icons.png');
  background-repeat: no-repeat;
}

.sprite-home {
  @extend .sprite;
  background-position: -0px -0px;
  width: 24px;
  height: 24px;
}

.sprite-user {
  @extend .sprite;
  background-position: -24px -0px;
  width: 24px;
  height: 24px;
}
```

## メディアマッチプラグイン

### 基本的な使用方法

```typescript
// vite.config.ts
import { mediaMatchVitePlugin } from '@fastkit/vite-kit'

export default defineConfig({
  plugins: [
    mediaMatchVitePlugin({
      // ブレークポイント定義
      breakpoints: {
        xs: 480,
        sm: 640,
        md: 768,
        lg: 1024,
        xl: 1280,
        '2xl': 1536
      },
      
      // CSS変数出力先
      cssPath: 'src/styles/media.css',
      
      // TypeScript型定義出力先
      typesPath: 'src/types/media.ts',
      
      onBooted: () => {
        console.log('メディアクエリ生成完了')
      }
    })
  ]
})
```

### メディアクエリの使用

```scss
// 生成されたCSS変数
:root {
  --breakpoint-xs: 480px;
  --breakpoint-sm: 640px;
  --breakpoint-md: 768px;
  --breakpoint-lg: 1024px;
  --breakpoint-xl: 1280px;
  --breakpoint-2xl: 1536px;
}

// 使用例
.container {
  width: 100%;
  
  @media (min-width: var(--breakpoint-md)) {
    max-width: 768px;
  }
  
  @media (min-width: var(--breakpoint-lg)) {
    max-width: 1024px;
  }
}
```

```typescript
// TypeScript での使用
import { breakpoints, mediaQueries } from './types/media'

// 型安全なブレークポイント参照
const lgBreakpoint = breakpoints.lg // 1024

// メディアクエリ文字列の生成
const lgAndUp = mediaQueries.lgAndUp // '(min-width: 1024px)'
```

## ハッシュ同期プラグイン

### 基本的な使用方法

```typescript
// vite.config.ts
import { hashedSyncVitePlugin } from '@fastkit/vite-kit'

export default defineConfig({
  plugins: [
    hashedSyncVitePlugin({
      // 監視対象ファイル
      files: [
        'src/assets/**/*',
        'public/**/*'
      ],
      
      // ハッシュファイル出力先
      hashFile: '.hashed-sync.json',
      
      // 除外パターン
      exclude: [
        '**/*.tmp',
        '**/.DS_Store'
      ],
      
      onBooted: () => {
        console.log('ハッシュ同期完了')
      }
    })
  ]
})
```

### ハッシュファイルの活用

```typescript
// ハッシュ情報の読み込み
import hashInfo from './.hashed-sync.json'

// キャッシュバスターとして使用
const assetUrl = `/assets/image.png?v=${hashInfo.files['src/assets/image.png']}`

// ファイル変更検知
const hasChanged = hashInfo.lastUpdate > previousUpdate
```

## 追加スタイルプラグイン

### 基本的な使用方法

```typescript
// vite.config.ts
import { styleAdditionalVitePlugin } from '@fastkit/vite-kit'

export default defineConfig({
  plugins: [
    styleAdditionalVitePlugin({
      // 追加するSassデータ
      additionalData: [
        '@import "src/styles/variables.scss";',
        '@import "src/styles/mixins.scss";'
      ],
      
      // 動的追加データ
      dynamicAdditionalData: () => {
        const timestamp = Date.now()
        return `$build-timestamp: ${timestamp};`
      }
    })
  ]
})
```

## 動的ソースプラグイン

### 基本的な使用方法

```typescript
// vite.config.ts
import { dynamicSrcVitePlugin } from '@fastkit/vite-kit'

export default defineConfig({
  plugins: [
    dynamicSrcVitePlugin({
      // パターンマッチング
      patterns: [
        {
          match: /\.env\.ts$/,
          transform: (code, id) => {
            // 環境変数の注入
            return code.replace(
              'process.env.NODE_ENV',
              JSON.stringify(process.env.NODE_ENV)
            )
          }
        }
      ],
      
      onBooted: () => {
        console.log('動的ソース処理完了')
      }
    })
  ]
})
```

## 複数プラグインの組み合わせ

```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import {
  colorSchemeVitePlugin,
  iconFontVitePlugin,
  spriteImagesVitePlugin,
  mediaMatchVitePlugin
} from '@fastkit/vite-kit'

export default defineConfig({
  plugins: [
    // カラースキーム
    colorSchemeVitePlugin({
      src: 'src/styles/color-scheme.ts'
    }),
    
    // アイコンフォント
    iconFontVitePlugin({
      src: 'src/assets/icons',
      dest: 'public/fonts',
      fontName: 'AppIcons'
    }),
    
    // スプライト画像
    spriteImagesVitePlugin({
      sprites: [
        {
          name: 'ui-icons',
          src: 'src/assets/sprites/ui/*.png',
          dest: 'public/images/ui-sprites.png'
        }
      ]
    }),
    
    // メディアクエリ
    mediaMatchVitePlugin({
      breakpoints: {
        mobile: 768,
        tablet: 1024,
        desktop: 1280
      }
    })
  ]
})
```

## パフォーマンス最適化

### 開発時の最適化

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [
    colorSchemeVitePlugin({
      src: 'src/styles/color-scheme.ts',
      // 開発時はキャッシュを有効化
      cache: process.env.NODE_ENV === 'development'
    }),
    
    iconFontVitePlugin({
      src: 'src/assets/icons',
      // 開発時は変更監視を有効化
      watch: process.env.NODE_ENV === 'development'
    })
  ]
})
```

### 本番ビルドの最適化

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [
    spriteImagesVitePlugin({
      sprites: [{
        name: 'icons',
        src: 'src/assets/sprites/*.png',
        // 本番時は最適化を有効化
        optimization: {
          algorithm: 'binary-tree',
          padding: 1,
          sort: true,
          // PNG最適化
          pngquant: process.env.NODE_ENV === 'production'
        }
      }]
    })
  ]
})
```

## API リファレンス

### colorSchemeVitePlugin

```typescript
interface ColorSchemeVitePluginOptions {
  src: string
  dest?: string
  onBooted?: () => any | Promise<any>
  onBootError?: (err: unknown) => any
}
```

### iconFontVitePlugin

```typescript
interface IconFontVitePlugin extends IconFontOptions {
  onBooted?: () => any | Promise<any>
  onBootError?: (err: unknown) => any | Promise<any>
}
```

### spriteImagesVitePlugin

```typescript
interface SpriteImagesVitePluginOptions extends SpriteImagesOptions {
  onBooted?: () => any | Promise<any>
  onBootError?: (err: unknown) => any | Promise<any>
}
```

### mediaMatchVitePlugin

```typescript
interface MediaMatchVitePluginOptions {
  breakpoints: Record<string, number>
  cssPath?: string
  typesPath?: string
  onBooted?: () => any | Promise<any>
  onBootError?: (err: unknown) => any
}
```

## CLI統合

### package.json スクリプト

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "generate:colors": "color-scheme-gen src/styles/color-scheme.ts",
    "generate:icons": "icon-font-gen src/assets/icons",
    "generate:sprites": "sprite-images-gen src/assets/sprites"
  }
}
```

### 自動生成の監視

```bash
# 開発サーバー起動時に自動生成・監視
npm run dev

# 個別生成
npm run generate:colors
npm run generate:icons
npm run generate:sprites
```

## トラブルシューティング

### よくある問題

1. **ファイルが見つからない**: `src`パスが正しいか確認
2. **権限エラー**: 出力ディレクトリの書き込み権限を確認
3. **メモリ不足**: 大量のファイル処理時はNode.jsメモリ上限を増加

### デバッグ方法

```typescript
// デバッグログの有効化
colorSchemeVitePlugin({
  src: 'src/styles/color-scheme.ts',
  onBooted: () => console.log('✓ カラースキーム生成完了'),
  onBootError: (err) => console.error('✗ エラー:', err)
})
```

## 関連パッケージ

- `@fastkit/color-scheme-gen` - カラースキーム生成器
- `@fastkit/icon-font-gen` - アイコンフォント生成器
- `@fastkit/sprite-images` - スプライト画像生成器
- `@fastkit/media-match-gen` - メディアクエリ生成器
- `@fastkit/hashed-sync` - ファイルハッシュ管理
- `@fastkit/helpers` - ヘルパー関数
- `@fastkit/tiny-logger` - ロガー
- `vite` - ビルドツール（ピア依存関係）

## ライセンス

MIT
