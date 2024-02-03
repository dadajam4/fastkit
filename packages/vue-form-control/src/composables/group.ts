import {
  ExtractPropTypes,
  SetupContext,
  provide,
  ref,
  Ref,
  computed,
  ComputedRef,
} from 'vue';
import { arrayRemove } from '@fastkit/helpers';
import { createPropsOptions } from '@fastkit/vue-utils';
import {
  createFormNodeProps,
  FormNodeControl,
  createFormNodeEmits,
  FormNodeContext,
  FormNodeControlBaseOptions,
} from './node';
import { FormGroupInjectionKey } from '../injections';

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

  protected _allInvalidNodes: ComputedRef<FormNodeControl[]>;

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

    this._allInvalidNodes = computed(() =>
      this.allNodes.filter((node) => node.hasMyError),
    );

    const { _resolvedErrorMessages } = this;

    this._resolvedErrorMessages = computed(() => {
      if (!this.showOwnErrors) return [];
      const messages = _resolvedErrorMessages.value.slice();
      const { allInvalidNodes } = this;
      for (const node of allInvalidNodes) {
        if (!node.showOwnErrors) {
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

    provide(FormGroupInjectionKey, this);
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

  protected _forceFinalize() {
    return true;
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
}

export function useFormGroup(
  props: FormGroupProps,
  ctx: FormGroupContext,
  options?: FormGroupOptions,
) {
  const control = new FormGroupControl(props, ctx, options);
  return control;
}
