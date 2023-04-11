import './VChip.scss';
import { defineComponent, computed, PropType, VNodeChild } from 'vue';
import { renderSlotOrEmpty } from '@fastkit/vue-utils';
import { actionableInheritProps, useActionable } from '@fastkit/vue-action';
import { colorSchemeProps, useColorClasses } from '@fastkit/vue-color-scheme';
import { useVui } from '../../injections';
import type { IconName } from '../VIcon';
import { VIcon } from '../VIcon';

// @TODO Unable to resolve dts for `actionableInheritProps`.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { RouteLocationRaw } from 'vue-router';

export const CHIP_SIZES = ['xs', 'sm', 'md', 'lg', 'xl'] as const;

export type ChipSize = (typeof CHIP_SIZES)[number];

export type VChipIcon = () => VNodeChild;

export type RawVChipIcon = IconName | VChipIcon;

export function createChipProps() {
  return {
    ...colorSchemeProps(),
    ...actionableInheritProps,
    size: {
      type: String as PropType<ChipSize>,
      default: 'md',
    },
    startIcon: [String, Function] as PropType<RawVChipIcon>,
    endIcon: [String, Function] as PropType<RawVChipIcon>,
    label: Boolean,
    disabled: Boolean,
  };
}

function resolveRawVChipIcon(
  raw: RawVChipIcon | undefined,
  type: 'start' | 'end',
): VChipIcon | undefined {
  if (!raw) return;
  if (typeof raw === 'function') {
    return () => {
      const child = raw();
      if (child == null) return;
      return (
        <span class={['v-chip__icon', `v-chip__icon--${type}`]}>{child}</span>
      );
    };
  }
  return () => (
    <VIcon class={['v-chip__icon', `v-chip__icon--${type}`]} name={raw} />
  );
}

export const VChip = defineComponent({
  name: 'VChip',
  inheritAttrs: false,
  props: createChipProps(),
  setup(props, ctx) {
    const vui = useVui();
    const defaults = vui.setting('buttonDefault');
    const color = useColorClasses({
      color: () => props.color || defaults.color,
      variant: () => props.variant || defaults.variant,
    });
    const startIcon = computed(() => {
      const _icon = resolveRawVChipIcon(props.startIcon, 'start');
      return _icon && _icon();
    });
    const endIcon = computed(() => {
      const _icon = resolveRawVChipIcon(props.endIcon, 'end');
      return _icon && _icon();
    });
    const actionable = useActionable(ctx, {
      clickableClassName: () => 'v-chip--clickable',
      linkFallbackTag: 'div',
    });

    const classes = computed(() => {
      const { size } = props;
      return [
        {
          'v-chip--label': props.label,
        },
        typeof size === 'string' && `v-chip--${size}`,
      ];
    });

    return () => {
      const { Tag, attrs } = actionable.value;
      return (
        <Tag
          {...attrs}
          class={['v-chip', classes.value, color.colorClasses.value]}>
          {startIcon.value}
          <span class="v-chip__content">{renderSlotOrEmpty(ctx.slots)}</span>
          {endIcon.value}
        </Tag>
      );
    };
  },
});
