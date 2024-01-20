import {
  ExtractPropTypes,
  SetupContext,
  ComputedRef,
  computed,
  provide,
  inject,
  onBeforeUnmount,
} from 'vue';
import { createPropsOptions } from '@fastkit/vue-utils';
import { FormNodeType, FormNodeControlBaseOptions } from './node';
import { FormSelectorControl, useParentFormSelector } from './selector';
import { FormSelectorItemGroupInjectionKey } from '../injections';

export function createFormSelectorItemGroupProps() {
  return {
    ...createPropsOptions({
      /** disabled state */
      disabled: Boolean,
      /** Group ID */
      groupId: {
        type: [String, Number],
        required: true,
      },
    }),
  };
}

export type FormSelectorItemGroupProps = ExtractPropTypes<
  ReturnType<typeof createFormSelectorItemGroupProps>
>;

export type FormSelectorItemGroupContext = SetupContext;

export interface FormSelectorItemGroupControlOptions
  extends FormNodeControlBaseOptions {
  parentNodeType?: FormNodeType;
}

/**
 * Selection group node
 */
export class FormSelectorItemGroupControl {
  readonly _props: FormSelectorItemGroupProps;

  readonly parentNodeType?: FormNodeType;

  protected _parentSelector: FormSelectorControl | null = null;

  readonly groupId!: string | number;

  protected _notSelected: ComputedRef<boolean>;

  protected _allSelected: ComputedRef<boolean>;

  protected _indeterminate: ComputedRef<boolean>;

  /**
   * Selector node
   *
   * @see {@link FormSelectorControl}
   */
  get parentSelector(): FormSelectorControl {
    const { _parentSelector } = this;
    if (!_parentSelector) {
      throw new Error('missing parent selector.');
    }
    return _parentSelector;
  }

  /**
   * Disabled state
   */
  get isDisabled(): boolean {
    return this.parentSelector.isDisabled || this._props.disabled;
  }

  /**
   * No items in this group are selected
   */
  get isNotSelected(): boolean {
    return this._notSelected.value;
  }

  /**
   * All items in this group are selected
   */
  get isAllSelected(): boolean {
    return this._allSelected.value;
  }

  /**
   * One or more items in this group are selected, but not all of them
   */
  get isIndeterminate(): boolean {
    return this._indeterminate.value;
  }

  /**
   * The parent selector is in multiple selection mode
   */
  get multiple(): boolean {
    return this.parentSelector.multiple;
  }

  constructor(
    props: FormSelectorItemGroupProps,
    ctx: FormSelectorItemGroupContext,
    options: FormSelectorItemGroupControlOptions = {},
  ) {
    this._props = props;
    this.parentNodeType = options.parentNodeType;
    this.groupId = props.groupId;

    const parentSelector = useParentFormSelector();
    if (
      !parentSelector ||
      (!!this.parentNodeType && this.parentNodeType !== parentSelector.nodeType)
    ) {
      throw new Error('missing parent selector.');
    }

    this._parentSelector = parentSelector;

    this._notSelected = computed(() =>
      parentSelector.isNotSelected(this.groupId),
    );

    this._allSelected = computed(() =>
      parentSelector.isAllSelected(this.groupId),
    );

    this._indeterminate = computed(() =>
      parentSelector.isIndeterminate(this.groupId),
    );

    onBeforeUnmount(() => {
      this._parentSelector = null;
      delete (this as any)._props;
    });

    provide(FormSelectorItemGroupInjectionKey, this);
  }

  /**
   * Toggle the selection state of this group
   *
   * - If there is at least one unselected item, select all.
   * - If all are selected, deselect all.
   */
  toggle(): void {
    return this.parentSelector.toggle(this.groupId);
  }

  /**
   * Select all items in this group
   */
  selectAll(): void {
    return this.parentSelector.selectAll(this.groupId);
  }

  /**
   * Deselect all items in this group
   */
  unselectAll(): void {
    return this.parentSelector.unselectAll(this.groupId);
  }
}

export function useParentFormSelectorItemGroup(
  parentSelector: FormSelectorControl,
) {
  const groupControl = inject(FormSelectorItemGroupInjectionKey, null);
  if (!groupControl || groupControl.parentSelector !== parentSelector)
    return null;
  return groupControl;
}

export function useFormSelectorItemGroupControl(
  props: FormSelectorItemGroupProps,
  ctx: FormSelectorItemGroupContext,
  options?: FormSelectorItemGroupControlOptions,
) {
  const control = new FormSelectorItemGroupControl(props, ctx, options);
  return control;
}
