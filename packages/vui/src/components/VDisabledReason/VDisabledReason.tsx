import './VDisabledReason.scss';
import { type PropType } from 'vue';
import { defineDisabledReasonComponent } from '@fastkit/vue-disabled-reason';
import { createMenuProps } from '@fastkit/vue-stack';
import { VTooltip } from '../VTooltip';

const menuProps = createMenuProps();

/**
 * Display type
 *
 * Currently, only tooltip is supported
 */
export type DisabledReasonType = 'tooltip';

export const VDisabledReason = defineDisabledReasonComponent({
  name: 'VDisabledReason',
  props: {
    ...menuProps,
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
  },
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
