export interface MediaMatchKeyMap {} // eslint-disable-line @typescript-eslint/no-empty-interface

// eslint-disable-next-line @typescript-eslint/ban-types
type ExtractKeys<T extends object, D> = keyof T extends never ? D : keyof T;

export type MediaMatchKey = ExtractKeys<MediaMatchKeyMap, '__MediaMatchKey__'>;

export interface MediaMatchCondition {
  key: MediaMatchKey;
  condition: string;
  description: string;
}

export class MediaMatchConditions {
  private _array: MediaMatchCondition[] = [];
  private _at: Record<MediaMatchKey, MediaMatchCondition> = {} as any;
  private _conditionProxy: Record<MediaMatchKey, string>;

  get at() {
    return this._at;
  }

  get condition() {
    return this._conditionProxy;
  }

  constructor() {
    this._conditionProxy = new Proxy({} as Record<MediaMatchKey, string>, {
      get: (target, prop) => {
        return this._at[prop as MediaMatchKey].condition;
      },
    });
  }

  forEach(
    callbackfn: (
      value: MediaMatchCondition,
      index: number,
      array: MediaMatchCondition[],
    ) => void,
    thisArg?: any,
  ) {
    return this._array.forEach(callbackfn, thisArg);
  }

  push(...items: MediaMatchCondition[]): number {
    const length = this._array.push(...items);
    items.forEach((item) => {
      this._at[item.key] = { ...item };
    });
    return length;
  }
}

export const MEDIA_MATCH_CONDITIONS = new MediaMatchConditions();

export function registerMediaMatchConditions(
  conditions: MediaMatchCondition[],
) {
  MEDIA_MATCH_CONDITIONS.push(...conditions);
  return MEDIA_MATCH_CONDITIONS;
}
