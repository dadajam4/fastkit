# @fastkit/color-scheme

アプリケーションのカラーテーマとスキームを管理するための包括的なカラーシステムライブラリです。TypeScriptで構築され、型安全性、動的テーマ切り替え、アクセシビリティ対応を重視したカラー管理システムを提供します。

## 特徴

- **厳密な型安全性**: TypeScriptジェネリクスによる完全な型チェック
- **動的テーマ切り替え**: ライト/ダークモードの自動判定と切り替え
- **柔軟なパレット管理**: 関数ベースの動的カラー生成
- **Vue.js完全統合**: 専用composablesとディレクティブ
- **CSS Variables自動生成**: 効率的なCSSカスタムプロパティ管理
- **アクセシビリティ対応**: コントラスト自動計算とフォーカス管理
- **コンテキスト対応**: 背景に応じた自動カラー調整
- **拡張可能設計**: カスタムテーマとスコープの簡単な追加
- **パフォーマンス最適化**: 遅延評価とキャッシュ機構
- **ビルドツール統合**: Plugboyとの完全統合

## インストール

```bash
npm install @fastkit/color-scheme
# or
pnpm add @fastkit/color-scheme

# Vue.js統合が必要な場合
npm install @fastkit/vue-color-scheme
```

## 基本的な使い方

### シンプルなカラースキーム作成

```typescript
import { createColorScheme } from '@fastkit/color-scheme';

const colorScheme = createColorScheme({
  // カラーバリアント定義
  variants: ['contained', 'outlined', 'inverted', 'plain'],
  
  // オプショナルカラー定義
  optionals: ['light', 'deep', 'text', 'border', 'focus'],
  
  // テーマ定義
  themes: [
    {
      name: 'light',
      palette: [
        ['primary', '#1976d2'],
        ['secondary', '#424242'],
        ['success', '#4caf50'],
        ['warning', '#ff9800'],
        ['error', '#f44336'],
        ['background', '#ffffff'],
        ['surface', '#f5f5f5']
      ],
      scopes: [
        ['primary', ({ palette }) => palette('primary')],
        ['secondary', ({ palette }) => palette('secondary')],
        ['success', ({ palette }) => palette('success')]
      ]
    },
    {
      name: 'dark',
      palette: [
        ['primary', '#42a5f5'],
        ['secondary', '#616161'],
        ['background', '#121212'],
        ['surface', '#1e1e1e']
      ],
      // 未定義のスコープはlightテーマから継承
    }
  ]
});
```

### Vue.js での使用

```vue
<template>
  <div :class="themeClass">
    <!-- プライマリカラーのボタン -->
    <button :class="primaryClasses.contained">
      プライマリボタン
    </button>
    
    <!-- セカンダリカラーのアウトラインボタン -->
    <button :class="secondaryClasses.outlined">
      セカンダリボタン
    </button>
    
    <!-- テーマ切り替えボタン -->
    <button @click="toggleTheme">
      {{ currentTheme === 'dark' ? 'ライト' : 'ダーク' }}テーマに切り替え
    </button>
  </div>
</template>

<script setup lang="ts">
import { useColorScheme, useColorClasses, useThemeClass } from '@fastkit/vue-color-scheme';

// カラースキームサービス
const colorScheme = useColorScheme();

// テーマクラス管理
const { themeClass, currentTheme, toggleTheme } = useThemeClass();

// カラークラス生成
const primaryClasses = useColorClasses('primary');
const secondaryClasses = useColorClasses('secondary');
</script>
```

## カラースキーム定義

### パレット定義

```typescript
// 静的カラー定義
palette: [
  ['primary', '#1976d2'],
  ['secondary', '#424242']
]

// 動的カラー定義
palette: [
  ['primary', '#1976d2'],
  ['primaryLight', ({ palette }) => palette('primary').lighten(0.2)],
  ['primaryDark', ({ palette }) => palette('primary').darken(0.2)],
  ['onPrimary', ({ palette }) => {
    // 背景色の明度に応じてテキストカラーを自動選択
    const bg = palette('primary');
    return bg.brightness() > 0.5 ? '#000000' : '#ffffff';
  }]
]
```

### スコープ定義

```typescript
scopes: [
  // 基本スコープ
  ['primary', ({ palette }) => palette('primary')],
  
  // コンテキスト対応スコープ
  ['error', ({ palette, theme }) => {
    const base = palette('error');
    // ダークテーマでは少し明るく調整
    return theme.isDark ? base.lighten(0.1) : base;
  }],
  
  // 条件付きスコープ
  ['accent', ({ palette, theme }) => {
    return theme.name === 'dark' ? palette('secondary') : palette('primary');
  }]
]
```

### スコープデフォルト

