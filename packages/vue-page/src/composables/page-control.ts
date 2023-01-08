/* eslint-disable @typescript-eslint/ban-types */
import {
  App,
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
  MatcherLocationAsPath,
  LocationQueryRaw,
  LocationAsRelativeRaw,
} from 'vue-router';
import { stringifyQuery, useLink, RouterLink } from 'vue-router';
import { IN_WINDOW } from '@fastkit/helpers';
import {
  extractRouteMatchedItems,
  RouteMatchedItem,
  getRouteQuery,
  RouteQueryType,
  isComponentCustomOptions,
} from '@fastkit/vue-utils';
import { ResolvedRouteLocation, WatchQueryOption } from '../schemes';
import {
  routeKeyWithWatchQueryByRouteItem,
  setForcePrefetchStates,
} from '../utils';
import { isPromise } from '@fastkit/helpers';
import { EV } from '@fastkit/ev';
import { useVuePageControl } from '../injections';
import { VuePageControlError } from './page-error';
import { VErrorPage } from '../components/VErrorPage';
import type { ServerResponse, IncomingMessage } from 'node:http';
import { StateInjectionKey } from './state';
import { Cookies, CookiesContext } from '@fastkit/cookies';
// import { JSONMapValue, JSONData } from '@fastkit/helpers';

// type JSONData = Record<string, unknown>;
type InitialState = Record<string, unknown>;
// type InitialState = JSONMapValue;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface VuePageInjectionKey<T> extends String {}

export type VuePagePrefetchFn = (
  this: void,
  queue: VuePagePrefetchQueue,
) => void | Promise<void>;

export type RawPrefetchContext = VuePagePrefetchFn | PrefetchContext;

export interface WrittenResponse {
  status?: number;
  statusText?: string;
  headers?: Record<string, string>;
}

export type WriteResponseFn = (params: WrittenResponse) => void;

export type RedirectFn = (location: string, status?: number) => void;

export interface PrefetchHandlerContext {
  control: VuePageControl;
  to: RouteLocationNormalized;
  from: RouteLocationNormalized;
  matched: {
    from?: RouteMatchedItem;
    to: RouteMatchedItem;
  };
  pageKey: string;
}

export type PrefetchHandler = (ctx: PrefetchHandlerContext) => boolean | void;

declare module '@vue/runtime-core' {
  interface ComponentCustomOptions {
    prefetch?: RawPrefetchContext;
    prefetchHandler?: PrefetchHandler;
    watchQuery?: WatchQueryOption;
    middleware?: VuePageControlMiddlewareFn | VuePageControlMiddlewareFn[];
  }
}

function extractPrefetch(Component: unknown): {
  prefetch?: VuePagePrefetchFn;
  middleware: VuePageControlMiddlewareFn[];
  prefetchHandler?: PrefetchHandler;
} | void {
  if (!isComponentCustomOptions(Component)) return;
  let { prefetch, middleware = [] } = Component;

  if (!Array.isArray(middleware)) {
    middleware = [middleware];
  }

  const { prefetchHandler } = Component;
  if (prefetch && typeof prefetch === 'object') {
    prefetch = prefetch.prefetch;
  }
  if (typeof prefetch === 'function' || middleware.length) {
    return {
      prefetch,
      prefetchHandler,
      middleware,
    };
  }
}

function updateWatchQueryOption(Component: unknown, queries: string[]) {
  if (!isComponentCustomOptions(Component)) return;
  if (Component.watchQuery === true) return;
  Component.watchQuery = Component.watchQuery || [];
  const { watchQuery } = Component;
  for (const query of queries) {
    if (!watchQuery.includes(query)) {
      watchQuery.push(query);
    }
  }
}

interface RouteMatchedItemWithPrefetch extends RouteMatchedItem {
  prefetch?: RawPrefetchContext;
  middleware: VuePageControlMiddlewareFn[];
  updateQueries(queries: string[]): void;
}

interface RequiredRouteMatchedItemWithPrefetch
  extends RouteMatchedItemWithPrefetch {
  prefetch: RawPrefetchContext;
}

