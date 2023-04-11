import './VFormControl.scss';
import { computed, defineComponent, VNodeChild } from 'vue';
import {
  createFormControlSettings,
  useFormControl,
  FormControlSlots,
  FormControl,
  RequiredChipSource,
} from '@fastkit/vue-form-control';
import { defineSlotsProps, renderSlotOrEmpty } from '@fastkit/vue-utils';
import { useVuiColorProvider, useVui } from '../../injections';
import type { VuiService } from '../../service';
import { VIcon } from '../VIcon';
import { VTooltip } from '../kits';

const { props, emits } = createFormControlSettings();

export function createRequiredChipRenderer(
  required: () => boolean,
  props: {
    requiredChip?: RequiredChipSource;
  },
  vui: VuiService = useVui(),
) {
  return () => {
    if (!required()) return;
    let chip: VNodeChild;
    const { requiredChip } = props;
    if (requiredChip === false) return;
    if (requiredChip) {
      if (typeof requiredChip === 'string') {
        chip = requiredChip;
      } else if (typeof requiredChip === 'function') {
        chip = requiredChip();
      }
    }
    if (chip === undefined) {
      chip = vui.getRequiredChip();
    }
    return chip;
  };
}

export const VFormControl = defineComponent({
  name: 'VFormControl',
  props: {
    ...props,
    ...defineSlotsProps<
      FormControlSlots & {
        default: FormControl;
      }
    >(),
    error: Boolean,
  },
  emits,
  setup(props, ctx) {
    const vui = useVui();
    const control = useFormControl(props, ctx, {
      hinttipPrepend: () => (
        <VIcon
          class="v-form-control__label__hinttip__icon"
          name={vui.icon('hinttip')}
        />
      ),
    });

    const hinttipDelay = computed(() => {
      let { hinttipDelay } = control;
      if (hinttipDelay == null) {
        hinttipDelay = vui.setting('hinttipDelay');
      }
      if (hinttipDelay == null) {
        hinttipDelay = 500;
      }
      return hinttipDelay;
    });

    ctx.expose(control.expose());

    const colorProvider = useVuiColorProvider();

    const classes = computed(() => [
      {
        'v-form-control--validating': control.validating,
        'v-form-control--pending': control.pending,
        'v-form-control--focused': control.focused,
        'v-form-control--dirty': control.dirty,
        'v-form-control--pristine': control.pristine,
        'v-form-control--disabled': control.disabled,
        'v-form-control--readonly': control.readonly,
        'v-form-control--touched': control.touched,
        'v-form-control--untouched': control.untouched,
        'v-form-control--invalid': control.invalid,
        'v-form-control--valid': control.valid,
      },
      colorProvider.className(
        props.error
          ? 'error'
          : control.invalid && !control.readonly
          ? 'error'
          : 'primary',
      ),
    ]);

    const getRequiredChip = createRequiredChipRenderer(
      () => control.required,
      props,
      vui,
    );

    return () => {
      const label = control.renderLabel();
      const message = control.renderMessage();
      const appends = control.renderInfoAppends();
      const hinttip = control.renderHinttip();
      const _hinttipDelay = hinttipDelay.value;

      return (
        <div class={['v-form-control', classes.value]}>
          {label && (
            <label
              class="v-form-control__label"
              onClick={(ev) => {
                ctx.emit('clickLabel', ev, control);
              }}>
              {label}
              {getRequiredChip()}
              {hinttip && (
                <VTooltip
                  y="top"
                  openOnHover={_hinttipDelay !== 'click'}
                  openDelay={
                    typeof _hinttipDelay === 'number'
                      ? _hinttipDelay
                      : undefined
                  }
                  v-slots={{
                    activator: (ctx) => (
                      <a
                        class="v-form-control__label__hinttip"
                        href="javascript:void(0)"
                        {...ctx.attrs}>
                        {hinttip.tip}
                      </a>
                    ),
                  }}>
                  <div class="v-form-control__label__hinttip__hint">
                    {hinttip.hint}
                  </div>
                </VTooltip>
              )}
            </label>
          )}
          <div class="v-form-control__body">
            {renderSlotOrEmpty(ctx.slots, 'default', control as any)}
            {!props.hiddenInfo && (
              <div class="v-form-control__info">
                {!!message && (
                  <div class="v-form-control__message">{message}</div>
                )}
                {!!appends && (
                  <div class="v-form-control__appends">{appends}</div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    };
  },
});
