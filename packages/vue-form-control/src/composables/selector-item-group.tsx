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
      disabled: Boolean,
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

export class FormSelectorItemGroupControl {
  readonly parentNodeType?: FormNodeType;
  protected _parentSelector: FormSelectorControl | null = null;
  readonly groupId!: string | number;
  protected _disabled: ComputedRef<boolean>;
  protected _notSelected: ComputedRef<boolean>;
  protected _allSelected: ComputedRef<boolean>;
  protected _indeterminate: ComputedRef<boolean>;

  get parentSelector() {
    return this._parentSelector;
  }

  get isDisabled() {
    return this._disabled.value;
  }

  get isNotSelected() {
    return this._notSelected.value;
  }

  get isAllSelected() {
    return this._allSelected.value;
  }

  get isIndeterminate() {
    return this._indeterminate.value;
  }

  constructor(
    props: FormSelectorItemGroupProps,
    ctx: FormSelectorItemGroupContext,
    options: FormSelectorItemGroupControlOptions = {},
  ) {
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

    this._disabled = computed(() => {
      return parentSelector.isDisabled || props.disabled;
    });

    this._notSelected = computed(() => {
      return parentSelector.isNotSelected(this.groupId);
    });

    this._allSelected = computed(() => {
      return parentSelector.isAllSelected(this.groupId);
    });

    this._indeterminate = computed(() => {
      return parentSelector.isIndeterminate(this.groupId);
    });

    onBeforeUnmount(() => {
      this._parentSelector = null;
    });

    provide(FormSelectorItemGroupInjectionKey, this);
  }

  expose() {
    return {
      groupControl: this as FormSelectorItemGroupControl,
      isDisabled: this._disabled,
      isNotSelected: this._notSelected,
      isAllSelected: this._allSelected,
      isIndeterminate: this._indeterminate,
    };
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
