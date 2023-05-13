import './VCheckable.scss';
import { computed, defineComponent } from 'vue';
import { defineSlots } from '@fastkit/vue-utils';
import { useVuiColorProvider } from '../../injections';

const slots = defineSlots<{
  input?: () => any;
  faux?: () => any;
  icon?: () => any;
  label?: () => any;
}>();

export const VCheckable = defineComponent({
  name: 'VCheckable',
  props: {
    invalid: Boolean,
    disabled: Boolean,
    readonly: Boolean,
    checked: Boolean,
    ...slots(),
    // autoWidth: Boolean,
  },
  slots,
  setup(props, ctx) {
    const colorProvider = useVuiColorProvider();
    const invalid = computed(() => props.invalid);
    const disabled = computed(() => props.disabled);
    const readonly = computed(() => props.readonly);
    const checked = computed(() => props.checked);
    // const autoWidth = computed(() => props.autoWidth);
    const classes = computed(() => {
      return [
        {
          'v-checkable--invalid': invalid.value,
          'v-checkable--disabled': disabled.value,
          'v-checkable--readonly': readonly.value,
          'v-checkable--checked': checked.value,
          'v-checkable--custom-icon': !!ctx.slots.icon,
          disabled: disabled.value,
        },
        colorProvider.className(invalid.value ? 'error' : 'primary'),
      ];
    });

    return () => (
      <label class={['v-checkable', classes.value]}>
        <span class="v-checkable__faux">
          {ctx.slots.input?.()}
          {ctx.slots.icon ? (
            ctx.slots.icon()
          ) : (
            <span class="v-checkable__faux__icon">{ctx.slots.faux?.()}</span>
          )}
        </span>
        <span class="v-checkable__label">{ctx.slots.label?.()}</span>
      </label>
    );
  },
});
