import { computed } from 'vue';
import {
  VStackControl,
  VStackAction,
  VStackActionProps,
  VStackActionControl,
} from '../schemes';

export interface UseStackActionOptions {
  resolver?: (actions: VStackAction[]) => VStackAction[];
}

export function useStackAction(
  props: VStackActionProps,
  control: VStackControl,
  opts: UseStackActionOptions = {},
): VStackActionControl {
  const { resolver } = opts;
  const actions = computed(() => {
    const { actions: _actions } = props;
    return resolver ? resolver(_actions) : _actions;
  });
  const $actions = computed(() =>
    actions.value.map((action) => {
      // eslint-disable-next-line no-shadow
      const onClick = (control: VStackControl, ev: MouseEvent) =>
        action.onClick?.(control, ev);

      const content = action.content({
        control,
        key: action.key,
        onClick,
      });
      return content;
    }),
  );

  const actionControl: VStackActionControl = {
    get control() {
      return control;
    },
    get actions() {
      return actions.value;
    },
    get $actions() {
      return $actions.value;
    },
  };

  return actionControl;
}
