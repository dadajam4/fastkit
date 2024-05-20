import {
  ref,
  type InjectionKey,
  inject,
  computed,
  type App,
  provide,
} from 'vue';
import { arrayRemove } from '@fastkit/helpers';
import type { Router } from 'vue-router';
import { type LoadingDisplaySettings } from './schema';
import { type Callable, LOADING_REQUEST_SYMBOL } from './_internal-schema';
import {
  withLoadingRequest,
  type LoadingRequestOptions,
  type LoadingRequest,
  type WithLoadingRequest,
} from './loading-request';

/**
 * Loading scope
 */
export interface LoadingScope {
  /** Loading scope of the application root */
  readonly root: LoadingScope;

  /** Vue Router instance */
  readonly router?: Router;

  /**
   * List of loading requests
   *
   * @see {@link LoadingRequest}
   */
  readonly requests: LoadingRequest[];

  /**
   * Current display settings
   *
   * @see {@link LoadingDisplaySettings}
   */
  readonly currentDisplaySettings: LoadingDisplaySettings | undefined;

  /**
   * Idle state
   *
   * Indicates that there are no loading requests.
   */
  readonly isIdle: boolean;

  /**
   * Pending state
   *
   * Indicates that no loading is currently displayed but one or more requests are pending to be displayed.
   */
  readonly isPending: boolean;

  /**
   * Displaying state
   *
   * Indicates that one or more loading displays are currently active.
   */
  readonly isDisplaying: boolean;

  /**
   * Active state
   *
   * Indicates that one or more loading displays are either pending or active.
   */
  readonly isActive: boolean;

  /**
   * Progress
   *
   * 0-100
   *
   * Always `100` when there are no active loading requests.
   */
  readonly progress: number;

  /**
   * Retrieve a function wrapped with loading display processing
   *
   * @example
   * ```ts
   * // 1. Assume there is an asynchronous function defined as follows
   * const someAsyncFunc = async (delayAmount: number) => {
   *   await delay(delayAmount);
   *   return {
   *     message: 'Hello world !!!',
   *   };
   * };
   *
   * // 2. Obtain the root loading scope
   * //    * In this example, we are obtaining the root scope, but you can also use useScopedLoading to use the nearest scope.
   * const loading = useLoading();
   *
   * // 3. Retrieve the function wrapped with LoadingScope.create function
   * const withLoadingFunc = loading.create(someAsyncFunc);
   *
   * async function someHandler() {
   *   // 4. It is executable with exactly the same arguments and return value structure as the original function. Loading is displayed until this process is completed.
   *   //    Even if an execution-time exception occurs in someAsyncFunc(), the loading display will end.
   *   const result = await withLoadingFunc(3000);
   *
   *   console.log(result.message); // > Hello world !!!
   * ```
   *
   * @param fn - Function to be wrapped with loading display processing
   * @param options - Loading request options
   *
   * @returns Function wrapped with loading display processing
   *
   * @see {@link LoadingRequestOptions}
   * @see {@link WithLoadingRequest}
   */
  create<Fn extends Callable>(
    fn: Fn,
    options?: LoadingRequestOptions,
  ): WithLoadingRequest<Fn>;

  /**
   * Generate a proxy function for loading display with progress processing
   *
   * @example
   * ```ts
   * const loading = useLoading();
   *
   * // The `proxyFn` function is a Proxy function defined by the `createProgressHandler` method.
   * // When called, it is possible to reference the `LoadingRequest` instance, and by setting progress within it, it will be reflected in the overall progress of the loading scope.
   * // If there are multiple loading display requests within the loading scope, their total value is calculated as the progress rate.
   * const proxyFn = loading.createProgressHandler(
   *   (request) => async (delaySeconds: number) => {
   *     if (delaySeconds === 0) return;
   *
   *     for (let current = 0; current < delaySeconds; current++) {
   *       request.progress = (current / delaySeconds) * 100;
   *       await delay(1000);
   *     }
   *   },
   * );
   *
   * const someHandler = () => {
   *   await proxyFn(3);
   *   console.log('3 seconds have passed');
   * };
   * ```
   *
   * @param handler - Handler returning asynchronous processing executed within the loading request scope
   * @param options - Loading request options
   *
   * @returns Function wrapped with loading display processing
   *
   * @see {@link LoadingRequestOptions}
   */
  createProgressHandler<Fn extends Callable>(
    handler: (request: LoadingRequest) => Fn,
    options?: LoadingRequestOptions,
  ): Fn;

  /**
   * Request the execution of a function with loading display
   *
   * @param fn - Function to be executed with loading display
   * @param options - Loading request options
   *
   * @returns Result of the function execution
   *
   * @example
   * ```ts
   * const loading = useLoading();
   *
   * // The loading display will be shown until the function passed as the first argument completes, and the return value will be obtained upon completion.
   * // If an exception occurs during execution, the loading display will safely be hidden.
   * const result = await loadingScope.request(() => fetch('https://hoge.fuga.com'));
   *
   * // The function can also reference the `LoadingRequest` instance via its first argument. You can set the progress rate and other settings.
   * const result = await loadingScope.request((request) => {
   *   let succeeded = 0;
   *   const increment = () => {
   *     succeeded++;
   *     request.progress = (succeeded / 3) * 100;
   *   };
   *   return Promise.all([
   *     fetch('https://hoge.1.com').then((res) => {
   *       increment();
   *       return res;
   *     }),
   *     fetch('https://hoge.2.com').then((res) => {
   *       increment();
   *       return res;
   *     }),
   *     fetch('https://hoge.3.com').then((res) => {
   *       increment();
   *       return res;
   *     }),
   *   ])
   * });
   * ```
   *
   * @see {@link LoadingRequestOptions}
   * @see {@link WithLoadingRequest}
   */
  request<Fn extends (request: LoadingRequest) => any>(
    fn: Fn,
    options?: LoadingRequestOptions,
  ): ReturnType<Fn>;

