import {
  ExtractPropTypes,
  SetupContext,
  PropType,
  provide,
  inject,
  watch,
  computed,
  ComputedRef,
  onBeforeUnmount,
  ref,
  Ref,
  VNodeChild,
} from 'vue';
import {
  createPropsOptions,
  VNodeChildOrSlot,
  TypedSlot,
  resolveVNodeChildOrSlot,
} from '@fastkit/vue-utils';
import {
  FormNodeType,
  createFormNodeProps,
  FormNodeControl,
  createFormNodeEmits,
  FormNodeContext,
  FormNodeControlBaseOptions,
} from './node';
import type { FormSelectorItemControl } from './selector-item';
import { FormSelectorInjectionKey } from '../injections';
import { IN_WINDOW, isPromise } from '@fastkit/helpers';

export const DEFAULT_FORM_SELECTOR_GROUP_ID = '__default__';

export interface FormSelectorItem {
  /** selection value */
  value: string | number;
  /** label */
  label: VNodeChildOrSlot<FormSelectorControl>;
  /** disabled state */
  disabled?: boolean;
}

export interface FormSelectorGroup {
  /** Group ID */
  id: string | number;
  /** label */
  label: VNodeChildOrSlot<FormSelectorControl>;
  /** disabled state */
  disabled?: boolean;
  /** List of choices */
  items: FormSelectorItem[];
}

export interface ResolvedFormSelectorItem
  extends Omit<FormSelectorItem, 'label'> {
  label: TypedSlot<FormSelectorControl>;
}

export interface ResolvedFormSelectorGroup
  extends Omit<FormSelectorGroup, 'label'> {
  label: TypedSlot<FormSelectorControl>;
  items: ResolvedFormSelectorItem[];
}

export type FormSelectorValue =
  | undefined
  | string
  | number
  | (string | number)[];

const modelValue = [String, Number, Array] as PropType<FormSelectorValue>;

// export type FormSelectorItems = FormSelectorItem[];
export type FormSelectorItemOrGroups = (FormSelectorItem | FormSelectorGroup)[];

export type RawFormSelectorItems =
  | FormSelectorItemOrGroups
  | ((
      selectorControl: FormSelectorControl,
    ) => Promise<FormSelectorItemOrGroups>);

/** Guard function context */
export interface FormSelectorGuardContext {
  /** @see {@link FormSelectorItemControl} */
  item: FormSelectorItemControl;
  /** @see {@link FormSelectorControl} */
  selector: FormSelectorControl;
  /** Choice click event */
  event: MouseEvent;
  /** Accept changes */
  accept: () => void;
}

/**
 * Handler to guard changes in selection state
 *
 * @param ctx - Guard function context
 *
 * @see {@link FormSelectorGuardContext}
 */
export type FormSelectorGuard = (
  ctx: FormSelectorGuardContext,
) => boolean | void | Promise<boolean | void>;

export function createFormSelectorProps(
  options: FormSelectorControlOptions = {},
) {
  const { defaultMultiple = false, defaultValidateTiming } = options;
  return {
    ...createFormNodeProps({
      defaultValidateTiming,
      modelValue,
    }),
    ...createPropsOptions({
      multiple: {
        type: Boolean,
        default: defaultMultiple,
      },
      items: {
        type: [Array, Function] as PropType<RawFormSelectorItems>,
        default: () => [],
      },
      /**
       * Handler before a clickable option is clicked and the selection state is changed.
       *
       * - If `false` is returned, the operation will be canceled.
       * - When passing an asynchronous process, all options will remain inactive until the process is completed.
       *
       * @see {@link FormSelectorGuard}
       */
      onClickItem: Function as PropType<FormSelectorGuard>,
    }),
  };
}

export type FormSelectorProps = ExtractPropTypes<
  ReturnType<typeof createFormSelectorProps>
>;

export function createFormSelectorEmits() {
  return {
    ...createFormNodeEmits({ modelValue }),
  };
}

