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
import { IN_WINDOW, isPromise, arrayRemove } from '@fastkit/helpers';
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
      /**
       * Multiple selection mode
       */
      multiple: {
        type: Boolean,
        default: defaultMultiple,
      },
      /**
       * List of selection items, group list, or asynchronous loader
       *
       * @see {@link RawFormSelectorItems}
       */
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
  readonly _props: FormSelectorProps;

  readonly parentNodeType?: FormNodeType;

  protected _items: Ref<FormSelectorItemControl[]> = ref([]);

  protected _itemsLoadState = ref<FormSelectorLoadState>('ready');

  protected _propGroups: Ref<ResolvedFormSelectorGroup[]> = ref([]);

  protected _loadedItems: ComputedRef<ResolvedFormSelectorItem[]>;

  protected _selectedPropItems: ComputedRef<ResolvedFormSelectorItem[]>;

  protected _selectedValues: ComputedRef<(string | number)[]>;

  protected _selectedItems: ComputedRef<FormSelectorItemControl[]>;

  protected _guardingItem: Ref<(() => FormSelectorItemControl) | undefined>;

  protected onSelectItem?: (
    item: FormSelectorItemControl,
    ev: MouseEvent,
  ) => any;

  protected onCancelSelect?: (
    item: FormSelectorItemControl,
    ev: MouseEvent,
  ) => any;

  /**
   * List of selection item nodes
   *
   * @see {@link FormSelectorItemControl}
   */
  get items(): FormSelectorItemControl[] {
    return this._items.value;
  }

  /**
   * Item currently undergoing selection guard process
   *
   * @see {@link FormSelectorItemControl}
   */
  get guardingItem(): FormSelectorItemControl | undefined {
    return this._guardingItem.value?.();
  }

  /**
   * In the process of selection guard
   */
  get isGuardInProgress(): boolean {
    return !!this.guardingItem;
  }

  /**
   * Not selected any
   */
  get notSelected(): boolean {
    return this.selectedValues.length === 0;
  }

  /**
   * Selected all items, including those in a disabled state
   */
  get allSelected(): boolean {
    return this.selectedValues.length === this.items.length;
  }

  /**
   * One or more items, including those in a disabled state, are selected, but not all of them
   */
  get indeterminate(): boolean {
    return !this.notSelected && !this.allSelected;
  }

  /**
   * List of selection groups resolved from properties
   *
   * @see {@link ResolvedFormSelectorGroup}
   */
  get propGroups(): ResolvedFormSelectorGroup[] {
    return this._propGroups.value;
  }

  /**
   * List of loaded items
   *
   * @see {@link ResolvedFormSelectorItem}
   */
  get loadedItems(): ResolvedFormSelectorItem[] {
    return this._loadedItems.value;
  }

  /**
   * List of selected property-specified items
   *
   * @see {@link ResolvedFormSelectorItem}
   */
  get selectedPropItems(): ResolvedFormSelectorItem[] {
    return this._selectedPropItems.value;
  }

  /**
   * List of selected values
   */
  get selectedValues(): (string | number)[] {
    return this._selectedValues.value;
  }

  /**
   * List of selected item nodes
   */
  get selectedItems(): FormSelectorItemControl[] {
    return this._selectedItems.value;
  }

  /**
   * Loading state of selection items
   *
   * @see {@link FormSelectorLoadState}
   */
  get itemsLoadState(): FormSelectorLoadState {
    return this._itemsLoadState.value;
  }

  /**
   * Loading items
   */
  get itemsLoading(): boolean {
    return this.itemsLoadState === 'loading';
  }

  /**
   * Items loaded
   */
  get itemsReady(): boolean {
    return this.itemsLoadState === 'ready';
  }

  /**
   * Failed to load items
   */
  get itemsLoadFailed(): boolean {
    return this.itemsLoadState === 'error';
  }

  get isDisabled(): boolean {
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
    this._props = props;

    this._guardingItem = ref();
    this.onSelectItem = options.onSelectItem;
    this.onCancelSelect = options.onCancelSelect;

    this._selectedValues = computed(() => this._safeMultipleValues());

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
      (_value) => {
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

  /**
   * Render selected property-specified items
   *
   * @param options - Options
   */
  renderSelectedPropItems(options?: {
    /**
     * Fallback specification for loading.
     */
    loading?: () => VNodeChild;
    /**
     * Fallback specification when nothing is selected
     */
    empty?: () => VNodeChild;
    /**
     * Separator for items when multiple selections are allowed
     */
    separator?: VNodeChild | (() => VNodeChild);
    /**
     * Renderer for customizing item rendering
     * @param item - Item
     * @param index - Index
     */
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

  /**
   * Load items
   */
  loadItems(): void {
    const { items } = this._props;

    if (typeof items !== 'function') {
      this._setPropItems(items);
      return;
    }

    this._setPropItems([]);
    this._itemsLoadState.value = 'loading';

    if (!IN_WINDOW) return;

    items(this)
      .then((result) => {
        if (this._props?.items !== items) return;
        this._setPropItems(result);
      })
      .catch((_err) => {
        if (this._props?.items !== items) return;
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
    // eslint-disable-next-line no-nested-ternary
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

  /**
   * Get the list of mounted selection nodes
   *
   * @param groupId - Group ID (for filtering)
   * @param ignoreDisabled - Ignore disabled items
   *
   * @see {@link FormSelectorItemControl}
   */
  getItems(
    groupId?: string | number | (string | number)[],
    ignoreDisabled?: boolean,
  ): FormSelectorItemControl[] {
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

  /**
   * Get the list of values of mounted selection nodes
   *
   * @param groupId - Group ID (for filtering)
   * @param ignoreDisabled - Ignore disabled items
   */
  getItemValues(
    groupId?: string | number | (string | number)[],
    ignoreDisabled?: boolean,
  ): (string | number)[] {
    const items = this.getItems(groupId, ignoreDisabled);
    const values: (string | number)[] = [];
    items.forEach((item) => {
      if (item.propValue != null) {
        values.push(item.propValue);
      }
    });
    return values;
  }

  /**
   * Sort the list of values in the order of currently mounted items
   * @param values - List of values to be sorted
   * @returns Sorted list of values
   */
  sortValues(values: (string | number)[]): (string | number)[] {
    const itemValues = this.getItemValues();
    return values.sort((a, b) => {
      const ai = itemValues.indexOf(a);
      const bi = itemValues.indexOf(b);
      if (ai < bi) return -1;
      if (ai > bi) return 1;
      return 0;
    });
  }

  /**
   * Select all items
   *
   * @param groupId - Group ID (for filtering)
   * @param deselectOtherGroups - Deselect items other than those in the specified group
   */
  selectAll(
    groupId?: string | number | (string | number)[],
    deselectOtherGroups?: boolean,
  ): void {
    if (!this.multiple) return;
    if (groupId == null || deselectOtherGroups) {
      this.value = this.getItemValues(groupId, true);
      return;
    }
    const values = [...this.selectedValues];
    const itemValues = this.getItemValues(groupId, true);
    itemValues.forEach((value) => {
      if (!values.includes(value)) {
        values.push(value);
      }
    });
    this.value = this.sortValues(values);
  }

  /**
   * Deselect items
   *
   * @param groupId - Group ID (for filtering)
   */
  unselectAll(groupId?: string | number | (string | number)[]): void {
    if (!this.multiple) return;
    if (groupId == null) {
      this.value = [];
      return;
    }
    const itemValues = this.getItemValues(groupId);
    this.value = this.selectedValues.filter(
      (value) => !itemValues.includes(value),
    );
  }

  /**
   * Check if it is not selected
   *
   * @param groupId - Group ID (for filtering)
   */
  isNotSelected(groupId?: string | number | (string | number)[]): boolean {
    if (groupId == null) {
      return this.notSelected;
    }
    const { selectedValues } = this;
    const itemValues = this.getItemValues(groupId);
    return itemValues.every((value) => !selectedValues.includes(value));
  }

  /**
   * Check if all are selected
   *
   * @param groupId - Group ID (for filtering)
   */
  isAllSelected(groupId?: string | number | (string | number)[]): boolean {
    if (groupId == null) {
      return this.allSelected;
    }
    const { selectedValues } = this;
    const itemValues = this.getItemValues(groupId, true);
    return itemValues.every((value) => selectedValues.includes(value));
  }

  /**
   * Check if the selection is in a partial state
   *
   * @param groupId - Group ID (for filtering)
   */
  isIndeterminate(groupId?: string | number | (string | number)[]): boolean {
    if (groupId == null) {
      return this.indeterminate;
    }
    const values = this.selectedValues;
    const itemValues = this.getItemValues(groupId, true);
    const selectedValues = values.filter((value) => itemValues.includes(value));
    const { length: selectedLength } = selectedValues;
    return selectedLength > 0 && selectedLength < itemValues.length;
  }

  /**
   * Toggle the selection state
   *
   * - If there is at least one unselected item, select all.
   * - If all are selected, deselect all.
   *
   * @param groupId - Group ID (for filtering)
   *
   */
  toggle(groupId?: string | number | (string | number)[]): void {
    if (groupId == null || !this.multiple) {
      if (this.allSelected) {
        this.value = this.multiple ? [] : undefined;
      } else {
        const itemValues = this.getItemValues(undefined, true);
        this.value = this.multiple ? itemValues : itemValues[0];
      }
      return;
    }

    if (this.isAllSelected(groupId)) {
      this.unselectAll(groupId);
    } else {
      this.selectAll(groupId);
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
      } else if (!item.selected) {
        item.select();
        this.handleSelectItem(item, ev);
      } else {
        this.onCancelSelect?.(item, ev);
      }
    };

    const { onClickItem } = this._props;
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
        .then((_result) => {
          this.clearGuard();
          if (_result !== false) accept();
        })
        .catch((err) => {
          this.clearGuard();
          throw err;
        });
    } else if (result !== false) accept();
  }

  /**
   * Check if the specified value is selected
   *
   * @param value - Value to check
   */
  isSelected(value: string | number): boolean {
    return this.selectedValues.includes(value);
  }

  /** @private */
  _joinFromSelectorItem(item: FormSelectorItemControl) {
    const { items } = this;
    if (!items.includes(item)) {
      items.push(item);
      this._syncValueForChoices();
    }
  }

  /** @private */
  _leaveFromSelectorItem(item: FormSelectorItemControl) {
    arrayRemove(this.items, item);
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
