import { EV } from '@fastkit/ev';
import { ref, VNode, ComputedRef, computed } from 'vue';

export type SuspenseRouteSource = VNode;

export interface SuspenseRouteBucketPayload {
  bucket: SuspenseRouteBucket;
  source: SuspenseRouteSource;
}

export interface SuspenseRouteBucketEventMap {
  push: SuspenseRouteBucketPayload;
  remove: SuspenseRouteBucketPayload;
  start: SuspenseRouteBucketPayload;
  finish: SuspenseRouteBucketPayload;
}

export interface SuspenseRouteBucketProgress {
  total: number;
  resolved: number;
}

class SuspenseRouteBucket extends EV<SuspenseRouteBucketEventMap> {
  private readonly _sources = ref<SuspenseRouteSource[]>([]);
  private readonly _total = ref(0);
  private readonly _progress: ComputedRef<SuspenseRouteBucketProgress>;

  get sources() {
    return this._sources.value;
  }

  get total() {
    return this._total.value;
  }

  get progress() {
    return this._progress.value;
  }

  constructor() {
    super();
    this._progress = computed(() => {
      const { total, sources } = this;
      return {
        total,
        resolved: total - sources.length,
      };
    });
    this.push = this.push.bind(this);
    this.remove = this.remove.bind(this);
  }

  push(source?: SuspenseRouteSource) {
    if (!source) return;
    const { sources } = this;
    if (!sources.includes(source)) {
      sources.push(source);
      this._total.value++;
      const payload: SuspenseRouteBucketPayload = { bucket: this, source };
      this.emit('push', payload);
      if (sources.length === 1) {
        this.emit('start', payload);
      }
    }
  }

  remove(source?: SuspenseRouteSource) {
    if (!source) return;
    const { sources } = this;
    const index = sources.indexOf(source);
    if (index !== -1) {
      sources.splice(index, 1);
      const payload: SuspenseRouteBucketPayload = { bucket: this, source };
      this.emit('remove', payload);
      if (sources.length === 0) {
        this._total.value = 0;
        this.emit('finish', payload);
      }
    }
  }

  ensureReady() {
    return new Promise<void>((resolve) => {
      const { total } = this;
      if (total === 0) return resolve();
      this.once('finish', () => {
        resolve();
      });
    });
  }
}

let _suspenseRouteBucket: SuspenseRouteBucket | undefined;

export function getSuspenseRouteBucket() {
  if (!_suspenseRouteBucket) {
    _suspenseRouteBucket = new SuspenseRouteBucket();
  }
  return _suspenseRouteBucket;
}
