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
    ...createFormNodeProps({ modelValue: Boolean }),
    ...createPropsOptions({
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
  readonly parentNodeType?: FormNodeType;
  protected _parentSelector: FormSelectorControl | null = null;
  protected _groupControl: FormSelectorItemGroupControl | null = null;
  readonly propValue?: string | number;
  // readonly group?: string | number;
  protected _multiple: ComputedRef<boolean>;
  protected _hasValue: ComputedRef<boolean>;
  protected _defaultSlot: ComputedRef<Slot>;

  // renderLabel

  get parentSelector() {
    return this._parentSelector;
  }

  get groupControl() {
    return this._groupControl;
  }

  get groupId() {
    const { groupControl } = this;
    if (!groupControl) return null;
    return groupControl.groupId;
  }

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

  get multiple() {
    return this._multiple.value;
  }

  get inputType(): FormSelectorItemInputType {
    return this.multiple ? 'checkbox' : 'radio';
  }

  get hasValue() {
    return this._hasValue.value;
  }

  _get() {
    return this;
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

    // ctx.slots

    (
      [
        '_get',
        '_valueChangeHandler',
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
    this._defaultSlot = computed(() => {
      return ctx.slots.default || (() => []);
    });

    const _name = this._name;
    this._name = computed(() => {
      const name = _name.value;
      if (name != null) return name;
      const { parentSelector } = this;
      if (!parentSelector) return;
      const parentName = parentSelector.name;
      if (parentName == null) return;
      return parentSelector.multiple ? `${parentName}[]` : parentName;
    });

    const _isDisabled = this._isDisabled;
    this._isDisabled = computed(() => {
      return (
        _isDisabled.value ||
        (!!this.groupControl && this.groupControl.isDisabled)
      );
    });

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
    this._parentSelector && this._parentSelector._itemValueChangeHandler(this);
  }

  select() {
    this.value = true;
  }

  unselect() {
    this.value = false;
  }

  toggle() {
    this.value = !this.value;
  }

  expose() {
    const publicInterface = super.expose();
    return {
      ...publicInterface,
      selectorItemControl: this as FormSelectorItemControl,
      selected: this._currentValue,
      computedMultiple: this._multiple,
      propValue: this.propValue,
      hasValue: this._hasValue,
    };
  }

  /** @private */
  _setValueSilent(value: boolean) {
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
        onChange={(ev) => {
          this.selected = (ev.target as HTMLInputElement).checked;
        }}
        value={this.propValue}
        onClick={this.handleClickInputElement}
      />
    );
  }

  handleClickInputElement(ev: MouseEvent) {
    if (this.canOperation && this.selected) {
      this.parentSelector && this.parentSelector.handleSelectItem(this, ev);
    }
  }

  handleClickElement(ev: MouseEvent) {
    if (this.canOperation) {
      this.parentSelector && this.parentSelector.handleClickItem(this, ev);
    }
  }

  /**
   * @override
   */
  focusHandler(ev: FocusEvent) {
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
