import { reactive, nextTick } from 'vue';
import { MediaMatchDefine } from '@fastkit/media-match';
import { arrayRemove } from '@fastkit/helpers';

export type MediaQueryServiceState<K extends string = string> = Record<
  K,
  boolean
>;

export type MediaQueryListener<K extends string = string> = {
  key: K;
  mql: MediaQueryList;
  handler: (ev: MediaQueryListEvent) => void;
  remove: () => void;
};

export interface MediaQueryServiceOptions {
  manual?: boolean;
}

export class MediaQueryService<K extends string = string> {
  readonly defines: MediaMatchDefine<K>[];
  readonly state: MediaQueryServiceState<K>;
  readonly listeners: MediaQueryListener<K>[] = [];

  constructor(
    defines: MediaMatchDefine<K>[],
    opts: MediaQueryServiceOptions = {},
  ) {
    this.defines = [...defines];

    const _state = {} as MediaQueryServiceState<K>;
    defines.forEach(({ key }) => {
      _state[key] = false;
    });

    this.state = reactive(_state) as MediaQueryServiceState<K>;
    this.matches = this.matches.bind(this);
    this.flush = this.flush.bind(this);

    if (!opts.manual) {
      this.setup();
    }
  }

  matches(key: K) {
    return this.state[key];
  }

  flush() {
    const { state, listeners } = this;
    for (const listener of listeners) {
      state[listener.key] = listener.mql.matches;
    }
  }

  setup() {
    if (!__BROWSER__) return;
    const { defines, state, listeners } = this;
    defines.forEach((define) => {
      const { key, condition } = define;
      const mql = window.matchMedia(condition);
      const handler = (ev: MediaQueryListEvent) => {
        state[key] = ev.matches;
      };
      const remove = () => {
        mql.removeEventListener('change', handler);
        arrayRemove(listeners, listener);
      };
      const listener: MediaQueryListener<K> = {
        key,
        mql,
        handler,
        remove,
      };
      mql.addEventListener('change', handler);
      state[key] = mql.matches;
      listeners.push(listener);
    });
    nextTick(this.flush);
  }

  dispose() {
    const { state, listeners } = this;
    for (const listener of listeners) {
      state[listener.key] = false;
      listener.remove();
    }
  }
}