```typescript
scopeDefaults: ({ palette, theme }) => ({
  // デフォルトスコープの自動生成
  default: [
    'transparent',
    {
      text: theme.isDark ? '#ffffff' : '#000000',
      border: theme.isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)',
      focus: palette('primary').alpha(0.12),
      focusShadow: palette('primary').alpha(0.3)
    }
  ],
  
  // 各カラーの自動バリエーション生成
  primary: [
    ({ palette }) => palette('primary'),
    {
      light: ({ main }) => main.alpha(0.04),
      deep: ({ main }) => main.alpha(0.1),
      text: ({ main }) => main.brightness() > 0.6 ? '#000000' : '#ffffff',
      border: ({ main }) => main.alpha(0.5),
      focus: ({ main }) => main.darken(0.07),
      focusShadow: ({ main }) => main.alpha(0.5)
    }
  ]
})
```

## テーマ管理

### 自動ライト/ダーク判定

```typescript
const scheme = createColorScheme({
  themes: [
    {
      name: 'light',
      // 明度0.5以上で自動的にライトテーマと判定
      palette: [['background', '#ffffff']]
    },
    {
      name: 'dark', 
      // 明度0.5未満で自動的にダークテーマと判定
      palette: [['background', '#121212']]
    }
  ]
});

// テーマの判定結果を取得
console.log(scheme.theme('light').isLight); // true
console.log(scheme.theme('dark').isDark);   // true
```

### 動的テーマ切り替え

```typescript
// Vue.js composable使用例
const { 
  currentTheme,     // 現在のテーマ名
  setTheme,         // テーマ設定
  toggleTheme,      // テーマ切り替え
  isDark,          // ダークテーマかどうか
  isLight          // ライトテーマかどうか
} = useThemeClass();

// プログラマティックなテーマ切り替え
setTheme('dark');

// システム設定に追従
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
setTheme(prefersDark.matches ? 'dark' : 'light');

// 自動切り替え監視
prefersDark.addEventListener('change', (e) => {
  setTheme(e.matches ? 'dark' : 'light');
});
```

## カラーバリアント

### 組み込みバリアント

```typescript
const variants = ['contained', 'outlined', 'inverted', 'plain'];

// CSS クラス例:
// - primary-contained: 塗りつぶしスタイル
// - primary-outlined: アウトラインスタイル  
// - primary-inverted: 反転スタイル
// - primary-plain: プレーンスタイル
```

### カスタムバリアント定義

```typescript
const colorScheme = createColorScheme({
  variants: ['contained', 'outlined', 'inverted', 'plain', 'gradient', 'shadow'],
  
  // カスタムバリアントのCSS定義は別途必要
  themes: [/* ... */]
});
```

## 高度な使用例

### レスポンシブカラーシステム

```typescript
const responsiveColorScheme = createColorScheme({
  variants: ['contained', 'outlined', 'text'],
  optionals: ['light', 'deep', 'hover', 'active', 'disabled'],
  
  themes: [
    {
      name: 'light',
      palette: [
        ['primary', '#1976d2'],
        ['secondary', '#424242'],
        ['background', '#ffffff'],
        ['surface', '#f5f5f5'],
        
        // レスポンシブ対応
        ['mobile-primary', ({ palette }) => palette('primary').saturate(0.1)],
        ['tablet-primary', ({ palette }) => palette('primary')],
        ['desktop-primary', ({ palette }) => palette('primary').desaturate(0.05)]
      ],
      
      scopes: [
        ['primary', ({ palette }) => {
          // メディアクエリに応じたカラー選択
          const isMobile = window.innerWidth < 768;
          const isTablet = window.innerWidth < 1024;
          
          if (isMobile) return palette('mobile-primary');
          if (isTablet) return palette('tablet-primary');
          return palette('desktop-primary');
        }]
      ]
    }
  ]
});
```

### アニメーション対応カラーシステム

```typescript
const animatedColorScheme = createColorScheme({
  variants: ['contained', 'outlined'],
  optionals: ['hover', 'active', 'focus', 'disabled'],
  
  themes: [
    {
      name: 'light',
      palette: [
        ['primary', '#1976d2'],
        ['primary-hover', ({ palette }) => palette('primary').lighten(0.08)],
        ['primary-active', ({ palette }) => palette('primary').darken(0.12)],
        ['primary-focus', ({ palette }) => palette('primary').alpha(0.12)],
        ['primary-disabled', ({ palette }) => palette('primary').alpha(0.38)]
      ],
      
      scopes: [
        ['primary', ({ palette }) => palette('primary')],
        ['primary-interactive', ({ palette }) => ({
          default: palette('primary'),
          hover: palette('primary-hover'),
          active: palette('primary-active'),
          focus: palette('primary-focus'),
          disabled: palette('primary-disabled')
        })]
      ]
    }
  ]
});
```

