import './VNavigationItem.scss';
import {
  defineComponent,
  computed,
  VNodeChild,
  PropType,
  VNodeProps,
  Fragment,
  ref,
  watch,
} from 'vue';
import { createListTileProps, listTileEmits, VListTile } from '../VListTile';
import {
  ExtractPropInput,
  renderSlotOrEmpty,
  VExpandTransition,
} from '@fastkit/vue-utils';
// import { toRawIconProp } from '../VIcon/VIcon';
import { useVui } from '../../injections';
import { useRoute } from 'vue-router';

export function createNavigationItemProps() {
  return {
    ...createListTileProps(),
    match: String,
  };
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface NavigationItemInput
  extends ExtractPropInput<ReturnType<typeof createNavigationItemProps>> {
  key: string | number;
  label: VNodeChild | (() => VNodeChild);
  children?: NavigationItemInput[];
}

export function resolveNavigationItemInput(input: NavigationItemInput) {
  let label = input.label;
  const props: NavigationItemInput = {
    ...input,
  };
  if (typeof label === 'function') {
    label = label();
  }
  delete (props as NavigationItemInput).label;

  return {
    label,
    props,
  };
}

export function renderNavigationItemInput(
  input: NavigationItemInput,
  extraProps?: Record<string, unknown> & VNodeProps,
) {
  const { label, props } = resolveNavigationItemInput(input);
  return (
    <VNavigationItem {...{ ...props, ...(extraProps as any) }}>
      {label}
    </VNavigationItem>
  );
}

export const VNavigationItem = defineComponent({
  name: 'VNavigationItem',
  inheritAttrs: false,
  props: {
    ...createNavigationItemProps(),
    children: Array as PropType<NavigationItemInput[]>,
  },
  emits: {
    ...listTileEmits,
  },
  setup(props, ctx) {
    const vui = useVui();
    const opened = ref(false);

    const children = computed(() => {
      const c = props.children;
      return c && c.length ? c : undefined;
    });

    const to = computed(() => props.to);

    const match = computed(() => {
      const { match, to } = props;
      if (match) return match;
      if (!to) return;
      if (typeof to === 'string') return to;
      return (to as any).path as string | undefined;
    });

    const classes = computed(() => [
      {
        'v-navigation-item--opened': opened.value,
      },
    ]);

    const route = useRoute();

    // const classes = computed(() => [
    //   // {
    //   //   'v-navigation-item--matched': matched.value,
    //   // },
    // ]);

    watch(
      () => route.path,
      (newPath) => {
        const c = children.value;
        const m = match.value;

        if (!c || !m) {
          // matched.value = false;
          return;
        }

        if (newPath.match(m)) {
          open();
          // matched.value = true;
        } else {
          close();
          // matched.value = false;
        }
      },
      { immediate: true },
    );

    // const iconPayload = () => opened.value;

    const _props = computed(() => {
      const c = children.value;
      let { endIcon } = props;
      if (c && !endIcon) {
        endIcon = vui.icon('navigationExpand');
        if (typeof endIcon === 'string') {
          const name = endIcon;
          endIcon = (gen) => {
            return gen({
              name,
              rotate: opened.value ? 180 : 0,
            });
          };
        }
      }

      const __props: any = {
        ...props,
        endIcon,
      };

      delete __props.children;

      // const _activeClass = props.activeClass;
      // const activeClass = `v-navigation-item--active${
      //   _activeClass ? ` ${_activeClass}` : ''
      // }`;

      return {
        ...__props,
        // activeClass,
        // startIcon: toRawIconProp(__props.startIcon, iconPayload),
        // endIcon: toRawIconProp(__props.endIcon, iconPayload),
      };
    });

    function open() {
      opened.value = true;
    }

    function close() {
      opened.value = false;
    }

    function toggle() {
      return opened.value ? close() : open();
    }

    const onClick = (ev: MouseEvent) => {
      if (!to.value) {
        toggle();
      }
      ctx.emit('click', ev);
    };

    const onChangeActive = (isActive: boolean) => {
      // if (isActive) {
      //   // open();
      //   // if (typeof window !== 'undefined') {
      //   //   // open();
      //   //   // console.log('hoge', window);
      //   //   setTimeout(() => {
      //   //     open();
      //   //   }, 1000);
      //   // }
      //   // open();
      //   // console.log(props);
      //   // setTimeout(() => {
      //   //   open();
      //   // }, 500);
      // }
      ctx.emit('changeActive', isActive);
    };

    return () => {
      const _children = children.value;
      const fallbackTag = _children ? 'button' : undefined;

      return (
        <Fragment>
          <VListTile
            {..._props.value}
            fallbackTag={fallbackTag}
            endIcon={_props.value.endIcon}
            class={['v-navigation-item', classes.value]}
            onClick={onClick}
            onChangeActive={onChangeActive}>
            {renderSlotOrEmpty(ctx.slots, 'default')}
          </VListTile>
          {_children && (
            <VExpandTransition>
              <div class="v-navigation-item__expand" v-show={opened.value}>
                {_children.map((child) =>
                  renderNavigationItemInput(child, {
                    startIconEmptySpace: _props.value.startIconEmptySpace,
                    // onClick,
                    // onChangeActive,
                  }),
                )}
              </div>
            </VExpandTransition>
          )}
        </Fragment>
      );
    };
  },
});
