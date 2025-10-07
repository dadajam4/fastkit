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
import { ExtractPropInput } from '@fastkit/vue-utils';
import { VExpandTransition } from '@fastkit/vue-transitions';
import { ScopeName } from '@fastkit/color-scheme';

// @TODO Unable to resolve dts for `actionableInheritProps`.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { useRoute, RouteLocationRaw } from 'vue-router';
import { useVui } from '../../injections';
import { createListTileProps, listTileEmits, VListTile } from '../VListTile';

export function createNavigationItemProps() {
  return {
    ...createListTileProps(),
    match: [String, Array] as PropType<string | string[]>,
    depth: {
      type: Number,
      default: 0,
    },
    nested: Boolean,
    color: String as PropType<ScopeName>,
  };
}

export interface NavigationItemInput
  extends ExtractPropInput<ReturnType<typeof createNavigationItemProps>> {
  key: string | number;
  label: VNodeChild | (() => VNodeChild);
  children?: NavigationItemInput[];
}

export function resolveNavigationItemInput(input: NavigationItemInput) {
  let { label } = input;
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

const TRIM_END_SLASH_RE = /\/$/;

function trimEndSlash<T extends string | undefined>(source: T) {
  return source ? source.replace(TRIM_END_SLASH_RE, '') : source;
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

    const to = computed(() => ctx.attrs.to);

    const match = computed<string[] | undefined>(() => {
      const { match } = props;

      const { to } = ctx.attrs;
      if (match) {
        return (Array.isArray(match) ? match : [match]).map(trimEndSlash);
      }
      if (!to) return;
      const toPath = typeof to === 'string' ? to : (to as any).path;
      if (!toPath) return;
      return [trimEndSlash(toPath)];
    });

    const classes = computed(() => [
      {
        'v-navigation-item--opened': opened.value,
        [`v-navigation-item--depth-${props.depth}`]: props.depth > 0,
      },
    ]);

    const route = useRoute();

    watch(
      () => route.path,
      (newPath) => {
        const c = children.value;
        const m = match.value;

        if (!c || !m || !m.length) {
          return;
        }

        const trimmedNewPath = trimEndSlash(newPath);
        if (m.some((_) => trimmedNewPath.match(_))) {
          open();
        } else {
          close();
        }
      },
      { immediate: true },
    );

    const _props = computed(() => {
      const c = children.value;
      let { endIcon } = props;
      if (c && !endIcon) {
        endIcon = vui.icon('navigationExpand');
        if (typeof endIcon === 'string') {
          const name = endIcon;
          endIcon = (gen) =>
            gen({
              name,
              rotate: opened.value ? 180 : 0,
            });
        }
      }

      const __props: any = {
        ...props,
        endIcon,
      };

      delete __props.children;

      return {
        ...__props,
      };
    });

    function open() {
      if (!children.value) return;
      opened.value = true;
    }

    function close() {
      opened.value = false;
    }

    function toggle() {
      return opened.value ? close() : open();
    }

    const onClick = (ev: PointerEvent) => {
      if (!to.value) {
        return toggle();
      }
    };

    const onChangeActive = (isActive: boolean) => {
      ctx.emit('changeActive', isActive);
    };

    ctx.expose({
      close,
    });

    return () => {
      const _children = children.value;
      const fallbackTag = _children ? 'button' : undefined;

      return (
        <Fragment>
          <VListTile
            {...ctx.attrs}
            {..._props.value}
            fallbackTag={fallbackTag}
            endIcon={_props.value.endIcon}
            class={['v-navigation-item', classes.value]}
            onClick={onClick}
            onChangeActive={onChangeActive}>
            {ctx.slots.default?.()}
          </VListTile>
          {_children && (
            <VExpandTransition>
              <div class="v-navigation-item__expand" v-show={opened.value}>
                {_children.map((child) =>
                  renderNavigationItemInput(
                    {
                      color: props.color,
                      ...child,
                    },
                    {
                      startIconEmptySpace: _props.value.startIconEmptySpace,
                      depth: props.nested ? props.depth + 1 : props.depth,
                    },
                  ),
                )}
              </div>
            </VExpandTransition>
          )}
        </Fragment>
      );
    };
  },
});
