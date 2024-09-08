import { type MaybeRefOrGetter, computed, toValue, ref, onMounted } from 'vue';
import { temporaryObjectID } from '@fastkit/helpers';

/**
 * Retrieve the vnode key for the specified object.
 *
 * The key obtained from this function is intended to be used on the client side.
 * Please note that in non-browser environments, undefined will be returned.
 *
 * @param obj - The object from which to retrieve the key
 * @returns The key for the object
 */
export function getClientIterableKey(obj: WeakKey): number | undefined {
  return temporaryObjectID(obj, true);
}

export type IterableKeyDetectorCandidate = string;

const ITERABLE_KEY_DETECTOR_CANDIDATES: IterableKeyDetectorCandidate[] = [
  'id',
  '_id',
  'key',
  '_key',
  'value',
];

export function registerIterableKeyDetectorCandidates(
  candidates: IterableKeyDetectorCandidate[],
  replace?: boolean,
) {
  if (replace) {
    ITERABLE_KEY_DETECTOR_CANDIDATES.splice(
      0,
      ITERABLE_KEY_DETECTOR_CANDIDATES.length,
      ...candidates,
    );
  } else {
    ITERABLE_KEY_DETECTOR_CANDIDATES.push(...candidates);
  }
}

export type IterableKeyResolver<T = unknown> = (item: T) => string | undefined;

/**
 * Settings of the List Item Enumeration Key Detector
 */
export interface IterableKeyDetectorSettings<T = unknown> {
  /**
   * List of items
   */
  items: MaybeRefOrGetter<T[] | undefined>;
  /**
   * Detection criteria for item key
   *
   * - `string` If the item is an object, use the value of the specified property name as the key.
   * - `IterableKeyResolver (Function)` Retrieve the key using a custom function.
   * - `undefined` If the item is an object, detect the key from a list of candidates.
   *
   * @default undefined
   */
  itemKey?: MaybeRefOrGetter<string | IterableKeyResolver<T> | undefined>;
  /**
   * List of candidates for automatic detection
   */
  candidates?: MaybeRefOrGetter<IterableKeyDetectorCandidate[] | undefined>;
}

const resolveKeyValue = (
  value: unknown,
): string | undefined | Record<keyof any, unknown> => {
  if (
    typeof value === 'string' ||
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    value instanceof Date
  ) {
    return String(value);
  }
  if (value && typeof value === 'object') {
    return value as any;
  }
};

/**
 * List Item Enumeration Key Detector
 */
export interface IterableKeyDetector<T = unknown> {
  /**
   * List of items
   */
  get items(): T[];
  /**
   * Detect and return the key of enumerable items.
   *
   * @param item - item
   * @param defaultValue - default value
   */
  detect<D extends string | undefined>(item: T, defaultValue?: D): string | D;
}

/**
 * Initialize and retrieve the List Item Enumeration Key Detector
 *
 * @param settings - Settings of the List Item Enumeration Key Detector
 * @returns List Item Enumeration Key Detector
 *
 * @see {@link IterableKeyDetectorSettings}
 * @see {@link IterableKeyDetector}
 */
export function useIterableKeyDetector<T = unknown>(
  settings: IterableKeyDetectorSettings<T>,
): IterableKeyDetector<T> {
  let detectedItemKey: string | undefined;

  const mounted = ref(false);
  onMounted(() => {
    mounted.value = true;
  });

  const items = computed<T[]>(() => toValue(settings.items) || []);

  const candidates = computed<IterableKeyDetectorCandidate[]>(() => {
    const itemKey = toValue(settings.itemKey);
    const _candidates = [
      ...(toValue(settings.candidates) || []),
      ...ITERABLE_KEY_DETECTOR_CANDIDATES,
    ];
    if (typeof itemKey === 'string') {
      _candidates.unshift(itemKey);
    }
    return _candidates;
  });

  const detect = computed<IterableKeyResolver<T>>(() => {
    const itemKey = toValue(settings.itemKey);
    if (typeof itemKey === 'function') {
      return itemKey;
    }

    if (typeof itemKey === 'string') {
      detectedItemKey = itemKey;
    }

    return (item) => {
      let value = resolveKeyValue(item);
      if (typeof value === 'string') {
        return value;
      }

      if (value && typeof value === 'object') {
        if (detectedItemKey) {
          return resolveKeyValue(value[detectedItemKey]) as any;
        }

        const _candidates = candidates.value;
        let detected: string | undefined;
        for (const candidate of _candidates) {
          const _detected = resolveKeyValue(value[candidate]);
          if (typeof _detected === 'string') {
            detected = _detected;
            detectedItemKey = candidate;
            break;
          }
        }
        if (typeof detected === 'string') {
          value = detected;
        } else {
          const _key = mounted.value ? getClientIterableKey(value) : undefined;
          value = _key !== undefined ? String(_key) : undefined;
        }
      }
      return value;
    };
  });

  return {
    get items() {
      return items.value;
    },
    detect<D extends string | undefined>(
      item: T,
      defaultValue?: D,
    ): string | D {
      return (detect.value(item) ?? defaultValue) as string | D;
    },
  };
}
