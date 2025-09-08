# @fastkit/vue-disabled-reason

🌐 [English](https://github.com/dadajam4/fastkit/blob/main/packages/vue-disabled-reason/README.md) | 日本語

無効状態の要素を監視し、理由を表示するヘッドレスVue.jsコンポーネントを定義するためのユーティリティ関数を提供するライブラリです。

## 特徴

- **ヘッドレスデザイン**: UIを提供せず、ロジックのみを担当するコンポーネントを作成可能
- **自動無効状態検出**: `disabled`属性と`aria-disabled`属性の自動監視
- **柔軟な表示制御**: スロットまたはレンダー関数による理由表示
- **TypeScript完全対応**: 厳密な型定義による型安全性
- **高度なカスタマイズ**: VNode走査のカスタムハンドリング対応
- **パフォーマンス最適化**: 効率的な要素監視とレンダリング制御

## インストール

```bash
npm install @fastkit/vue-disabled-reason
# or
pnpm add @fastkit/vue-disabled-reason
```

### 必須CSS読み込み

ライブラリを使用する前に、必ずCSSファイルを読み込んでください。このCSSは監視対象の要素に`position: relative`を設定し、ライブラリが理由表示用の要素を正しく挿入できるようにします。

```typescript
// メインエントリーポイントで最初に読み込み
import '@fastkit/vue-disabled-reason/vue-disabled-reason.css';
```

または、HTML内で読み込み：

```html
<link rel="stylesheet" href="@fastkit/vue-disabled-reason/vue-disabled-reason.css">
```

## 基本的な使い方

### シンプルな無効理由表示

```vue
<template>
  <div>
    <!-- 無効状態のボタンをラップ -->
    <MyDisabledReason>
      <button :disabled="hasNoPermission">
        削除実行
      </button>

      <!-- 無効理由をスロットで表示 -->
      <template #reason>
        権限が不足しています
      </template>
    </MyDisabledReason>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { MyDisabledReason } from './components/MyDisabledReason.vue';

const hasNoPermission = ref(true);
</script>
```

### reasonプロパティでの理由表示

スロットの代わりに`reason`プロパティを使用することも可能です。

```vue
<template>
  <div>
    <!-- reasonプロパティで理由を指定 -->
    <MyDisabledReason reason="管理者権限が必要です">
      <button :disabled="!isAdmin">
        システム設定
      </button>
    </MyDisabledReason>

    <!-- 動的な理由の設定 -->
    <MyDisabledReason :reason="disableReason">
      <button :disabled="isDisabled">
        データ削除
      </button>
    </MyDisabledReason>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const isAdmin = ref(false);
const hasDeletePermission = ref(false);

const disableReason = computed(() => 
  hasDeletePermission.value ? null : '削除権限がありません'
);
</script>
```

### カスタムコンポーネントの定義

```typescript
import { defineDisabledReasonComponent } from '@fastkit/vue-disabled-reason';
import { VTooltip } from './components/VTooltip.vue';

export const MyDisabledReason = defineDisabledReasonComponent({
  name: 'MyDisabledReason',
  setup(api) {
    return (reason) => (
      <VTooltip
        disabled={!reason || !api.disabled}
        v-slots={{
          activator: ({ attrs }) => <span {...attrs} />,
          default: () => reason,
        }}
      />
    );
  },
});
```

## 高度な使用例

### カスタムコンテナ指定

デフォルトでは、無効理由を表示する要素は監視対象要素のルート要素に挿入されます。`DISABLED_REASON_CONTAINER_BIND`を使用することで、挿入位置をカスタマイズできます。

```vue
<template>
  <MyDisabledReason>
    <div class="button-container">
      <!-- DISABLED_REASON_CONTAINER_BINDで挿入位置を指定 -->
      <div v-bind="DISABLED_REASON_CONTAINER_BIND">
        <button :disabled="isDisabled">設定変更</button>
      </div>
      <span>システム設定</span>
    </div>
    
    <template #reason>
      システム設定の変更権限がありません
    </template>
  </MyDisabledReason>
</template>

<script setup lang="ts">
import { DISABLED_REASON_CONTAINER_BIND } from '@fastkit/vue-disabled-reason';
const isDisabled = ref(true);
</script>
```

### 複数ボタンでの個別対応

複数の無効化可能要素がある場合は、それぞれを個別のコンポーネントでラップする必要があります。

```vue
<template>
  <div>
    <h3>データ管理</h3>
    <div>
      <!-- 編集ボタン -->
      <MyDisabledReason>
        <div v-bind="DISABLED_REASON_CONTAINER_BIND">
          <button :disabled="!canEdit">編集</button>
        </div>
        <template #reason>
          編集権限がありません
        </template>
      </MyDisabledReason>

      <!-- 削除ボタン -->
      <MyDisabledReason>
        <div v-bind="DISABLED_REASON_CONTAINER_BIND">
          <button :disabled="!canDelete">削除</button>
        </div>
        <template #reason>
          削除権限がありません
        </template>
      </MyDisabledReason>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { DISABLED_REASON_CONTAINER_BIND } from '@fastkit/vue-disabled-reason';

const userRole = ref('viewer'); // 'admin', 'editor', 'viewer'
const canEdit = computed(() => ['admin', 'editor'].includes(userRole.value));
const canDelete = computed(() => userRole.value === 'admin');
</script>
```

## API リファレンス

### defineDisabledReasonComponent

ヘッドレスな無効理由コンポーネントを定義します。

```typescript
function defineDisabledReasonComponent<Props>(
  options: DisabledReasonComponentOptions<Props>
): DefineComponent
```

**オプション:**

- `name?`: コンポーネント名
- `props?`: 追加プロパティの定義
- `skipVNode?`: VNode走査のスキップハンドラー
- `setup`: レンダー関数を返すセットアップ関数

### DisabledReasonAPI

コンポーネント内で利用できるAPIです。

```typescript
interface DisabledReasonAPI<Props = {}> {
  readonly props: ExtractPropTypes<Props>;
  readonly disabled: boolean;
}
```

### DISABLED_REASON_CONTAINER_BIND

無効理由表示要素の挿入位置をカスタマイズするためのバインドオブジェクトです。

```typescript
const DISABLED_REASON_CONTAINER_BIND: {
  'data-disabled-reason-container': '';
}
```

**使用方法:**

```vue
<template>
  <MyDisabledReason>
    <!-- この要素内に無効理由が挿入される -->
    <div v-bind="DISABLED_REASON_CONTAINER_BIND">
      <button :disabled="isDisabled">ボタン</button>
    </div>
    
    <template #reason>
      無効理由のテキスト
    </template>
  </MyDisabledReason>
</template>
```

**注意事項:**
- 指定されたコンテナ内で最初に見つかった無効化可能要素のみが監視対象となります
- 複数の無効化可能要素がある場合は、それぞれを個別のコンポーネントでラップしてください

## 監視対象要素

### 標準的な無効化可能要素

- `<button>`
- `<input>`（全てのtype）
- `<textarea>`
- `<select>`
- `<fieldset>`
- `<optgroup>`
- `<option>`

### ARIA対応要素

`aria-disabled`属性を持つ以下のroleの要素（`<a>`タグを含む）:

- `button`
- `link`
- `menuitem`
- `menuitemcheckbox`
- `menuitemradio`
- `option`
- `radio`
- `slider`
- `spinbutton`
- `switch`
- `tab`
- `checkbox`
- `gridcell`
- `textbox`

## パフォーマンス考慮事項

- **効率的な要素検索**: 必要最小限のDOM走査
- **レンダリング最適化**: 無効状態変更時のみ再レンダリング
- **メモリ管理**: 適切なクリーンアップ処理
- **イベント最適化**: 必要な場合のみイベントリスナー登録

## 制限事項

- **単一要素監視**: 1つのコンポーネントインスタンスは最初に見つけた無効化可能要素のみを監視します。複数の要素を監視する場合は、それぞれを個別のコンポーネントでラップする必要があります
- **動的要素**: 動的に追加される要素の監視には再マウントが必要
- **CSS疑似クラス**: CSS疑似クラス（`:disabled`など）による無効状態は検出不可
- **JavaScript動的変更**: JavaScriptによる動的な無効状態変更は`nextTick`後に反映

## 関連パッケージ

- `@fastkit/vue-utils` - Vue.jsユーティリティ（依存関係）
- `vue` - Vue.js フレームワーク（ピア依存関係）

## ライセンス

MIT
