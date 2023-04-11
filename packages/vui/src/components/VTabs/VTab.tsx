import './VTab.scss';

import {
  defineComponent,
  PropType,
  computed,
  ComponentPublicInstance,
} from 'vue';
import { RouteLocationRaw } from 'vue-router';
import { RawIconProp, resolveRawIconProp } from '../VIcon';
import { renderSlotOrEmpty } from '@fastkit/vue-utils';
import { RouterLink } from 'vue-router';

export interface VTabExpose {
  value: string;
  active: boolean;
}

export interface VTabRef extends ComponentPublicInstance, VTabExpose {}

export const VTab = defineComponent({
  name: 'VTab',
  props: {
    value: {
      type: String,
      required: true,
    },
    active: Boolean,
    to: [String, Object] as PropType<RouteLocationRaw>,
    icon: [String, Function] as PropType<RawIconProp>,
  },
  emits: {
    click: (ev: MouseEvent) => true,
  },
  setup(props, ctx) {
    const classesRef = computed(() => ({
      'v-tab--active': props.active,
    }));

    const exposeValues: VTabExpose = {
      value: props.value,
      active: props.active,
    };

    ctx.expose(exposeValues);

    return () => {
      const { to, value, icon, active } = props;
      const classes = ['v-tab', classesRef.value];

      const children = (
        <span class="v-tab__content">
          {icon &&
            resolveRawIconProp(active, icon, {
              class: 'v-tab__icon',
            })}
          {renderSlotOrEmpty(ctx.slots)}
        </span>
      );

      if (to) {
        const replace = typeof to === 'string' ? undefined : to.replace;
        return (
          <RouterLink
            class={classes}
            to={to}
            replace={replace}
            // disableScrollBehavior
          >
            {children}
          </RouterLink>
        );
      } else {
        return (
          <button
            class={classes}
            type="button"
            value={value}
            onClick={(ev) => {
              ctx.emit('click', ev);
            }}>
            {children}
          </button>
        );
      }
    };
  },
});
