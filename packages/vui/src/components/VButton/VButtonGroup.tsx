import './VButtonGroup.scss';

import { defineComponent, isVNode, cloneVNode, VNodeChild, VNode } from 'vue';
import { colorSchemeProps } from '@fastkit/vue-color-scheme';
import { createControlProps } from '../../composables';
import { renderSlotOrEmpty } from '@fastkit/vue-utils';
import { VButton } from './VButton';

type VButtonGroupChild =
  | {
      isButton: true;
      node: VNode;
    }
  | {
      isButton: false;
      node: VNodeChild;
    };

export const VButtonGroup = defineComponent({
  name: 'VButtonGroup',
  props: {
    ...colorSchemeProps(),
    ...createControlProps(),
    disabled: Boolean,
  },
  setup(props, ctx) {
    return () => {
      let buttonLength = 0;

      const children: VButtonGroupChild[] = (
        renderSlotOrEmpty(ctx.slots) || []
      ).map((node) => {
        if (!isVNode(node) || node.type !== VButton) {
          return {
            isButton: false,
            node,
          };
        }

        buttonLength++;

        return {
          isButton: true,
          node,
        };
      });
      // const children = renderSlotOrEmpty(ctx.slots) || [];
      // const $children = children.map((child) => {
      //   if (!isVNode(child) || child.type !== VButton) return child;
      //   const $child = cloneVNode(child, {
      //     ...props,
      //     ...child.props,
      //   });
      //   return $child;
      // });
      let buttonIndex = 0;

      const $children = children.map((child) => {
        if (child.isButton) {
          buttonIndex++;

          const hasLeft = buttonIndex > 1;
          const hasRight = buttonIndex < buttonLength;

          const childProps = child.node.props;

          return cloneVNode(child.node, {
            ...props,
            ...childProps,
            rouded: false,
            class: [
              'v-button-group__item',
              {
                'v-button-group__item--has-left': hasLeft,
                'v-button-group__item--has-right': hasRight,
              },
            ],
          });
        }
        return child.node;
      });
      return <div class="v-button-group">{$children}</div>;
    };
  },
});