  /**
   * End all loading displays
   */
  endAll(): void;

  /**
   * Add a loading display request
   *
   * @internal
   *
   * @param req - Loading display request
   */
  _attach(req: LoadingRequest): void;

  /**
   * Remove a loading display request
   *
   * @internal
   *
   * @param req - Loading display request
   */
  _detach(req: LoadingRequest): void;
}

const LOADING_SCOPE_INJECTION_KEY: InjectionKey<LoadingScope> =
  Symbol('LoadingScope');

const ROOT_LOADING_SCOPE_INJECTION_KEY: InjectionKey<LoadingScope> =
  Symbol('RootLoadingScope');

/**
 * Create a loading scope
 *
 * @param app - App scope to create as the root scope of Vue application
 *
 * @returns Loading scope
 *
 * @see {@link LoadingScope}
 */
export function createLoadingScope(app?: App): LoadingScope {
  const root = app ? undefined : useLoading();

  const requests = ref<LoadingRequest[]>([]);

  const displayingRequests = computed(() =>
    requests.value.filter((req) => req.isDisplaying),
  );

  const currentDisplaySettings = computed<LoadingDisplaySettings | undefined>(
    () => {
      const _displayingRequests = displayingRequests.value;

      if (!_displayingRequests.length) return;

      return {
        backdrop: _displayingRequests.some((req) => req.backdrop),
      };
    },
  );

  const progress = computed(() => {
    const _displayingRequests = displayingRequests.value;
    const { length } = _displayingRequests;
    if (!length) return 100;
    return (
      _displayingRequests.reduce((prev, req) => prev + req.progress, 0) / length
    );
  });

  const context: LoadingScope = {
    get root() {
      return root || context;
    },
    get router() {
      return app?.config.globalProperties?.$router;
    },
    get requests() {
      return requests.value;
    },
    get currentDisplaySettings() {
      return currentDisplaySettings.value;
    },
    get isIdle() {
      return requests.value.length === 0;
    },
    get isPending() {
      return !this.isDisplaying && !this.isIdle;
    },
    get isDisplaying() {
      return !!currentDisplaySettings.value;
    },
    get isActive() {
      return !this.isIdle;
    },
    get progress() {
      return progress.value;
    },
    create(fn, options) {
      return withLoadingRequest(this, fn, options);
    },
    createProgressHandler(handler, options) {
      return ((...args: any[]) => {
        let _ref: LoadingRequest;
        const proxy = new Proxy({} as LoadingRequest, {
          get(_target, p, receiver) {
            return Reflect.get(_ref, p, receiver);
          },
          set(_target, p, newValue, receiver) {
            return Reflect.set(_ref, p, newValue, receiver);
          },
        });
        const fn = this.create(handler(proxy), options);
        _ref = fn[LOADING_REQUEST_SYMBOL];
        return fn(...args);
      }) as any;
    },
    request(fn, options) {
      const request = this.create(fn, options);
      return request(request[LOADING_REQUEST_SYMBOL]);
    },
    endAll() {
      for (const req of requests.value) {
        req.end();
      }
    },
    _attach(req) {
      requests.value.push(req);
    },
    _detach(req) {
      arrayRemove(requests.value, req);
    },
  };

  return context;
}

/**
 * Initialize and provide the loading scope
 *
 * @param app - If creating as the scope of Vue application (application root)
 *
 * @returns Loading scope
 *
 * @see {@link LoadingScope}
 */
export function initLoadingScope(app?: App): LoadingScope {
  const context = createLoadingScope(app);
  if (app) {
    app.provide(LOADING_SCOPE_INJECTION_KEY, context);
    app.provide(ROOT_LOADING_SCOPE_INJECTION_KEY, context);
  } else {
    provide(LOADING_SCOPE_INJECTION_KEY, context);
  }
  return context;
}

/**
 * Retrieve the loading scope of the application root
 *
 * @returns Loading scope of the application root
 *
 * @see {@link LoadingScope}
 */
export function useLoading(): LoadingScope {
  const service = inject(ROOT_LOADING_SCOPE_INJECTION_KEY);
  if (!service) {
    throw new Error('missing provided RootLoadingScope');
  }
  return service;
}

/**
 * Retrieve the loading scope of the nearest scope
 *
 * @returns Loading scope
 *
 * @see {@link LoadingScope}
 */
export function useScopedLoading(): LoadingScope {
  const service = inject(LOADING_SCOPE_INJECTION_KEY);
  if (!service) {
    throw new Error('missing provided RootLoadingScope');
  }
  return service;
}
