/* eslint-disable @typescript-eslint/ban-types */
import {
  App,
  ComponentCustomOptions,
  ref,
  Ref,
  ComputedRef,
  computed,
  VNode,
  Component,
  InjectionKey,
  reactive,
} from 'vue';
import type {
  Router,
  RouteLocationNormalized,
  RouteQueryAndHash,
  LocationAsPath,
  LocationQueryRaw,
  LocationAsRelativeRaw,
} from 'vue-router';
import { stringifyQuery } from 'vue-router';
import { IN_WINDOW } from '@fastkit/helpers';
import { extractRouteMatchedItems, RouteMatchedItem } from '@fastkit/vue-utils';
import { ResolvedRouteLocation } from '../schemes';
import { isPromise } from '@fastkit/helpers';
import { EV } from '@fastkit/ev';
import { useVuePageControl } from '../injections';
import { VuePageControlError } from './page-error';
import { VErrorPage } from '../components/VErrorPage';
import type { ServerResponse, IncomingMessage } from 'http';
import { StateInjectionKey } from './state';
import { JSONMapValue, JSONData } from '@fastkit/helpers';

type InitialState = JSONMapValue;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface VuePageInjectionKey<T extends JSONData> extends String {}

export type VuePagePrefetchFn = (
  this: void,
  queue: VuePagePrefetchQueue,
) => void | Promise<void>;

export type RawPrefetchContext = VuePagePrefetchFn | PrefetchContext;

export interface WriteResponse {
  status?: number;
  statusText?: string;
  headers?: Record<string, string>;
}

declare module '@vue/runtime-core' {
  export interface ComponentCustomOptions {
    prefetch?: RawPrefetchContext;
  }
}

function extractPrefetch(Component: unknown) {
  if (
    (!!Component && typeof Component === 'object') ||
    typeof Component === 'function'
  ) {
    let { prefetch } = Component as ComponentCustomOptions;
    if (prefetch && typeof prefetch === 'object') {
      prefetch = prefetch.prefetch;
    }
    if (typeof prefetch === 'function') {
      return prefetch;
    }
  }
}

interface RouteMatchedItemWithPrefetch extends RouteMatchedItem {
  prefetch: RawPrefetchContext;
}

export function extractRouteMatchedItemsWithPrefetch(
  route: RouteLocationNormalized,
) {
  const extracted: RouteMatchedItemWithPrefetch[] = [];
  const matched = extractRouteMatchedItems(route);
  matched.forEach((_item) => {
    const prefetch = extractPrefetch(_item.Component);
    if (prefetch) {
      extracted.push({ ..._item, prefetch });
    }
  });
  return {
    extracted,
    matched,
  };
}

// export interface VuePageLoadingOptions {
//   color?: string;
//   failedColor?: string;
//   height?: number;
//   throttle?: number;
//   duration?: number;
//   continuous?: boolean;
// }

export type VuePageControlMiddlewareFn = (
  ctx: VuePageControl,
) => void | Promise<void>;

export function createMiddleware(source: VuePageControlMiddlewareFn) {
  return source;
}

type RedirectOptions = {
  statusCode?: number;
};

export type RawVuePageControlRedirectSpec =
  | string
  | (RouteQueryAndHash & LocationAsPath & RedirectOptions)
  | (RouteQueryAndHash & LocationAsRelativeRaw & RedirectOptions);

export interface VuePageControlRedirectSpec
  extends RouteQueryAndHash,
    LocationAsPath,
    LocationAsRelativeRaw {
  statusCode: number;
  query?: LocationQueryRaw;
}

const DEFAULT_REDIRECT_STATUS = 302;

const STATE_BUCKET_SYMBOL = 'pgc-state';

function resolveRawVuePageControlRedirectSpec(
  source: RawVuePageControlRedirectSpec,
): VuePageControlRedirectSpec {
  if (typeof source === 'string') {
    source = { path: source };
  }
  const { statusCode = DEFAULT_REDIRECT_STATUS, query, hash } = source;
  const { path } = source as LocationAsPath;
  const { name, params } = source as LocationAsRelativeRaw;
  return {
    statusCode,
    query,
    hash,
    path,
    name,
    params,
  };
}

