import {
  ref,
  type Ref,
  computed,
  toValue,
  type SetupContext,
  onBeforeUpdate,
  // nextTick,
  toRaw,
  watch,
  markRaw,
  // getCurrentInstance,
} from 'vue';
import { getClientIterableKey } from '@fastkit/vue-utils';
import Sortable from 'sortablejs';
import { arrayRemove } from '@fastkit/helpers';
import {
  type SortableDirectiveValue,
  type SortableDirectiveElement,
  type ExtendedSortableEvent,
  type ExtendedSortableOptions,
  getSortableDirectiveContext,
} from '../directives/sortable';
import {
  type SortableData,
  type GroupOptions,
  type SortableEvent,
} from '../schema';
import { OPTION_NAMES } from '../schema/_internal';
import * as Styles from '../styles.css';

export type SortableUpdateType = 'add' | 'sort' | 'remove';

export interface SortableUpdateEntry<T extends SortableData = SortableData> {
  readonly type: SortableUpdateType;
  readonly oldIndex?: number;
  readonly newIndex?: number;
  get sameGroup(): boolean;
  get from(): SortableContext<T>;
  get to(): SortableContext<T>;
  get data(): T;
}

export type SortableUpdateEvent<T extends SortableData = SortableData> =
  ExtendedSortableEvent<SortableEvent, SortableContext<T>>;

export interface SortableUpdateContext<T extends SortableData = SortableData> {
  get event(): SortableUpdateEvent<T> | undefined;
  get sortable(): SortableContext<T>;
  get entries(): SortableUpdateEntry<T>[];
  get oldValues(): T[];
  get newValues(): T[];
  // get guardInProgress(): boolean;
}

export type SortableGuardResult = boolean | void;

export type SortableGuardReturn =
  | SortableGuardResult
  | Promise<SortableGuardResult>;

export type SortableUpdateGuardFn<T extends SortableData = SortableData> = (
  ctx: SortableUpdateContext<T>,
) => SortableGuardReturn;

export interface SortableProps<T extends SortableData = SortableData>
  extends ExtendedSortableOptions<SortableContext<T>> {
  modelValue?: T[];
  clone?: (source: T) => T;
  beforeUpdate?: SortableUpdateGuardFn<T>;
}

export interface SortableItemDetails<T extends SortableData = SortableData> {
  /** リスト内インデックス */
  get index(): number;
  /** リスト内でユニークなキー */
  get key(): string;
  get attrs(): Record<string, any>;
  get selected(): boolean;
  select(): void;
  data: T;
}

export interface SortableContext<T extends SortableData = SortableData> {
  get sortable(): Sortable | undefined;
  get el(): SortableDirectiveElement<T> | undefined;
  get id(): string;
  get group(): GroupOptions | undefined;
  get directiveValue(): SortableDirectiveValue<SortableContext<T>>;
  get disabled(): boolean;
  get items(): SortableItemDetails<T>[];
  get guardInProgress(): boolean;
  get canOperation(): boolean;
  get wrapperAttrs(): Record<string, any>;
  getIndexByData(data: T): number;
  // add(data: T): Promise<void>;
  replace(data: T, index: number): Promise<void>;
  getKeys(): string[];
  getKeyByData(data: T): string;
  getKeyByElement(el: HTMLElement): string;
  findDataByKey(key: string): T | undefined;
  getDataByKey(key: string): T;
  findElementByKey(key: string): HTMLElement;
  // _paring(resolver: SortableContextParingResolver): void;
  /**
   * @internal
   */
  get _guardController(): GuardController<T> | undefined;
}

const _SERVER_DEFAULT_KEY_ = 0;

export type SortableEmits<T extends SortableData = SortableData> = {
  'update:modelValue': (modelValue: T[]) => true;
};

interface GuardController<T extends SortableData = SortableData> {
  reserve(fn: (() => SortableGuardReturn) | undefined): void;
  ready(): Promise<void>;
  dispatch(): Promise<SortableGuardResult>;
}

