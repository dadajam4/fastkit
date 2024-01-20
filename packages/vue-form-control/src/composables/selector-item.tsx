import {
  ExtractPropTypes,
  SetupContext,
  onBeforeUnmount,
  watch,
  InputHTMLAttributes,
  ComputedRef,
  computed,
  Slot,
} from 'vue';
import { createPropsOptions } from '@fastkit/vue-utils';
import {
  FormNodeType,
  createFormNodeProps,
  FormNodeControl,
  createFormNodeEmits,
  FormNodeContext,
  FormNodeControlBaseOptions,
} from './node';
import { FormSelectorControl, useParentFormSelector } from './selector';
import {
  FormSelectorItemGroupControl,
  useParentFormSelectorItemGroup,
} from './selector-item-group';

export function createFormSelectorItemProps() {
  return {
    ...createFormNodeProps({
      modelValue: Boolean,
      defaultValidateTiming: 'change',
    }),
    ...createPropsOptions({
      /** selection value */
      value: {
        type: [String, Number],
        // default: '',
      },
    }),
  };
}

export type FormSelectorItemProps = ExtractPropTypes<
  ReturnType<typeof createFormSelectorItemProps>
>;

export function createFormSelectorItemEmits() {
  return {
    ...createFormNodeEmits({ modelValue: Boolean }),
  };
}

export function createFormSelectorItemSettings() {
  const props = createFormSelectorItemProps();
  const emits = createFormSelectorItemEmits();
  return { props, emits };
}

export type FormSelectorItemInputType = 'checkbox' | 'radio';

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface FormSelectorItemEmitOptions
  extends ReturnType<typeof createFormSelectorItemEmits> {}

export type FormSelectorItemContext = SetupContext<FormSelectorItemEmitOptions>;

export interface FormSelectorItemControlOptions
  extends FormNodeControlBaseOptions {
  parentNodeType?: FormNodeType;
}

export class FormSelectorItemControl extends FormNodeControl<boolean> {
  readonly _props: FormSelectorItemProps;

  readonly parentNodeType?: FormNodeType;

  protected _parentSelector: FormSelectorControl | null = null;

  protected _groupControl: FormSelectorItemGroupControl | null = null;

  readonly propValue?: string | number;

  // readonly group?: string | number;
  protected _multiple: ComputedRef<boolean>;

  protected _hasValue: ComputedRef<boolean>;

  protected _defaultSlot: ComputedRef<Slot>;

  /**
   * Selector node
   *
   * @see {@link FormSelectorControl}
   */
  get parentSelector(): FormSelectorControl | null {
    return this._parentSelector;
  }

  /**
   * The parent selector is currently executing the selection guard process for this item
   */
  get isGuardInProgress(): boolean {
    return this.parentSelector?.guardingItem === this;
  }

  /**
   * Selection group node
   *
   * @see {@link FormSelectorItemGroupControl}
   */
  get groupControl(): FormSelectorItemGroupControl | null {
    return this._groupControl;
  }

  /**
   * Selection group ID
   */
  get groupId(): string | number | null {
    const { groupControl } = this;
    if (!groupControl) return null;
    return groupControl.groupId;
  }

  /**
   * Selection state
   */
  get selected() {
    return this._currentValue.value;
  }

  set selected(selected) {
    if (typeof selected !== 'boolean') {
      selected = selected === this.propValue;
    }
    if (this._currentValue.value !== selected) {
      this._currentValue.value = selected;
    }
  }

  /**
   * The parent selector is in multiple selection mode
   */
  get multiple() {
    return this._multiple.value;
  }

  /**
   * Input type
   *
   * @see {@link FormSelectorItemInputType}
   */
  get inputType(): FormSelectorItemInputType {
    return this.multiple ? 'checkbox' : 'radio';
  }

  /** Has a value */
  get hasValue() {
    return this._hasValue.value;
  }

  renderDefaultSlot() {
    return this._defaultSlot.value(this);
  }