export interface VuePageControlSettings {
  app: App;
  router: Router;
  initialState?: InitialState;
  initialRoute: ResolvedRouteLocation;
  ErrorComponent?: Component;
  request?: IncomingMessage;
  response?: ServerResponse;
  serverRedirect?: (location: string, status?: number) => void;
  writeResponse?: (params: WriteResponse) => void;
  middleware?: VuePageControlMiddlewareFn[];
}

type RawProvided<T extends JSONData> =
  | T
  | ((queue: VuePagePrefetchQueue) => T | Promise<T>);

export interface VuePagePreftechProgress {
  resolved: number;
  total: number;
  per: number;
  finished: boolean;
}

export interface VuePageControlEventMap {
  start: VuePagePreftechProgress;
  finish: VuePagePreftechProgress;
  error: VuePageControlError;
}

const ERROR_STATE_NAME = '__vpe__';

export class VuePageControl extends EV<VuePageControlEventMap> {
  readonly app: App;
  readonly router: Router;
  private _from: Ref<RouteLocationNormalized | null> = ref(null);
  private _to: Ref<RouteLocationNormalized | null> = ref(null);
  private _initialState: InitialState;
  private _beforeRoute: Ref<ResolvedRouteLocation | null> = ref(null);
  private _route: Ref<ResolvedRouteLocation>;
  private _stopFn?: () => void;
  private _prefetchQueues: Ref<(() => VuePagePrefetchQueue)[]> = ref([]);
  private _initialStateConsumed = false;
  private _runningQueues: ComputedRef<VuePagePrefetchQueue[]>;
  private _preftechProgress: ComputedRef<VuePagePreftechProgress>;
  private _suspenseComponents: Ref<(() => VNode)[]> = ref([]);
  private _err: Ref<(() => VuePageControlError) | null> = ref(null);
  private _ErrorComponent: Component;
  readonly request?: IncomingMessage;
  readonly response?: ServerResponse;
  private readonly _serverRedirect?: (
    location: string,
    status?: number,
  ) => void;
  private readonly _writeResponse?: (params: WriteResponse) => void;
  readonly isClient: boolean;
  readonly middleware: VuePageControlMiddlewareFn[];
  private _redirectSpec?: VuePageControlRedirectSpec;
  private _providedMap: Map<string | InjectionKey<any>, any> = new Map();
  private _transitioning = ref(false);

  get isServer() {
    return !this.isClient;
  }

  get from() {
    return this._from.value;
  }

  get to() {
    return this._to.value;
  }

  get initialState() {
    return this._initialState;
  }

  get beforeRoute() {
    return this._beforeRoute.value;
  }

  get route() {
    return this._route.value;
  }

  get prefetchQueues() {
    return this._prefetchQueues.value.map((g) => g());
  }

  get initialStateConsumed() {
    return this._initialStateConsumed;
  }

  get runningQueues() {
    return this._runningQueues.value;
  }

  get preftechProgress() {
    return this._preftechProgress.value;
  }

  get suspenseComponents() {
    return this._suspenseComponents.value.map((g) => g());
  }

  get pageError() {
    const _err = this._err.value;
    return _err && _err();
  }

  get ErrorComponent() {
    return this._ErrorComponent;
  }

  get transitioning() {
    return this._transitioning.value;
  }

  constructor(settings: VuePageControlSettings) {
    super();

    const {
      app,
      router,
      initialState = {},
      initialRoute,
      ErrorComponent,
      request,
      response,
      serverRedirect,
      writeResponse,
      middleware = [],
    } = settings;

    this.app = app;
    this.router = router;
    this.request = request;
    this.response = response;
    this.isClient = typeof window !== 'undefined';
    this.middleware = middleware;
    this._serverRedirect = serverRedirect;
    this._writeResponse = writeResponse;

    this._ErrorComponent = ErrorComponent || VErrorPage;

    initialState[STATE_BUCKET_SYMBOL] = initialState[STATE_BUCKET_SYMBOL] || {};

    initialState[STATE_BUCKET_SYMBOL] = reactive<any>(
      initialState[STATE_BUCKET_SYMBOL],
    );
    this._initialState = initialState;

    this._route = ref(initialRoute);
    this._runningQueues = computed(() =>
      this.prefetchQueues.filter((q) => q.running),
    );
    this._preftechProgress = computed(() => {
      const { prefetchQueues, runningQueues } = this;
      const total = prefetchQueues.length;
      const resolved = total - runningQueues.length;
      const per = total === 0 ? 0 : resolved / total;
      return {
        total,
        resolved,
        per,
        finished: resolved >= total,
      };
    });

    this._handleBeforeResolve = this._handleBeforeResolve.bind(this);
    this._handleAfterEach = this._handleAfterEach.bind(this);

    (
      [
        '_handleBeforeResolve',
        '_handleAfterEach',
        'setInitialState',
        'injectData',
        'onSuspensePending',
      ] as const
    ).forEach((fn) => {
      const _fn = this[fn];
      this[fn] = _fn.bind(this) as any;
    });

    if (IN_WINDOW) {
      const initialError = this.consumeInitialState(ERROR_STATE_NAME);
      if (initialError) {
        this._setPageError(initialError);
      }
    }

    this._init();
  }

