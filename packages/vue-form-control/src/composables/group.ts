import {
  ExtractPropTypes,
  SetupContext,
  provide,
  ref,
  Ref,
  markRaw,
  VNodeArrayChildren,
} from 'vue';
import {
  createFormNodeProps,
  FormNodeControl,
  createFormNodeEmits,
  FormNodeContext,
  FormNodeControlBaseOptions,
  RenderFormNodeErrorOptions,
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
      /**
       * Auto scroll to the location of the form when invalid input is detected in the validation on submission
       */
      disableAutoScroll: Boolean,
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
  protected _allNodes: Ref<FormNodeControl[]> = ref([]);
  protected _allInvalidNodes: Ref<FormNodeControl[]> = ref([]);

  /**
   * All nodes in an error state belonging recursively to this group
   */
  get allInvalidNodes() {
    return this._allInvalidNodes.value;
  }

  /**
   * Collect the error messages of all nodes belonging to this node
   */
  get collectErrorMessages() {
    return this._props.collectErrorMessages;
  }

  /**
   * Auto scroll to the location of the form when invalid input is detected in the validation on submission
   */
  get disableAutoScroll() {
    return this._props.disableAutoScroll;
  }

  /**
   * List of all nodes belonging to this group
   *
   * This list is a reactive list, and depending on usage, it may contain a large number of nodes.
   * Please be aware that complex operations using this list can lead to performance issues.
   */
  get allNodes() {
    return this._allNodes.value;
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
    const { allNodes } = this;
    if (!allNodes.includes(node)) {
      allNodes.push(markRaw(node));
    }
  }

  /** @internal */
  __leaveFromNode(node: FormNodeControl) {
    const { allNodes } = this;
    const index = allNodes.indexOf(node);
    if (index !== -1) {
      allNodes.splice(index, 1);
    }
    this.__removeInvalidChild(node);
  }

  /** @internal */
  private __pushInvalidChild(node: FormNodeControl) {
    const { allInvalidNodes } = this;
    if (!allInvalidNodes.includes(node)) {
      this._allInvalidNodes.value.push(markRaw(node));
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

  protected dispatchAutoScroll() {
    !this.disableAutoScroll && this.scrollToFirstInvalidNode();
  }

  /**
   * Validate the values of this group and all descendant nodes. If there is one or more errors, scroll to the top error node
   *
   * If `disableAutoScroll` is set, scrolling will not be performed.
   */
  async validateAndScroll(): Promise<boolean> {
    const valid = await this.validate();
    if (!valid) {
      this.dispatchAutoScroll();
    }
    return valid;
  }

  /** @internal */
  _renderFirstError(): VNodeArrayChildren | undefined {
    if (!this.canOperation) {
      return;
    }
    const myError = super._renderFirstError();
    if (myError) return myError;

    for (const node of this._allInvalidNodes.value) {
      if (node.showOwnErrors) continue;
      const nodeError = node._renderFirstError(this._ctx?.slots as any);
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
  _renderAllErrors(options?: RenderFormNodeErrorOptions) {
    if (!this.canOperation) {
      return [];
    }
    const errors = super._renderAllErrors(options);
    const { allInvalidNodes } = this;
    for (const node of allInvalidNodes) {
      if (!node.showOwnErrors) {
        errors.push(
          ...node._renderAllErrors({
            ...options,
            slotsOverrides: {
              ...options?.slotsOverrides,
              ...(this._ctx?.slots as any),
            },
          }),
        );
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