### コンポーネントライブラリ統合

```vue
<template>
  <div class="button-component" :class="buttonClasses">
    <slot />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useColorClasses } from '@fastkit/vue-color-scheme';

interface Props {
  color?: 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  variant?: 'contained' | 'outlined' | 'text';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  color: 'primary',
  variant: 'contained',
  size: 'md',
  disabled: false
});

// カラークラス生成
const colorClasses = useColorClasses(props.color);

// 最終的なクラス名計算
const buttonClasses = computed(() => [
  'button',
  `button--${props.size}`,
  colorClasses[props.variant],
  {
    'button--disabled': props.disabled
  }
]);
</script>

<style scoped>
.button {
  /* ベーススタイル */
  padding: var(--spacing-md);
  border-radius: var(--border-radius);
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
}

.button--sm { padding: var(--spacing-sm); }
.button--md { padding: var(--spacing-md); }
.button--lg { padding: var(--spacing-lg); }

.button--disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* カラースキームのCSS変数を使用 */
.button.primary-contained {
  background-color: var(--color-primary);
  color: var(--color-primary-text);
  border: 1px solid var(--color-primary);
}

.button.primary-contained:hover {
  background-color: var(--color-primary-deep);
}

.button.primary-outlined {
  background-color: transparent;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
}
</style>
```

## CSS Variables統合

### 自動生成されるCSS変数

```css
:root.light-theme {
  /* プライマリカラー */
  --color-primary: #1976d2;
  --color-primary-light: rgba(25, 118, 210, 0.04);
  --color-primary-deep: rgba(25, 118, 210, 0.1);
  --color-primary-text: #ffffff;
  --color-primary-border: rgba(25, 118, 210, 0.5);
  --color-primary-focus: #1565c0;
  --color-primary-focus-shadow: rgba(25, 118, 210, 0.5);
  
  /* セカンダリカラー */
  --color-secondary: #424242;
  --color-secondary-light: rgba(66, 66, 66, 0.04);
  --color-secondary-deep: rgba(66, 66, 66, 0.1);
  --color-secondary-text: #ffffff;
  
  /* システムカラー */
  --color-background: #ffffff;
  --color-surface: #f5f5f5;
  --color-on-background: #000000;
  --color-on-surface: #000000;
}

:root.dark-theme {
  --color-primary: #42a5f5;
  --color-secondary: #616161;
  --color-background: #121212;
  --color-surface: #1e1e1e;
  --color-on-background: #ffffff;
  --color-on-surface: #ffffff;
}
```

### SCSS統合

```scss
// _variables.scss (自動生成)
$color-primary: var(--color-primary);
$color-primary-light: var(--color-primary-light);
$color-primary-deep: var(--color-primary-deep);

// コンポーネントスタイル
.my-component {
  background-color: $color-primary;
  color: $color-primary-text;
  
  &:hover {
    background-color: $color-primary-deep;
  }
  
  &:focus {
    box-shadow: 0 0 0 2px $color-primary-focus-shadow;
  }
}
```

## Plugboy統合

### プラグイン設定

```typescript
// plugboy.workspace.ts
import { defineWorkspaceConfig } from '@fastkit/plugboy';
import { colorSchemePlugin } from '@fastkit/color-scheme-gen';

export default defineWorkspaceConfig({
  entries: {
    '.': './src/index.ts'
  },
  plugins: [
    colorSchemePlugin({
      // カラースキーム定義ファイル
      input: './src/color-scheme.ts',
      // CSS出力パス
      output: './dist/colors.css',
      // SCSS変数出力
      scssOutput: './src/styles/_colors.scss',
      // 追加設定
      generateCssVars: true,
      generateScssVars: true,
      minify: true
    })
  ]
});
```

### ビルド時カラー生成

```typescript
// src/color-scheme.ts
import { createSimpleColorScheme } from '@fastkit/color-scheme-gen';

export const colorScheme = createSimpleColorScheme({
  themes: {
    light: {
      primary: '#1976d2',
      secondary: '#424242',
      success: '#4caf50',
      warning: '#ff9800',
      error: '#f44336',
      background: '#ffffff',
      surface: '#f5f5f5'
    },
    dark: {
      primary: '#42a5f5',
      secondary: '#616161',
      success: '#66bb6a',
      warning: '#ffa726',
      error: '#ef5350',
      background: '#121212',
      surface: '#1e1e1e'
    }
  }
});
```

## アクセシビリティ対応

### コントラスト自動計算

