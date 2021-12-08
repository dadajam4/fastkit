import './VNavigationItem.scss';
import {
  defineComponent,
  computed,
  VNodeChild,
  PropType,
  VNodeProps,
  Fragment,
  ref,
} from 'vue';
import { createListTileProps, listTileEmits, VListTile } from '../VListTile';
import {
  ExtractPropInput,
  renderSlotOrEmpty,
  VExpandTransition,
} from '@fastkit/vue-utils';
import { toRawIconProp } from '../VIcon/VIcon';
import { useVui } from '../../injections';

export function createNavigationItemProps() {
  return {
    ...createListTileProps<boolean>(),
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

    const iconPayload = () => opened.value;

    const _props = computed(() => {
      const c = children.value;
      let { endIcon } = props;
      if (c && !endIcon) {
        endIcon = vui.icon('navigationExpand');
        if (typeof endIcon === 'string') {
          const name = endIcon;
          endIcon = (gen, active) => {
            return gen({
              name,
              rotate: active ? 180 : 0,
            });
          };
        }
      }

      const __props: any = {
        ...props,
        endIcon,
      };

      delete __props.children;

      return {
        ...__props,
        startIcon: toRawIconProp(__props.startIcon, iconPayload),
        endIcon: toRawIconProp(__props.endIcon, iconPayload),
      } as ExtractPropInput<ReturnType<typeof createListTileProps>>;
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

    return () => {
      const _children = children.value;

      return (
        <Fragment>
          <VListTile
            {..._props.value}
            endIcon={_props.value.endIcon}
            class="v-navigation-item"
            onClick={(ev: MouseEvent) => {
              toggle();
              ev.preventDefault();
            }}>
            {renderSlotOrEmpty(ctx.slots, 'default')}
          </VListTile>
          {_children && (
            <VExpandTransition>
              <div class="v-navigation-item__expand" v-show={opened.value}>
                {_children.map((child) =>
                  renderNavigationItemInput(child, {
                    startIconEmptySpace: _props.value.startIconEmptySpace,
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
