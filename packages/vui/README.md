
# @fastkit/vui

🌐 English | [日本語](./README-ja.md)

Vue.js 3アプリケーション用のシンプルで拡張可能なUIコンポーネントライブラリです。TypeScript完全対応、カラーテーマシステム、アクセシビリティ、そして@fastkit/vue-form-controlとの緊密な統合に焦点を当てています。

## 特徴

- **45個以上のUIコンポーネント**: ボタン、フォーム、ナビゲーション、データ表示など包括的なコンポーネントセット
- **統合エコシステム**: 20以上の@fastkitパッケージを統一されたAPIで提供
- **TypeScript完全対応**: 型安全なprops、イベント、スロット定義
- **Composition API設計**: Vue 3のモダンパターンを全面採用
- **カラーテーマシステム**: CSS Variables基盤の柔軟なテーマ機能
- **フォーム統合**: @fastkit/vue-form-controlとのシームレス連携
- **アクセシビリティ**: WAI-ARIA準拠、キーボードナビゲーション対応
- **レスポンシブ設計**: モバイルファーストなグリッドシステム
- **国際化対応**: 多言語フォント設定、RTL言語サポート
- **プログラマティックUI**: ダイアログ、通知などの命令的操作

## Installation

```bash
npm install @fastkit/vui
# or
pnpm add @fastkit/vui
```

## 基本的な使い方

### プラグイン設定

```typescript
import { createApp } from 'vue';
import { VuiPlugin } from '@fastkit/vui';
import { createRouter } from 'vue-router';

const app = createApp(App);
const router = createRouter(/* routes */);

// VUIプラグインをインストール
app.use(VuiPlugin, {
  router,
  colorScheme: {
    // カラーテーマ設定
    primary: '#1976d2',
    secondary: '#424242'
  },
  uiSettings: {
    primaryScope: 'primary',
    buttonDefault: {
      color: 'primary',
      variant: 'contained'
    }
  }
});
```

### アプリケーション設定

```vue
<template>
  <VApp>
    <!-- アプリケーションコンテンツ -->
    <router-view />
  </VApp>
</template>

<script setup lang="ts">
import { VApp } from '@fastkit/vui';
</script>
```

## コンポーネント一覧

### レイアウト & 構造

- **VApp** - アプリケーションルートコンテナ
- **VGrid** (`VGridContainer`, `VGridItem`) - レスポンシブグリッドシステム
- **VPaper** - Material Design風ペーパーコンテナ
- **VCard** (`VCardContent`, `VCardActions`) - カードレイアウト
- **VToolbar** (`VToolbarTitle`, `VToolbarMenu`, `VToolbarEdge`) - ツールバー

### ナビゲーション

- **VNavigation**, **VNavigationItem** - サイドナビゲーション
- **VBreadcrumbs** - パンくずリスト
- **VTabs**, **VTab** - タブインターフェース
- **VPagination** - ページネーション

### フォームコントロール

- **VButton**, **VButtonGroup** - ボタンとボタングループ
- **VTextField** - テキスト入力フィールド
- **VTextarea** - マルチラインテキスト入力
- **VNumberField** - 数値入力フィールド
- **VSelect** - セレクトドロップダウン
- **VCheckbox**, **VCheckboxGroup** - チェックボックス
- **VRadio**, **VRadioGroup** - ラジオボタン
- **VSwitch**, **VSwitchGroup** - スイッチトグル
- **VOption**, **VOptionGroup** - オプション要素

### データ表示

- **VDataTable** - データテーブル
- **VListTile** - リストアイテム
- **VAvatar** - ユーザーアバター
- **VChip** - チップ/タグ要素
- **VIcon** - アイコン表示

### フィードバック & インタラクション

- **VDialog** - モーダルダイアログ
- **VSnackbar** - 通知スナックバー
- **VTooltip** - ツールチップ
- **VMenu** - コンテキストメニュー
- **VSheetModal** - シートモーダル

### その他

- **VSkeltonLoader** - スケルトンローディング
- **VBusyImage** - 遅延ローディング画像
- **VHero** - ヒーローセクション
- **VContentSwitcher** - コンテンツ切り替え

## Usage Examples

### ボタンコンポーネント

