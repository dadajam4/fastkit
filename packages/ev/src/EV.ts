import { EVListener, EVListenerTag } from './EVListener';

/**
 * This is the default event map.
 */
export interface EVEventMap {
  [key: string]: any;
}

/**
 * The context class for event operations.
 * You can use as it is or inherit any classes in this class.
 *
 * ```js
 * const dv = new EV();
 * // or...
 * class SomeClass extends EV {}
 * ```
 *
 * When using it with TypeScript, it is possible to strictly set type information by specifying an interface in Generics.
 *
 * ```ts
 * class SomeClass extends EV<{event1: string, event2: boolean}> {
 *   constructor() {
 *     super();
 *     this.emit('event1', 5); // ng
 *     this.emit('event1', 'string'); // ok
 *     this.on('event2', event => {
 *       const var1: string = event; // ng
 *       const var2: boolean = event; // ok
 *     });
 *   }
 * }
 * ```
 */
export class EV<EventMap extends EVEventMap = EVEventMap> {
  /**
   * Create and return listener instance by type, handler.
   * @param type - event type
   * @param handler - event handler
   */
  on<K extends keyof EventMap>(
    type: K,
    handler: (ev: EventMap[K]) => any,
  ): EVListener;

  /**
   * Create and return listener instance by type, handler, option.
   * @param type - event type
   * @param handler - event handler
   * @param option - object option
   */
  on<K extends keyof EventMap>(
    type: K,
    handler: (ev: EventMap[K]) => any,
    option?: {
      tag?: EVListenerTag;
      once?: boolean;
    },
  ): EVListener;

  /**
   * Create and return listener instance by type, handler, option.
   * @param type - event type
   * @param handler - event handler
   * @param option - object option
   */
  on<K extends keyof EventMap>(
    type: K,
    handler: (ev: EventMap[K]) => any,
    option?: {
      tag?: EVListenerTag;
      once?: boolean;
    },
  ): EVListener;

  /**
   * Create and return listener instance by type, handler, once.
   * @param type - event type
   * @param handler - event handler
   * @param option - object option
   * @param once - Delete handler with one event firing
   */
  on<K extends keyof EventMap>(
    type: K,
    handler: (ev: EventMap[K]) => any,
    option?: {
      tag?: EVListenerTag;
    },
    once?: boolean,
  ): EVListener;

  /**
   * Create and return listener instance by type, option.
   * @param type - event type
   * @param option - object option
   */
  on<K extends keyof EventMap>(
    type: K,
    option?: {
      handler: (ev: EventMap[K]) => any;
      tag?: EVListenerTag;
      once?: boolean;
    },
  ): EVListener;

  /**
   * Create and return listener instance by option.
   * @param option - object option
   */
  on<K extends keyof EventMap>(option: {
    type: K;
    handler: (ev: EventMap[K]) => any;
    tag?: EVListenerTag;
    once?: boolean;
  }): EVListener;

  on<K extends keyof EventMap>(
    typeOrOption:
      | K
      | {
          type: K;
          handler: (ev: EventMap[K]) => any;
          tag?: EVListenerTag;
          once?: boolean;
        },
    handlerOrOption?:
      | ((ev: EventMap[K]) => any)
      | {
          handler: (ev: EventMap[K]) => any;
          tag?: EVListenerTag;
          once?: boolean;
        },
    option?: {
      tag?: EVListenerTag;
      once?: boolean;
    },
    once?: boolean,
  ): EVListener {
    let _type: K;
    let _handler: (ev: EventMap[K]) => any;
    let _tag: EVListenerTag | undefined = undefined;
    let _once = false;
    if (typeof typeOrOption === 'object') {
      _type = typeOrOption.type;
      _handler = typeOrOption.handler;
      _tag = typeOrOption.tag;
      _once = !!typeOrOption.once;
    } else {
      _type = typeOrOption;
      if (typeof handlerOrOption === 'object') {
        _handler = handlerOrOption.handler;
        _tag = handlerOrOption.tag;
        _once = !!handlerOrOption.once;
      } else {
        _handler = <any>handlerOrOption;
        if (option) {
          _tag = option.tag;
          _once = !!option.once;
        }
      }
    }

    const listener = new EVListener({
      context: this,
      remover: (listener) => {
        this.__ev_listener_remover__(listener);
      },
      type: _type as any,
      tag: _tag,
      handler: _handler,
      once: once || _once,
    });

    this.__ev_listeners__.push(listener);
    return listener;
  }

  /**
   * Create and return listener instance by type, handler.
   * This listener is deleted when it detects an event only once.
   * @param type - event type
   * @param handler - event handler
   */
  once<K extends keyof EventMap>(
    type: K,
    handler: (ev: EventMap[K]) => any,
  ): EVListener;

  /**
   * Create and return listener instance by type, handler, option.
   * This listener is deleted when it detects an event only once.
   * @param type - event type
   * @param handler - event handler
   * @param option - object option
   */
  once<K extends keyof EventMap>(
    type: K,
    handler: (ev: EventMap[K]) => any,
    option: {
      tag?: EVListenerTag;
    },
  ): EVListener;

