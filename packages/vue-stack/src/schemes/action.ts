import { VNodeChild, PropType, ExtractPropTypes } from 'vue';
import { VStackControl } from './control';
import type { VueStackService } from '../service';

export interface VStackActionContext {
  control: VStackControl;
  key: string | number;
  onClick: (control: VStackControl, ev: MouseEvent) => any;
}

export type VStackActionFn = (ctx: VStackActionContext) => VNodeChild;

export interface VStackAction {
  key: string | number;
  content: VStackActionFn;
  onClick?: (control: VStackControl, ev: MouseEvent) => any;
}

export function createStackActionProps() {
  return {
    actions: {
      type: [Array] as PropType<VStackAction[]>,
      default: () => [],
    },
  };
}

export type VStackActionProps = ExtractPropTypes<
  ReturnType<typeof createStackActionProps>
>;

export interface VStackActionControl {
  readonly control: VStackControl;
  readonly actions: VStackAction[];
  readonly $actions: VNodeChild[];
}

export type VStackBuiltinActionType = 'ok' | 'cancel' | 'close';

export interface VStackBuiltinActionContext {
  service: VueStackService;
  control: VStackControl;
  key: string | number;
  bindings: {
    onClick?: (ev: MouseEvent) => void;
  };
}

export type VStackBuiltinAction = (
  context: VStackBuiltinActionContext,
) => VNodeChild;

export type VStackBuiltinActions = Record<
  VStackBuiltinActionType,
  VStackBuiltinAction
>;

export const BUILTIN_ACTION_HANDLERS: Record<
  VStackBuiltinActionType,
  (control: VStackControl, ev: MouseEvent) => any
> = {
  ok: (control, ev) => {
    control.resolve(true);
  },
  cancel: (control, ev) => {
    control.resolve(false);
  },
  close: (control, ev) => {
    control.close({ force: true });
  },
};
