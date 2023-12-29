import {
  ExtractPropTypes,
  SetupContext,
  provide,
  ref,
  VNodeArrayChildren,
} from 'vue';
import {
  createFormNodeProps,
  FormNodeControl,
  createFormNodeEmits,
  FormNodeContext,
  FormNodeControlBaseOptions,
} from './node';
import { FormGroupInjectionKey } from '../injections';
import { createPropsOptions } from '@fastkit/vue-utils';

export function createFormGroupProps() {
  return {
    ...createFormNodeProps(),
    ...createPropsOptions({
      /**
       * Collect the error messages of all nodes belonging to this node
       *
       * By default, a node attempts to render error messages on its own, but enabling this setting allows the parent group to manage the rendering of error messages.
       * If you want to exclude a specific node from this configuration, enable the `showOwnErrors` setting for that node.
       */
      collectErrorMessages: Boolean,
    }),
  };
}

export type FormGroupProps = ExtractPropTypes<
  ReturnType<typeof createFormGroupProps>
>;

export function createFormGroupEmits() {
  return createFormNodeEmits();
}

export function createFormGroupSettings() {
  const props = createFormGroupProps();
  const emits = createFormGroupEmits();
  return { props, emits };
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface FormGroupEmitOptions
  extends ReturnType<typeof createFormGroupEmits> {}

export type FormGroupContext = SetupContext<FormGroupEmitOptions>;

export interface FormGroupOptions extends FormNodeControlBaseOptions {}

export class FormGroupControl extends FormNodeControl {
  readonly _props: FormGroupProps;
  protected _allNodes: FormNodeControl[] = [];
  protected _allInvalidNodes = ref<(() => FormNodeControl)[]>([]);
  // protected _allErrors: ComputedRef<FormNodeError[]>;

  /**
   * All nodes in an error state belonging recursively to this group
   */
  get allInvalidNodes() {
    return this._allInvalidNodes.value.map((g) => g());
  }

  /**
   * Collect the error messages of all nodes belonging to this node
   */
  get collectErrorMessages() {
    return this._props.collectErrorMessages;
  }

  constructor(
    props: FormGroupProps,
    ctx: FormGroupContext,
    options: FormGroupOptions = {},
  ) {
    super(props, ctx as unknown as FormNodeContext<{}>, {
      ...options,
    });
    this._props = props;

    provide(FormGroupInjectionKey, this);
  }

  /** @internal */
  __joinFromNode(node: FormNodeControl) {
    const { _allNodes } = this;
    if (!_allNodes.includes(node)) {
      _allNodes.push(node);
    }
  }

  /** @internal */
  __leaveFromNode(node: FormNodeControl) {
    const { _allNodes } = this;
    const index = _allNodes.indexOf(node);
    if (index !== -1) {
      _allNodes.splice(index, 1);
    }
    this.__removeInvalidChild(node);
  }

  /** @internal */
  private __pushInvalidChild(node: FormNodeControl) {
    const { allInvalidNodes } = this;
    if (!allInvalidNodes.includes(node)) {
      this._allInvalidNodes.value.push(() => node);
    }
  }

  /** @internal */
  private __removeInvalidChild(node: FormNodeControl) {
    const { allInvalidNodes } = this;
    const index = allInvalidNodes.indexOf(node);
    if (index !== -1) {
      this._allInvalidNodes.value.splice(index, 1);
    }
  }

  /** @internal */
  __updateInvalidNodesByNode(node: FormNodeControl) {
    if (node.hasMyError && !this.allInvalidNodes.includes(node)) {
      this.__pushInvalidChild(node);
    } else {
      this.__removeInvalidChild(node);
    }
  }

  /**
   * Recursively retrieve the leading node in an error state within this group
   */
  findFirstInvalidNode() {
    return this.findNodeRecursive((node) => node.invalid);
  }

  /**
   * Scroll to the position of the leading node in an error state within this group
   */
  scrollToFirstInvalidNode() {
    this.findFirstInvalidNode()?.scrollIntoView();
  }

  /** @internal */
  _renderFirstError(): VNodeArrayChildren | undefined {
    if (!this.canOperation) {
      return;
    }
    const myError = super._renderFirstError();
    if (myError) return myError;
    if (!this.collectErrorMessages) return;

    for (const getNode of this._allInvalidNodes.value) {
      const node = getNode();
      if (node.showOwnErrors) continue;
      const nodeError = node._renderFirstError();
      if (nodeError) return nodeError;
    }
  }

  /**
   * Render all errors held by this node as an array of `VNodeArrayChildren`
   *
   * @remarks
   * Please note that nothing will be returned if the node is inoperable.
   * Also, if the parent group is configured to collect errors for this node and `showOwnErrors` for this node is disabled, this method will return nothing.
   *
   * @see {@link FormNodeControl.canOperation canOperation}
   * @see {@link FormNodeControl.showOwnErrors showOwnErrors}
   */
  _renderAllErrors() {
    if (!this.canOperation) {
      return [];
    }
    const errors = super._renderAllErrors();
    const { allInvalidNodes } = this;
    for (const node of allInvalidNodes) {
      if (!node.showOwnErrors) {
        errors.push(...node._renderAllErrors());
      }
    }
    return errors;
  }
}

export function useFormGroup(
  props: FormGroupProps,
  ctx: FormGroupContext,
  options?: FormGroupOptions,
) {
  const control = new FormGroupControl(props, ctx, options);
  return control;
}