  /**
   * Create and return listener instance by type, option.
   * This listener is deleted when it detects an event only once.
   * @param type - event type
   * @param option - object option
   */
  once<K extends keyof EventMap>(
    type: K,
    option: {
      handler: (ev: EventMap[K]) => any;
      tag?: EVListenerTag;
    },
  ): EVListener;

  /**
   * Create and return listener instance by option.
   * This listener is deleted when it detects an event only once.
   * @param option - object option
   */
  once<K extends keyof EventMap>(option: {
    type: K;
    handler: (ev: EventMap[K]) => any;
    tag?: EVListenerTag;
  }): EVListener;

  once<K extends keyof EventMap>(
    typeOrOption:
      | K
      | {
          type: K;
          handler: (ev: EventMap[K]) => any;
          tag?: EVListenerTag;
        },
    handlerOrOption?:
      | ((ev: EventMap[K]) => any)
      | {
          handler: (ev: EventMap[K]) => any;
          tag?: EVListenerTag;
        },
    option?: {
      tag?: EVListenerTag;
    },
  ): EVListener {
    return this.on(<any>typeOrOption, <any>handlerOrOption, <any>option, true);
  }

  /**
   * Create and return listener instance by type, handler. This will be done immediately.
   * When registering this hook, do not expect the payload to be passed to the callback method.
   * @param type - event type
   * @param handler - event handler
   */
  immediate<K extends keyof EventMap>(
    type: K,
    handler: () => any,
    option?: {
      tag?: EVListenerTag;
    },
  ) {
    handler();
    return this.on(type, handler as any, option);
  }

  /**
   * Remove listener by type
   * @param type - event type
   */
  off<K extends keyof EventMap>(type: K): void;

  /**
   * Remove listener by type and handler.
   * @param type - event type
   * @param handler - event handler
   */
  off<K extends keyof EventMap>(
    type: K,
    handler: (ev: EventMap[K]) => any,
  ): void;

  /**
   * Remove listener by type and option.
   * @param type - event type
   * @param option - object option
   */
  off<K extends keyof EventMap>(
    type: K,
    option: {
      handler?: (ev: EventMap[K]) => any;
      tag?: EVListenerTag;
    },
  ): void;

  /**
   * Remove listener by handler.
   * @param handler - event handler
   */
  off<K extends keyof EventMap>(handler: (ev: EventMap[K]) => any): void;

  /**
   * Remove listener by option(tag, handler, tag).
   * @param option - object option
   */
  off<K extends keyof EventMap>(option: {
    type?: K;
    handler?: (ev: EventMap[K]) => any;
    tag?: EVListenerTag;
  }): void;

  off<K extends keyof EventMap>(
    typeOrHandlerOrOption:
      | K
      | ((ev: EventMap[K]) => any)
      | {
          type?: K;
          handler?: (ev: EventMap[K]) => any;
          tag?: EVListenerTag;
        },
    handlerOrOption?:
      | ((ev: EventMap[K]) => any)
      | {
          handler?: (ev: EventMap[K]) => any;
          tag?: EVListenerTag;
        },
  ): void {
    let _type: K | undefined = undefined;
    let _handler: ((ev: EventMap[K]) => any) | undefined;
    let _tag: EVListenerTag | undefined = undefined;

    if (typeof typeOrHandlerOrOption === 'object') {
      _type = typeOrHandlerOrOption.type;
      _handler = typeOrHandlerOrOption.handler;
      _tag = typeOrHandlerOrOption.tag;
    } else if (typeof typeOrHandlerOrOption === 'function') {
      _handler = typeOrHandlerOrOption;
    } else {
      _type = typeOrHandlerOrOption;
      if (typeof handlerOrOption === 'object') {
        _handler = handlerOrOption.handler;
        _tag = handlerOrOption.tag;
      } else {
        _handler = handlerOrOption;
      }
    }
    const listeners = this.__ev_filter__(_type as any, _handler, _tag);
    listeners.forEach((listener) => {
      listener.remove();
    });
  }

  /**
   * Remove all listener instances.
   */
  offAll(): void {
    const listeners = this.__ev_listeners__.slice();
    listeners.forEach((listener) => {
      listener.remove();
    });
  }

  /**
   * Emit event.
   * @param type - event type
   * @param payload - event payload
   */
  emit<K extends keyof EventMap>(type: K, payload: EventMap[K]): void {
    const listeners = this.__ev_filter__(<string>type);
    listeners.forEach((listener) => {
      listener.trigger(payload);
    });
  }

  private __ev_listeners__: EVListener[] = [];

  private __ev_listener_remover__(listener: EVListener) {
    this.__ev_listeners__.splice(this.__ev_listeners__.indexOf(listener), 1);
  }

  private __ev_filter__(
    type?: string | null,
    // eslint-disable-next-line @typescript-eslint/ban-types
    handler?: Function,
    tag?: EVListenerTag,
  ) {
    return this.__ev_listeners__.filter((listener) =>
      listener.match(type, handler, tag),
    );
  }
}
