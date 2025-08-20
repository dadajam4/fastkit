
# @fastkit/ev

🌐 English | [日本語](https://github.com/dadajam4/fastkit/blob/main/packages/ev/README-ja.md)

A lightweight and type-safe event emitter & observer library implemented in TypeScript. As a core package of the Fastkit ecosystem, it provides a simple and type-safe event handling system.

## Features

- **Complete TypeScript Support**: Strict type checking using generics
- **Lightweight Design**: High performance with minimal dependencies
- **Flexible API**: Multiple overloads and rich options
- **Tag System**: Group management functionality for listeners
- **One-time Listeners**: Auto-removal functionality that executes only once
- **Immediate Execution**: Listeners that execute immediately upon registration
- **Memory Efficiency**: Proper cleanup and prevention of circular references
- **Chain Methods**: Intuitive API through builder pattern

## Installation

```bash
npm install @fastkit/ev
# or
pnpm add @fastkit/ev
```

## Basic Usage

### Simple Event Emitter

```typescript
import { EV } from '@fastkit/ev';

// Basic event emitter
const ev = new EV();

// Register listener
ev.on('message', (data) => {
  console.log('Received:', data);
});

// Emit event
ev.emit('message', 'Hello World!');
// => "Received: Hello World!"
```

### Type-safe Event Map

```typescript
import { EV } from '@fastkit/ev';

// Define event map
interface MyEvents {
  userLogin: { userId: string; timestamp: Date };
  dataUpdate: { records: any[]; total: number };
  error: Error;
  statusChange: { from: string; to: string };
}

// Type-safe event emitter
class UserManager extends EV<MyEvents> {
  login(userId: string) {
    // Type-safe event emission
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

// Type-safe listener registration
userManager.on('userLogin', (data) => {
  // data is of type { userId: string; timestamp: Date }
  console.log(`User ${data.userId} has logged in`);
});

userManager.on('error', (error) => {
  // error is of type Error
  console.error('An error occurred:', error.message);
});
```

## API

### Event Listener Registration

#### on() - Regular Listener

```typescript
// Basic form
ev.on('eventName', handler);

// With options
ev.on('eventName', handler, {
  tag: 'myTag',        // Group by tag
  once: false          // Execute only once
});

// Register multiple events at once
ev.on({
  event1: handler1,
  event2: handler2,
  event3: handler3
});
```

#### once() - One-time Listener

```typescript
// Listener that executes only once
ev.once('initialize', () => {
  console.log('Initialization completed');
});

// Multiple one-time listeners
ev.once({
  ready: () => console.log('Ready'),
  loaded: () => console.log('Loaded')
});
```

#### immediate() - Immediate Execution Listener

```typescript
// Execute immediately upon registration + respond to subsequent events
ev.immediate('status', (status) => {
  console.log('Current status:', status);
});

// Execute immediately if there's a last emitted event
ev.emit('status', 'ready');
ev.immediate('status', (status) => {
  console.log(status); // => "ready" (executed immediately)
});
```

### Event Emission

#### emit() - Event Emission

```typescript
// Basic event emission
ev.emit('eventName', data);

// Multiple arguments
ev.emit('process', 'start', { id: 123 });

// No payload
ev.emit('complete');
```

### Listener Removal

#### off() - Listener Removal

```typescript
// Remove specific handler
ev.off('eventName', handler);

// Remove all listeners for event type
ev.off('eventName');

// Batch removal by tag
const TAG_USER = Symbol('user');
ev.off({ tag: TAG_USER });

// Removal with multiple conditions
ev.off({
  type: 'eventName',
  tag: TAG_USER,
  handler: specificHandler
});
```

#### offAll() - Remove All Listeners

```typescript
// Remove all listeners
ev.offAll();

// Remove all listeners with specific tag
ev.offAll(TAG_USER);
```

## Usage Examples

### User Authentication System

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

      // Emit login event
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

// Usage example
const auth = new AuthService();

// Register authentication event listeners
auth.on('login', ({ user, token }) => {
  console.log(`${user.name} has logged in`);
  localStorage.setItem('token', token);
});

auth.on('logout', ({ userId }) => {
  console.log('Logged out');
  localStorage.removeItem('token');
});

auth.on('authError', ({ error, action }) => {
  console.error(`Authentication error (${action}):`, error.message);
  // Display error notifications, etc.
});
```

### Data Store

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

// Usage example
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

// Monitor data changes
userStore.on('change', ({ data, previous }) => {
  console.log('User data has been changed');
  console.log('Before:', previous);
  console.log('After:', data);
});

// Update data
userStore.set({
  name: 'Taro Tanaka',
  email: 'tanaka@example.com'
});
```

### Integration with Vue.js Components

```vue
<template>
  <div>
    <h2>Notification System</h2>
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

// Global notification service
const notificationService = new EV<NotificationEvents>();

interface Notification {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'error';
}

const notifications = ref<Notification[]>([]);

// Register listeners
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

// Remove listeners when component is destroyed
onUnmounted(() => {
  notificationService.off({ tag: TAG_COMPONENT });
});

// Usage from external sources
// notificationService.emit('show', {
//   id: 'msg1',
//   message: 'Save completed',
//   type: 'info'
// });
</script>
```

### Real-time Communication

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

        // Auto-reconnect
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

// Usage example
const socketManager = new WebSocketManager();

// Connection event
socketManager.on('connect', () => {
  console.log('WebSocket connection established');
});

// Message reception
socketManager.on('message', ({ from, content, timestamp }) => {
  console.log(`[${timestamp.toLocaleTimeString()}] ${from}: ${content}`);
});

// User join/leave
socketManager.on('userJoin', ({ userName }) => {
  console.log(`${userName} has joined`);
});

socketManager.on('userLeave', ({ userId }) => {
  console.log(`User left (ID: ${userId})`);
});

// Error handling
socketManager.on('error', (error) => {
  console.error('WebSocket error:', error.message);
});

// Start connection
socketManager.connect('wss://example.com/websocket');
```

## Advanced Usage Examples

### Group Management Using Tags

```typescript
const ev = new EV();

// Tag definitions
const TAG_UI = Symbol('ui');
const TAG_API = Symbol('api');
const TAG_DEBUG = Symbol('debug');

// Register listeners by group
ev.on('event', uiHandler, { tag: TAG_UI });
ev.on('event', apiHandler, { tag: TAG_API });
ev.on('event', debugHandler, { tag: TAG_DEBUG });

// Remove only listeners from specific group
ev.off({ tag: TAG_DEBUG }); // Remove only debug listeners

// Remove multiple groups simultaneously
ev.off({ tag: [TAG_UI, TAG_API] });
```

### Conditional Listeners

```typescript
interface AppEvents {
  stateChange: { state: 'loading' | 'ready' | 'error' };
  dataUpdate: { type: string; data: any };
}

const app = new EV<AppEvents>();

// Process only when conditions are met
app.on('dataUpdate', ({ type, data }) => {
  if (type === 'user') {
    // Process only for user data
    updateUserInterface(data);
  }
});

// One-time and conditional listener
app.once('stateChange', ({ state }) => {
  if (state === 'ready') {
    initializeApplication();
  }
});
```

### Plugin System

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
      // Before execution event
      this.emit('beforeExecute', { pluginName: name, args });

      // Execute plugin
      const result = await plugin(...args);

      // After execution event
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

// Usage example
const pluginManager = new PluginManager();

// Monitor plugin execution
pluginManager.on('beforeExecute', ({ pluginName, args }) => {
  console.log(`Executing plugin "${pluginName}"`, args);
});

pluginManager.on('afterExecute', ({ pluginName, result }) => {
  console.log(`Plugin "${pluginName}" execution completed`, result);
});

pluginManager.on('error', ({ pluginName, error }) => {
  console.error(`Error occurred in plugin "${pluginName}":`, error.message);
});
```

## TypeScript Type Definitions

### EVListener Type

```typescript
interface EVListener<T = any> {
  /** Listener function */
  handler: (...args: T[]) => void;
  /** Tag (for grouping) */
  tag?: any;
  /** Execute only once */
  once?: boolean;
}
```

### Event Map Types

```typescript
// Custom event map definition
interface CustomEvents {
  // Event name: Payload type
  create: { id: string; data: any };
  update: { id: string; changes: Partial<any> };
  delete: { id: string };
  batch: { operations: Array<{ type: string; data: any }> };
}

// Type checking during usage
class MyEmitter extends EV<CustomEvents> {
  create(id: string, data: any) {
    // Type-safe: correct payload type required
    this.emit('create', { id, data });
  }
}
```

## Performance Optimization

### Memory Usage Optimization

```typescript
class OptimizedEventManager extends EV {
  private cleanup() {
    // Periodic cleanup
    setInterval(() => {
      // Remove unused listeners
      this.offAll();
    }, 60000); // Every minute
  }

  addTemporaryListener(event: string, handler: Function) {
    // Temporary listeners are automatically removed
    const timeoutId = setTimeout(() => {
      this.off(event, handler);
    }, 30000); // Auto-remove after 30 seconds

    this.on(event, handler);

    return () => {
      clearTimeout(timeoutId);
      this.off(event, handler);
    };
  }
}
```

### High-Volume Event Processing Optimization

```typescript
class BatchEventProcessor extends EV {
  private batchQueue: Array<{ event: string; data: any }> = [];
  private batchTimer: NodeJS.Timeout | null = null;

  emitBatch(event: string, data: any) {
    this.batchQueue.push({ event, data });

    if (!this.batchTimer) {
      this.batchTimer = setTimeout(() => {
        this.processBatch();
      }, 16); // Approximately 60FPS
    }
  }

  private processBatch() {
    const batch = [...this.batchQueue];
    this.batchQueue = [];
    this.batchTimer = null;

    // Emit batch processing event
    this.emit('batch', batch);

    // Also emit individual events
    batch.forEach(({ event, data }) => {
      this.emit(event, data);
    });
  }
}
```

## Testing Patterns

### Unit Test Examples

```typescript
import { describe, test, expect, vi } from 'vitest';
import { EV } from '@fastkit/ev';

describe('EV', () => {
  test('Basic event emission and listening', () => {
    const ev = new EV();
    const handler = vi.fn();

    ev.on('test', handler);
    ev.emit('test', 'data');

    expect(handler).toHaveBeenCalledWith('data');
    expect(handler).toHaveBeenCalledTimes(1);
  });

  test('One-time listener', () => {
    const ev = new EV();
    const handler = vi.fn();

    ev.once('test', handler);
    ev.emit('test', 'data1');
    ev.emit('test', 'data2');

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith('data1');
  });

  test('Tag-based removal', () => {
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

## Dependencies

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

## Documentation

For detailed documentation, please visit [here](https://dadajam4.github.io/fastkit/ev/).

## License

MIT
