import {
  ExtractPropTypes,
  PropType,
  SetupContext,
  computed,
  ComputedRef,
  onBeforeUnmount,
  VNodeChild,
  Ref,
  ref,
  provide,
  markRaw,
} from 'vue';
import {
  createPropsOptions,
  VNodeChildOrSlot,
  resolveVNodeChildOrSlots,
  TypedSlot,
  cleanupEmptyVNodeChild,
  DefineSlotsType,
} from '@fastkit/vue-utils';
import {
  FormNodeControl,
  FormNodeErrorSlots,
  FormNodeErrorSlotsSource,
  FormNodeErrorMessageSource,
} from './node';
import type { VueFormService } from '../service';
import { useVueForm, FormNodeWrapperInjectionKey } from '../injections';
import { arrayRemove } from '@fastkit/helpers';

const EMPTY_MESSAGE = '\xa0'; // for keep height

export type RequiredChipSource = (() => VNodeChild) | string | boolean;

export type FormNodeWrapperHinttip = boolean | string | (() => VNodeChild);

export type FormNodeWrapperHinttipDelay = 'click' | number;

export type FormNodeWrapperSlots = DefineSlotsType<
  {
    /** label */
    label?: (wrapper: FormNodeWrapper) => any;
    /** hint message */
    hint?: (wrapper: FormNodeWrapper) => any;
    /** Elements to be added to the information message */
    infoAppends?: (wrapper: FormNodeWrapper) => any;
  } & FormNodeErrorSlots
>;

export function createFormNodeWrapperProps() {
  return {
    ...createPropsOptions({
      /**
       * Instance of FormNodeControl
       *
       * When this setting is applied, the state and error messages will always refer to the state of this node. If not set, it will attempt to compute them from descendant nodes.
       */
      nodeControl: {} as PropType<FormNodeControl>,
      /** label */
      label: {} as PropType<VNodeChildOrSlot>,
      /** hint message */
      hint: {} as PropType<VNodeChildOrSlot>,
      /** Settings for displaying hint as tips */
      hinttip: [Boolean, String, Function] as PropType<FormNodeWrapperHinttip>,
      /** hint tip Display Delay */
      hinttipDelay: [String, Number] as PropType<FormNodeWrapperHinttipDelay>,
      /** Elements to be added to the information message */
      infoAppends: {} as PropType<VNodeChildOrSlot>,
      /** Hide information */
      hiddenInfo: Boolean,
      /** Chip(required) display settings */
      requiredChip: {} as PropType<RequiredChipSource>,
      /**
       * Collect the error messages of all nodes belonging to this node
       *
       * By default, a node attempts to render error messages on its own, but enabling this setting allows the parent wrapper to manage the rendering of error messages.
       * If you want to exclude a specific node from this configuration, enable the `showOwnErrors` setting for that node.
       *
       * @default true
       */
      collectErrorMessages: {
        type: Boolean,
        default: true,
      },
    }),
  };
}

export type FormNodeWrapperProps = ExtractPropTypes<
  ReturnType<typeof createFormNodeWrapperProps>
>;

export function createFormNodeWrapperEmits() {
  return {
    clickLabel: (ev: MouseEvent, wrapper: FormNodeWrapper) => true,
  };
}

export type FormNodeWrapperEmitOptions = ReturnType<
  typeof createFormNodeWrapperEmits
>;

export function createFormNodeWrapperSettings() {
  const props = createFormNodeWrapperProps();
  const emits = createFormNodeWrapperEmits();
  return { props, emits };
}

export type FormNodeWrapperContext = SetupContext<FormNodeWrapperEmitOptions>;

export interface FormNodeWrapperOptions {
  hinttipPrepend?: () => VNodeChild;
}

/**
 * Form node wrapper
 */
export class FormNodeWrapper {
  readonly _props: FormNodeWrapperProps;
  readonly _service: VueFormService;
  protected _ctx: FormNodeWrapperContext | undefined;
  protected _allNodes: Ref<FormNodeControl[]> = ref([]);
  protected _labelSlot: ComputedRef<TypedSlot<FormNodeWrapper> | undefined>;
  protected _hintSlot: ComputedRef<TypedSlot<FormNodeWrapper> | undefined>;
  protected _hinttip: ComputedRef<VNodeChild>;
  protected _hinttipDelay: ComputedRef<FormNodeWrapperHinttipDelay | undefined>;
  protected _hinttipPrepend?: () => VNodeChild;
  protected _infoAppendsSlot: ComputedRef<
    TypedSlot<FormNodeWrapper> | undefined
  >;
  protected _validating: ComputedRef<boolean>;
  protected _pending: ComputedRef<boolean>;
  protected _focused: ComputedRef<boolean>;
  protected _dirty: ComputedRef<boolean>;
  protected _disabled: ComputedRef<boolean>;
  protected _readonly: ComputedRef<boolean>;
  protected _viewonly: ComputedRef<boolean>;
  protected _touched: ComputedRef<boolean>;
  protected _required: ComputedRef<boolean>;
  protected _invalid: ComputedRef<boolean>;
  protected _resolvedErrorMessages: ComputedRef<FormNodeErrorMessageSource[]>;