const initGuardController = <T extends SortableData = SortableData>(
  event?: SortableUpdateEvent<T>,
): GuardController<T> => {
  const guards: ((() => SortableGuardReturn) | undefined)[] = [];
  const limit = event?.from === event?.to ? 1 : 2;
  const _readyPromises: (() => void)[] = [];
  let _dispatchPromise: Promise<SortableGuardResult> | undefined;

  const ready = (): Promise<void> => {
    if (guards.length >= limit) {
      for (const resolve of _readyPromises) {
        resolve();
      }
      _readyPromises.length = 0;
      return Promise.resolve();
    }
    return new Promise((resolve) => {
      _readyPromises.push(resolve);
    });
  };

  const reserve = (fn: (() => SortableGuardReturn) | undefined) => {
    guards.push(fn);
  };

  const dispatch = (): Promise<SortableGuardResult> => {
    if (!_dispatchPromise) {
      _dispatchPromise = Promise.all(guards.map((guard) => guard?.())).then(
        (results) =>
          results.some((result) => result === false) ? false : undefined,
      );
    }
    return _dispatchPromise;
  };

  return markRaw({
    reserve,
    ready,
    dispatch,
  });
};

export function useSortable<T extends SortableData = SortableData>(
  props: SortableProps<T>,
  { emit }: Pick<SetupContext<SortableEmits<T>>, 'emit'>,
): SortableContext<T> {
  let sortable: Sortable | undefined;
  const mounted = ref(false);
  const guardController = ref<GuardController<T>>();
  const id = crypto.randomUUID();
  const modelValue = ref(props.modelValue?.slice() || []) as Ref<T[]>;
  const isDisabled = computed(() => toValue(props.disabled) || false);
  const guardInProgress = computed(() => !!guardController.value);
  const canOperation = computed(
    () => !(isDisabled.value || guardInProgress.value),
  );
  const selectedKeys = ref<string[]>([]);
  let _items = [] as HTMLElement[];
  const dataIdAttr = computed(() => props.dataIdAttr || 'data-sortable-key');
  const wrapperAttrs = computed<Record<string, any>>(() => ({
    class: [
      guardInProgress.value && Styles.guardInProgress,
      !canOperation.value && Styles.disabled,
    ],
  }));

  const getKeys = () => sortable?.toArray() ?? [];

  const dispatchBeforeUpdate = async (
    entries: SortableUpdateEntry<T>[],
    oldValues: T[],
    newValues: T[],
    event?: SortableUpdateEvent<T>,
  ): Promise<SortableGuardResult> => {
    const { beforeUpdate } = props;
    const from = event?.from;
    const to = event?.to;

    if (!beforeUpdate && from === to) {
      return;
    }

    const guard: (() => SortableGuardReturn) | undefined =
      beforeUpdate &&
      (() => {
        const updateContext: SortableUpdateContext<T> = markRaw({
          get event() {
            return event;
          },
          get sortable() {
            return ctx;
          },
          get entries() {
            return entries;
          },
          get oldValues() {
            return oldValues;
          },
          get newValues() {
            return newValues;
          },
        });
        return beforeUpdate(updateContext);
      });

    const $from = from && getSortableDirectiveContext(from)?.ctx;
    const $to = to && getSortableDirectiveContext(to)?.ctx;

    const _guardController =
      $from?._guardController ||
      $to?._guardController ||
      initGuardController(event);
    guardController.value = _guardController;

    _guardController.reserve(guard);
    await _guardController.ready();

    try {
      return await _guardController.dispatch();
    } finally {
      guardController.value = undefined;
    }
  };

  const updateWithGuard = async (
    entries: SortableUpdateEntry<T>[],
    oldValues: T[],
    newValues: T[],
    event?: SortableUpdateEvent<T>,
  ): Promise<SortableGuardResult> => {
    let err: unknown;
    const result = await dispatchBeforeUpdate(
      entries,
      oldValues,
      newValues,
      event,
    ).catch((_err) => {
      err = _err;
      return false;
    });

    const from = event?.from;
    const to = event?.to;

    if (result === false) {
      if (!from || !to || from === to) {
        sortable?.sort(
          oldValues.map((data) => getKeyByData(data)),
          true,
        );
      } else if (event.type === 'remove' && sortable) {
        const { item, oldIndicies } = event;

        let els: HTMLElement[];
        if (oldIndicies.length > 0) {
          els = oldIndicies.map((i) => i.multiDragElement);
        } else {
          els = [item];
        }

        for (const el of els) {
          event.from.insertBefore(el, null);
        }

        sortable.sort(oldValues.map((data) => getKeyByData(data)));
      }

      if (err) {
        throw err;
      }
      return;
    }

    updateModelValue(newValues);
  };

  watch(
    () => props.modelValue,
    (newValue) => {
      modelValue.value = newValue?.slice() || [];
    },
    {
      deep: true,
    },
  );

  onBeforeUpdate(() => {
    _items = [];
  });

  const group = computed<GroupOptions | undefined>(() => {
    const _group = props.group;
    return typeof _group === 'string' ? { name: _group } : _group;
  });

  const getKeyByData = (data: T): string =>
    String(
      mounted.value
        ? (getClientIterableKey(data) ?? _SERVER_DEFAULT_KEY_)
        : _SERVER_DEFAULT_KEY_,
    );

  const getKeyByElement = (_el: HTMLElement): string => {
    const key = _el.getAttribute(dataIdAttr.value);
    if (!key) {
      throw new Error(`missing attribute at "${dataIdAttr.value}"`);
    }
    return key;
  };

  const findDataByKey = (key: string): T | undefined =>
    modelValue.value.find((data) => getKeyByData(data) === key);

  const getDataByKey = (key: string): T => {
    const hit = findDataByKey(key);
    if (!hit) {
      throw new Error(`missing data at "${key}"`);
    }
    return hit;
  };

  const findElementByKey = (key: string): HTMLElement =>
    (sortable?.el.querySelector(
      `[${dataIdAttr.value}="${key}"]`,
    ) as HTMLElement) ?? undefined;

  const items = computed<SortableItemDetails<T>[]>(() =>
    modelValue.value.map((data, index) => {
      const key = getKeyByData(data);
      const attrs = {
        key,
        [dataIdAttr.value]: key,
        ref: (_el: HTMLElement) => {
          _items[index] = _el;
        },
      };

      return {
        get index() {
          return index;
        },
        get key() {
          return key;
        },
        get attrs() {
          return attrs;
        },
        get data() {
          return data;
        },
        set data(_data) {
          replace(_data, index);
        },
        get selected() {
          return selectedKeys.value.includes(key);
        },
        select() {
          const _el = findElementByKey(key);
          _el && Sortable.utils.select(_el);
        },
      };
    }),
  );

  const updateModelValue = (newValues: T[]) => {
    modelValue.value = newValues;
    emit('update:modelValue', newValues);
  };

  const getIndexByData = (data: T): number => {
    const key = getKeyByData(data);
    return modelValue.value.findIndex((d) => getKeyByData(d) === key);
  };

  const replace = async (data: T, index: number): Promise<void> => {
    const oldValues = modelValue.value.slice();
    const newValues = oldValues.splice(index, 1, data);
    updateModelValue(newValues);
  };

  const _clone = (data: T): T => {
    const _data = toRaw(data);
    return props.clone ? props.clone(_data) : structuredClone(_data);
  };

  // const ensureAnimationEnd = () =>
  //   new Promise((resolve) => {
  //     nextTick().then(resolve);
  //   });

  // const focusItemByIndex = async (index: number) => {
  //   await nextTick();
  //   const item = _items.at(index);
  //   if (!item) return;
  //   await ensureAnimationEnd();
  //   _items.at(index)?.focus();
  // };

  // const focusItem = (data: T) => focusItemByIndex(getIndexByData(data));
  const _onMounted = (_sortable: Sortable) => {
    sortable = _sortable;
    mounted.value = true;
    // el = _sortable.el;
    // el[CONTEXT_SYMBOL] = ctx;
  };

  const _onEnd = async (event: SortableUpdateEvent<T>) => {
    const { oldIndex, newIndex, to } = event;

    // 違うSortableコンポーネントへの横断移動なので後続処理をスキップする ※フォーカス処理も移動後のコンポーネントで行われる
    if (to !== sortable?.el) {
      return;
    }

    if (oldIndex == null || newIndex == null || oldIndex === newIndex) {
      return;
    }

    const oldValues = modelValue.value.slice();
    const newValues = getKeys().map(getDataByKey);

    let newIndicies: number[];
    let oldIndicies: number[];

    if (event.newIndicies.length > 0) {
      newIndicies = event.newIndicies.map((i) => i.index);
      oldIndicies = event.oldIndicies.map((i) => i.index);
    } else {
      newIndicies = [newIndex];
      oldIndicies = [oldIndex];
    }

    const entries: SortableUpdateEntry<T>[] = newIndicies.map(
      (_newIndex, i) => {
        const _oldIndex = oldIndicies[i];
        const data = oldValues[_oldIndex];
        return {
          type: 'sort',
          oldIndex: _oldIndex,
          newIndex: _newIndex,
          sameGroup: true,
          from: ctx,
          to: ctx,
          data,
        };
      },
    );

    await updateWithGuard(entries, oldValues, newValues, event);

    // focusItem()
  };

  const _onAdd = async (event: SortableUpdateEvent<T>) => {
    const { oldIndex, newIndex } = event;

    if (!sortable || newIndex == null) {
      return;
    }

    let newIndicies: number[];
    let oldIndicies: (number | undefined)[];

    if (event.newIndicies.length > 0) {
      newIndicies = event.newIndicies.map((i) => i.index);
      oldIndicies = event.oldIndicies.map((i) => i.index);
    } else {
      newIndicies = [newIndex];
      oldIndicies = [oldIndex];
    }

    const from = getSortableDirectiveContext(event.from).ctx;
    const oldValues = modelValue.value.slice();
    const newValues = getKeys().map(
      (key) => findDataByKey(key) || _clone(from.getDataByKey(key)),
    );

    const entries: SortableUpdateEntry<T>[] = newIndicies.map(
      (_newIndex, i) => {
        const _oldIndex = oldIndicies[i];
        const data = newValues[_newIndex];
        return {
          type: 'add',
          oldIndex: _oldIndex,
          newIndex: _newIndex,
          sameGroup: false,
          from,
          to: ctx,
          data,
        };
      },
    );

    await updateWithGuard(entries, oldValues, newValues, event);
  };

  const _onRemove = async (event: SortableUpdateEvent<T>) => {
    const { oldIndex, newIndex } = event;

    if (!sortable || oldIndex == null) {
      return;
    }

    let newIndicies: (number | undefined)[];
    let oldIndicies: number[];

    if (event.newIndicies.length > 0) {
      newIndicies = event.newIndicies.map((i) => i.index);
      oldIndicies = event.oldIndicies.map((i) => i.index);
    } else {
      newIndicies = [newIndex];
      oldIndicies = [oldIndex];
    }

    const oldValues = modelValue.value.slice();
    const newValues = sortable.toArray().map((key) => {
      const hit = getDataByKey(key);
      if (!hit) {
        throw new Error(`missing data at "${key}"`);
      }
      return hit;
    });

    const to = getSortableDirectiveContext(event.to).ctx;

    const entries: SortableUpdateEntry<T>[] = oldIndicies.map(
      (_oldIndex, i) => {
        const _newIndex = newIndicies[i];
        const data = oldValues[oldIndex];
        return {
          type: 'remove',
          oldIndex: _oldIndex,
          newIndex: _newIndex,
          sameGroup: false,
          from: ctx,
          to,
          data,
        };
      },
    );

    await updateWithGuard(entries, oldValues, newValues, event);
  };

  const pushSelectedKey = (key: string) => {
    if (!selectedKeys.value.includes(key)) {
      selectedKeys.value.push(key);
    }
  };

  const removeSelectedKey = (key: string) => {
    arrayRemove(selectedKeys.value, key);
  };

  const _onSelect = async (event: SortableUpdateEvent<T>) => {
    pushSelectedKey(getKeyByElement(event.item));
    props.onSelect?.(event);
  };

  const _onDeselect = async (event: SortableUpdateEvent<T>) => {
    removeSelectedKey(getKeyByElement(event.item));
    props.onDeselect?.(event);
  };

  const inject = () => ctx;

  const directiveValue = computed<SortableDirectiveValue<SortableContext<T>>>(
    () => {
      const _directiveValue: SortableDirectiveValue<SortableContext<T>> = {
        inject,
        onMounted: _onMounted,
        onEnd: _onEnd,
        onAdd: _onAdd,
        onRemove: _onRemove,
        onSelect: _onSelect,
        onDeselect: _onDeselect,
        group: group.value,
        disabled: !canOperation.value,
      };
      for (const optionName of OPTION_NAMES) {
        if (optionName in _directiveValue) {
          continue;
        }
        const value = props[optionName];
        if (value !== undefined) {
          _directiveValue[optionName] = value as any;
        }
      }
      _directiveValue.dataIdAttr = dataIdAttr.value;

      return _directiveValue;
    },
  );

  const ctx: SortableContext<T> = markRaw({
    get sortable() {
      return sortable;
    },
    get el() {
      return sortable?.el as SortableDirectiveElement<T> | undefined;
    },
    get id() {
      return id;
    },
    get group() {
      return group.value;
    },
    get disabled() {
      return isDisabled.value;
    },
    get items() {
      return items.value;
    },
    get directiveValue() {
      return directiveValue.value;
    },
    get guardInProgress() {
      return guardInProgress.value;
    },
    get canOperation() {
      return canOperation.value;
    },
    get wrapperAttrs() {
      return wrapperAttrs.value;
    },
    get _guardController() {
      return guardController.value;
    },
    getIndexByData,
    replace,
    // add,
    getKeys,
    getKeyByData,
    getKeyByElement,
    findDataByKey,
    getDataByKey,
    findElementByKey,
  });

  return ctx;
}
