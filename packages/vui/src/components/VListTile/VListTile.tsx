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
  navigationableEmits,
  navigationableProps,
  useNavigationable,
  createPropsOptions,
} from '@fastkit/vue-utils';
import { useScopeColorClass, ScopeName } from '@fastkit/vue-color-scheme';
import { useLink } from 'vue-router';

export function createListTileProps() {
  const icon = rawIconProp();
  return {
    ...navigationableProps,
    ...createPropsOptions({
      startIcon: icon,
      endIcon: icon,
      fallbackTag: {
        type: String,
        default: 'div',
      },
      startIconEmptySpace: Boolean,
      color: String as PropType<ScopeName>,
    }),
  };
}

export const listTileEmits = {
  ...navigationableEmits,
  changeActive: (isActive: boolean) => true,
};

export const VListTile = defineComponent({
  name: 'VListTile',
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
    const navigationable = useNavigationable(
      props,
      () => props.fallbackTag,
      ctx as any,
    );

    const hasTo = computed(() => !!props.to);

    const link = useLink({ to: props.to || '' });

    const isActive = computed(() => {
      if (!hasTo.value) return false;
      return link.isActive.value;
    });

    const color = useScopeColorClass(props);
    const classes: ComputedRef<any[]> = computed(() => {
      const _color = color.value;
      const hasColor = !!_color.value;
      const _navigationable = navigationable.value;
      const clickable = _navigationable.clickable;

      return [
        color.value.className,
        _navigationable.classes,
        {
          'v-list-tile--clickable': clickable,
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
      const { Tag, attrs } = navigationable.value;

      return (
        <Tag
          class={['v-list-tile', classes.value]}
          {...attrs}
          onClick={(ev: MouseEvent) => {
            ctx.emit('click', ev);
          }}>
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
        </Tag>
      );
    };
  },
});
