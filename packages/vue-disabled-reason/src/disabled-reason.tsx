import './disabled-reason.css';
import {
  nextTick,
  defineComponent,
  getCurrentInstance,
  onMounted,
  onUpdated,
  computed,
  ref,
  h,
  render,
  onBeforeUnmount,
  type PropType,
  type VNodeChild,
  type VNodeArrayChildren,
  type ExtractPropTypes,
} from 'vue';
import {
  createPropsOptions,
  defineSlots,
  cleanupEmptyVNodeChild,
  resolveVNodeChildOrSlots,
  findFirstDomVNode,
  type VNodeSkipHandler,
  type VNodeChildOrSlot,
} from '@fastkit/vue-utils';
import {
  DISABLED_REASON_ACTIVATED_ATTR,
  DISABLED_REASON_CONTAINER_ATTR,
  DISABLEABLE_ELEMENT_QUERY,
} from './constants';

type PropsOptionsImpl = Record<string, any>;

/**
 * Public API available inside DisabledReason components.
 *
 * Exposes the component's resolved props and whether the target is
 * disabled: the `disabled` prop when specified, otherwise the state
 * detected from the DOM.
 */
export interface DisabledReasonAPI<
  Props extends Readonly<PropsOptionsImpl> = {},
> {
  /** Resolved component props. */
  get props(): ExtractPropTypes<
    Omit<Props, keyof typeof DISABLED_REASON_BASE_PROPS> &
      typeof DISABLED_REASON_BASE_PROPS
  >;

  /**
   * True if the target is disabled: the `disabled` prop when specified,
   * otherwise the state detected from the DOM.
   */
  get disabled(): boolean;
}

/**
 * The setup context passed to a DisabledReason component's `setup` function.
 *
 * Provides reactive access to:
 * - The component's resolved props.
 * - The disabled state of the target (the `disabled` prop when specified,
 *   otherwise the state detected from the DOM).
 *
 * Use this context inside `setup` to determine whether the target
 * element is disabled and to render the disabled reason accordingly.
 *
 * @example
 * ```ts
 * defineDisabledReasonComponent({
 *   setup(api) {
 *     return (reason) => (
 *       <MyTooltip disabled={!reason || !api.disabled}>
 *         {{ reason }}
 *       </MyTooltip>
 *     );
 *   },
 * });
 * ```
 */
export interface DisabledReasonSetupContext<
  Props extends Readonly<PropsOptionsImpl> = {},
> extends DisabledReasonAPI<Props> {}

/**
 * Render function used to display the disabled reason.
 *
 * Receives the content provided by the `reason` slot or prop,
 * and should return the element (e.g. tooltip, overlay) that
 * actually displays the reason to the user.
 */
export type DisabledReasonRenderFunction = (
  reason: VNodeArrayChildren | undefined,
) => VNodeChild;

/**
 * Options for {@link defineDisabledReasonComponent}.
 *
 * @typeParam Props - Additional props to extend the component.
 */
export interface DisabledReasonComponentOptions<
  Props extends Readonly<PropsOptionsImpl>,
> {
  /** Optional name for the component. */
  name?: string;

  /** Additional props to extend the base props. */
  props?: Props;

  /**
   * Optional handler to control how the target element is detected.
   * Can be used to skip or replace certain VNodes during traversal.
   */
  skipVNode?: VNodeSkipHandler;

  /**
   * Setup function returning a render function for the reason layer.
   * This is where you provide the actual UI (e.g. a tooltip).
   */
  setup(
    this: void,
    ctx: DisabledReasonSetupContext<Props>,
  ): DisabledReasonRenderFunction;
}

const slots = defineSlots<{
  /** The main content that will be observed for disabled state */
  default?: (api: DisabledReasonAPI) => any;
  /** Slot for providing the disabled reason content */
  reason?: (api: DisabledReasonAPI) => any;
}>();

export const DISABLED_REASON_BASE_PROPS = createPropsOptions({
  /** The content or slot that provides the disabled reason */
  reason: {} as PropType<VNodeChildOrSlot>,
  /**
   * Whether the target is disabled.
   * When specified, it takes precedence over detection from the DOM.
   */
  disabled: { type: Boolean, default: undefined },
});

/**
 * Creates a headless Vue component that observes whether its
 * child element is disabled and displays a "disabled reason"
 * when applicable.
 *
 * This component monitors:
 * - Native `disabled` attributes on standard elements (button, input, etc.)
 * - Elements with ARIA roles that support disabled state
 *   (e.g., button, link, checkbox) via the `aria-disabled` attribute
 *
 * Use the optional `skipVNode` callback to skip or replace
 * certain VNodes during the traversal. This allows you to
 * ignore wrapper elements or other nodes that should not
 * be considered as the target for the disabled reason.
 *
 * The component itself does not provide any UI. Instead, supply
 * a render function in `setup` to display the disabled reason
 * (e.g., tooltip, overlay, etc.).
 *
 * @example
 * ```ts
 * export const UIDisabledReason = defineDisabledReasonComponent({
 *   name: 'UIDisabledReason',
 *   skipVNode: (vnode, el) => el.dataset.skip === 'true',
 *   setup(api) {
 *     return (reason) => (
 *       <MyTooltip
 *         disabled={!reason || !api.disabled}
 *         v-slots={{
 *           activator: ({ attrs }) => <span {...attrs} />,
 *           default: () => reason,
 *         }}
 *       />
 *     );
 *   },
 * });
 * ```
 *
 * @param options - Component configuration.
 * @returns A Vue component definition.
 */