  /**
   * Root service of `vue-form-control`
   *
   * @see {@link VueFormService}
   */
  get service(): VueFormService {
    return this._service;
  }

  /**
   * Instance of FormNodeControl
   *
   * When this setting is applied, the state and error messages will always refer to the state of this node. If not set, it will attempt to compute them from descendant nodes.
   */
  get nodeControl(): FormNodeControl | undefined {
    return this._props.nodeControl;
  }

  /**
   * List of all nodes belonging to this wrapper
   *
   * This list is a reactive list, and depending on usage, it may contain a large number of nodes.
   * Please be aware that complex operations using this list can lead to performance issues.
   */
  get allNodes() {
    return this._allNodes.value;
  }

  /**
   * At least one of the associated nodes is validating the value
   */
  get validating() {
    return this._validating.value;
  }

  /**
   * Pending processing
   *
   * This is marked as `true` during the validation and finalization process of the value
   */
  get pending() {
    return this._pending.value;
  }

  /**
   * One of the associated nodes is currently focused
   */
  get focused() {
    return this._focused.value;
  }

  /**
   * The changes to the input value have not been committed yet
   *
   * @see {@link FormNodeControl.initialValue initialValue}
   */
  get dirty() {
    return this._dirty.value;
  }

  /**
   * The input value has not been changed from its initial value
   */
  get pristine() {
    return !this.dirty;
  }

  /**
   * All associated nodes are disabled
   */
  get isDisabled() {
    return this._disabled.value;
  }

  /**
   * All associated nodes are read-only
   */
  get isReadonly() {
    return this._readonly.value;
  }

  /**
   * All associated nodes are view-only
   */
  get isViewonly() {
    return this._viewonly.value;
  }

  /**
   * All associated nodes are operable
   */
  get canOperation() {
    return !this.isDisabled && !this.isReadonly && !this.isViewonly;
  }

  /**
   * One of the associated nodes has already been touched
   */
  get touched() {
    return this._touched.value;
  }

  /**
   * None of the associated nodes has been touched yet
   */
  get untouched() {
    return !this.touched;
  }

  /**
   * One of the associated nodes requires input
   */
  get isRequired() {
    return this._required.value;
  }

  /**
   * There is an error in the input value of one of the associated nodes
   */
  get invalid() {
    return this._invalid.value;
  }

  /**
   * No errors in the input values of all associated nodes
   */
  get valid() {
    return !this.invalid;
  }

  /**
   * Collect the error messages of all nodes belonging to this node
   */
  get collectErrorMessages() {
    return this._props.collectErrorMessages;
  }

  /**
   * Source code for all collected error messages
   *
   * This list is generated based on the setting of {@link FormNodeControl.showOwnErrors showOwnErrors}.
   *
   * @see {@link FormNodeErrorMessageSource}
   */
  get errorMessages(): FormNodeErrorMessageSource[] {
    return this._resolvedErrorMessages.value;
  }

  /**
   * Source code for the first error message among all collected messages
   *
   * This list is generated based on the setting of {@link FormNodeControl.showOwnErrors showOwnErrors}.
   *
   * @see {@link FormNodeErrorMessageSource}
   */
  get firstErrorMessage(): FormNodeErrorMessageSource | undefined {
    return this.errorMessages[0];
  }

  get labelSlot() {
    return this._labelSlot.value;
  }

  get hintSlot() {
    return this._hintSlot.value;
  }

  get infoAppendsSlot() {
    return this._infoAppendsSlot.value;
  }

  get hinttipDelay() {
    return this._hinttipDelay.value;
  }