```vue
<template>
  <div>
    <!-- 基本ボタン -->
    <VButton @click="handleClick">クリック</VButton>
    
    <!-- プライマリボタン -->
    <VButton color="primary" variant="contained">
      保存
    </VButton>
    
    <!-- アイコン付きボタン -->
    <VButton 
      startIcon="mdi-search"
      color="primary"
      variant="outlined"
      :loading="searching"
      @click="handleSearch"
    >
      検索
    </VButton>
    
    <!-- ボタングループ -->
    <VButtonGroup>
      <VButton>左</VButton>
      <VButton>中央</VButton>
      <VButton>右</VButton>
    </VButtonGroup>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { VButton, VButtonGroup } from '@fastkit/vui';

const searching = ref(false);

const handleClick = () => {
  console.log('クリックされました');
};

const handleSearch = async () => {
  searching.value = true;
  try {
    // 検索処理
    await performSearch();
  } finally {
    searching.value = false;
  }
};
</script>
```

### フォームコンポーネント

```vue
<template>
  <VCard>
    <VCardContent>
      <h2>ユーザー登録</h2>
      
      <!-- テキスト入力 -->
      <VTextField
        v-model="form.name.value"
        label="名前"
        required
        :rules="[required(), minLength(2)]"
        :invalid="form.name.invalid"
        :error-message="form.name.errorMessage"
      />
      
      <!-- メール入力 -->
      <VTextField
        v-model="form.email.value"
        label="メールアドレス"
        type="email"
        required
        :rules="[required(), email()]"
        :invalid="form.email.invalid"
        :error-message="form.email.errorMessage"
      />
      
      <!-- セレクト -->
      <VSelect
        v-model="form.category.value"
        label="カテゴリ"
        :items="categories"
        placeholder="カテゴリを選択"
        required
      />
      
      <!-- チェックボックス -->
      <VCheckbox
        v-model="form.agreement.value"
        :rules="[required()]"
      >
        利用規約に同意します
      </VCheckbox>
    </VCardContent>
    
    <VCardActions>
      <VButton 
        color="primary"
        variant="contained"
        :disabled="form.invalid"
        @click="handleSubmit"
      >
        登録
      </VButton>
      <VButton variant="text" @click="handleCancel">
        キャンセル
      </VButton>
    </VCardActions>
  </VCard>
</template>

<script setup lang="ts">
import { 
  VCard, VCardContent, VCardActions,
  VTextField, VSelect, VCheckbox, VButton
} from '@fastkit/vui';
import { useForm } from '@fastkit/vue-form-control';
import { required, email, minLength } from '@fastkit/rules';

const categories = [
  { value: 'personal', label: '個人' },
  { value: 'business', label: 'ビジネス' },
  { value: 'education', label: '教育' }
];

const form = useForm({
  name: {
    value: '',
    rules: [required(), minLength(2)]
  },
  email: {
    value: '',
    rules: [required(), email()]
  },
  category: {
    value: '',
    rules: [required()]
  },
  agreement: {
    value: false,
    rules: [required()]
  }
}, {
  onSubmit: async (values) => {
    console.log('フォーム送信:', values);
    await api.register(values);
  }
});

const handleSubmit = () => {
  form.submit();
};

const handleCancel = () => {
  form.reset();
};
</script>
```

### データテーブル

```vue
<template>
  <VDataTable
    :items="users"
    :headers="headers"
    :loading="loading"
    item-key="id"
    selectable
    @select="handleSelect"
  >
    <!-- カスタムカラム -->
    <template #item.status="{ item }">
      <VChip
        :color="item.status === 'active' ? 'success' : 'warning'"
        size="sm"
      >
        {{ item.status === 'active' ? 'アクティブ' : '非アクティブ' }}
      </VChip>
    </template>
    
    <template #item.actions="{ item }">
      <VButton size="sm" variant="text" @click="editUser(item)">
        編集
      </VButton>
      <VButton 
        size="sm" 
        variant="text" 
        color="error"
        @click="deleteUser(item)"
      >
        削除
      </VButton>
    </template>
  </VDataTable>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { VDataTable, VChip, VButton } from '@fastkit/vui';

const loading = ref(false);
const users = ref([
  { id: 1, name: '田中太郎', email: 'tanaka@example.com', status: 'active' },
  { id: 2, name: '佐藤花子', email: 'sato@example.com', status: 'inactive' }
]);

const headers = [
  { key: 'name', title: '名前', sortable: true },
  { key: 'email', title: 'メール', sortable: true },
  { key: 'status', title: 'ステータス' },
  { key: 'actions', title: '操作', width: 120 }
];

const handleSelect = (selectedItems: any[]) => {
  console.log('選択されたアイテム:', selectedItems);
};

const editUser = (user: any) => {
  console.log('編集:', user);
};

const deleteUser = (user: any) => {
  console.log('削除:', user);
};
</script>
```

