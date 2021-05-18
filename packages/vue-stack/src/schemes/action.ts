import { VNodeChild, PropType, ExtractPropTypes, VNode } from 'vue';
import { VStackBtnProps } from '../components/VStackBtn';
import { VStackControl } from './control';

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
