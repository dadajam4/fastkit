import { computed } from 'vue';
import {
  VStackControl,
  VStackAction,
  VStackActionProps,
  VStackActionControl,
  resolveRawVStackActions,
  resolveRawVStackActionContent,
} from '../schemes';
import { VStackBtn } from '../components/VStackBtn';

export interface UseStackActionOptions {
  resolver?: (resolver: typeof resolveRawVStackActions) => VStackAction[];
}

export function useStackAction(
  props: VStackActionProps,
  control: VStackControl,
  opts: UseStackActionOptions = {},
): VStackActionControl {
  const actions = computed(() => {
    if (opts.resolver) return opts.resolver(resolveRawVStackActions);
    return resolveRawVStackActions(props.actions, control);
  });
  const $actions = computed(() => {
    return actions.value.map((props) => {
      const content = resolveRawVStackActionContent(props.content, control);
      const { onClick } = props;
      return (
        <VStackBtn
          {...{
            ...props,
            onClick: onClick
              ? (ev: MouseEvent) => {
                  onClick(control, ev);
                }
              : undefined,
          }}>
          {content}
        </VStackBtn>
      );
    });
  });

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
