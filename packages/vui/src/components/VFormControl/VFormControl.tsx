import './VFormControl.scss';
import { renderSlot, computed, defineComponent } from 'vue';
import {
  createFormControlSettings,
  useFormControl,
  FormControlSlots,
  defineSlotsProps,
} from '@fastkit/vue-kit';
import { useVuiColorProvider } from '../../composables';

const { props, emits } = createFormControlSettings();

export const VFormControl = defineComponent({
  name: 'VFormControl',
  props: {
    ...props,
    ...defineSlotsProps<
      FormControlSlots & {
        default: void;
      }
    >(),
  },
  emits,
  setup(props, ctx) {
    const control = useFormControl(props, ctx);
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
      colorProvider.className(control.invalid ? 'error' : 'primary'),
    ]);

    return () => {
      const label = control.renderLabel();
      const message = control.renderMessage();
      const appends = control.renderInfoAppends();
      return (
        <div class={['v-form-control', classes.value]}>
          {label && (
            <label
              class="v-form-control__label"
              onClick={(ev) => {
                ctx.emit('clickLabel', ev, control);
              }}>
              {label}
            </label>
          )}
          <div class="v-form-control__body">
            {renderSlot(ctx.slots, 'default')}
            <div class="v-form-control__info">
              {!!message && (
                <div class="v-form-control__message">{message}</div>
              )}
              {!!appends && (
                <div class="v-form-control__appends">{appends}</div>
              )}
            </div>
          </div>
        </div>
      );
    };
  },
});