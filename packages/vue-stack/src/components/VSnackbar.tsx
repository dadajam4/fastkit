import './VSnackbar.scss';
import { defineComponent, ExtractPropTypes, computed } from 'vue';
import { createStackableDefine, createStackActionProps } from '../schemes';
import { useStackControl, useStackAction } from '../composables';
import {
  VSnackbarTransition,
  stackSnackbarTransitionProps,
} from './VSnackbarTransition';
import { ExtractPropInput } from '@fastkit/vue-utils';

const { props, emits } = createStackableDefine({
  defaultTransition: 'v-stack-fade',
  defaultCloseOnOutsideClick: false,
  defaultCloseOnNavigation: false,
  defaultTimeout: 6000,
});

const stackSnackbarProps = {
  ...props,
  ...createStackActionProps(),
  ...stackSnackbarTransitionProps,
};

interface SnackPosition {
  top: boolean;
  bottom: boolean;
  left: boolean;
  right: boolean;
}

export type VSnackbarProps = ExtractPropInput<typeof stackSnackbarProps>;

export type VSnackbarResolvedProps = ExtractPropTypes<
  typeof stackSnackbarProps
>;

export const VSnackbar = defineComponent({
  name: 'VSnackbar',
  inheritAttrs: false,
  props: stackSnackbarProps,
  emits,
  setup(props, ctx) {
    const stackControl = useStackControl(props, ctx);
    const actionControl = useStackAction(props, stackControl, {
      resolver: (actions) => {
        if (actions.length === 0) {
          return [stackControl.$service.action('close')];
        } else {
          return actions;
        }
      },
    });

    const { snackbarDefaultPosition } = stackControl.$service;

    const snackPosition = computed<SnackPosition>(() => {
      let { top, bottom, left } = props;
      const { right } = props;

      if (top === bottom) {
        top = snackbarDefaultPosition === 'top';
        bottom = !top;
      }

      if (left && right) {
        left = false;
      }

      return {
        top,
        bottom,
        left,
        right,
      };
    });

    const snackClasses = computed(() => {
      const { left, right, top, bottom } = snackPosition.value;
      const hasHorizontal = left || right;
      return {
        'v-snackbar--top': top,
        'v-snackbar--bottom': bottom,
        'v-snackbar--left': left,
        'v-snackbar--right': right,
        'v-snackbar--x-center': !hasHorizontal,
        'v-snackbar--has-horizontal': hasHorizontal,
      };
    });

    return {
      stackControl,
      actionControl,
      snackControl: {
        classes: snackClasses,
        position: snackPosition,
      },
    };
  },
  render() {
    const { render, color } = this.stackControl;
    const { $actions } = this.actionControl;
    const { classes, position } = this.snackControl;
    return render(
      (children) => {
        return (
          <div class={['v-snackbar', color.colorClasses.value, classes.value]}>
            <div class="v-snackbar__inner">
              <div class="v-snackbar__body">{children}</div>
              {$actions.length > 0 && (
                <div class="v-snackbar__actions">{$actions}</div>
              )}
            </div>
          </div>
        );
      },
      {
        transition: (child) => {
          return (
            <VSnackbarTransition {...position.value}>
              {child}
            </VSnackbarTransition>
          );
        },
      },
    );
  },
});

export type VSnackbarStatic = typeof VSnackbar;
