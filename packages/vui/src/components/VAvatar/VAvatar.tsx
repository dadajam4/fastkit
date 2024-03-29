import './VAvatar.scss';
import { defineComponent, computed, PropType } from 'vue';
import { actionableInheritProps, useActionable } from '@fastkit/vue-action';
import { colorSchemeProps, useColorClasses } from '@fastkit/vue-color-scheme';
import { useVui } from '../../injections';
import { VBusyImage } from '../VBusyImage';

// @TODO Unable to resolve dts for `navigationableInheritProps`.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line import/order
import { RouteLocationRaw } from 'vue-router';

export const AVATAR_SIZES = ['sm', 'md', 'lg'] as const;

export type AvatarSize = (typeof AVATAR_SIZES)[number];

export function createAvatarProps() {
  return {
    ...colorSchemeProps(),
    ...actionableInheritProps,
    size: {
      type: [String, Number] as PropType<AvatarSize | number>,
      default: 'md',
    },
    tile: Boolean,
    rounded: Boolean,
    disabled: Boolean,
    src: String,
  };
}

export const VAvatar = defineComponent({
  name: 'VAvatar',
  inheritAttrs: false,
  props: createAvatarProps(),
  setup(props, ctx) {
    const vui = useVui();
    const defaults = vui.setting('buttonDefault');
    const color = useColorClasses({
      color: () => props.color || defaults.color,
      variant: () => props.variant || defaults.variant,
    });

    const classes = computed(() => {
      const { size } = props;
      return [
        {
          'v-avatar--tile': props.tile,
          'v-avatar--rounded': props.rounded,
        },
        typeof size === 'string' && `v-avatar--${size}`,
      ];
    });

    const styles = computed(() => {
      const { size } = props;
      if (typeof size !== 'number') return;

      return {
        '--avatar-size': `${size}px`,
      };
    });

    const actionable = useActionable(ctx, {
      attrs: () => ({
        class: ['v-avatar', classes.value, color.colorClasses.value],
        style: styles.value,
      }),
      actionableClass: () => 'v-avatar--clickable',
      linkFallbackTag: 'div',
    });

    return () => {
      const { src } = props;
      return actionable.render(
        (!!src && <VBusyImage class="v-avatar__image" src={src} cover />) ||
          ctx.slots.default?.(),
      );
    };
  },
});
