# @fastkit/plugboy

🌐 [English](https://github.com/dadajam4/fastkit/blob/main/packages/plugboy/README.md) | 日本語

モノレポ対応のモジュールバンドラー・プロジェクト管理ツールです。tsdownをベースとした高速ビルドシステムを提供します。

> **v0.x からの移行は** [v1 移行ガイド](./docs/migrations/v1.md)（tsdown 移行）を参照してください。

## 特徴

- **高速ビルド**: tsdownベースの超高速バンドリング
- **モノレポ対応**: マルチパッケージプロジェクトの統合管理
- **TypeScript完全対応**: 自動型定義生成・最適化
- **プラグインシステム**: 拡張可能なアーキテクチャ
- **CSS統合**: Sass、Vanilla Extract、CSS最適化サポート
- **開発効率**: stub機能による高速開発サイクル
- **自動化**: package.json、exports自動生成
- **環境定数とモジュール型**: 開発時ガードの `__PLUGBOY_DEV__` / `__PLUGBOY_STUB__` に加え、アセット・CSS・`?raw` インポート向けの Vite 互換アンビエント型（[ドキュメント](./docs/env-constants-ja.md)）

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
    'vue': '^3.5.0'
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

#### ビルドターゲット

`target` はそのまま tsdown に渡され、どの JavaScript 構文をダウンレベルするかを決定します。単一のターゲット、ターゲットの配列、または全ての変換を無効化する `false` を指定できます。

```typescript
export default defineWorkspaceConfig({
  // Node.js とブラウザの双方で動作するライブラリは、それぞれの下限を宣言します。
  // 出力は列挙した全ての環境を満たすものになります。
  target: ['node20.19', 'chrome111', 'firefox114', 'safari16.4']
});
```

`plugboy.project.ts` に設定すれば全ワークスペースに適用されます。ワークスペース側で `target` を宣言した場合はプロジェクトの値を完全に置き換えます（ターゲットのリストはマージされません）。どちらのレイヤーでも未設定の場合、tsdown はパッケージの `engines.node` フィールドにフォールバックし、そのフィールドも無い場合は一切変換を行いません。

ダウンレベルされるのは*構文*のみで、ランタイム API（`structuredClone`、`Array#at` など）がポリフィルされることはありません。この値は後述の `css.target` のデフォルトにもなります（リストのうちブラウザ以外のエントリは無視されます）。

#### CSS オプション

`css` はそのまま tsdown に渡され、スタイルシートの処理方法と出力を制御します。出力ファイル名、プリプロセッサのオプション、CSS Modules、構文のダウンレベルなどが対象です。

```typescript
export default defineWorkspaceConfig({
  css: {
    // 出力される単一のスタイルシートの名前。
    fileName: 'my-package.css',
    // `target` とは独立に、CSS の構文をブラウザ向けにのみダウンレベルする。
    target: ['chrome111', 'firefox114', 'safari16.4']
  }
});
```

`plugboy.project.ts` に設定すれば全ワークスペースのデフォルトになります。ワークスペースの値はプロジェクトの値へ浅くマージされるため、変更するキーだけを書けば十分です。

プラグインがワークスペースのセットアップ時にデフォルト値を与える場合があります。例えば vanilla-extract プラグインは、出力ファイルが plugboy の宣言する CSS export と一致するように `splitting` と `fileName` を所有します。設定値は常にプラグインのデフォルトより優先されるので、プラグインが管理するキーを上書きする前にそのドキュメントを確認してください。

#### CSS の最適化

`optimizeCSS` は、tsdown が生成した CSS に対して plugboy 独自の postcss 処理を適用します。重複した `@layer` / `@media` ブロックの統合と、`combineRules` に列挙したセレクタの単一ルールへの結合を行います。`false` で無効化できます。

```typescript
export default defineWorkspaceConfig({
  optimizeCSS: {
    combineRules: {
      rules: [':root']
    }
  }
});
```

この処理は `writeBundle` でディスク上のスタイルシートに対して実行されるため、ビルドが書き出す**すべての**スタイルシートが対象になります。tsdown 自身の CSS パイプラインは全プラグインの処理後に CSS を出力しますが、それも含まれます。plugboy が保持した外部 `@import` はその後に再挿入されるため、常に最適化済みのルールより上に配置されます。

### defineProjectConfig

#### ワークスペース管理

```typescript
export default defineProjectConfig({
  workspacesDir: 'packages',
  peerDependencies: {
    'react': '^18.0.0',
    'vue': '^3.5.0'
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

プラグインは tsdown（Rollup互換）プラグインを拡張し、plugboyのライフサイクルフック用の `hooks` フィールドを追加できます。型推論を得るには `definePlugin` を使用します。

```typescript
import { definePlugin } from '@fastkit/plugboy';

const customPlugin = () =>
  definePlugin({
    name: 'custom-plugin',
    hooks: {
      // ワークスペースインスタンスが生成される直前に呼び出されます
      setupWorkspace(ctx, getWorkspace) {
        console.log('Setting up workspace:', ctx.json.name);
      }
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
  deps: {
    neverBundle: ['vue']
  }
});
```

### 依存関係の外部化

`deps.neverBundle` は、指定したパッケージをバンドルせず外部依存（external）として
扱います。マッチングは**パッケージ名とそのサブパス**単位で行われ、`'foo'` を指定
すると `foo` と `foo/bar` の両方が external になります。

**自己参照（self-reference）は常に自動で external になります。** モジュールが自身の
パッケージ名で import した場合（例: `import logo from 'my-pkg/assets/logo.svg'`）、
その import はパッケージ自身の `exports` マップ（`"./*": "./dist/*"`）を通じて
実行時に解決されるため、バンドルされません。自分自身のパッケージを `neverBundle` に
列挙する必要はありません。plugboy がこれらを事前に external として解決するため、
rolldown の `UNRESOLVED_IMPORT` 警告は発生しません。一方、本当に解決できない
specifier（typo など）は従来どおり警告されます。

## フック システム

### ライフサイクルフック

```typescript
export default defineWorkspaceConfig({
  hooks: {
    // ワークスペースインスタンスが生成される直前に呼び出されます
    setupWorkspace: (ctx, getWorkspace) => {
      console.log('Setting up workspace:', ctx.json.name);
    },
    // ワークスペースインスタンスの生成後に呼び出されます
    createWorkspace: (workspace) => {
      console.log('Workspace created:', workspace.name);
    },
    // package.json が修正・保存される直前に呼び出されます
    preparePackageJSON: (json, workspace) => {
      json.sideEffects = false;
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

- `tsdown`: TypeScriptビルドツール
- `cac`: CLI作成ライブラリ
- `glob`: ファイルマッチング
- `cssnano`: CSS最適化

## ライセンス

MIT
