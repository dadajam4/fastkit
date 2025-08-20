# @fastkit/ev

🌐 [English](https://github.com/dadajam4/fastkit/blob/main/packages/ev/README.md) | 日本語

TypeScriptで実装された軽量でタイプセーフなイベントエミッター&オブザーバーライブラリです。Fastkitエコシステムのコアパッケージとして、シンプルで型安全なイベント処理システムを提供します。

## 特徴

- **TypeScript完全対応**: ジェネリクスを使用した厳密な型チェック
- **軽量設計**: 最小限の依存関係で高いパフォーマンス
- **柔軟なAPI**: 複数のオーバーロードと豊富なオプション
- **タグシステム**: リスナーのグループ管理機能
- **ワンタイムリスナー**: 一度だけ実行される自動削除機能
- **即座実行**: 登録時に即座に実行されるリスナー
- **メモリ効率**: 適切なクリーンアップと循環参照の防止
- **チェーンメソッド**: ビルダーパターンによる直感的なAPI

## インストール

```bash
npm install @fastkit/ev
# or
pnpm add @fastkit/ev
```

## 基本的な使い方

### シンプルなイベントエミッター

```typescript
import { EV } from '@fastkit/ev';

// 基本的なイベントエミッター
const ev = new EV();

// リスナー登録
ev.on('message', (data) => {
  console.log('受信:', data);
});

// イベント発行
ev.emit('message', 'Hello World!');
// => "受信: Hello World!"
```

### 型安全なイベントマップ

```typescript
import { EV } from '@fastkit/ev';

// イベントマップの定義
interface MyEvents {
  userLogin: { userId: string; timestamp: Date };
  dataUpdate: { records: any[]; total: number };
  error: Error;
  statusChange: { from: string; to: string };
}

// 型安全なイベントエミッター
class UserManager extends EV<MyEvents> {
  login(userId: string) {
    // 型安全なイベント発行
    this.emit('userLogin', {
      userId,
      timestamp: new Date()
    });
  }

  updateData(records: any[]) {
    this.emit('dataUpdate', {
      records,
      total: records.length
    });
  }

  handleError(error: Error) {
    this.emit('error', error);
  }
}

const userManager = new UserManager();

// 型安全なリスナー登録
userManager.on('userLogin', (data) => {
  // data は { userId: string; timestamp: Date } 型
  console.log(`ユーザー ${data.userId} がログインしました`);
});

userManager.on('error', (error) => {
  // error は Error 型
  console.error('エラーが発生:', error.message);
});
```

## API

### イベントリスナー登録

#### on() - 通常のリスナー

```typescript
// 基本形
ev.on('eventName', handler);

// オプション付き
ev.on('eventName', handler, {
  tag: 'myTag',        // タグでグループ化
  once: false          // 一度だけ実行するか
});

// 複数イベントを一度に登録
ev.on({
  event1: handler1,
  event2: handler2,
  event3: handler3
});
```

#### once() - ワンタイムリスナー

```typescript
// 一度だけ実行されるリスナー
ev.once('initialize', () => {
  console.log('初期化完了');
});

// 複数のワンタイムリスナー
ev.once({
  ready: () => console.log('準備完了'),
  loaded: () => console.log('読み込み完了')
});
```

#### immediate() - 即座実行リスナー

```typescript
// 登録時に即座に実行 + 以降のイベントにも反応
ev.immediate('status', (status) => {
  console.log('現在のステータス:', status);
});

// 最後に発行されたイベントがあれば即座に実行
ev.emit('status', 'ready');
ev.immediate('status', (status) => {
  console.log(status); // => "ready" (即座に実行)
});
```

### イベント発行

#### emit() - イベント発行

```typescript
// 基本的なイベント発行
ev.emit('eventName', data);

// 複数の引数
ev.emit('process', 'start', { id: 123 });

// ペイロードなし
ev.emit('complete');
```

### リスナー削除

#### off() - リスナー削除

```typescript
// 特定のハンドラーを削除
ev.off('eventName', handler);

// イベントタイプの全リスナーを削除
ev.off('eventName');

// タグで一括削除
const TAG_USER = Symbol('user');
ev.off({ tag: TAG_USER });

// 複数条件での削除
ev.off({
  type: 'eventName',
  tag: TAG_USER,
  handler: specificHandler
});
```

#### offAll() - 全リスナー削除

```typescript
// 全てのリスナーを削除
ev.offAll();

// 特定タグのリスナーを全削除
ev.offAll(TAG_USER);
```

## 使用例

### ユーザー認証システム

```typescript
interface AuthEvents {
  login: { user: User; token: string };
  logout: { userId: string };
  tokenRefresh: { newToken: string };
  authError: { error: Error; action: string };
}

class AuthService extends EV<AuthEvents> {
  private currentUser: User | null = null;

  async login(email: string, password: string) {
    try {
      const { user, token } = await api.login(email, password);
      this.currentUser = user;

      // ログインイベントを発行
      this.emit('login', { user, token });

    } catch (error) {
      this.emit('authError', {
        error: error as Error,
        action: 'login'
      });
    }
  }

  logout() {
    if (this.currentUser) {
      const userId = this.currentUser.id;
      this.currentUser = null;

      this.emit('logout', { userId });
    }
  }

  async refreshToken() {
    try {
      const { token } = await api.refreshToken();
      this.emit('tokenRefresh', { newToken: token });
    } catch (error) {
      this.emit('authError', {
        error: error as Error,
        action: 'tokenRefresh'
      });
    }
  }
}

// 使用例
const auth = new AuthService();

// 認証イベントのリスナー登録
auth.on('login', ({ user, token }) => {
  console.log(`${user.name}さんがログインしました`);
  localStorage.setItem('token', token);
});

auth.on('logout', ({ userId }) => {
  console.log('ログアウトしました');
  localStorage.removeItem('token');
});

auth.on('authError', ({ error, action }) => {
  console.error(`認証エラー (${action}):`, error.message);
  // エラー通知の表示など
});
```

### データストア

```typescript
interface StoreEvents<T> {
  change: { data: T; previous: T };
  reset: { data: T };
  error: Error;
}

class DataStore<T> extends EV<StoreEvents<T>> {
  private _data: T;

  constructor(initialData: T) {
    super();
    this._data = initialData;
  }

  get data(): T {
    return this._data;
  }

  set(newData: Partial<T>) {
    const previous = { ...this._data };
    this._data = { ...this._data, ...newData };

    this.emit('change', {
      data: this._data,
      previous
    });
  }

  reset(data: T) {
    this._data = data;
    this.emit('reset', { data });
  }
}

// 使用例
interface UserState {
  name: string;
  email: string;
  isActive: boolean;
}

const userStore = new DataStore<UserState>({
  name: '',
  email: '',
  isActive: false
});

// データ変更の監視
userStore.on('change', ({ data, previous }) => {
  console.log('ユーザーデータが変更されました');
  console.log('前:', previous);
  console.log('後:', data);
});

// データ更新
userStore.set({
  name: '田中太郎',
  email: 'tanaka@example.com'
});
```

### Vue.js コンポーネントとの統合

```vue
<template>
  <div>
    <h2>通知システム</h2>
    <div v-for="notification in notifications" :key="notification.id">
      {{ notification.message }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { EV } from '@fastkit/ev';

interface NotificationEvents {
  show: { id: string; message: string; type: 'info' | 'warning' | 'error' };
  hide: { id: string };
  clear: void;
}

// グローバル通知サービス
const notificationService = new EV<NotificationEvents>();

interface Notification {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'error';
}

const notifications = ref<Notification[]>([]);

// リスナー登録
const TAG_COMPONENT = Symbol('notification-component');

onMounted(() => {
  notificationService.on('show', ({ id, message, type }) => {
    notifications.value.push({ id, message, type });
  }, { tag: TAG_COMPONENT });

  notificationService.on('hide', ({ id }) => {
    const index = notifications.value.findIndex(n => n.id === id);
    if (index !== -1) {
      notifications.value.splice(index, 1);
    }
  }, { tag: TAG_COMPONENT });

  notificationService.on('clear', () => {
    notifications.value = [];
  }, { tag: TAG_COMPONENT });
});

// コンポーネント破棄時にリスナー削除
onUnmounted(() => {
  notificationService.off({ tag: TAG_COMPONENT });
});

// 外部からの使用
// notificationService.emit('show', {
//   id: 'msg1',
//   message: '保存が完了しました',
//   type: 'info'
// });
</script>
```

### リアルタイム通信

```typescript
interface SocketEvents {
  connect: void;
  disconnect: { reason: string };
  message: { from: string; content: string; timestamp: Date };
  userJoin: { userId: string; userName: string };
  userLeave: { userId: string };
  error: Error;
}

class WebSocketManager extends EV<SocketEvents> {
  private socket: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;

  connect(url: string) {
    try {
      this.socket = new WebSocket(url);

      this.socket.onopen = () => {
        this.reconnectAttempts = 0;
        this.emit('connect');
      };

      this.socket.onclose = (event) => {
        this.emit('disconnect', {
          reason: event.reason || 'Connection closed'
        });

        // 自動再接続
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          setTimeout(() => this.connect(url), 1000 * this.reconnectAttempts);
        }
      };

      this.socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          switch (data.type) {
            case 'message':
              this.emit('message', {
                from: data.from,
                content: data.content,
                timestamp: new Date(data.timestamp)
              });
              break;

            case 'userJoin':
              this.emit('userJoin', {
                userId: data.userId,
                userName: data.userName
              });
              break;

            case 'userLeave':
              this.emit('userLeave', {
                userId: data.userId
              });
              break;
          }
        } catch (error) {
          this.emit('error', error as Error);
        }
      };

      this.socket.onerror = (error) => {
        this.emit('error', new Error('WebSocket error'));
      };

    } catch (error) {
      this.emit('error', error as Error);
    }
  }

  sendMessage(content: string) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({
        type: 'message',
        content,
        timestamp: new Date().toISOString()
      }));
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

// 使用例
const socketManager = new WebSocketManager();

// 接続イベント
socketManager.on('connect', () => {
  console.log('WebSocket接続が確立されました');
});

// メッセージ受信
socketManager.on('message', ({ from, content, timestamp }) => {
  console.log(`[${timestamp.toLocaleTimeString()}] ${from}: ${content}`);
});

// ユーザー参加・退出
socketManager.on('userJoin', ({ userName }) => {
  console.log(`${userName}さんが参加しました`);
});

socketManager.on('userLeave', ({ userId }) => {
  console.log(`ユーザーが退出しました (ID: ${userId})`);
});

// エラーハンドリング
socketManager.on('error', (error) => {
  console.error('WebSocketエラー:', error.message);
});

// 接続開始
socketManager.connect('wss://example.com/websocket');
```

## 高度な使用例

### タグを使ったグループ管理

```typescript
const ev = new EV();

// タグの定義
const TAG_UI = Symbol('ui');
const TAG_API = Symbol('api');
const TAG_DEBUG = Symbol('debug');

// グループごとにリスナー登録
ev.on('event', uiHandler, { tag: TAG_UI });
ev.on('event', apiHandler, { tag: TAG_API });
ev.on('event', debugHandler, { tag: TAG_DEBUG });

// 特定グループのリスナーのみ削除
ev.off({ tag: TAG_DEBUG }); // デバッグ用リスナーのみ削除

// 複数グループを同時に削除
ev.off({ tag: [TAG_UI, TAG_API] });
```

### 条件付きリスナー

```typescript
interface AppEvents {
  stateChange: { state: 'loading' | 'ready' | 'error' };
  dataUpdate: { type: string; data: any };
}

const app = new EV<AppEvents>();

// 条件を満たす場合のみ処理
app.on('dataUpdate', ({ type, data }) => {
  if (type === 'user') {
    // ユーザーデータの場合のみ処理
    updateUserInterface(data);
  }
});

// ワンタイムかつ条件付きリスナー
app.once('stateChange', ({ state }) => {
  if (state === 'ready') {
    initializeApplication();
  }
});
```

### プラグインシステム

```typescript
interface PluginEvents {
  beforeExecute: { pluginName: string; args: any[] };
  afterExecute: { pluginName: string; result: any };
  error: { pluginName: string; error: Error };
}

class PluginManager extends EV<PluginEvents> {
  private plugins = new Map<string, Function>();

  register(name: string, plugin: Function) {
    this.plugins.set(name, plugin);
  }

  async execute(name: string, ...args: any[]) {
    const plugin = this.plugins.get(name);
    if (!plugin) {
      throw new Error(`Plugin "${name}" not found`);
    }

    try {
      // 実行前イベント
      this.emit('beforeExecute', { pluginName: name, args });

      // プラグイン実行
      const result = await plugin(...args);

      // 実行後イベント
      this.emit('afterExecute', { pluginName: name, result });

      return result;
    } catch (error) {
      this.emit('error', {
        pluginName: name,
        error: error as Error
      });
      throw error;
    }
  }
}

// 使用例
const pluginManager = new PluginManager();

// プラグイン実行の監視
pluginManager.on('beforeExecute', ({ pluginName, args }) => {
  console.log(`プラグイン "${pluginName}" を実行します`, args);
});

pluginManager.on('afterExecute', ({ pluginName, result }) => {
  console.log(`プラグイン "${pluginName}" の実行が完了しました`, result);
});

pluginManager.on('error', ({ pluginName, error }) => {
  console.error(`プラグイン "${pluginName}" でエラーが発生:`, error.message);
});
```

## TypeScript型定義

### EVListener型

```typescript
interface EVListener<T = any> {
  /** リスナー関数 */
  handler: (...args: T[]) => void;
  /** タグ（グループ化用） */
  tag?: any;
  /** 一度だけ実行するか */
  once?: boolean;
}
```

### イベントマップの型

```typescript
// カスタムイベントマップの定義
interface CustomEvents {
  // イベント名: ペイロード型
  create: { id: string; data: any };
  update: { id: string; changes: Partial<any> };
  delete: { id: string };
  batch: { operations: Array<{ type: string; data: any }> };
}

// 使用時の型チェック
class MyEmitter extends EV<CustomEvents> {
  create(id: string, data: any) {
    // 型安全：正しいペイロード型が要求される
    this.emit('create', { id, data });
  }
}
```

## パフォーマンス最適化

### メモリ使用量の最適化

```typescript
class OptimizedEventManager extends EV {
  private cleanup() {
    // 定期的なクリーンアップ
    setInterval(() => {
      // 未使用のリスナーを削除
      this.offAll();
    }, 60000); // 1分ごと
  }

  addTemporaryListener(event: string, handler: Function) {
    // 一時的なリスナーは自動的に削除
    const timeoutId = setTimeout(() => {
      this.off(event, handler);
    }, 30000); // 30秒後に自動削除

    this.on(event, handler);

    return () => {
      clearTimeout(timeoutId);
      this.off(event, handler);
    };
  }
}
```

### 大量イベント処理の最適化

```typescript
class BatchEventProcessor extends EV {
  private batchQueue: Array<{ event: string; data: any }> = [];
  private batchTimer: NodeJS.Timeout | null = null;

  emitBatch(event: string, data: any) {
    this.batchQueue.push({ event, data });

    if (!this.batchTimer) {
      this.batchTimer = setTimeout(() => {
        this.processBatch();
      }, 16); // 約60FPS
    }
  }

  private processBatch() {
    const batch = [...this.batchQueue];
    this.batchQueue = [];
    this.batchTimer = null;

    // バッチ処理イベントを発行
    this.emit('batch', batch);

    // 個別イベントも発行
    batch.forEach(({ event, data }) => {
      this.emit(event, data);
    });
  }
}
```

## テストパターン

### ユニットテスト例

```typescript
import { describe, test, expect, vi } from 'vitest';
import { EV } from '@fastkit/ev';

describe('EV', () => {
  test('基本的なイベント発行とリスニング', () => {
    const ev = new EV();
    const handler = vi.fn();

    ev.on('test', handler);
    ev.emit('test', 'data');

    expect(handler).toHaveBeenCalledWith('data');
    expect(handler).toHaveBeenCalledTimes(1);
  });

  test('ワンタイムリスナー', () => {
    const ev = new EV();
    const handler = vi.fn();

    ev.once('test', handler);
    ev.emit('test', 'data1');
    ev.emit('test', 'data2');

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith('data1');
  });

  test('タグベースの削除', () => {
    const ev = new EV();
    const handler1 = vi.fn();
    const handler2 = vi.fn();
    const tag = Symbol('test');

    ev.on('test', handler1, { tag });
    ev.on('test', handler2);
    ev.off({ tag });
    ev.emit('test', 'data');

    expect(handler1).not.toHaveBeenCalled();
    expect(handler2).toHaveBeenCalledWith('data');
  });
});
```

## 依存関係

```json
{
  "dependencies": {},
  "peerDependencies": {},
  "devDependencies": {
    "typescript": "^5.5.0",
    "vitest": "^1.0.0"
  }
}
```

## ドキュメント

詳細なドキュメントは[こちら](https://dadajam4.github.io/fastkit/ev/)をご覧ください。

## ライセンス

MIT