### レイアウトシステム

```vue
<template>
  <VApp>
    <!-- ツールバー -->
    <VToolbar color="primary" variant="flat">
      <VToolbarTitle>マイアプリ</VToolbarTitle>
      <VToolbarMenu>
        <VButton variant="text" color="on-primary">
          メニュー
        </VButton>
      </VToolbarMenu>
    </VToolbar>
    
    <!-- メインコンテンツ -->
    <VGridContainer>
      <VGridItem cols="12" md="3">
        <!-- サイドナビゲーション -->
        <VNavigation>
          <VNavigationItem to="/dashboard" icon="mdi-dashboard">
            ダッシュボード
          </VNavigationItem>
          <VNavigationItem to="/users" icon="mdi-account-group">
            ユーザー
          </VNavigationItem>
          <VNavigationItem to="/settings" icon="mdi-cog">
            設定
          </VNavigationItem>
        </VNavigation>
      </VGridItem>
      
      <VGridItem cols="12" md="9">
        <!-- ページコンテンツ -->
        <VPaper class="pa-4">
          <router-view />
        </VPaper>
      </VGridItem>
    </VGridContainer>
  </VApp>
</template>

<script setup lang="ts">
import {
  VApp, VToolbar, VToolbarTitle, VToolbarMenu,
  VGridContainer, VGridItem, VNavigation, VNavigationItem,
  VPaper, VButton
} from '@fastkit/vui';
</script>
```

## プログラマティックUI操作

VUIサービスを使用して、JavaScriptからUI要素を制御できます。

```typescript
import { useVui } from '@fastkit/vui';

const vui = useVui();

// アラートダイアログ
await vui.alert('処理が完了しました');

// 確認ダイアログ
const confirmed = await vui.confirm({
  title: '確認',
  message: 'この操作を実行しますか？',
  okText: '実行',
  cancelText: 'キャンセル'
});

if (confirmed) {
  // 確認された場合の処理
}

// プロンプトダイアログ
const result = await vui.prompt({
  title: '名前を入力',
  message: '新しい名前を入力してください',
  defaultValue: '既定値'
});

// フォームプロンプト
const formResult = await vui.formPrompt(
  {
    state: { name: '', description: '' },
    title: '新規作成'
  },
  (state) => (
    <>
      <VTextField 
        label="名前" 
        v-model={state.name}
        required
      />
      <VTextarea 
        label="説明" 
        v-model={state.description}
        rows={3}
      />
    </>
  )
);

// スナックバー通知
vui.snackbar.show({
  message: '保存しました',
  color: 'success',
  timeout: 3000
});

// カスタムダイアログ
const dialog = await vui.dialog.show({
  component: MyCustomDialog,
  props: {
    data: someData
  }
});
```

## テーマカスタマイズ

### CSS Variables

```css
:root {
  /* カラーパレット */
  --color-primary: #1976d2;
  --color-secondary: #424242;
  --color-success: #4caf50;
  --color-warning: #ff9800;
  --color-error: #f44336;
  
  /* サイズ設定 */
  --control-field-rem-sm: 0.875rem;
  --control-field-rem-md: 1rem;
  --control-field-rem-lg: 1.125rem;
  
  /* スペーシング */
  --root-spacing: 8px;
  
  /* フォント */
  --typo-base-font: Roboto, 'Noto Sans JP', sans-serif;
  
  /* シャドウ */
  --shadow-1: 0px 2px 1px -1px rgba(0, 0, 0, 0.2);
  --shadow-4: 0px 2px 4px -1px rgba(0, 0, 0, 0.2);
  
  /* トランジション */
  --transition-primary: cubic-bezier(0.25, 0.8, 0.5, 1);
}
```

### カスタムカラースキーム

```typescript
// カスタムカラーの定義
app.use(VuiPlugin, {
  colorScheme: {
    primary: {
      main: '#1976d2',
      light: '#42a5f5',
      dark: '#1565c0',
      contrast: '#ffffff'
    },
    secondary: {
      main: '#dc004e',
      light: '#ff5983',
      dark: '#9a0036',
      contrast: '#ffffff'
    }
  }
});
```

