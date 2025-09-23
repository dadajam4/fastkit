import './VDisabledReason.scss';
import {
  type PropType,
  type ExtractPublicPropTypes,
  type VNodeChild,
} from 'vue';
import {
  defineDisabledReasonComponent,
  DISABLED_REASON_BASE_PROPS,
} from '@fastkit/vue-disabled-reason';
import { createMenuProps } from '@fastkit/vue-stack';
import { createPropsOptions } from '@fastkit/vue-utils';
import {
  registerActionableAttrsResolver,
  registerActionableRenderWrapper,
  type ActionableCustomProps as _ActionableCustomProps,
} from '@fastkit/vue-action';
import { VTooltip } from '../VTooltip';

const menuProps = createMenuProps();

/**
 * Display type
 *
 * Currently, only tooltip is supported
 */
export type DisabledReasonType = 'tooltip';

export const DISABLED_REASON_PROPS = {
  ...menuProps,
  ...createPropsOptions({
    /**
     * Display type
     *
     * Currently, only tooltip is supported
     *
     * @see {@link DisabledReasonType}
     */
    type: {
      type: String as PropType<DisabledReasonType>,
      default: 'tooltip' satisfies DisabledReasonType,
    },
  }),
};

export interface DisabledReasonInput
  extends ExtractPublicPropTypes<
    typeof DISABLED_REASON_PROPS & typeof DISABLED_REASON_BASE_PROPS
  > {}

export const VDisabledReason = defineDisabledReasonComponent({
  name: 'VDisabledReason',
  props: DISABLED_REASON_PROPS,
  setup(api) {
    return (reason) => {
      const { type: _type, ...tooltipProps } = api.props;
      return (
        <VTooltip
          {...tooltipProps}
          disabled={!reason || !api.disabled}
          v-slots={{
            activator: ({ attrs }) => (
              <span
                class="v-disabled-reason"
                // If tabindex is 0 or greater, enable pointer-events via CSS
                tabindex={api.disabled ? 0 : -1}
                {...attrs}
              />
            ),
            default: () => reason,
          }}
        />
      );
    };
  },
});

// Customize '@fastkit/vue-action' so that when the custom attribute
// "disabledReason" is set, it wraps the element with `VDisabledReason`
// to display the reason for being disabled.

// 1. Extend the '@fastkit/vue-action' interface
declare module '@fastkit/vue-action' {
  interface ActionableCustomProps {
    /**
     * Reason why this element is disabled.
     *
     * If set, hovering over the disabled element will display the reason
     * using `VDisabledReason`.
     */
    disabledReason: PropType<string | (() => VNodeChild) | DisabledReasonInput>;
  }
}

// 2. Handle `disabledReason` as a custom attribute of '@fastkit/vue-action'
registerActionableAttrsResolver((attrs, ctx) => {
  const disabledReason = ctx.getAttr('disabledReason');
  if (disabledReason) {
    // Remove disabledReason from the original attrs
    // (to prevent adding unnecessary attributes to the element)
    delete attrs.disabledReason;
    return [
      undefined,
      {
        disabledReason,
      },
    ];
  }
});

// 3. Register a custom render wrapper for '@fastkit/vue-action'
registerActionableRenderWrapper((customProps, currentNode) => {
  const { disabledReason } = customProps;
  const disabledReasonInput =
    typeof disabledReason === 'string' || typeof disabledReason === 'function'
      ? { reason: disabledReason }
      : disabledReason;

  if (disabledReasonInput) {
    return (
      <VDisabledReason {...disabledReasonInput}>{currentNode}</VDisabledReason>
    );
  }
  return currentNode;
});
