import { reactive, ref } from 'vue';
import { MEDIA_MATCH_CONDITIONS } from '@fastkit/media-match';
import type { MediaMatchConditions, MediaMatchKey } from '@fastkit/media-match';
import { arrayRemove, IN_WINDOW } from '@fastkit/helpers';

export type MediaMatchServiceState = Record<MediaMatchKey, boolean>;

export type MediaMatchListener = {
  key: MediaMatchKey;
  mql: MediaQueryList;
  handler: (ev: MediaQueryListEvent) => void;
  remove: () => void;
};

type BootState = 'pending' | 'resvered' | 'ready';

export interface VueMediaMatchService {
  (key: MediaMatchKey): boolean;
  state(): MediaMatchServiceState;
  listeners(): MediaMatchListener[];
  conditions(): MediaMatchConditions;
  bootState(): BootState;
  isPending(): boolean;
  isBooted(): boolean;
  matches(key: MediaMatchKey): boolean;
  flush(): void;
  setup(): void;
  dispose(): void;
}

let _serviceCache: VueMediaMatchService | undefined;

function createVueMediaMatchService(): VueMediaMatchService {
  const state = reactive({}) as MediaMatchServiceState;
  const bootState = ref<BootState>('pending');
  const listeners: MediaMatchListener[] = [];

  MEDIA_MATCH_CONDITIONS.forEach(({ key }) => {
    (state as any)[key] = false;
  });

  const isPending = () => bootState.value === 'pending';
  const isBooted = () => bootState.value === 'ready';

  function setup() {
    if (!IN_WINDOW || !isPending()) return;
    bootState.value = 'resvered';
    MEDIA_MATCH_CONDITIONS.forEach((define) => {
      const { key, condition } = define;
      const mql = window.matchMedia(condition);
      const handler = (ev: MediaQueryListEvent) => {
        state[key] = ev.matches;
      };
      const remove = () => {
        mql.removeEventListener('change', handler);
        arrayRemove(listeners, listener);
      };
      const listener: MediaMatchListener = {
        key,
        mql,
        handler,
        remove,
      };
      mql.addEventListener('change', handler);
      state[key] = mql.matches;
      listeners.push(listener);
    });
  }

  function matches(key: MediaMatchKey) {
    return state[key];
  }

  function flush() {
    for (const listener of listeners) {
      state[listener.key] = listener.mql.matches;
    }
  }

  function dispose() {
    for (const listener of listeners) {
      state[listener.key] = false;
      listener.remove();
    }
  }

  const service: VueMediaMatchService = function vueMediaMatchService(key) {
    return matches(key);
  };

  service.state = () => state;
  service.listeners = () => listeners;
  service.conditions = () => MEDIA_MATCH_CONDITIONS;
  service.bootState = () => bootState.value;
  service.isPending = isPending;
  service.isBooted = isBooted;
  service.matches = matches;
  service.flush = flush;
  service.setup = setup;
  service.dispose = dispose;

  return service;
}

export function getVueMediaMatchService(): VueMediaMatchService {
  if (!_serviceCache) {
    _serviceCache = createVueMediaMatchService();
  }
  return _serviceCache;
}