### ダークテーマ対応

```vue
<template>
  <VApp :theme="currentTheme">
    <VButton @click="toggleTheme">
      {{ currentTheme === 'dark' ? 'ライト' : 'ダーク' }}テーマ
    </VButton>
    <!-- アプリコンテンツ -->
  </VApp>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useColorScheme } from '@fastkit/vui';

const { theme: currentTheme, toggle: toggleTheme } = useColorScheme();
</script>
```

## Advanced Usage Examples

### カスタムコンポーネント作成

```vue
<template>
  <VCard class="user-profile">
    <VCardContent>
      <div class="user-profile__header">
        <VAvatar :src="user.avatar" size="lg" />
        <div class="user-profile__info">
          <h3>{{ user.name }}</h3>
          <p>{{ user.role }}</p>
        </div>
      </div>
      
      <VTabs v-model="activeTab">
        <VTab value="profile">プロフィール</VTab>
        <VTab value="settings">設定</VTab>
        <VTab value="activity">アクティビティ</VTab>
      </VTabs>
      
      <VContentSwitcher :value="activeTab">
        <template #profile>
          <UserProfileTab :user="user" />
        </template>
        <template #settings>
          <UserSettingsTab :user="user" />
        </template>
        <template #activity>
          <UserActivityTab :user="user" />
        </template>
      </VContentSwitcher>
    </VCardContent>
  </VCard>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import {
  VCard, VCardContent, VAvatar, VTabs, VTab, VContentSwitcher
} from '@fastkit/vui';

interface User {
  name: string;
  role: string;
  avatar: string;
}

const props = defineProps<{
  user: User;
}>();

const activeTab = ref('profile');
</script>

<style scoped>
.user-profile__header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.user-profile__info h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 500;
}

.user-profile__info p {
  margin: 0.25rem 0 0;
  color: var(--color-text-secondary);
}
</style>
```

### 複雑なフォームウィザード

```vue
<template>
  <VCard class="form-wizard">
    <VCardContent>
      <VToolbar variant="flat" class="mb-4">
        <VToolbarTitle>登録ウィザード</VToolbarTitle>
        <VToolbarEdge>
          ステップ {{ currentStep + 1 }} / {{ steps.length }}
        </VToolbarEdge>
      </VToolbar>
      
      <!-- ステップインジケーター -->
      <div class="step-indicator">
        <div 
          v-for="(step, index) in steps" 
          :key="step.name"
          class="step-indicator__item"
          :class="{
            'step-indicator__item--active': index === currentStep,
            'step-indicator__item--completed': index < currentStep
          }"
        >
          <VIcon 
            :name="index < currentStep ? 'mdi-check' : step.icon" 
            size="sm"
          />
          <span>{{ step.title }}</span>
        </div>
      </div>
      
      <!-- ステップコンテンツ -->
      <VContentSwitcher :value="currentStep">
        <template #0>
          <PersonalInfoStep v-model="formData.personal" />
        </template>
        <template #1>
          <ContactInfoStep v-model="formData.contact" />
        </template>
        <template #2>
          <PreferencesStep v-model="formData.preferences" />
        </template>
        <template #3>
          <ConfirmationStep :data="formData" />
        </template>
      </VContentSwitcher>
    </VCardContent>
    
    <VCardActions>
      <VButton 
        variant="text"
        :disabled="currentStep === 0"
        @click="previousStep"
      >
        戻る
      </VButton>
      
      <div class="flex-grow" />
      
      <VButton 
        v-if="currentStep < steps.length - 1"
        color="primary"
        variant="contained"
        :disabled="!canProceed"
        @click="nextStep"
      >
        次へ
      </VButton>
      
      <VButton 
        v-else
        color="primary"
        variant="contained"
        :loading="submitting"
        @click="submitForm"
      >
        完了
      </VButton>
    </VCardActions>
  </VCard>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import {
  VCard, VCardContent, VCardActions,
  VToolbar, VToolbarTitle, VToolbarEdge,
  VContentSwitcher, VButton, VIcon
} from '@fastkit/vui';

const currentStep = ref(0);
const submitting = ref(false);

const steps = [
  { name: 'personal', title: '個人情報', icon: 'mdi-account' },
  { name: 'contact', title: '連絡先', icon: 'mdi-email' },
  { name: 'preferences', title: '設定', icon: 'mdi-cog' },
  { name: 'confirm', title: '確認', icon: 'mdi-check-circle' }
];

const formData = ref({
  personal: { name: '', birthday: '' },
  contact: { email: '', phone: '' },
  preferences: { newsletter: false, theme: 'light' }
});

const canProceed = computed(() => {
  // ステップごとのバリデーション
  switch (currentStep.value) {
    case 0:
      return formData.value.personal.name && formData.value.personal.birthday;
    case 1:
      return formData.value.contact.email;
    case 2:
      return true;
    default:
      return false;
  }
});

const nextStep = () => {
  if (currentStep.value < steps.length - 1) {
    currentStep.value++;
  }
};

const previousStep = () => {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
};

const submitForm = async () => {
  submitting.value = true;
  try {
    await api.submitRegistration(formData.value);
    // 成功処理
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.step-indicator {
  display: flex;
  justify-content: space-between;
  margin-bottom: 2rem;
}

.step-indicator__item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  opacity: 0.6;
  transition: opacity 0.2s;
}

.step-indicator__item--active,
.step-indicator__item--completed {
  opacity: 1;
}

.flex-grow {
  flex-grow: 1;
}
</style>
```