export function createFormSelectorSettings(
  options?: FormSelectorControlOptions,
) {
  const props = createFormSelectorProps(options);
  const emits = createFormSelectorEmits();
  return { props, emits };
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface FormSelectorEmitOptions
  extends ReturnType<typeof createFormSelectorEmits> {}

export type FormSelectorContext = SetupContext<FormSelectorEmitOptions>;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface FormSelectorControlOptions extends FormNodeControlBaseOptions {
  defaultMultiple?: boolean;
  onSelectItem?: (item: FormSelectorItemControl, ev: MouseEvent) => any;
  onCancelSelect?: (item: FormSelectorItemControl, ev: MouseEvent) => any;
}

export type FormSelectorLoadState = 'ready' | 'loading' | 'error';

export class FormSelectorControl extends FormNodeControl<FormSelectorValue> {
  readonly parentNodeType?: FormNodeType;
  protected _itemGetters = ref<FormSelectorItemControl['_get'][]>([]);
  protected _items: ComputedRef<FormSelectorItemControl[]>;
  protected _notSelected: ComputedRef<boolean>;
  protected _allSelected: ComputedRef<boolean>;
  protected _indeterminate: ComputedRef<boolean>;
  protected _itemsLoadState = ref<FormSelectorLoadState>('ready');
  protected _propGroups: Ref<ResolvedFormSelectorGroup[]> = ref([]);
  protected __propItems: ComputedRef<RawFormSelectorItems>;
  protected _loadedItems: ComputedRef<ResolvedFormSelectorItem[]>;
  protected _selectedPropItems: ComputedRef<ResolvedFormSelectorItem[]>;
  // protected _propItems: Ref<ResolvedFormSelectorItem[]> = ref([]);
  protected _selectedValues: ComputedRef<(string | number)[]>;
  protected _selectedItems: ComputedRef<FormSelectorItemControl[]>;
  protected _onClickItem: ComputedRef<FormSelectorGuard | undefined>;
  protected _guardingItem: Ref<(() => FormSelectorItemControl) | undefined>;
  protected onSelectItem?: (
    item: FormSelectorItemControl,
    ev: MouseEvent,
  ) => any;
  protected onCancelSelect?: (
    item: FormSelectorItemControl,
    ev: MouseEvent,
  ) => any;

  get items() {
    return this._items.value;
  }

  get guardingItem() {
    return this._guardingItem.value?.();
  }

  get isGuardInProgress() {
    return !!this.guardingItem;
  }

  get notSelected() {
    return this._allSelected.value;
  }

  get allSelected() {
    return this._allSelected.value;
  }

  get indeterminate() {
    return this._indeterminate.value;
  }

  get propGroups() {
    return this._propGroups.value;
  }

  get loadedItems() {
    return this._loadedItems.value;
  }

  get selectedPropItems() {
    return this._selectedPropItems.value;
  }

  // get propItems() {
  //   return this._propItems.value;
  // }

  get selectedValues() {
    return this._selectedValues.value;
  }

  get selectedItems() {
    return this._selectedItems.value;
  }

  get itemsLoadState() {
    return this._itemsLoadState.value;
  }

  get itemsLoading() {
    return this.itemsLoadState === 'loading';
  }

  get itemsReady() {
    return this.itemsLoadState === 'ready';
  }

  get itemsLoadFailed() {
    return this.itemsLoadState === 'error';
  }

  get isDisabled() {
    return super.isDisabled || this.itemsLoading;
  }

  constructor(
    props: FormSelectorProps,
    ctx: FormSelectorContext,
    options: FormSelectorControlOptions = {},
  ) {
    super(props, ctx as unknown as FormNodeContext<FormSelectorValue>, {
      ...options,
      modelValue,
    });

    this._onClickItem = computed(() => props.onClickItem);
    this._guardingItem = ref();
    this.onSelectItem = options.onSelectItem;
    this.onCancelSelect = options.onCancelSelect;
    // this._syncValueForChoices = this._syncValueForChoices.bind(this);

    this._items = computed(() => {
      return this._itemGetters.value.map((_get) => _get());
    });

    this._notSelected = computed(() => {
      return this.selectedValues.length === 0;
    });

    this._allSelected = computed(() => {
      return this.selectedValues.length === this.items.length;
    });

    this._indeterminate = computed(() => {
      return !this.notSelected && !this.allSelected;
    });

    this._selectedValues = computed(() => {
      return this._safeMultipleValues();
    });

    this._selectedItems = computed(() => {
      const { selectedValues } = this;
      const items: FormSelectorItemControl[] = [];
      const { items: _items } = this;
      selectedValues.forEach((value) => {
        const hit = _items.find((item) => item.propValue === value);
        if (hit) items.push(hit);
      });
      return items;
    });

    (
      [
        '_syncValueForChoices',
        'getItems',
        'getItemValues',
        'sortValues',
        'selectAll',
        'unselectAll',
        'isNotSelected',
        'isAllSelected',
        'isIndeterminate',
        'toggle',
      ] as const
    ).forEach((fn) => {
      this[fn] = (this[fn] as any).bind(this);
    });

    // const setPropItems = (items: FormSelectorItems) => {
    //   this._propItems.value = items.map((item) => ({
    //     ...item,
    //     label: resolveVNodeChildOrSlot(item.label),
    //   }));
    //   this._itemsLoadState.value = 'ready';
    // };

    // const loadItems = () => {
    //   const { items } = props;

    //   if (typeof items !== 'function') {
    //     setPropItems(items);
    //     return;
    //   }

    //   setPropItems([]);
    //   this._itemsLoadState.value = 'loading';

    //   if (!IN_WINDOW) return;

    //   items(this)
    //     .then((result) => {
    //       if (props.items !== items) return;
    //       setPropItems(result);
    //     })
    //     .catch((_err) => {
    //       if (props.items !== items) return;
    //       this._itemsLoadState.value = 'error';
    //     });
    // };
    this.__propItems = computed(() => props.items);
    this._loadedItems = computed(() =>
      this.propGroups.map((group) => group.items).flat(),
    );

    this._selectedPropItems = computed(() => {
      const { selectedValues, loadedItems } = this;
      return loadedItems.filter(
        ({ value }) => value != null && selectedValues.includes(value),
      );
    });

    watch(
      () => props.items,
      () => {
        this.loadItems();
      },
      { immediate: true },
    );

    watch(
      () => this._value.value,
      (value) => {
        this._syncValueForChoices();
      },
      { immediate: true },
    );

    onBeforeUnmount(() => {
      delete this.onSelectItem;
      delete this.onCancelSelect;
      this._propGroups.value = [];
      this.clearGuard();
    });

    provide(FormSelectorInjectionKey, this);
  }

  emptyValue() {
    return this.multiple ? [] : undefined;
  }

  private _setPropItems(itemOrGroups: FormSelectorItemOrGroups) {
    const groups: ResolvedFormSelectorGroup[] = [];
    let defaultGroup: ResolvedFormSelectorGroup | undefined;

    itemOrGroups.forEach((itemOrGroup) => {
      if ('items' in itemOrGroup) {
        groups.push({
          ...itemOrGroup,
          label: resolveVNodeChildOrSlot(itemOrGroup.label),
          items: itemOrGroup.items.map((item) => ({
            ...item,
            label: resolveVNodeChildOrSlot(item.label),
          })),
        });
        return;
      }

      if (!defaultGroup) {
        defaultGroup = {
          id: DEFAULT_FORM_SELECTOR_GROUP_ID,
          label: () => undefined,
          items: [],
        };
        groups.push(defaultGroup);
      }

      defaultGroup.items.push({
        ...itemOrGroup,
        label: resolveVNodeChildOrSlot(itemOrGroup.label),
      });
    });
    this._propGroups.value = groups.filter((group) => !!group.items.length);
    this._itemsLoadState.value = 'ready';
  }

  renderSelectedPropItems(options?: {
    loading?: () => VNodeChild;
    empty?: () => VNodeChild;
    separator?: VNodeChild | (() => VNodeChild);
    item?: (item: ResolvedFormSelectorItem, index: number) => VNodeChild;
  }): VNodeChild {
    if (this.itemsLoading) {
      return options?.loading ? options.loading() : [];
    }
    const { selectedPropItems } = this;
    if (!selectedPropItems.length) {
      return options?.empty ? options.empty() : [];
    }

    const children: VNodeChild[] = [];
    const separator = options?.separator ?? ', ';
    selectedPropItems.forEach((item, index) => {
      if (index > 0) {
        children.push(
          typeof separator === 'function' ? separator() : separator,
        );
      }
      const child = options?.item
        ? options.item(item, index)
        : item.label(this);
      children.push(child);
    });
    return children;
  }

  loadItems() {
    const items = this.__propItems.value;

    if (typeof items !== 'function') {
      this._setPropItems(items);
      return;
    }

    this._setPropItems([]);
    this._itemsLoadState.value = 'loading';

    if (!IN_WINDOW) return;

    items(this)
      .then((result) => {
        if (this.__propItems.value !== items) return;
        this._setPropItems(result);
      })
      .catch((_err) => {
        if (this.__propItems.value !== items) return;
        this._itemsLoadState.value = 'error';
      });
  }

  protected _reCalcValues(changedSelectorItem?: FormSelectorItemControl) {
    if (this.multiple) {
      const values: (string | number)[] = [];
      const currentValues = this._safeMultipleValues();
      const usedValues: (string | number)[] = [];
      this.items.forEach((item) => {
        const { propValue } = item;
        propValue != null && usedValues.push(propValue);
        if (item.selected && propValue != null && !values.includes(propValue)) {
          values.push(propValue);
        }
      });
      currentValues.forEach((v) => {
        if (!usedValues.includes(v)) {
          values.push(v);
        }
      });
      this._currentValue.value = values;
    } else {
      if (changedSelectorItem) {
        if (changedSelectorItem.selected) {
          this._currentValue.value = changedSelectorItem.propValue;
          return;
        }
      }
      let value: string | number | undefined;
      for (const item of this.items) {
        if (item.selected) {
          value = item.propValue;
          break;
        }
      }
      this._currentValue.value = value;
    }
  }

  safeModelValue(
    value: any,
  ): undefined | string | number | (string | number)[] {
    if (value == null) {
      return this.emptyValue();
    }
    return this.multiple
      ? this._safeMultipleValues(value)
      : this._safeSingleValue(value);
  }

  protected _safeMultipleValues(_value = this.value): (string | number)[] {
    const values: (string | number)[] = Array.isArray(_value)
      ? _value
      : _value == null
      ? []
      : [_value];
    return values;
  }

  protected _safeSingleValue(_value = this.value): string | number | undefined {
    const value = Array.isArray(_value) ? _value[0] : _value;
    return value;
  }

  protected _syncValueForChoices(exclude?: FormSelectorItemControl) {
    if (this.multiple) {
      const { selectedValues } = this;

      this.items.forEach((item) => {
        if (item === exclude) return;
        const { propValue } = item;
        const newValue =
          propValue != null && selectedValues.includes(propValue);
        if (newValue !== item.selected) {
          item._setValueSilent(newValue);
        }
      });
    } else {
      const value = this._safeSingleValue();
      this.items.forEach((item) => {
        if (item === exclude) return;
        const { propValue } = item;
        const newValue = propValue === value;
        if (newValue !== item.selected) {
          item._setValueSilent(newValue);
        }
      });
    }
  }

  getItems(
    groupId?: string | number | (string | number)[],
    ignoreDisabled?: boolean,
  ) {
    let { items } = this;
    if (groupId) {
      const filter = Array.isArray(groupId) ? groupId : [groupId];
      items = items.filter(
        ({ groupId: _groupId }) =>
          _groupId != null && filter.includes(_groupId),
      );
    }
    return ignoreDisabled ? items.filter((item) => !item.isDisabled) : items;
  }

  getItemValues(
    group?: string | number | (string | number)[],
    ignoreDisabled?: boolean,
  ): (string | number)[] {
    const items = this.getItems(group, ignoreDisabled);
    const values: (string | number)[] = [];
    items.forEach((item) => {
      if (item.propValue != null) {
        values.push(item.propValue);
      }
    });
    return values;
  }

  sortValues(values: (string | number)[]) {
    const itemValues = this.getItemValues();
    return values.sort((a, b) => {
      const ai = itemValues.indexOf(a);
      const bi = itemValues.indexOf(b);
      if (ai < bi) return -1;
      if (ai > bi) return 1;
      return 0;
    });
  }

  selectAll(
    group?: string | number | (string | number)[],
    onlyGroup?: boolean,
  ) {
    if (!this.multiple) return;
    if (group == null || onlyGroup) {
      this.value = this.getItemValues(group, true);
      return;
    }
    const values = [...this.selectedValues];
    const itemValues = this.getItemValues(group, true);
    itemValues.forEach((value) => {
      if (!values.includes(value)) {
        values.push(value);
      }
    });
    this.value = this.sortValues(values);
  }

  unselectAll(group?: string | number | (string | number)[]) {
    if (!this.multiple) return;
    if (group == null) {
      this.value = [];
      return;
    }
    const itemValues = this.getItemValues(group);
    this.value = this.selectedValues.filter(
      (value) => !itemValues.includes(value),
    );
  }

  isNotSelected(group?: string | number | (string | number)[]) {
    if (group == null) {
      return this.notSelected;
    }
    const { selectedValues } = this;
    const itemValues = this.getItemValues(group);
    return itemValues.every((value) => !selectedValues.includes(value));
  }

  isAllSelected(group?: string | number | (string | number)[]) {
    if (group == null) {
      return this.allSelected;
    }
    const { selectedValues } = this;
    const itemValues = this.getItemValues(group, true);
    return itemValues.every((value) => selectedValues.includes(value));
  }

  isIndeterminate(group?: string | number | (string | number)[]) {
    if (group == null) {
      return this.indeterminate;
    }
    const values = this.selectedValues;
    const itemValues = this.getItemValues(group, true);
    const selectedValues = values.filter((value) => itemValues.includes(value));
    const { length: selectedLength } = selectedValues;
    return selectedLength > 0 && selectedLength < itemValues.length;
  }

  toggle(group?: string | number | (string | number)[]) {
    if (group == null || !this.multiple) {
      if (this.allSelected) {
        this.value = this.multiple ? [] : undefined;
      } else {
        const itemValues = this.getItemValues(undefined, true);
        this.value = this.multiple ? itemValues : itemValues[0];
      }
      return;
    }

    if (this.isAllSelected(group)) {
      this.unselectAll(group);
    } else {
      this.selectAll(group);
    }
  }

  handleSelectItem(item: FormSelectorItemControl, ev: MouseEvent) {
    this.onSelectItem && this.onSelectItem(item, ev);
  }

  clearGuard() {
    this._guardingItem.value = undefined;
  }

  handleClickItem(item: FormSelectorItemControl, ev: MouseEvent) {
    let accepted = false;
    const accept = () => {
      if (accepted) return;
      accepted = true;
      if (this.multiple) {
        item.toggle();
      } else {
        if (!item.selected) {
          item.select();
          this.handleSelectItem(item, ev);
        } else {
          this.onCancelSelect?.(item, ev);
        }
      }
    };

    const { value: onClickItem } = this._onClickItem;
    if (!onClickItem) {
      return accept();
    }

    const result = onClickItem({
      item,
      selector: this,
      event: ev,
      accept,
    });
    if (isPromise(result)) {
      this._guardingItem.value = () => item;
      result
        .then((result) => {
          this.clearGuard();
          if (result !== false) accept();
        })
        .catch((err) => {
          this.clearGuard();
          throw err;
        });
    } else {
      if (result !== false) accept();
    }
  }

  isSelected(value: string | number) {
    return this.selectedValues.includes(value);
  }

  expose() {
    const publicInterface = super.expose();
    return {
      ...publicInterface,
      selectorControl: this as FormSelectorControl,
      notSelected: this._notSelected,
      allSelected: this._allSelected,
      indeterminate: this._indeterminate,
      getItems: this.getItems,
      getItemValues: this.getItemValues,
      sortValues: this.sortValues,
      selectAll: this.selectAll,
      unselectAll: this.unselectAll,
      isNotSelected: this.isNotSelected,
      isAllSelected: this.isAllSelected,
      isIndeterminate: this.isIndeterminate,
      toggle: this.toggle,
      selectorItems: this._items,
      selectedValues: this._selectedValues,
      selectedItems: this._selectedItems,
      propGroups: this._propGroups,
    };
  }

  /** @private */
  _joinFromSelectorItem(item: FormSelectorItemControl) {
    const fn = item._get;
    const itemGetters = this._itemGetters.value;
    if (!itemGetters.includes(fn)) {
      itemGetters.push(fn);
      this._syncValueForChoices();
    }
  }

  /** @private */
  _leaveFromSelectorItem(item: FormSelectorItemControl) {
    const fn = item._get;
    const itemGetters = this._itemGetters.value;
    const index = itemGetters.indexOf(fn);
    if (index !== -1) {
      itemGetters.splice(index, 1);
    }
  }

  /** @private */
  _itemValueChangeHandler(changedSelectorItem: FormSelectorItemControl) {
    this._reCalcValues(changedSelectorItem);
  }
}

export function useParentFormSelector() {
  return inject(FormSelectorInjectionKey, null);
}

export function useFormSelectorControl(
  props: FormSelectorProps,
  ctx: FormSelectorContext,
  options?: FormSelectorControlOptions,
) {
  const control = new FormSelectorControl(props, ctx, options);
  return control;
}
