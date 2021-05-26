import './VStackSnackbar.scss';
import { defineComponent, ExtractPropTypes, computed } from 'vue';
import { createStackableDefine, createStackActionProps } from '../schemes';
import { useStackControl, useStackAction } from '../hooks';
import {
  VStackSnackbarTransition,
  stackSnackbarTransitionProps,
} from './VStackSnackbarTransition';
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

export type VStackSnackbarProps = ExtractPropInput<typeof stackSnackbarProps>;

export type VStackSnackbarResolvedProps = ExtractPropTypes<
  typeof stackSnackbarProps
>;

export const VStackSnackbar = defineComponent({
  name: 'VStackSnackbar',
  inheritAttrs: false,
  props: stackSnackbarProps,
  emits,
  setup(props, ctx) {
    const stackControl = useStackControl(props, ctx);
    const actionControl = useStackAction(props, stackControl, {
      resolver: (resolve) => {
        if (props.actions.length === 0) {
          return [stackControl.$service.action('close')];
        } else {
          return resolve(props.actions, stackControl);
        }
      },
    });
    const snackPosition = computed<SnackPosition>(() => {
      let { top, bottom, left } = props;
      const { right } = props;

      if (top === bottom) {
        top = false;
        bottom = true;
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
        'v-stack-snackbar--top': top,
        'v-stack-snackbar--bottom': bottom,
        'v-stack-snackbar--left': left,
        'v-stack-snackbar--right': right,
        'v-stack-snackbar--x-center': !hasHorizontal,
        'v-stack-snackbar--has-horizontal': hasHorizontal,
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
          <div
            class={[
              'v-stack-snackbar',
              color.colorClasses.value,
              classes.value,
            ]}>
            <div class="v-stack-snackbar__inner">
              <div class="v-stack-snackbar__body">{children}</div>
              {$actions.length > 0 && (
                <div class="v-stack-snackbar__actions">{$actions}</div>
              )}
            </div>
          </div>
        );
      },
      {
        transition: (child) => {
          return (
            <VStackSnackbarTransition {...position.value}>
              {child}
            </VStackSnackbarTransition>
          );
        },
      },
    );
  },
});

export type VStackSnackbarStatic = typeof VStackSnackbar;
