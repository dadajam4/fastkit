# @fastkit/plugboy

モノレポ対応のモジュールバンドラー・プロジェクト管理ツールです。esbuild、tsup等をベースとした高速ビルドシステムを提供します。

## 特徴

- **高速ビルド**: esbuild、tsupベースの超高速バンドリング
- **モノレポ対応**: マルチパッケージプロジェクトの統合管理
- **TypeScript完全対応**: 自動型定義生成・最適化
- **プラグインシステム**: 拡張可能なアーキテクチャ
- **CSS統合**: Sass、Vanilla Extract、CSS最適化サポート
- **開発効率**: stub機能による高速開発サイクル
- **自動化**: package.json、exports自動生成

## インストール

```bash
npm install @fastkit/plugboy
# or
pnpm add @fastkit/plugboy
```

## 基本的な使い方

### CLI コマンド

```bash
# プロジェクト全体のビルド
plugboy build

# 開発用stub生成（高速開発）
plugboy stub

# package.json設定の同期
plugboy json

# ディストリビューション削除
plugboy clean

# 新しいワークスペース生成
plugboy generate [workspaceName]
# または
plugboy gen [workspaceName]
```

### ワークスペース設定

**`plugboy.workspace.ts`**:
```typescript
import { defineWorkspaceConfig } from '@fastkit/plugboy';

export default defineWorkspaceConfig({
  entries: {
    '.': './src/index.ts',
    './utils': './src/utils.ts'
  },
  plugins: [
    // プラグイン設定
  ],
  dts: {
    // TypeScript型定義設定
  },
  optimizeCSS: true
});
```

### プロジェクト設定

**`plugboy.project.ts`**:
```typescript
import { defineProjectConfig } from '@fastkit/plugboy';

export default defineProjectConfig({
  workspacesDir: 'packages',
  peerDependencies: {
    'vue': '^3.4.0'
  },
  scripts: [
    {
      name: 'TypeScript',
      scripts: {
        build: 'plugboy build',
        stub: 'plugboy stub',
        typecheck: 'tsc --noEmit'
      }
    }
  ]
});
```

## API

### defineWorkspaceConfig

#### エントリーポイント設定

```typescript
export default defineWorkspaceConfig({
  entries: {
    '.': './src/index.ts',              // メインエントリー
    './components': './src/components.ts', // サブエントリー
    './styles': {                        // CSS付きエントリー
      src: './src/styles.ts',
      css: true
    }
  }
});
```

#### プラグイン設定

```typescript
import { createSassPlugin } from '@fastkit/plugboy-sass-plugin';
import { createVueJSXPlugin } from '@fastkit/plugboy-vue-jsx-plugin';

export default defineWorkspaceConfig({
  plugins: [
    createSassPlugin(),
    createVueJSXPlugin()
  ]
});
```

#### TypeScript型定義設定

```typescript
export default defineWorkspaceConfig({
  dts: {
    preserveType: [
      // カスタム型保持設定
    ],
    normalizers: [
      // 型定義正規化関数
      (dts) => dts.replace(/unwanted-pattern/g, '')
    ]
  }
});
```

### defineProjectConfig

#### ワークスペース管理

```typescript
export default defineProjectConfig({
  workspacesDir: 'packages',
  peerDependencies: {
    'react': '^18.0.0',
    'vue': '^3.4.0'
  }
});
```

#### スクリプトテンプレート

```typescript
export default defineProjectConfig({
  scripts: [
    {
      name: 'TypeScript',
      scripts: {
        build: 'plugboy build',
        clean: 'rm -rf dist',
        typecheck: 'tsc --noEmit'
      }
    },
    {
      name: 'TypeScript with CSS',
      scripts: {
        build: 'plugboy build',
        lint: 'eslint . && stylelint "**/*.css"'
      }
    }
  ]
});
```

## プラグインシステム

### 内蔵プラグイン

- **@fastkit/plugboy-sass-plugin**: Sass/SCSS サポート
- **@fastkit/plugboy-vanilla-extract-plugin**: Vanilla Extract サポート
- **@fastkit/plugboy-vue-jsx-plugin**: Vue JSX サポート

### カスタムプラグイン

```typescript
import type { Plugin } from '@fastkit/plugboy';

const customPlugin = (): Plugin => ({
  name: 'custom-plugin',
  setup(workspace) {
    // プラグイン初期化
    workspace.hooks.buildStart?.tap('custom-plugin', () => {
      console.log('Build started');
    });
  }
});

export default defineWorkspaceConfig({
  plugins: [customPlugin()]
});
```

## 開発ワークフロー

### 高速開発サイクル

```bash
# 1. 初回ビルド
pnpm build

# 2. 開発モード（高速）
pnpm stub

# 3. 開発サーバー起動
pnpm dev
```

### モノレポ管理

```bash
# 新しいパッケージ作成
plugboy gen my-new-package

# プロジェクト全体ビルド
plugboy build

# 特定パッケージのみ
cd packages/my-package
plugboy build
```

## 設定例

### CSS統合プロジェクト

```typescript
// plugboy.workspace.ts
import { defineWorkspaceConfig } from '@fastkit/plugboy';
import { createSassPlugin } from '@fastkit/plugboy-sass-plugin';

export default defineWorkspaceConfig({
  entries: {
    '.': {
      src: './src/index.ts',
      css: true
    }
  },
  plugins: [
    createSassPlugin()
  ],
  optimizeCSS: {
    combineRules: {
      rules: [':root']
    }
  }
});
```

### Vue.jsプロジェクト

```typescript
// plugboy.workspace.ts
import { defineWorkspaceConfig } from '@fastkit/plugboy';
import { createVueJSXPlugin } from '@fastkit/plugboy-vue-jsx-plugin';
import { createSassPlugin } from '@fastkit/plugboy-sass-plugin';

export default defineWorkspaceConfig({
  entries: {
    '.': './src/index.ts'
  },
  plugins: [
    createVueJSXPlugin(),
    createSassPlugin()
  ],
  external: ['vue']
});
```

## フック システム

### ビルドフック

```typescript
export default defineWorkspaceConfig({
  hooks: {
    buildStart: () => {
      console.log('Build starting...');
    },
    buildEnd: (result) => {
      console.log('Build completed:', result);
    },
    buildError: (error) => {
      console.error('Build failed:', error);
    }
  }
});
```

## 型定義管理

### 自動型定義生成

```typescript
export default defineWorkspaceConfig({
  dts: {
    preserveType: [
      // 外部パッケージ型の保持
      'external-package-types'
    ],
    normalizers: [
      // 型定義の正規化・最適化
      (dts) => dts
        .replace(/unnecessary-types/g, '')
        .replace(/import\("complex-path"\)/g, 'SimpleType')
    ]
  }
});
```

## パフォーマンス最適化

### ビルド最適化

- **並列処理**: 複数エントリーの同時ビルド
- **インクリメンタル**: 変更部分のみ再ビルド
- **キャッシュ**: ビルド結果のキャッシュ利用
- **Tree Shaking**: 未使用コードの除去

### 開発最適化

- **Stub モード**: 実ファイルへのシンボリックリンク
- **Hot Reload**: ファイル変更の即座反映
- **TypeScript**: 高速型チェック

## 依存関係

### 主要依存
- `esbuild`: 高速JavaScriptビルダー
- `tsup`: TypeScriptビルドツール
- `cac`: CLI作成ライブラリ
- `glob`: ファイルマッチング
- `cssnano`: CSS最適化

## ライセンス

MIT