  async initState<T extends object>(
    key: StateInjectionKey<T>,
    initializer: () => T | Promise<T>,
  ): Promise<T> {
    const bucket = this.initialState[STATE_BUCKET_SYMBOL] as any;
    let data = bucket[key as any] as T;
    if (data === undefined) {
      data =
        typeof initializer === 'function' ? await initializer() : initializer;
    }
    bucket[key as any] = reactive(data);
    this.app.provide(key as any, data);
    return data;
  }

  useState<T  extends object>(key: StateInjectionKey<T>): T | undefined; // eslint-disable-line prettier/prettier
  useState<T extends object>(key: StateInjectionKey<T>, defaultValue: T | (() => T)): T; // eslint-disable-line prettier/prettier
  useState<T extends object>(
    key: StateInjectionKey<T>,
    defaultValue?: T | (() => T),
  ): T | undefined {
    const bucket = this.initialState[STATE_BUCKET_SYMBOL] as JSONMapValue;
    let data = bucket[key as any] as T | undefined;
    if (data === undefined) {
      data = typeof defaultValue === 'function' ? defaultValue() : defaultValue;
    }
    return data;
  }

  provide<T>(key: InjectionKey<T> | string, value: T) {
    this.app.provide(key, value);
    this._providedMap.set(key, value);
  }

  inject<T>(key: InjectionKey<T> | string): T | undefined;
  inject<T>(key: InjectionKey<T> | string, defaultValue: T, treatDefaultAsFactory?: false): T; // eslint-disable-line prettier/prettier
  inject<T>(key: InjectionKey<T> | string, defaultValue: T | (() => T), treatDefaultAsFactory: true): T; // eslint-disable-line prettier/prettier
  inject<T>(
    key: InjectionKey<T> | string,
    defaultValue?: T | (() => T),
    treatDefaultAsFactory?: boolean,
  ): T | undefined {
    let value = this._providedMap.get(key);
    if (value === undefined && defaultValue !== undefined) {
      value =
        treatDefaultAsFactory && typeof defaultValue === 'function'
          ? (defaultValue as () => T)()
          : defaultValue;
    }
    return value;
  }

  addMiddleware(middleware: VuePageControlMiddlewareFn) {
    this.middleware.push(middleware);
  }

  writeResponse(params: WriteResponse) {
    const { _writeResponse } = this;
    if (!_writeResponse) {
      throw new Error('missing provided writeResponse function.');
    }
    return _writeResponse(params);
  }

  onSuspensePending(Component: VNode) {
    if (!this.suspenseComponents.includes(Component)) {
      this._suspenseComponents.value.push(() => Component);
    }
  }

  onSuspenseResolved(Component: VNode) {
    const index = this.suspenseComponents.indexOf(Component);
    if (index !== -1) {
      this._suspenseComponents.value.splice(index, 1);
    }
  }

  setInitialState(key: string, data: JSONData) {
    if (this.initialState) {
      this.initialState[key] = data;
    }
  }

  consumeInitialState(key: string) {
    const { initialState } = this;
    if (!initialState) return;
    const v = initialState[key];
    delete initialState[key];
    return v;
  }

  injectData<T extends JSONData, D extends T | undefined>(
    key: VuePageInjectionKey<T>,
    defaultData?: D,
  ): T | D {
    const queue = this.prefetchQueues.find(
      ({ _provideKey }) => _provideKey === key,
    );
    const data = queue && queue.resolvedData;
    return (data === undefined ? defaultData : data) as T | D;
  }

  private _stop() {
    if (this._stopFn) {
      this._stopFn();
      delete this._stopFn;
    }
  }