```typescript
const accessibleColorScheme = createColorScheme({
  themes: [
    {
      name: 'light',
      palette: [
        ['primary', '#1976d2'],
        // 背景色の明度に応じて自動的にテキストカラーを選択
        ['primary-text', ({ palette }) => {
          const bg = palette('primary');
          const brightness = bg.brightness();
          
          // WCAG AA基準に基づくコントラスト確保
          if (brightness > 0.5) {
            return '#000000'; // 明るい背景には黒テキスト
          } else {
            return '#ffffff'; // 暗い背景には白テキスト
          }
        }]
      ]
    }
  ]
});
```

### フォーカス管理

```typescript
scopeDefaults: ({ palette, theme }) => ({
  primary: [
    ({ palette }) => palette('primary'),
    {
      // フォーカス時の視認性確保
      focus: ({ main }) => main.darken(0.1),
      focusShadow: ({ main }) => main.alpha(0.3),
      
      // キーボードナビゲーション対応
      focusVisible: ({ main }) => main.alpha(0.12),
      focusRing: ({ main }) => main.alpha(0.5)
    }
  ]
})
```

## パフォーマンス最適化

### 遅延評価

```typescript
// カラー値は必要になるまで計算されない
const lazyColor = ({ palette }) => palette('primary').lighten(0.2);

// アクセス時に初めて計算される
const actualColor = scheme.scope('primary').light;
```

### キャッシュ機構

```typescript
// 一度計算された値はキャッシュされる
const cachedScheme = createColorScheme({
  cache: true, // キャッシュ有効化
  themes: [/* ... */]
});

// 同じテーマ・スコープへの再アクセスは高速
const color1 = cachedScheme.scope('primary').main;
const color2 = cachedScheme.scope('primary').main; // キャッシュから取得
```

## 型安全性と拡張

### モジュール拡張

```typescript
// types/color-scheme.d.ts
declare module '@fastkit/color-scheme' {
  interface ThemeSettings {
    light: 'light';
    dark: 'dark';
    auto: 'auto';
  }
  
  interface PaletteSettings {
    primary: 'primary';
    secondary: 'secondary';
    tertiary: 'tertiary';
    success: 'success';
    warning: 'warning';
    error: 'error';
    info: 'info';
  }
  
  interface ScopeSettings {
    primary: 'primary';
    secondary: 'secondary';
    surface: 'surface';
    background: 'background';
  }
  
  interface VariantSettings {
    contained: 'contained';
    outlined: 'outlined';
    text: 'text';
    elevated: 'elevated';
  }
}
```

### 型安全なカラーアクセス

```typescript
// 型安全なスキームアクセス
const color: string = scheme.scope('primary').main; // ✓ 正常
const invalid = scheme.scope('invalid'); // ✗ TypeScriptエラー

// 型安全なテーマアクセス
const lightTheme = scheme.theme('light'); // ✓ 正常
const invalidTheme = scheme.theme('invalid'); // ✗ TypeScriptエラー
```

## テストとデバッグ

### ユニットテスト例

```typescript
import { describe, test, expect } from 'vitest';
import { createColorScheme } from '@fastkit/color-scheme';

describe('ColorScheme', () => {
  const scheme = createColorScheme({
    variants: ['contained', 'outlined'],
    themes: [
      {
        name: 'light',
        palette: [['primary', '#1976d2']],
        scopes: [['primary', ({ palette }) => palette('primary')]]
      }
    ]
  });
  
  test('テーマアクセス', () => {
    const theme = scheme.theme('light');
    expect(theme.name).toBe('light');
    expect(theme.isLight).toBe(true);
  });
  
  test('スコープアクセス', () => {
    const scope = scheme.scope('primary');
    expect(scope.main).toBe('#1976d2');
  });
  
  test('パレットアクセス', () => {
    const palette = scheme.theme('light').palette;
    expect(palette('primary')).toBe('#1976d2');
  });
});
```

### デバッグ機能

```typescript
// デバッグモード有効化
const debugScheme = createColorScheme({
  debug: true,
  themes: [/* ... */]
});

// カラー情報の詳細出力
console.log(debugScheme.debug.info());
// {
//   themes: ['light', 'dark'],
//   scopes: ['primary', 'secondary'],
//   variants: ['contained', 'outlined'],
//   optionals: ['light', 'deep', 'text']
// }
```

## 依存関係

```json
{
  "dependencies": {
    "@fastkit/color": "カラー操作ライブラリ",
    "@fastkit/tiny-logger": "ログ機能"
  },
  "peerDependencies": {
    "vue": "^3.4.0"
  },
  "devDependencies": {
    "typescript": "^5.5.0",
    "vitest": "^1.0.0"
  }
}
```

## ドキュメント

詳細なドキュメントは[こちら](https://dadajam4.github.io/fastkit/color-scheme/)をご覧ください。

## ライセンス

MIT