import { ref, getCurrentInstance, markRaw, toValue, onUnmounted } from 'vue';
import { mixin } from '@fastkit/helpers';
import {
  type LoadingDisplayOptions,
  type LoadingDisplaySettings,
} from './schema';
import { LOADING_REQUEST_SYMBOL, type Callable } from './_internal-schema';
import { type LoadingScope } from './loading-scope';

/**
 * Loading request options
 *
 * @see {@link LoadingDisplayOptions}
 */
export interface LoadingRequestOptions extends LoadingDisplayOptions {}

/**
 * Loading request state
 *
 * - `idle`: Idle state
 * - `pending`: Waiting to be displayed
 * - `displaying`: Currently displaying
 */
export type LoadingRequestState = 'idle' | 'pending' | 'displaying';

/**
 * Loading request
 */
export interface LoadingRequest extends LoadingDisplaySettings {
  /**
   * State
   *
   * @see {@link LoadingRequestState}
   */
  readonly state: LoadingRequestState;

  /** Idle state */
  readonly isIdle: boolean;

  /** Waiting to be displayed */
  readonly isPending: boolean;

  /** Currently displaying */
  readonly isDisplaying: boolean;

  /** Either waiting to be displayed or currently displaying */
  readonly isActive: boolean;

  /**
   * Progress
   *
   * 0-100
   *
   * Always `0` when not active
   */
  progress: number;

  /**
   * Start loading display
   *
   * This method usually does not need to be called manually by the application. Loading is automatically displayed when the function is executed.
   */
  start(): void;

  /**
   * End loading display
   *
   * This method usually does not need to be called manually by the application. Loading is automatically hidden when the function execution ends.
   */
  end(): void;
}

/**
 * Function wrapped with loading display processing
 */
export type WithLoadingRequest<Fn extends Callable> = Fn & {
  readonly [LOADING_REQUEST_SYMBOL]: LoadingRequest;
};

/**
 * Wrap the specified function with loading display processing in the specified scope
 *
 * @param scope - Loading scope
 * @param fn - Function to be wrapped with loading display processing
 * @param options - Loading request options
 * @returns Function wrapped with loading display processing
 */
export function withLoadingRequest<Fn extends Callable>(
  scope: LoadingScope,
  fn: Fn,
  options?: LoadingRequestOptions,
): WithLoadingRequest<Fn> {
  const componentInstance = getCurrentInstance();

  let delayTimer: number | undefined;

  const clearDelayTimer = () => {
    if (delayTimer !== undefined) {
      clearTimeout(delayTimer);
      delayTimer = undefined;
    }
  };

  const state = ref<LoadingRequestState>('idle');
  const progress = ref(0);
  let routeWatcher: (() => void) | undefined;

  const consumeRouteWatcher = () => {
    routeWatcher?.();
    routeWatcher = undefined;
  };

  const request: LoadingRequest = {
    get backdrop() {
      return options?.backdrop === undefined
        ? true
        : toValue(options?.backdrop);
    },
    get state() {
      return state.value;
    },
    get isIdle() {
      return state.value === 'idle';
    },
    get isPending() {
      return state.value === 'pending';
    },
    get isDisplaying() {
      return state.value === 'displaying';
    },
    get isActive() {
      return this.isPending || this.isDisplaying;
    },
    get progress() {
      if (!this.isActive) return 0;
      return progress.value;
    },
    set progress(value) {
      progress.value = Math.min(Math.max(value, 0), 100);
    },
    start() {
      if (this.isActive) return;

      clearDelayTimer();
      consumeRouteWatcher();

      const delay = options?.delay ?? 0;
      progress.value = 0;

      scope._attach(request);

      if (options?.endOnNavigation ?? true) {
        const { router } = scope;
        if (!router) {
          throw new Error(
            'vue-router instance is required to use endOnNavigation',
          );
        }
        routeWatcher = router.afterEach(request.end);
      }

      if (delay <= 0) {
        state.value = 'displaying';
        return;
      }

      state.value = 'pending';
      delayTimer = window.setTimeout(() => {
        state.value = 'displaying';
      }, delay);
    },
    end() {
      clearDelayTimer();
      consumeRouteWatcher();
      scope._detach(request);
      state.value = 'idle';
      progress.value = 0;
    },
  };

  const handler = async (...args: any[]): Promise<any> => {
    try {
      request.start();
      return await fn(...args);
    } finally {
      request.end();
    }
  };

  const wrappedFn = markRaw(
    mixin(handler, {
      [LOADING_REQUEST_SYMBOL]: request,
    }),
  ) as WithLoadingRequest<Fn>;

  componentInstance && onUnmounted(request.end);

  return wrappedFn;
}