  private _init() {
    this._stop();

    const fns: (() => void)[] = [];
    fns.push(
      this.router.beforeResolve(this._handleBeforeResolve),
      this.router.afterEach(this._handleAfterEach),
    );
    this._stopFn = () => {
      fns.forEach((fn) => fn());
      delete this._stopFn;
    };
  }

  private async _handleAfterEach(
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
  ) {
    delete this._redirectSpec;
    this._transitioning.value = false;

    const { router } = this;
    this._beforeRoute.value = router.resolve(from);
    this._route.value = router.resolve(to);
    this.emit('finish', this.preftechProgress);
  }

  private _closePrefetchs() {
    this.prefetchQueues.forEach((queue) => queue.close());
    this._prefetchQueues.value = [];
  }

  redirect(redirectSpec: RawVuePageControlRedirectSpec) {
    this._redirectSpec = resolveRawVuePageControlRedirectSpec(redirectSpec);
    if (!this.transitioning) {
      this._triggerRedirect();
    }
  }

  private _triggerRedirect() {
    const { _redirectSpec } = this;
    if (!_redirectSpec) return;
    let { path, query, hash } = _redirectSpec;
    const { statusCode, name, params } = _redirectSpec;
    if (name) {
      const tmp = this.router.resolve({ name, params, query, hash });
      path = tmp.path;
      query = tmp.query;
      hash = tmp.hash;
    }
    const queryStr = query ? stringifyQuery(query) : query;
    const queryAppends = queryStr
      ? path.includes('?')
        ? `&${queryStr}`
        : `?${queryStr}`
      : '';

    const fullPath = `${path}${queryAppends}`;
    if (this.isClient) {
      const isInSite = /(^[.]{1,2}\/)|(^\/(?!\/))/.test(fullPath);
      if (isInSite) {
        this.router.replace({ path, query, hash });
      } else {
        window.location.replace(fullPath);
      }
      return false;
    }

    if (!this._serverRedirect) {
      throw new Error('required server redirect function.');
    }

    this._serverRedirect(fullPath, statusCode);
  }

  private async _handleBeforeResolve(
    to: RouteLocationNormalized,
    from: RouteLocationNormalized,
  ) {
    this._to.value = to;
    this._from.value = from;

    this._closePrefetchs();
    delete this._redirectSpec;

    if (IN_WINDOW && !this.initialStateConsumed && this.pageError) {
      this._initialStateConsumed = true;
      return;
    }

    try {
      const { extracted, matched } = extractRouteMatchedItemsWithPrefetch(to);
      if (!matched.length) {
        throw new VuePageControlError({
          statusCode: 404,
          message: 'This page could not be found',
        });
      }

      this._transitioning.value = true;

      for (const middlewareFn of this.middleware) {
        await middlewareFn(this);
        if (this._redirectSpec) {
          break;
        }
      }

      if (this._redirectSpec) {
        return this._triggerRedirect();
      }

      if (!extracted.length) {
        this._initialStateConsumed = true;
        this._deletePageError();
        return;
      }

      const queueSetups: Promise<any>[] = [];
      let queues = extracted.map((item) => {
        const queue = new VuePagePrefetchQueue(this, item);
        if (queue._setupPromise) {
          console.log(queue._setupPromise);
          queueSetups.push(queue._setupPromise);
        }
        return queue;
      });

      this._prefetchQueues.value = queues.map((q) => () => q);

      this.emit('start', this.preftechProgress);

      await Promise.all(queueSetups);

      const providePromises: Promise<any>[] = [];

      queues = queues.filter(({ _providePromise }) => {
        if (!_providePromise) return false;
        providePromises.push(_providePromise);
        return true;
      });

      this._prefetchQueues.value = queues.map((q) => () => q);

      await Promise.all(providePromises);

      this._initialStateConsumed = true;

      this._deletePageError();
    } catch (_err) {
      this._setPageError(_err);
    }
  }

  private _deletePageError() {
    this._err.value = null;
  }

  private _setPageError(_err: unknown, withEmit = true) {
    const err = new VuePageControlError(_err);
    this._err.value = () => err;
    if (!IN_WINDOW) {
      this.setInitialState(ERROR_STATE_NAME, err.toJSON());
      this._writeStates(err.statusCode);
    }
    withEmit && this.emit('error', err);
    return err;
  }