export function extractRouteMatchedItemsWithPrefetch(
  control: VuePageControl,
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
) {
  const extracted: RouteMatchedItemWithPrefetch[] = [];
  const fromMatched = extractRouteMatchedItems(from);
  const fromItems: { [key: string]: RouteMatchedItem } = {};

  fromMatched.forEach((_item) => {
    const fromKey = routeKeyWithWatchQueryByRouteItem(from, _item);
    fromItems[fromKey] = _item;
  });

  const matched = extractRouteMatchedItems(to);

  matched.forEach((_item) => {
    const prefetchSettings = extractPrefetch(_item.Component);
    if (!prefetchSettings) return;

    const { prefetchHandler, middleware } = prefetchSettings;
    let { prefetch } = prefetchSettings;

    const pageKey = routeKeyWithWatchQueryByRouteItem(to, _item);
    const fromItem = fromItems[pageKey];

    let forcePrefetch: boolean | undefined | void;

    if (prefetchHandler) {
      const ctx: PrefetchHandlerContext = {
        control,
        to,
        from,
        matched: {
          from: fromItem,
          to: _item,
        },
        pageKey,
      };

      forcePrefetch = prefetchHandler(ctx);
    }

    setForcePrefetchStates(pageKey, forcePrefetch || false);

    if (!forcePrefetch && fromItem) {
      // 遷移前にすでに実行されているprefetchの場合（ネストされたルートにおけるルートビュー等）はpreftechをキャンセルする
      prefetch = undefined;
    }

    function updateQueries(queries: string[]) {
      updateWatchQueryOption(_item.Component, queries);
    }
    extracted.push({ ..._item, prefetch, updateQueries, middleware });
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
  | (RouteQueryAndHash & MatcherLocationAsPath & RedirectOptions)
  | (RouteQueryAndHash & LocationAsRelativeRaw & RedirectOptions);

export interface VuePageControlRedirectSpec
  extends RouteQueryAndHash,
    MatcherLocationAsPath,
    LocationAsRelativeRaw {
  statusCode: number;
  query?: LocationQueryRaw;
}

const DEFAULT_REDIRECT_STATUS = 302;

const STATE_BUCKET_SYMBOL = 'pgc-state';
const QUERY_BUCKET_SYMBOL = 'pgc-query';

function resolveRawVuePageControlRedirectSpec(
  source: RawVuePageControlRedirectSpec,
): VuePageControlRedirectSpec {
  if (typeof source === 'string') {
    source = { path: source };
  }
  const { statusCode = DEFAULT_REDIRECT_STATUS, query, hash } = source;
  const { path } = source as MatcherLocationAsPath;
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
  RouterLink?: any;
  useLink?: typeof useLink;
  initialState?: InitialState;
  initialRoute: ResolvedRouteLocation;
  ErrorComponent?: Component;
  request?: IncomingMessage;
  response?: ServerResponse;
  serverRedirect?: RedirectFn;
  writeResponse?: WriteResponseFn;
  middleware?: VuePageControlMiddlewareFn[];
}

type RawProvided<T> = T | ((queue: VuePagePrefetchQueue) => T | Promise<T>);

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
  readonly cookies: Cookies;
  readonly RouterLink: typeof RouterLink;
  readonly useLink: typeof useLink;
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
  private readonly _serverRedirect?: RedirectFn;
  private readonly _writeResponse?: WriteResponseFn;
  readonly isClient: boolean;
  readonly middleware: VuePageControlMiddlewareFn[];
  private _redirectSpec?: VuePageControlRedirectSpec;
  private _providedMap: Map<string | InjectionKey<any>, any> = new Map();
  private _transitioning = ref(false);
  private _serverRedirected = ref(false);

  get isServer() {
    return !this.isClient;
  }

  get serverRedirected() {
    return this._serverRedirected.value;
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
    this.RouterLink = settings.RouterLink || RouterLink;
    this.useLink = settings.useLink || useLink;

    const cookiesContext: CookiesContext = this.isClient
      ? document
      : { req: request, res: response };
    this.cookies = new Cookies(cookiesContext, { bucket: reactive({}) });

    this.middleware = middleware;
    this._serverRedirect = serverRedirect;

    this._writeResponse = writeResponse;

    this._ErrorComponent = ErrorComponent || VErrorPage;

    initialState[STATE_BUCKET_SYMBOL] = initialState[STATE_BUCKET_SYMBOL] || {};
    initialState[QUERY_BUCKET_SYMBOL] = initialState[QUERY_BUCKET_SYMBOL] || {};

    initialState[STATE_BUCKET_SYMBOL] = reactive<any>(
      initialState[STATE_BUCKET_SYMBOL],
    );
    this._initialState = initialState;

    this._route = ref(initialRoute as any) as Ref<ResolvedRouteLocation>;
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

    (
      [
        '_handleBeforeResolve',
        '_handleAfterEach',
        'setInitialState',
        'injectData',
        'onSuspensePending',
        'redirect',
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

  /** @private */
  _getQueryBucket(provideKey: string): string[] {
    const obj = this.initialState[QUERY_BUCKET_SYMBOL] as any;
    let bucket = obj[provideKey] as string[];
    if (!bucket) {
      bucket = [];
      obj[provideKey] = bucket;
    }
    return bucket;
  }

  /** @private */
  _pushQueryToBucket(provideKey: string, query: string) {
    const bucket = this._getQueryBucket(provideKey);
    if (!bucket.includes(query)) {
      bucket.push(query);
    }
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
    const bucket = this.initialState[STATE_BUCKET_SYMBOL] as any;
    let data = bucket[key as any] as T | undefined;
    if (data === undefined) {
      data =
        typeof defaultValue === 'function'
          ? (defaultValue as any)() // @TODO TS2349: This expression is not callable.
          : defaultValue;
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

  writeResponse(params: WrittenResponse) {
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

  setInitialState(key: string, data: any) {
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

  injectData<T, D extends T | undefined, N extends Boolean>(
    key: VuePageInjectionKey<T>,
    defaultData?: D,
    allowNull?: N,
  ): D extends T ? T : N extends true ? T | D : T {
    const queue = this.prefetchQueues.find(
      ({ _provideKey }) => _provideKey === key,
    );
    const data = queue && queue.resolvedData;
    const result = data === undefined ? defaultData : data;
    if (!allowNull && result == null) {
      throw new Error(`missing provided data. "${key}"`);
    }
    return result as any;
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

    let fullPath = `${path}${queryAppends}`;

    // apply base url
    if (/^\//.test(fullPath)) {
      const { base } = this.router.options.history;
      fullPath = `${base}/${fullPath.replace(/^\//, '')}`;
    }

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

    this._serverRedirected.value = true;
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
      const { extracted, matched } = extractRouteMatchedItemsWithPrefetch(
        this,
        to,
        from,
      );
      if (!matched.length) {
        throw new VuePageControlError({
          statusCode: 404,
          message: 'This page could not be found',
        });
      }

      this._transitioning.value = true;

      const allMiddleware = [...this.middleware];

      extracted.forEach(({ middleware }) => {
        allMiddleware.push(...middleware);
      });

      for (const middlewareFn of allMiddleware) {
        await middlewareFn(this);
        if (this._redirectSpec) {
          break;
        }
      }

      if (this._redirectSpec) {
        return this._triggerRedirect();
      }

      const requiredItems: RequiredRouteMatchedItemWithPrefetch[] =
        extracted.filter(
          (e) => !!e.prefetch,
        ) as RequiredRouteMatchedItemWithPrefetch[];

      if (!requiredItems.length) {
        this._initialStateConsumed = true;
        this._deletePageError();
        return;
      }

      const queueSetups: Promise<any>[] = [];
      let queues = requiredItems.map((item) => {
        const queue = new VuePagePrefetchQueue(this, item, to);
        if (queue._setupPromise) {
          queueSetups.push(queue._setupPromise);
        }
        return queue;
      });

      this._prefetchQueues.value = queues.map((q) => () => q);

      this.emit('start', this.preftechProgress);

      await Promise.all(queueSetups);

      if (this._redirectSpec) {
        return this._triggerRedirect();
      }

      queues.forEach((queue) => {
        const { item, provideKey } = queue;
        if (provideKey) {
          item.updateQueries(this._getQueryBucket(provideKey));
        }
      });

      const providePromises: Promise<any>[] = [];

      queues = queues.filter(({ _providePromise }) => {
        if (!_providePromise) return false;
        providePromises.push(_providePromise);
        return true;
      });

      this._prefetchQueues.value = queues.map((q) => () => q);

      await Promise.all(providePromises);

      if (this._redirectSpec) {
        return this._triggerRedirect();
      }

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
    if (this.response.headersSent) return;
    this.response.statusCode = status;
    this.writeResponse({
      status,
    });
  }
}

export interface VuePagePrefetchQueueEventMap {
  close: void;
}

export class VuePagePrefetchQueue extends EV<VuePagePrefetchQueueEventMap> {
  readonly control: VuePageControl;
  readonly item: RouteMatchedItemWithPrefetch;
  readonly route: RouteLocationNormalized;
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

  get params() {
    return this.route.params;
  }

  get query() {
    return this.route.query;
  }

  get running() {
    return this._running.value;
  }

  constructor(
    control: VuePageControl,
    item: RequiredRouteMatchedItemWithPrefetch,
    to: RouteLocationNormalized,
  ) {
    super();

    this.control = control;
    this.item = item;
    this.route = to;

    (
      ['close', 'cancel', 'provide', 'injectOtherQueue', 'getQuery'] as const
    ).forEach((fn) => {
      const _fn = this[fn];
      this[fn] = _fn.bind(this) as any;
    });
    this._running = computed(() => {
      return !this.resolved && !this.canceled;
    });

    const prefetchFn =
      typeof item.prefetch === 'function'
        ? item.prefetch
        : item.prefetch.prefetch;

    this._setupPromise = prefetchFn(this);
  }

  getQuery(key: string): string | undefined;
  // eslint-disable-next-line no-dupe-class-members
  getQuery(key: string, type: undefined, defaultValue: string): string;
  // eslint-disable-next-line no-dupe-class-members
  getQuery(key: string, type: StringConstructor): string | undefined;
  // eslint-disable-next-line no-dupe-class-members
  getQuery(key: string, type: StringConstructor, defaultValue: string): string;
  // eslint-disable-next-line no-dupe-class-members
  getQuery(key: string, type: NumberConstructor): number | undefined;
  // eslint-disable-next-line no-dupe-class-members
  getQuery(key: string, type: NumberConstructor, defaultValue: number): number;
  // eslint-disable-next-line no-dupe-class-members
  getQuery(key: string, type: BooleanConstructor): boolean;
  // eslint-disable-next-line no-dupe-class-members
  getQuery(
    key: string,
    type: BooleanConstructor,
    defaultValue: boolean,
  ): boolean;
  // eslint-disable-next-line no-dupe-class-members
  getQuery(
    key: string,
    type: RouteQueryType = String,
    defaultValue?: string | number | boolean,
  ): string | number | boolean | undefined {
    const { provideKey } = this;
    if (!provideKey) {
      throw new Error('missing provideKey');
    }
    this.control._pushQueryToBucket(provideKey, key);
    return getRouteQuery(this.query, key, type as any, defaultValue as any);
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

  provide<T>(key: VuePageInjectionKey<T>, data: RawProvided<T>) {
    this._provideKey = key as string;
    let promise: Promise<any>;

    if (IN_WINDOW && !this.control.initialStateConsumed) {
      const consumed = this.control.consumeInitialState(key as string);
      promise = Promise.resolve(consumed);
    } else {
      if (typeof data !== 'function') {
        promise = Promise.resolve(data);
      } else {
        const payload = (data as any)(this);
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
    return this._providePromise;
  }

  injectOtherQueue<T, D extends T | undefined>(
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

export type PrefetchContext<T = any> = {
  key: VuePageInjectionKey<T>;
  prefetch: VuePagePrefetchFn;
  inject: <D extends T | undefined, N extends Boolean>(
    defaultValue?: D,
    allowNull?: N,
  ) => D extends T ? T : N extends true ? T | D : T;
};

export function createPrefetch<T>(
  key: VuePageInjectionKey<T>,
  data: RawProvided<T>,
): PrefetchContext<T> {
  const prefetch: VuePagePrefetchFn = function prefetch(queue) {
    return queue.provide(key, data);
  };

  function inject<D extends T | undefined, N extends Boolean>(
    defaultValue?: D,
    allowNull?: N,
  ): D extends T ? T : N extends true ? T | D : T {
    const pageControl = useVuePageControl();
    return pageControl.injectData(key, defaultValue, allowNull);
  }

  return { key, prefetch, inject };
}
