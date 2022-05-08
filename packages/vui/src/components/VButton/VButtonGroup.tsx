import './VButtonGroup.scss';

import { defineComponent, isVNode, cloneVNode, VNodeChild, VNode } from 'vue';
import { colorSchemeProps } from '@fastkit/vue-color-scheme';
import { createControlProps } from '../../composables';
import { renderSlotOrEmpty, isFragment } from '@fastkit/vue-utils';
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
      let hasIcon = false;
      let buttonLength = 0;

      let tmp = renderSlotOrEmpty(ctx.slots) || [];

      if (tmp.length === 1 && isFragment(tmp[0])) {
        tmp = tmp[0].children as any;
      }

      const children: VButtonGroupChild[] = tmp.map((node) => {
        if (!isVNode(node) || node.type !== VButton) {
          return {
            isButton: false,
            node,
          };
        }

        buttonLength++;

        if (!hasIcon && node.props && !!node.props.icon) {
          hasIcon = true;
        }

        return {
          isButton: true,
          node,
        };
      });

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
                'v-button--icon': hasIcon,
                'v-button-group__item--has-left': hasLeft,
                'v-button-group__item--has-right': hasRight,
              },
            ],
          });
        }
        return child.node;
      });
      return (
        <div
          class={['v-button-group', { 'v-button-group--has-icon': hasIcon }]}>
          {$children}
        </div>
      );
    };
  },
});
