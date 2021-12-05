import './VButton.scss';
import { defineComponent, ExtractPropTypes, computed, PropType } from 'vue';
import { colorSchemeProps, useColorClasses } from '@fastkit/vue-color-scheme';
import {
  navigationableEmits,
  navigationableProps,
  useNavigationable,
  ExtractPropInput,
  createPropsOptions,
} from '@fastkit/vue-utils';
import { useVui } from '../../injections';
import { createControlProps, useControl } from '../../composables';
import { VProgressCircular } from '../loading';
import { ControlSize } from '../../schemes/control';

export type VButtonSpacer = 'left' | 'right';

export type RawVButtonSpacer = boolean | VButtonSpacer;

export const vueButtonProps = createPropsOptions({
  ...colorSchemeProps(),
  ...navigationableProps,
  spacer: [Boolean, String] as PropType<RawVButtonSpacer>,
  loading: Boolean,
  ...createControlProps(),
});

export type VButtonProps = ExtractPropInput<typeof vueButtonProps>;

export type VButtonResolvedProps = ExtractPropTypes<typeof vueButtonProps>;

const LOADING_SIZE_MAP: Record<ControlSize, number> = {
  sm: 14,
  md: 20,
  lg: 28,
};

export const VButton = defineComponent({
  name: 'VButton',
  props: vueButtonProps,
  emits: {
    ...navigationableEmits.emits,
  },
  setup(props) {
    const vui = useVui();
    const control = useControl(props);
    const defaults = vui.setting('buttonDefault');
    const color = useColorClasses({
      color: () => props.color || defaults.color,
      variant: () => props.variant || defaults.variant,
    });
    const navigationable = useNavigationable(props);
    const isLoading = computed(() => props.loading);
    const isDisabled = computed(() => props.disabled);
    const spacer = computed<VButtonSpacer | undefined>(() => {
      const _spacer = props.spacer;
      if (!_spacer) return;
      return _spacer === true ? 'left' : _spacer;
    });
    return {
      ...color,
      navigationable,
      isDisabled,
      isLoading,
      spacer,
      control,
    };
  },
  render() {
    const {
      navigationable,
      colorClasses,
      $slots,
      isDisabled,
      spacer,
      control,
    } = this;
    const { Tag, attrs, classes } = navigationable;
    const children = $slots.default && $slots.default();
    const _attrs = {
      ...attrs,
    };
    if (isDisabled) {
      _attrs.disabled = true;
    }
    return (
      <Tag
        class={[
          'v-button',
          colorClasses,
          classes,
          spacer ? `v-button--spacer-${spacer}` : undefined,
          `v-button--${control.size.value}`,
          {
            'v-button--loading': this.isLoading,
          },
          // ...control.classes.value,
        ]}
        {..._attrs}
        onClick={(ev: MouseEvent) => {
          if (this.isDisabled || this.isLoading) {
            ev.preventDefault();
            if (this.isDisabled) {
              return;
            }
          }
          this.$emit('click', ev);
        }}>
        <span class="v-button__content">{children}</span>
        {this.loading && (
          <VProgressCircular
            class="v-button__loading"
            indeterminate
            size={LOADING_SIZE_MAP[control.size.value]}
          />
        )}
      </Tag>
    );
  },
});