  constructor(
    props: FormSelectorItemProps,
    ctx: FormSelectorItemContext,
    options: FormSelectorItemControlOptions = {},
  ) {
    super(props, ctx as unknown as FormNodeContext<boolean>, {
      ...options,
      modelValue: Boolean,
    });
    this._props = props;

    (
      [
        '_valueChangeHandler',
        'handleChange',
        'handleClickInputElement',
        'handleClickElement',
      ] as const
    ).forEach((fn) => {
      const _fn = this[fn] as any;
      this[fn] = _fn.bind(this);
    });

    this.parentNodeType = options.parentNodeType;
    this.propValue = props.value;
    // this.group = props.group;

    this._name = computed(() => {
      if (props.name) return props.name;
      if (this.parentSelector) return this.parentSelector.name;
      return undefined;
    });

    this._multiple = computed(() => {
      if (this._parentSelector) {
        return this._parentSelector.multiple;
      }
      return false;
    });
    this._hasValue = computed(() => {
      const { propValue } = this;
      return propValue != null && propValue !== '';
    });
    this._defaultSlot = computed(() => ctx.slots.default || (() => []));

    const { _name } = this;
    this._name = computed(() => {
      const name = _name.value;
      if (name != null) return name;
      const { parentSelector } = this;
      if (!parentSelector) return;
      const parentName = parentSelector.name;
      if (parentName == null) return;
      return parentSelector.multiple ? `${parentName}[]` : parentName;
    });

    const { _isDisabled } = this;
    this._isDisabled = computed(
      () =>
        _isDisabled.value ||
        !!this.groupControl?.isDisabled ||
        !!this.parentSelector?.isGuardInProgress,
    );

    watch(() => this._value.value, this._valueChangeHandler, {
      immediate: true,
    });

    if (this.parentNodeType) {
      const parentSelector = useParentFormSelector();

      if (parentSelector && parentSelector.nodeType === this.parentNodeType) {
        this._parentSelector = parentSelector;
        parentSelector._joinFromSelectorItem(this);

        this._groupControl = useParentFormSelectorItemGroup(parentSelector);

        onBeforeUnmount(() => {
          parentSelector._leaveFromSelectorItem(this);
          this._parentSelector = null;
          this._groupControl = null;
        });
      }
    }
  }

  emptyValue() {
    return false;
  }

  protected _valueChangeHandler(value: boolean) {
    if (this._parentSelector) {
      this._parentSelector &&
        this._parentSelector._itemValueChangeHandler(this);
    } else if (value && !this.multiple && this.currentEl && this.name) {
      const query = `input[name="${this.name}"]`;
      const myInput = this.currentEl.querySelector(query);
      if (!myInput) return;
      const siblings: NodeListOf<HTMLInputElement> =
        document.querySelectorAll(query);
      siblings.forEach((sibling) => {
        if (sibling === myInput) return;
        sibling.checked = false;
        sibling.dispatchEvent(new Event('change'));
      });
    }
  }

  /** Select */
  select(): void {
    this.value = true;
  }

  /** Deselect */
  unselect(): void {
    this.value = false;
  }

  /** Toggle selection state */
  toggle(): void {
    this.value = !this.value;
  }

  /** @internal */
  _setValueSilent(value: boolean): void {
    this._value.value = value;
  }

  createInputElement(
    override: Pick<InputHTMLAttributes, 'class'> & {
      type?: FormSelectorItemInputType;
    } = {},
  ) {
    return (
      <input
        class={override.class}
        type={override.type || this.inputType}
        name={this.name}
        tabindex={this.tabindex}
        onFocus={this.focusHandler}
        onBlur={this.blurHandler}
        readonly={this.isReadonly}
        disabled={this.isDisabled || this.isReadonly}
        // v-model={this.selected}
        checked={this.selected}
        value={this.propValue}
        onChange={this.handleChange}
        onClick={this.handleClickInputElement}
      />
    );
  }

  handleChange(ev: Event): void {
    this.selected = (ev.target as HTMLInputElement).checked;
  }

  handleClickInputElement(ev: MouseEvent): void {
    if (this.canOperation && this.selected) {
      this.parentSelector && this.parentSelector.handleSelectItem(this, ev);
    }
  }

  handleClickElement(ev: MouseEvent): void {
    if (this.canOperation) {
      this.parentSelector && this.parentSelector.handleClickItem(this, ev);
    }
  }

  /**
   * @override
   */
  focusHandler(ev: FocusEvent): void {
    super.focusHandler(ev);
    const { parentSelector } = this;
    parentSelector && parentSelector.focusHandler(ev);
  }
}

export function useFormSelectorItemControl(
  props: FormSelectorItemProps,
  ctx: FormSelectorItemContext,
  options?: FormSelectorItemControlOptions,
) {
  const control = new FormSelectorItemControl(props, ctx, options);
  return control;
}
