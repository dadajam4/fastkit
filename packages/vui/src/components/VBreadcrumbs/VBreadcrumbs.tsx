import './VBreadcrumbs.scss';

import { defineComponent, PropType, VNodeChild, computed } from 'vue';
import { VAction, ActionableInheritProps } from '@fastkit/vue-action';
import { useVui } from '../../injections';
import type { VuiService } from '../../service';
import { RawIconProp, resolveRawIconProp } from '../VIcon';

export interface BreadcrumbsItem
  extends Pick<ActionableInheritProps, 'to' | 'disabled'> {
  /**
   * "正確なマッチモード" を強制する場合true
   */
  // exact?: boolean;
  icon?: RawIconProp;
  text: VNodeChild | ((vui: VuiService) => VNodeChild);
}

export type RawBreadcrumbsItem = string | BreadcrumbsItem;

export const VBreadcrumbs = defineComponent({
  name: 'VBreadcrumbs',
  props: {
    items: {
      type: Array as PropType<BreadcrumbsItem[]>,
      default: () => [],
    },
    divider: [String, Function] as PropType<
      VNodeChild | ((vui: VuiService) => VNodeChild)
    >,
    // ...defineSlotsProps<{}>(),
  },
  setup(props, ctx) {
    const vui = useVui();

    const computedItemsRef = computed(() => {
      const items: BreadcrumbsItem[] = props.items.map((rawItem) => {
        return typeof rawItem === 'string'
          ? {
              text: rawItem,
            }
          : rawItem;
      });

      return items.map((item) => {
        const { to, text } = item;
        const {
          disabled = vui.location.match(to) || !vui.location.isAvailable(to),
        } = item;
        return {
          ...item,
          disabled,
          text: typeof text === 'function' ? text(vui) : text,
        };
      });
    });

    const lengthRef = computed(() => computedItemsRef.value.length);

    const defaultDividerSlot = () => {
      return [<i class="v-breadcrumbs__divider__icon" />];
    };

    return () => {
      if (lengthRef.value < 1) return;
      let dividerSlot: (vui: VuiService) => VNodeChild;
      const propDivider = props.divider;
      if (propDivider) {
        dividerSlot =
          typeof propDivider === 'function' ? propDivider : () => propDivider;
      } else {
        dividerSlot = defaultDividerSlot;
      }

      const children: VNodeChild[] = [];

      computedItemsRef.value.forEach((item, index) => {
        const { text, icon, disabled, to } = item;

        if (index > 0) {
          const divider = dividerSlot(vui);
          if (divider) {
            children.push(
              <li class="v-breadcrumbs__divider" key={`divider-${index}`}>
                {divider}
              </li>,
            );
          }
        }
        const myChildren: VNodeChild[] = [];

        if (icon) {
          const $icon = resolveRawIconProp(false, icon, {
            class: 'v-breadcrumbs__icon',
          });
          if ($icon) {
            myChildren.push($icon);
          }
        }

        if (text) myChildren.push(text);

        const itemChild = to ? (
          <VAction
            class="v-breadcrumbs__link"
            to={to}
            exactActiveClass="v-breadcrumbs__link--active"
            // exact={exact}
          >
            {myChildren}
          </VAction>
        ) : (
          myChildren
        );

        children.push(
          <li
            class={[
              'v-breadcrumbs__item',
              {
                'v-breadcrumbs__item--disabled': disabled,
              },
            ]}
            key={`link-${index}`}>
            {itemChild}
          </li>,
        );
      });

      return (
        <nav class="v-breadcrumbs">
          <ul class="v-breadcrumbs__list">{children}</ul>
        </nav>
      );
    };
  },
});