  private _writeStates(status: number) {
    if (IN_WINDOW || !this.response) return;
    // console.log()
    if (this.response.headersSent) return;
    this.response.statusCode = status;
  }
}

export interface VuePagePrefetchQueueEventMap {
  close: void;
}

export class VuePagePrefetchQueue extends EV<VuePagePrefetchQueueEventMap> {
  readonly control: VuePageControl;
  readonly item: RouteMatchedItemWithPrefetch;
  private readonly _resolved = ref(false);
  private readonly _canceled = ref(false);
  private readonly _running: ComputedRef<boolean>;
  private _resolvedData?: any;

  /** @private */
  _providePromise?: Promise<any>;

  /** @private */
  _provideKey?: string;

  /** @private */
  _setupPromise?: void | Promise<void>;

  get resolved() {
    return this._resolved.value;
  }

  get canceled() {
    return this._canceled.value;
  }

  get provideKey() {
    return this._provideKey;
  }

  get resolvedData() {
    return this._resolvedData;
  }

  get route() {
    return this.control.route;
  }

  get routeParams() {
    return this.route.params;
  }

  get running() {
    return this._running.value;
  }

  constructor(control: VuePageControl, item: RouteMatchedItemWithPrefetch) {
    super();

    this.control = control;
    this.item = item;
    this._running = computed(() => {
      return !this.resolved && !this.canceled;
    });

    const prefetchFn =
      typeof item.prefetch === 'function'
        ? item.prefetch
        : item.prefetch.prefetch;

    this._setupPromise = prefetchFn(this);

    (['close', 'cancel', 'provide', 'injectOtherQueue'] as const).forEach(
      (fn) => {
        const _fn = this[fn];
        this[fn] = _fn.bind(this) as any;
      },
    );
  }

  close() {
    this._canceled.value = true;
    this.emit('close', undefined);
    this.offAll();
    delete this._providePromise;
    delete this._setupPromise;
    delete this._resolvedData;
    delete (this as any).item;
    delete (this as any).control;
  }

  cancel() {
    return this.close();
  }

  provide<T extends JSONData>(
    key: VuePageInjectionKey<T>,
    data: RawProvided<T>,
  ) {
    this._provideKey = key as string;
    let promise: Promise<any>;

    if (IN_WINDOW && !this.control.initialStateConsumed) {
      const consumed = this.control.consumeInitialState(key as string);
      promise = Promise.resolve(consumed);
    } else {
      if (typeof data !== 'function') {
        promise = Promise.resolve(data);
      } else {
        const payload = data(this);
        promise = isPromise(payload) ? payload : Promise.resolve(payload);
      }
    }

    this._providePromise = promise.then((v) => {
      this._resolved.value = true;
      this._resolvedData = v;
      if (!IN_WINDOW) {
        this.control.setInitialState(key as string, v);
      }
      return v;
    });
  }

  injectOtherQueue<T extends JSONData, D extends T | undefined>(
    key: VuePageInjectionKey<T>,
    defaultData?: D,
  ): Promise<T | D> {
    const queue = this.control.prefetchQueues.find(
      ({ _provideKey }) => _provideKey === key,
    );
    if (!queue || !queue._providePromise)
      return Promise.resolve(defaultData as D);

    return queue._providePromise.then((value) => {
      const v = (value === undefined ? defaultData : value) as T | D;
      return v;
    });
  }
}

export interface UseVuePageControlOptions {
  onStart?: (progress: VuePagePreftechProgress) => any;
  onFinish?: (progress: VuePagePreftechProgress) => any;
  onError?: (error: VuePageControlError) => any;
}

export type PrefetchContext<T extends JSONData = JSONData> = {
  key: VuePageInjectionKey<T>;
  prefetch: VuePagePrefetchFn;
  inject: <D extends T | undefined>(defaultValue?: D) => T | D;
};

export function createPrefetch<T extends JSONData>(
  key: VuePageInjectionKey<T>,
  data: RawProvided<T>,
): PrefetchContext<T> {
  const prefetch: VuePagePrefetchFn = function prefetch(queue) {
    queue.provide(key, data);
  };

  function inject<D extends T | undefined>(defaultValue?: D) {
    const pageControl = useVuePageControl();
    return pageControl.injectData(key, defaultValue);
  }

  return { key, prefetch, inject };
}