# @fastkit/vue-color-scheme

🌐 [English](https://github.com/dadajam4/fastkit/blob/main/packages/vue-color-scheme/README.md) | 日本語

Vue.js アプリケーションで型安全なカラースキームを利用するためのライブラリです。@fastkit/color-schemeとVue 3 Composition APIを統合し、動的テーマ切り替え、CSS Variables統合、型安全なカラーアクセスを提供します。

## 特徴

- **Vue 3 完全統合**: Composition APIとOptionsAPIの両方をサポート
- **型安全**: TypeScriptによる完全な型安全性
- **動的テーマ切り替え**: リアルタイムでのライト/ダーク切り替え
- **CSS Variables統合**: 自動CSS変数生成とバインディング
- **Composables**: useColorScheme、useColorClasses等の便利なコンポーザブル
- **props統合**: colorSchemePropsによる標準化されたprop定義
- **HTMLクラス管理**: テーマクラスの自動HTMLバインディング
- **Head管理**: @unhead/vueとの統合によるメタ情報管理
- **プラグインシステム**: Vueアプリケーションレベルでの簡単セットアップ
- **SSR対応**: サーバーサイドレンダリング完全対応

## インストール

```bash
npm install @fastkit/vue-color-scheme
# or
pnpm add @fastkit/vue-color-scheme

# 依存関係
npm install @fastkit/color-scheme vue @unhead/vue
```

## 基本的な使い方

### プラグイン設定

```typescript
// main.ts
import { createApp } from 'vue';
import { createHead } from '@unhead/vue';
import { VueColorSchemeService } from '@fastkit/vue-color-scheme';
import colorScheme from './color-scheme'; // カラースキーム定義

const app = createApp(App);

// Head プラグイン
const head = createHead();
app.use(head);

// カラースキームサービス
const colorSchemeService = new VueColorSchemeService(colorScheme);
colorSchemeService.provide(app);

app.mount('#app');
```

### カラースキーム定義

```typescript
// color-scheme.ts
import { createSimpleColorScheme } from '@fastkit/color-scheme-gen';

export default createSimpleColorScheme({
  primary: '#1976d2',
  secondary: '#424242',
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
  background: '#ffffff',
  foundation: '#f5f5f5'
});
```

### Vue コンポーネントでの使用

```vue
<template>
  <div :class="themeClass">
    <!-- プライマリカラーのボタン -->
    <button :class="primaryClasses">
      プライマリボタン
    </button>

    <!-- セカンダリカラーのアウトラインボタン -->
    <button :class="secondaryClasses">
      セカンダリボタン
    </button>

    <!-- テーマ切り替えボタン -->
    <button @click="toggleTheme">
      {{ isDark ? 'ライト' : 'ダーク' }}テーマに切り替え
    </button>
  </div>
</template>

<script setup lang="ts">
import {
  useColorScheme,
  useColorClasses,
  useThemeClass
} from '@fastkit/vue-color-scheme';

// カラースキームサービス
const colorScheme = useColorScheme();

// テーマクラス管理
const { themeClass, currentTheme, toggleTheme, isDark } = useThemeClass({});

// カラークラス生成
const primaryClasses = useColorClasses({ color: 'primary', variant: 'contained' });
const secondaryClasses = useColorClasses({ color: 'secondary', variant: 'outlined' });
</script>
```

## Composables

### useColorScheme

カラースキームサービスへのアクセス：

```typescript
import { useColorScheme } from '@fastkit/vue-color-scheme';

const colorSchemeService = useColorScheme();

// サービス情報
console.log(colorSchemeService.defaultTheme);    // 'light'
console.log(colorSchemeService.themeNames);      // ['light', 'dark']
console.log(colorSchemeService.paletteNames);    // ['primary', 'secondary', ...]
console.log(colorSchemeService.scopeNames);      // ['primary', 'secondary', ...]

// 現在のテーマ
console.log(colorSchemeService.rootTheme);       // 'light' | 'dark'
colorSchemeService.rootTheme = 'dark';           // テーマ変更
```

### useThemeClass

テーマクラスの管理：

```typescript
import { useThemeClass } from '@fastkit/vue-color-scheme';

// 基本的な使用
const themeResult = useThemeClass({});
console.log(themeResult.value); // { value: 'light', className: 'light-theme' }

// 特定のテーマを指定
const themeResult = useThemeClass({ theme: 'dark' });
console.log(themeResult.value); // { value: 'dark', className: 'dark-theme' }

// リアクティブなテーマ
const theme = ref('light');
const themeResult = useThemeClass({ theme });

// ルートテーマをデフォルトに使用
const themeResult = useThemeClass({}, true);
```

### useColorClasses

包括的なカラークラス管理：

```typescript
import { useColorClasses } from '@fastkit/vue-color-scheme';

const colorClassesResult = useColorClasses({
  theme: 'light',
  color: 'primary',
  variant: 'contained',
  textColor: 'white',
  borderColor: 'primary'
});

// 結果の構造
console.log(colorClassesResult.theme.value);        // { value: 'light', className: 'light-theme' }
console.log(colorClassesResult.color.value);        // { value: 'primary', className: 'primary-scope' }
console.log(colorClassesResult.variant.value);      // { value: 'contained', className: 'contained' }
console.log(colorClassesResult.textColor.value);    // { value: 'white', className: 'white-text' }
console.log(colorClassesResult.borderColor.value);  // { value: 'primary', className: 'primary-border' }

// 全てのクラスを配列で取得
console.log(colorClassesResult.colorClasses.value);
// ['light-theme', 'primary-scope', 'contained', 'white-text', 'primary-border']
```

### useScopeColorClass

スコープカラークラス専用：

```typescript
import { useScopeColorClass } from '@fastkit/vue-color-scheme';

const scopeResult = useScopeColorClass({ color: 'primary' });
console.log(scopeResult.value); // { value: 'primary', className: 'primary-scope' }

// 動的カラー
const color = ref('secondary');
const scopeResult = useScopeColorClass({ color });
// colorが変更されると自動的にクラス名も変更される
```

### useTextColorClass

テキストカラークラス専用：

```typescript
import { useTextColorClass } from '@fastkit/vue-color-scheme';

const textResult = useTextColorClass({ textColor: 'primary' });
console.log(textResult.value); // { value: 'primary', className: 'primary-text' }

// 関数ベースの動的カラー
const textResult = useTextColorClass({
  textColor: () => isDark.value ? 'white' : 'black'
});
```

### useBorderColorClass

ボーダーカラークラス専用：

```typescript
import { useBorderColorClass } from '@fastkit/vue-color-scheme';

const borderResult = useBorderColorClass({ borderColor: 'primary' });
console.log(borderResult.value); // { value: 'primary', className: 'primary-border' }
```

### useColorVariantClasses

バリアントクラス専用：

```typescript
import { useColorVariantClasses } from '@fastkit/vue-color-scheme';

const variantResult = useColorVariantClasses({ variant: 'outlined' });
console.log(variantResult.value); // { value: 'outlined', className: 'outlined' }
```

### useInjectTheme

HTMLクラスへのテーマ自動適用：

```typescript
import { useInjectTheme } from '@fastkit/vue-color-scheme';

// このcomposableを呼び出すと、
// HTMLのclass属性にテーマクラスが自動的に追加される
const colorSchemeService = useInjectTheme();

// HTML例: <html class="light-theme">
// テーマが変更されると自動的にクラスも変更される
```

## Props統合

### colorSchemeProps

標準化されたカラースキームpropsの定義：

```typescript
import { colorSchemeProps } from '@fastkit/vue-color-scheme';

// デフォルトprop名
const props = colorSchemeProps();
// 生成されるprops:
// {
//   variant: String,
//   theme: String,
//   color: String,
//   textColor: String,
//   borderColor: String
// }

// カスタムprop名
const customProps = colorSchemeProps({
  theme: 'appTheme',
  color: 'brandColor',
  textColor: 'fontColor',
  borderColor: 'edgeColor'
});
// 生成されるprops:
// {
//   variant: String,
//   appTheme: String,
//   brandColor: String,
//   fontColor: String,
//   edgeColor: String
// }

// 使用例
export default defineComponent({
  props: {
    ...colorSchemeProps(),
    title: String,
    size: String
  },
  setup(props) {
    const colorClasses = useColorClasses(props);

    return {
      colorClasses
    };
  }
});
```

## 高度な使用例

### コンポーネントライブラリ統合

```vue
<!-- Button.vue -->
<template>
  <button
    :class="buttonClasses"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { colorSchemeProps, useColorClasses } from '@fastkit/vue-color-scheme';

interface Props {
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

const props = defineProps({
  ...colorSchemeProps(),
  ...withDefaults(defineProps<Props>(), {
    size: 'md',
    disabled: false
  })
});

defineEmits<{
  click: [event: MouseEvent];
}>();

// カラークラス生成
const colorClasses = useColorClasses(props);

// 最終的なクラス名計算
const buttonClasses = computed(() => [
  'button',
  `button--${props.size}`,
  ...colorClasses.colorClasses.value,
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
.button.primary-scope.contained {
  background: var(--main-color);
  color: var(--text-color);
  border: 1px solid var(--main-color);
}

.button.primary-scope.contained:hover {
  background: var(--deep-color);
}

.button.primary-scope.outlined {
  background: transparent;
  color: var(--main-color);
  border: 1px solid var(--outlineBorder-color);
}
</style>
```

### テーマ切り替えコンポーネント

```vue
<!-- ThemeSwitcher.vue -->
<template>
  <div class="theme-switcher">
    <button
      v-for="themeName in availableThemes"
      :key="themeName"
      :class="themeButtonClass(themeName)"
      @click="setTheme(themeName)"
    >
      {{ getThemeDisplayName(themeName) }}
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useColorScheme } from '@fastkit/vue-color-scheme';

const colorSchemeService = useColorScheme();

// 利用可能なテーマ
const availableThemes = computed(() => colorSchemeService.themeNames);

// 現在のテーマ
const currentTheme = computed(() => colorSchemeService.rootTheme);

// テーマ設定
const setTheme = (themeName: string) => {
  colorSchemeService.rootTheme = themeName;
};

// テーマボタンのクラス
const themeButtonClass = (themeName: string) => [
  'theme-button',
  {
    'theme-button--active': currentTheme.value === themeName
  }
];

// テーマ表示名
const getThemeDisplayName = (themeName: string) => {
  const displayNames: Record<string, string> = {
    light: 'ライト',
    dark: 'ダーク',
    auto: '自動'
  };
  return displayNames[themeName] || themeName;
};
</script>

<style scoped>
.theme-switcher {
  display: flex;
  gap: var(--spacing-sm);
}

.theme-button {
  padding: var(--spacing-sm) var(--spacing-md);
  border: 1px solid var(--border-color);
  background: var(--background-color);
  color: var(--text-color);
  border-radius: var(--border-radius);
  cursor: pointer;
  transition: all 0.2s ease;
}

.theme-button:hover {
  background: var(--light-color);
}

.theme-button--active {
  background: var(--primary-color);
  color: var(--primary-text-color);
  border-color: var(--primary-color);
}
</style>
```

### システム設定連携

```vue
<!-- AutoThemeManager.vue -->
<template>
  <div class="auto-theme-manager">
    <label>
      <input
        type="checkbox"
        :checked="followSystem"
        @change="toggleSystemFollow"
      >
      システム設定に従う
    </label>

    <div v-if="!followSystem" class="manual-controls">
      <ThemeSwitcher />
    </div>

    <div class="current-info">
      現在のテーマ: {{ currentTheme }}
      <span v-if="followSystem">(システム: {{ systemTheme }})</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useColorScheme } from '@fastkit/vue-color-scheme';

const colorSchemeService = useColorScheme();
const followSystem = ref(true);
const systemTheme = ref<'light' | 'dark'>('light');

// 現在のテーマ
const currentTheme = computed(() => colorSchemeService.rootTheme);

// システム設定の監視
let mediaQuery: MediaQueryList | null = null;

const updateSystemTheme = () => {
  if (mediaQuery) {
    systemTheme.value = mediaQuery.matches ? 'dark' : 'light';
    if (followSystem.value) {
      colorSchemeService.rootTheme = systemTheme.value;
    }
  }
};

const toggleSystemFollow = (event: Event) => {
  const target = event.target as HTMLInputElement;
  followSystem.value = target.checked;

  if (followSystem.value) {
    // システム設定に従う場合、現在のシステムテーマを適用
    colorSchemeService.rootTheme = systemTheme.value;
  }
};

onMounted(() => {
  // システムのダークモード設定を監視
  mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  updateSystemTheme();

  mediaQuery.addEventListener('change', updateSystemTheme);
});

onUnmounted(() => {
  if (mediaQuery) {
    mediaQuery.removeEventListener('change', updateSystemTheme);
  }
});
</script>
```

### 動的カラー生成

```vue
<!-- DynamicColorGenerator.vue -->
<template>
  <div class="color-generator">
    <div class="controls">
      <label>
        ベースカラー:
        <input
          type="color"
          v-model="baseColor"
          @input="generateColors"
        >
      </label>

      <label>
        カラーモード:
        <select v-model="colorMode" @change="generateColors">
          <option value="monochromatic">単色調</option>
          <option value="analogous">類似色</option>
          <option value="complementary">補色</option>
          <option value="triadic">三色調</option>
        </select>
      </label>
    </div>

    <div class="color-preview">
      <div
        v-for="(color, index) in generatedColors"
        :key="index"
        class="color-swatch"
        :style="{ backgroundColor: color }"
      >
        {{ color }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useColorScheme } from '@fastkit/vue-color-scheme';

const colorSchemeService = useColorScheme();
const baseColor = ref('#1976d2');
const colorMode = ref('monochromatic');
const generatedColors = ref<string[]>([]);

const generateColors = () => {
  // カラー生成ロジック（実際の実装では @fastkit/color を使用）
  const colors: string[] = [];

  switch (colorMode.value) {
    case 'monochromatic':
      // 明度違いの単色調パレット
      colors.push(
        baseColor.value,
        adjustBrightness(baseColor.value, 0.2),
        adjustBrightness(baseColor.value, -0.2)
      );
      break;

    case 'analogous':
      // 類似色パレット
      colors.push(
        baseColor.value,
        rotateHue(baseColor.value, 30),
        rotateHue(baseColor.value, -30)
      );
      break;

    case 'complementary':
      // 補色パレット
      colors.push(
        baseColor.value,
        rotateHue(baseColor.value, 180)
      );
      break;

    case 'triadic':
      // 三色調パレット
      colors.push(
        baseColor.value,
        rotateHue(baseColor.value, 120),
        rotateHue(baseColor.value, 240)
      );
      break;
  }

  generatedColors.value = colors;
};

// カラー操作ヘルパー関数（簡易版）
const adjustBrightness = (color: string, amount: number): string => {
  // 実装は @fastkit/color のColor.lighten/darken メソッドを使用
  return color;
};

const rotateHue = (color: string, degrees: number): string => {
  // 実装は @fastkit/color のColor.rotate メソッドを使用
  return color;
};

onMounted(() => {
  generateColors();
});
</script>

<style scoped>
.color-generator {
  padding: var(--spacing-lg);
}

.controls {
  display: flex;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.controls label {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.color-preview {
  display: flex;
  gap: var(--spacing-sm);
}

.color-swatch {
  width: 120px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  border-radius: var(--border-radius);
}
</style>
```

## VueColorSchemeService

サービスクラスの詳細な使用：

```typescript
import { VueColorSchemeService } from '@fastkit/vue-color-scheme';
import colorScheme from './color-scheme';

// サービス作成
const service = new VueColorSchemeService(colorScheme);

// プロパティアクセス
console.log(service.scheme);          // ColorSchemeインスタンス
console.log(service.defaultTheme);    // デフォルトテーマ名
console.log(service.themeNames);      // 全テーマ名
console.log(service.paletteNames);    // 全パレット名
console.log(service.scopeNames);      // 全スコープ名

// テーマ管理
console.log(service.rootTheme);       // 現在のテーマ
service.rootTheme = 'dark';          // テーマ変更

// Vueアプリへの提供
service.provide(app);
```

## SSR対応

サーバーサイドレンダリングでの使用：

```typescript
// server.ts (Node.js サーバー)
import { createSSRApp } from 'vue';
import { renderToString } from 'vue/server-renderer';
import { createHead, renderHeadToString } from '@unhead/vue';
import { VueColorSchemeService } from '@fastkit/vue-color-scheme';

export async function render(url: string, theme = 'light') {
  const app = createSSRApp(App);

  // Head設定
  const head = createHead();
  app.use(head);

  // カラースキーム設定
  const colorSchemeService = new VueColorSchemeService(colorScheme);
  colorSchemeService.rootTheme = theme; // サーバー側でテーマ設定
  colorSchemeService.provide(app);

  // レンダリング
  const appHtml = await renderToString(app);
  const { headTags, htmlAttrs, bodyAttrs } = await renderHeadToString(head);

  return {
    html: `
      <!DOCTYPE html>
      <html${htmlAttrs}>
        <head>
          ${headTags}
        </head>
        <body${bodyAttrs}>
          <div id="app">${appHtml}</div>
        </body>
      </html>
    `,
  };
}
```

## TypeScript型拡張

型情報の拡張：

```typescript
// types/vue-color-scheme.d.ts
declare module '@fastkit/vue-color-scheme' {
  interface ColorSchemeHooksProps {
    // カスタムpropの追加
    brand?: string;
    accent?: string;
  }
}

// 使用例
const customColorClasses = useColorClasses({
  color: 'primary',
  brand: 'corporate',  // カスタムprop
  accent: 'highlight'  // カスタムprop
});
```

## テストとデバッグ

### ユニットテスト

```typescript
import { describe, test, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { VueColorSchemeService } from '@fastkit/vue-color-scheme';
import { createSimpleColorScheme } from '@fastkit/color-scheme-gen';

describe('VueColorScheme', () => {
  let colorScheme: any;
  let service: VueColorSchemeService;

  beforeEach(() => {
    colorScheme = createSimpleColorScheme({
      primary: '#1976d2',
      secondary: '#424242'
    });
    service = new VueColorSchemeService(colorScheme);
  });

  test('service creation', () => {
    expect(service.defaultTheme).toBe('light');
    expect(service.themeNames).toContain('light');
    expect(service.themeNames).toContain('dark');
  });

  test('theme switching', () => {
    expect(service.rootTheme).toBe('light');
    service.rootTheme = 'dark';
    expect(service.rootTheme).toBe('dark');
  });

  test('component integration', () => {
    const TestComponent = {
      template: '<div :class="colorClasses.colorClasses.value"></div>',
      setup() {
        const colorClasses = useColorClasses({
          color: 'primary',
          variant: 'contained'
        });
        return { colorClasses };
      }
    };

    const wrapper = mount(TestComponent, {
      global: {
        provide: {
          [VueColorSchemeServiceInjectionKey]: service
        }
      }
    });

    expect(wrapper.classes()).toContain('primary-scope');
    expect(wrapper.classes()).toContain('contained');
  });
});
```

## 依存関係

```json
{
  "dependencies": {
    "@fastkit/color-scheme": "カラースキーム基盤ライブラリ",
    "@fastkit/tiny-logger": "軽量ログ機能",
    "@fastkit/vue-utils": "Vue.js ユーティリティ"
  },
  "peerDependencies": {
    "vue": "^3.4.0",
    "@unhead/vue": "^1.8.0"
  }
}
```

## ドキュメント

https://dadajam4.github.io/fastkit/vue-color-scheme/

## ライセンス

MIT
