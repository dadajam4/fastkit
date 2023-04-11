import './VButton.scss';
import {
  defineComponent,
  ExtractPropTypes,
  computed,
  PropType,
  VNodeChild,
} from 'vue';
import { colorSchemeProps, useColorClasses } from '@fastkit/vue-color-scheme';
import {
  ExtractPropInput,
  createPropsOptions,
  renderSlotOrEmpty,
  htmlAttributesPropOptions,
} from '@fastkit/vue-utils';
import { VAction, actionableInheritProps } from '@fastkit/vue-action';
import { useVui } from '../../injections';
import { createControlProps, useControl } from '../../composables';
import { VProgressCircular } from '../loading';
import { ControlSize } from '../../schemes/control';
import { VIcon } from '../VIcon';
import type { IconName } from '../VIcon';

// @TODO Unable to resolve dts for `navigationableInheritProps`.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { RouteLocationRaw } from 'vue-router';

export type VButtonSpacer = 'left' | 'right';

export type RawVButtonSpacer = boolean | VButtonSpacer;

export type VButtonIcon = () => VNodeChild;

export type RawVButtonIcon = IconName | VButtonIcon;

export const BUTTON_ALIGNS = ['left', 'center', 'right'] as const;

export type VButtonAlign = (typeof BUTTON_ALIGNS)[number];

function resolveRawVButtonIcon(
  raw?: RawVButtonIcon,
  type: 'main' | 'start' | 'end' = 'main',
): VButtonIcon | undefined {
  if (!raw) return;
  return typeof raw === 'function'
    ? raw
    : () => (
        <VIcon
          class={['v-button__icon', `v-button__icon--${type}`]}
          name={raw}
        />
      );
}

export const vueButtonProps = createPropsOptions({
  ...htmlAttributesPropOptions,
  ...colorSchemeProps(),
  ...actionableInheritProps,
  spacer: [Boolean, String] as PropType<RawVButtonSpacer>,
  rounded: Boolean,
  icon: [String, Function] as PropType<RawVButtonIcon>,
  startIcon: [String, Function] as PropType<RawVButtonIcon>,
  endIcon: [String, Function] as PropType<RawVButtonIcon>,
  align: {
    type: String as PropType<VButtonAlign>,
    default: 'center',
  },
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
  inheritAttrs: false,
  props: vueButtonProps,
  setup(props, ctx) {
    const vui = useVui();
    const control = useControl(props);
    const defaults = vui.setting('buttonDefault');
    const icon = computed(() => {
      const _icon = resolveRawVButtonIcon(props.icon);
      return _icon && _icon();
    });
    const startIcon = computed(() => {
      const _icon = resolveRawVButtonIcon(props.startIcon, 'start');
      return _icon && _icon();
    });
    const endIcon = computed(() => {
      const _icon = resolveRawVButtonIcon(props.endIcon, 'end');
      return _icon && _icon();
    });
    const color = useColorClasses({
      color: () => props.color || defaults.color,
      variant: () =>
        props.variant ||
        (icon.value ? vui.setting('plainVariant') : defaults.variant),
    });
    const isPlain = computed(
      () =>
        color.variant.value.value === vui.setting('plainVariant') &&
        color.color.value.value === defaults.color,
    );
    const isLoading = computed(() => props.loading);
    // const isDisabled = computed(() => props.disabled);
    // const isRounded = computed(() =>
    //   props.rounded != null ? props.rounded : !!icon.value,
    // );

    const spacer = computed<VButtonSpacer | undefined>(() => {
      const _spacer = props.spacer;
      if (!_spacer) return;
      return _spacer === true ? 'left' : _spacer;
    });

    const classes = computed(() => [
      color.colorClasses.value,
      spacer.value ? `v-button--spacer-${spacer.value}` : undefined,
      `v-button--${control.size.value}`,
      `v-button--align-${props.align}`,
      {
        'v-button--loading': isLoading.value,
        'v-button--icon': !!icon.value,
        'v-button--rounded': props.rounded,
        'v-button--plain': isPlain.value,
      },
    ]);

    return () => {
      const children = renderSlotOrEmpty(ctx.slots);
      return (
        <VAction {...ctx.attrs} class={['v-button', classes.value]}>
          <span class="v-button__content">
            {startIcon.value}
            {children}
            {icon.value}
            {endIcon.value}
          </span>
          {isLoading.value && (
            <VProgressCircular
              class="v-button__loading"
              indeterminate
              size={LOADING_SIZE_MAP[control.size.value]}
            />
          )}
        </VAction>
      );
    };
  },
});
