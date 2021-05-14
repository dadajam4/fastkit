import { reactive, onBeforeMount, onBeforeUnmount } from 'vue';
import {
  visibilityManager,
  VisibilityState as State,
  VisibilityStateListener,
  VisibilityTypedCallback,
} from '@fastkit/visibility';

export interface VisibilityState {
  state: State;
  visible: boolean;
  hidden: boolean;
}

const initialState = visibilityManager.state;

const state = reactive<VisibilityState>({
  state: initialState,
  visible: initialState === 'visible',
  hidden: initialState === 'hidden',
});

visibilityManager.change((newState) => {
  state.state = newState;
  const isVisible = newState === 'visible';
  state.visible = isVisible;
  state.hidden = !isVisible;
});

export interface UseVisibilityRef {
  readonly state: State;
  readonly visible: boolean;
  readonly hidden: boolean;
}

export interface UseVisibilityOptions {
  change?: VisibilityStateListener;
  visible?: VisibilityTypedCallback;
  hidden?: VisibilityTypedCallback;
}

export function useVisibility(
  opts: UseVisibilityOptions = {},
): UseVisibilityRef {
  const { change, visible, hidden } = opts;
  const removers: (() => void)[] = [];

  onBeforeMount(() => {
    change && removers.push(visibilityManager.change(change));
    visible && removers.push(visibilityManager.visible(visible));
    hidden && removers.push(visibilityManager.hidden(hidden));
  });

  onBeforeUnmount(() => {
    removers.forEach((remover) => remover());
    removers.length = 0;
  });

  return {
    get state() {
      return state.state;
    },
    get visible() {
      return state.visible;
    },
    get hidden() {
      return state.hidden;
    },
  };
}
