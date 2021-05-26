import { VNodeChild, PropType, ExtractPropTypes, VNode } from 'vue';
import { VStackBtnProps } from '../components/VStackBtn';
import { VStackControl } from './control';
import type { VueStackService } from '../service';

export type VStackActionMessageResolver = VNodeChild | (() => VNodeChild);

export interface VStackActionMessageResolvers {
  ok: VStackActionMessageResolver;
  cancel: VStackActionMessageResolver;
  close: VStackActionMessageResolver;
}

export type RawVStackActionContent =
  | VNodeChild
  | ((control: VStackControl) => VNodeChild);

export interface VStackAction extends Omit<VStackBtnProps, 'onClick'> {
  key: string | number;
  content?: RawVStackActionContent;
  onClick?: (control: VStackControl, ev: MouseEvent) => any;
}

export function resolveRawVStackActionContent(
  source: RawVStackActionContent,
  control: VStackControl,
): VNodeChild {
  return typeof source === 'function' ? source(control) : source;
}

export type RawVStackActions =
  | VStackAction[]
  | ((control: VStackControl) => VStackAction[]);

export function resolveRawVStackActions(
  source: RawVStackActions,
  control: VStackControl,
): VStackAction[] {
  return typeof source === 'function' ? source(control) : source;
}

export function createStackActionProps() {
  return {
    actions: {
      type: [Array, Function] as PropType<RawVStackActions>,
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
  readonly $actions: VNode[];
}

export type VStackActionResolver = (service: VueStackService) => VStackAction;

export const DEFAULT_ACTION_MESSAGES: VStackActionMessageResolvers = {
  ok: 'OK',
  cancel: 'CANCEL',
  close: 'CLOSE',
};

export const DEFAULT_ACTIONS: Record<
  keyof VStackActionMessageResolvers,
  VStackActionResolver
> = {
  ok: (service) => {
    return {
      key: '__ok',
      content: service.actionMessage('ok'),
      color: service.primaryColor,
      onClick: (control) => {
        control.resolve(true);
      },
    };
  },
  cancel: (service) => {
    return {
      key: '__cancel',
      content: service.actionMessage('cancel'),
      color: service.primaryColor,
      outlined: true,
      onClick: (control) => {
        control.resolve(false);
      },
    };
  },
  close: (service) => {
    return {
      key: '__close',
      content: service.actionMessage('close'),
      color: service.primaryColor,
      onClick: (control) => {
        control.close({ force: true });
      },
    };
  },
};