export function defineDisabledReasonComponent<
  Props extends Readonly<PropsOptionsImpl> = {},
>(options: DisabledReasonComponentOptions<Props>) {
  return defineComponent({
    name: options.name,
    inheritAttrs: false,
    props: {
      ...(options.props as Props),
      ...DISABLED_REASON_BASE_PROPS,
      ...slots(),
    },
    slots,
    setup(_props, ctx) {
      const props = _props as ExtractPropTypes<
        typeof DISABLED_REASON_BASE_PROPS
      >;
      const instance = getCurrentInstance();
      const detected = ref(false);
      const api: DisabledReasonAPI<Props> = {
        get props() {
          return props as any;
        },
        get disabled() {
          return props.disabled ?? detected.value;
        },
      };
      const setupCtx: DisabledReasonSetupContext<Props> = api;

      const reasonSlot = computed(() =>
        resolveVNodeChildOrSlots(props.reason, ctx.slots.reason),
      );

      const mountedContainers = new Map<HTMLElement, HTMLElement>();

      const renderReasonLayer = options.setup(setupCtx);

      const ReasonLayer = () => {
        const reason = cleanupEmptyVNodeChild(reasonSlot.value?.(api));
        return renderReasonLayer(reason);
      };

      const setupDisabledLayer = (container: HTMLElement) => {
        const host = mountedContainers.get(container);
        // A dedicated host keeps the layer's nodes together even if the
        // container's content is replaced, so the layer can always be
        // unmounted, and its presence tells whether the layer is still in place.
        if (host && container.contains(host)) return;
        if (host) teardownDisabledLayer(container);

        const newHost = container.ownerDocument.createElement('span');
        // Adds no box; keeps the overlay's inherited radius equal to the container's.
        newHost.style.display = 'contents';
        newHost.style.borderRadius = 'inherit';
        container.appendChild(newHost);
        mountedContainers.set(container, newHost);

        container.setAttribute(DISABLED_REASON_ACTIVATED_ATTR, '');

        const layer = h(ReasonLayer);
        layer.appContext = instance!.appContext;
        render(layer, newHost);
      };

      const teardownDisabledLayer = (container: HTMLElement) => {
        const host = mountedContainers.get(container);
        if (host) {
          render(null, host);
          host.remove();
        }
        container.removeAttribute(DISABLED_REASON_ACTIVATED_ATTR);
        mountedContainers.delete(container);
      };

      const setup = async () => {
        await nextTick();
        if (instance?.isUnmounted) return;
        const child = findFirstDomVNode(
          instance?.subTree.children,
          options.skipVNode,
        );
        detected.value = false;

        const containers: HTMLElement[] = [];
        if (child) {
          const specifiedContainers = (
            child.el as HTMLElement
          ).querySelectorAll<HTMLElement>(
            `[${DISABLED_REASON_CONTAINER_ATTR}]`,
          );
          if (specifiedContainers.length) {
            containers.push(...specifiedContainers);
          } else {
            containers.push(child.el as HTMLElement);
          }
        }

        mountedContainers.forEach((_, container) => {
          if (!containers.includes(container)) {
            teardownDisabledLayer(container);
          }
        });

        if (!child) return;

        let el = containers[0];
        if (!el.matches(DISABLEABLE_ELEMENT_QUERY)) {
          const disabledChild = el.querySelector<HTMLElement>(
            DISABLEABLE_ELEMENT_QUERY,
          );
          if (disabledChild) {
            el = disabledChild;
          }
        }

        const disabledValue =
          child.props?.disabled ?? el.getAttribute('disabled');
        if (
          disabledValue === '' ||
          disabledValue === 'true' ||
          disabledValue === true
        ) {
          detected.value = true;
        }
        {
          const ariaValue =
            child.props?.['aria-disabled'] ?? el.getAttribute('aria-disabled');
          if (ariaValue === 'true' || ariaValue === true) {
            detected.value = true;
          }
        }

        containers.forEach(setupDisabledLayer);
      };

      onMounted(setup);
      onUpdated(setup);
      onBeforeUnmount(() => {
        // render() during the parent's patch would flush the post-flush queue early.
        nextTick(() => {
          mountedContainers.forEach((_, container) =>
            teardownDisabledLayer(container),
          );
        });
      });

      return () => {
        const [first, ...otherChildren] =
          cleanupEmptyVNodeChild(ctx.slots.default?.(api)) || [];
        return [first, ...otherChildren];
      };
    },
  });
}
