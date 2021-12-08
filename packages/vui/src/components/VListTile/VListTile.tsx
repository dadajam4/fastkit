import './VListTile.scss';
import { defineComponent, computed, PropType } from 'vue';
import { rawIconProp, resolveRawIconProp } from '../VIcon';
import {
  renderSlotOrEmpty,
  navigationableEmits,
  navigationableProps,
  useNavigationable,
  createPropsOptions,
} from '@fastkit/vue-utils';
import { useScopeColorClass, ScopeName } from '@fastkit/vue-color-scheme';

export function createListTileProps<T = void>() {
  const icon = rawIconProp<T>();
  return createPropsOptions({
    ...navigationableProps,
    startIcon: icon,
    endIcon: icon,
    fallbackTag: {
      type: String,
      default: 'div',
    },
    startIconEmptySpace: Boolean,
    color: String as PropType<ScopeName>,
  });
}

export const listTileEmits = {
  ...navigationableEmits,
};

export const VListTile = defineComponent({
  name: 'VListTile',
  props: createListTileProps(),
  emits: {
    ...listTileEmits,
  },
  setup(props, ctx) {
    const startIcon = computed(() => {
      let icon = resolveRawIconProp(undefined, props.startIcon);
      if (!icon && props.startIconEmptySpace) {
        icon = resolveRawIconProp(undefined, '$empty');
      }
      return icon;
    });
    const endIcon = computed(() =>
      resolveRawIconProp(undefined, props.endIcon),
    );
    const navigationable = useNavigationable(
      props,
      () => props.fallbackTag,
      ctx as any,
    );
    const color = useScopeColorClass(props);
    const classes = computed(() => {
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
        },
      ];
    });

    return () => {
      const _startIcon = startIcon.value;
      const _endIcon = endIcon.value;
      const { Tag, attrs } = navigationable.value;

      return (
        <Tag class={['v-list-tile', classes.value]} {...attrs}>
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
