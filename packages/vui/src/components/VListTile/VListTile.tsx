import './VListTile.scss';
import { defineComponent, computed } from 'vue';
import { rawRawIconProp, resolveRawIconProp } from '../VIcon';
import {
  renderSlotOrEmpty,
  navigationableEmits,
  navigationableProps,
  useNavigationable,
  createPropsOptions,
} from '@fastkit/vue-utils';

export function createListTileProps<T = void>() {
  const icon = rawRawIconProp<T>();
  return createPropsOptions({
    ...navigationableProps,
    startIcon: icon,
    endIcon: icon,
    fallbackTag: {
      type: String,
      default: 'div',
    },
  });
}

export const listTileEmits = {
  ...navigationableEmits.emits,
};

export const VListTile = defineComponent({
  name: 'VListTile',
  props: createListTileProps(),
  emits: {
    ...listTileEmits,
  },
  setup(props, ctx) {
    const startIcon = computed(() => resolveRawIconProp(props.startIcon));
    const endIcon = computed(() => resolveRawIconProp(props.endIcon));
    const navigationable = useNavigationable(props, () => props.fallbackTag);

    return () => {
      const _startIcon = startIcon.value;
      const _endIcon = endIcon.value;
      const { Tag, attrs, classes } = navigationable.value;

      return (
        <Tag class={['v-list-tile', classes]} {...attrs}>
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
