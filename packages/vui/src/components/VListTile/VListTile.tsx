import './VListTile.scss';
import {
  defineComponent,
  computed,
  PropType,
  VNodeChild,
  ComputedRef,
  watch,
} from 'vue';
import { rawIconProp, resolveRawIconProp } from '../VIcon';
import {
  renderSlotOrEmpty,
  navigationableInheritProps,
  createPropsOptions,
} from '@fastkit/vue-utils';
import { useScopeColorClass, ScopeName } from '@fastkit/vue-color-scheme';
import { useLink } from 'vue-router';
import { VLink } from '@fastkit/vue-utils';

export function createListTileProps() {
  const icon = rawIconProp();
  return {
    ...navigationableInheritProps,
    ...createPropsOptions({
      startIcon: icon,
      endIcon: icon,
      linkFallbackTag: {
        type: String,
        default: 'div',
      },
      startIconEmptySpace: Boolean,
      color: String as PropType<ScopeName>,
      exactMatch: Boolean,
    }),
  };
}

export const listTileEmits = {
  changeActive: (isActive: boolean) => true,
};

export const VListTile = defineComponent({
  name: 'VListTile',
  inheritAttrs: false,
  props: createListTileProps(),
  emits: {
    ...listTileEmits,
  },
  setup(props, ctx) {
    const startIcon: ComputedRef<VNodeChild> = computed(() => {
      let icon = resolveRawIconProp(false, props.startIcon);
      if (!icon && props.startIconEmptySpace) {
        icon = resolveRawIconProp(false, '$empty');
      }
      return icon;
    });
    const endIcon: ComputedRef<VNodeChild> = computed(() =>
      resolveRawIconProp(false, props.endIcon),
    );

    const hasTo = computed(() => !!ctx.attrs.to);

    const link = useLink({ to: (ctx.attrs.to as any) || '' });

    const isActive = computed(() => {
      if (!hasTo.value) return false;
      return props.exactMatch ? link.isExactActive.value : link.isActive.value;
    });

    const color = useScopeColorClass(props);
    const classes: ComputedRef<any[]> = computed(() => {
      const _color = color.value;
      const hasColor = !!_color.value;

      return [
        color.value.className,
        {
          'v-list-tile--plain': !hasColor,
          'v-list-tile--has-color': hasColor,
          'v-list-tile--active': isActive.value,
        },
      ];
    });

    watch(
      () => isActive.value,
      (isActive) => {
        ctx.emit('changeActive', isActive);
      },
      {
        immediate: true,
      },
    );

    return () => {
      const _startIcon = startIcon.value;
      const _endIcon = endIcon.value;

      return (
        <VLink
          {...ctx.attrs}
          class={['v-list-tile', classes.value]}
          clickableClassName="v-list-tile--clickable">
          {_startIcon && (
            <span class="v-list-tile__icon v-list-tile__icon--start">
              {_startIcon}
            </span>
          )}
          <span class="v-list-tile__body">
            {renderSlotOrEmpty(ctx.slots, 'default')}
          </span>
          {_endIcon && (
            <span class="v-list-tile__icon v-list-tile__icon--end">
              {_endIcon}
            </span>
          )}
        </VLink>
      );
    };
  },
});