  constructor(
    props: FormNodeWrapperProps,
    ctx: FormNodeWrapperContext,
    options: FormNodeWrapperOptions = {},
  ) {
    markRaw(this);

    this._props = props;
    this._service = useVueForm();
    const { slots } = ctx;

    this._ctx = ctx;

    this._labelSlot = computed(() =>
      resolveVNodeChildOrSlots(props.label, slots.label),
    );

    this._hintSlot = computed(() =>
      resolveVNodeChildOrSlots(props.hint, slots.hint),
    );

    this._hinttipPrepend = options.hinttipPrepend;

    this._hinttip = computed(() => {
      const { hinttip } = props;
      if (!hinttip) return;
      if (typeof hinttip === 'function') return hinttip();
      const children: VNodeChild[] = [];
      if (this._hinttipPrepend) {
        children.push(this._hinttipPrepend());
      }
      if (typeof hinttip !== 'boolean') {
        children.push(hinttip);
      }
      return children;
    });

    this._hinttipDelay = computed(() => {
      const { hinttipDelay } = props;
      return hinttipDelay == null ? 500 : hinttipDelay;
    });

    this._infoAppendsSlot = computed(() =>
      resolveVNodeChildOrSlots(props.infoAppends, slots.infoAppends),
    );

    const hasTrueFromControlOrChildren = <
      P extends
        | 'validating'
        | 'pending'
        | 'focused'
        | 'dirty'
        | 'touched'
        | 'isRequired'
        | 'invalid',
    >(
      prop: P,
    ): boolean => {
      const nc = props.nodeControl;
      if (nc) return nc[prop];
      return this.allNodes.some((node) => node[prop]);
    };

    const everyTrueFromControlOrChildren = <
      P extends 'isDisabled' | 'isReadonly' | 'isViewonly',
    >(
      prop: P,
    ): boolean => {
      const nc = props.nodeControl;
      if (nc) return nc[prop];
      return this.allNodes.every((node) => node[prop]);
    };

    this._validating = computed(() =>
      hasTrueFromControlOrChildren('validating'),
    );
    this._pending = computed(() => hasTrueFromControlOrChildren('pending'));
    this._focused = computed(() => hasTrueFromControlOrChildren('focused'));
    this._dirty = computed(() => hasTrueFromControlOrChildren('dirty'));
    this._touched = computed(() => hasTrueFromControlOrChildren('touched'));

    this._disabled = computed(() =>
      everyTrueFromControlOrChildren('isDisabled'),
    );
    this._readonly = computed(() =>
      everyTrueFromControlOrChildren('isReadonly'),
    );
    this._viewonly = computed(() =>
      everyTrueFromControlOrChildren('isViewonly'),
    );
    this._required = computed(() => hasTrueFromControlOrChildren('isRequired'));
    this._invalid = computed(() => hasTrueFromControlOrChildren('invalid'));

    this._resolvedErrorMessages = computed(() => {
      const nc = props.nodeControl;
      if (nc) return nc.errorMessages;

      const messages: FormNodeErrorMessageSource[] = [];
      for (const node of this.allNodes) {
        if (
          !node.showOwnErrors &&
          !node.parentFormGroup?.collectErrorMessages
        ) {
          node.errors.forEach((error) => {
            messages.push(
              node._createFormNodeErrorMessageSource(
                error,
                messages.length + 1,
                ctx.slots as any,
              ),
            );
          });
        }
      }
      return messages;
    });

    onBeforeUnmount(() => {
      delete this._ctx;
      delete (this as any)._props;
      delete (this as any)._service;
    });

    provide(FormNodeWrapperInjectionKey, this);
  }

  renderLabel() {
    const { labelSlot: slot } = this;
    return (slot && cleanupEmptyVNodeChild(slot(this))) || undefined;
  }

  renderHint(allowNotFocused?: boolean) {
    if (!allowNotFocused && !this.focused) return;
    const { hintSlot: slot } = this;
    return (slot && cleanupEmptyVNodeChild(slot(this))) || undefined;
  }

  renderInfoAppends() {
    const { infoAppendsSlot: slot } = this;
    return (slot && cleanupEmptyVNodeChild(slot(this))) || undefined;
  }

  protected _getContextOrDie() {
    const { _ctx } = this;
    if (!_ctx) throw new Error('missing form wrapper context');
    return _ctx;
  }

  renderFirstError(slotsOverrides?: FormNodeErrorSlotsSource) {
    if (!this.canOperation) {
      return;
    }
    return this.firstErrorMessage?.render(slotsOverrides);
  }

  renderMessage(allowNotFocused?: boolean) {
    if (!this.canOperation) return EMPTY_MESSAGE;
    const error = this.renderFirstError();
    if (error) return error;
    return (
      (!this._hinttip.value && this.renderHint(allowNotFocused)) ||
      EMPTY_MESSAGE
    );
  }

  renderHinttip():
    | {
        tip: VNodeChild;
        hint: VNodeChild;
      }
    | undefined {
    const { value: hinttip } = this._hinttip;
    if (!hinttip) {
      return;
    }
    const hint = this.renderHint(true);
    if (!hint) return;

    return {
      tip: hinttip,
      hint,
    };
  }

  /** @internal */
  __joinFromNode(node: FormNodeControl) {
    const { allNodes } = this;
    if (!allNodes.includes(node)) {
      allNodes.push(node);
    }
  }

  /** @internal */
  __leaveFromNode(node: FormNodeControl) {
    arrayRemove(this.allNodes, node);
  }
}

export function useFormNodeWrapper(
  props: FormNodeWrapperProps,
  ctx: FormNodeWrapperContext,
  options?: FormNodeWrapperOptions,
) {
  const control = new FormNodeWrapper(props, ctx, options);
  return control;
}