## API

### Composables

#### useVui()

VUIサービスインスタンスにアクセスします。

```typescript
const vui = useVui();

// ダイアログ操作
vui.alert(message)
vui.confirm(options)
vui.prompt(options)
vui.formPrompt(state, renderer)

// 通知
vui.snackbar.show(options)
vui.snackbar.hide()

// ナビゲーション
vui.router.push(location)
vui.location.assign(url)
```

#### useControl()

コントロール要素の共通機能を提供します。

```typescript
const control = useControl(props, options);

// プロパティ
control.size        // 'sm' | 'md' | 'lg'
control.classes     // 計算されたCSSクラス
control.isDisabled  // 無効状態
```

#### useColorScheme()

カラーテーマの制御を提供します。

```typescript
const { theme, toggle, setTheme } = useColorScheme();

theme.value         // 現在のテーマ
toggle()            // テーマ切り替え
setTheme('dark')    // 特定テーマ設定
```

### プラグインオプション

```typescript
interface VuiPluginOptions {
  router: Router;
  colorScheme?: VueColorSchemePluginSettings;
  uiSettings?: {
    primaryScope: ScopeName;
    buttonDefault: {
      color: ScopeName;
      variant: ColorVariant;
    };
    dialogOk?: {
      color?: ScopeName;
      variant?: ColorVariant;
    };
  };
  icons?: {
    menuDown: IconName;
    navigationExpand: RawIconProp;
    // その他のアイコン設定
  };
  stack?: VueStackPluginOptions;
  form?: VueFormServiceOptions;
}
```

## アクセシビリティ

### キーボードナビゲーション

- **Tab/Shift+Tab**: フォーカス移動
- **Enter/Space**: ボタン・チェックボックス操作
- **Arrow Keys**: ラジオボタン・タブ・メニュー内移動
- **Escape**: ダイアログ・メニューを閉じる
- **Home/End**: リスト・テーブルの先頭・末尾移動

### ARIA対応

```html
<!-- 自動的に適用されるARIA属性 -->
<button aria-disabled="true" aria-label="保存ボタン">
<input aria-invalid="true" aria-describedby="error-message">
<div role="dialog" aria-modal="true" aria-labelledby="dialog-title">
```

### スクリーンリーダー対応

- フォームエラーの音声読み上げ
- ステート変更の通知
- ランドマーク要素の適切な配置

## 依存関係

```json
{
  "dependencies": {
    "@fastkit/vue-form-control": "フォーム機能",
    "@fastkit/vue-color-scheme": "カラーテーマ",
    "@fastkit/vue-stack": "スタック管理",
    "@fastkit/vue-action": "アクション機能",
    "@fastkit/vue-app-layout": "レイアウト",
    "@fastkit/rules": "バリデーション",
    "@fastkit/helpers": "ユーティリティ"
  },
  "peerDependencies": {
    "vue": "^3.4.0",
    "vue-router": "^4.0.0"
  }
}
```

## ドキュメント

詳細なドキュメントは[こちら](https://dadajam4.github.io/fastkit/vui/)をご覧ください。

## License

MIT