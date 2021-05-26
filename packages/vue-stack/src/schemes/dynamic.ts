import { h, VNode, VNodeChild } from 'vue';

import { VStackControl } from './control';
import type {
  VStackDialogStatic,
  VStackDialogProps,
} from '../components/VStackDialog';
import type {
  VStackSnackbarStatic,
  VStackSnackbarProps,
} from '../components/VStackSnackbar';

// export type VStackDynamicCtor = VStackDialogStatic;

export type VStackDynamicChildren =
  | VNodeChild
  | ((control: VStackControl) => VNodeChild);

export function normalizeVStackDynamicChildren(
  children: VStackDynamicChildren,
) {
  if (typeof children === 'string') {
    const tmp: (VNode | string)[] = [];
    const lines = children.trim().split('\n');
    lines.forEach((line, index) => {
      if (index !== 0) tmp.push(h('br'));
      tmp.push(line);
    });
    return () => tmp;
  }
  return typeof children === 'function'
    ? {
        default: (control: VStackControl) => {
          const child = children(control);
          return [child];
        },
      }
    : () => [children];
}

export interface VStackDynamicBaseSetting {
  children: VStackDynamicChildren;
}

export interface VStackDynamicDialogSetting extends VStackDynamicBaseSetting {
  Ctor: VStackDialogStatic;
  props: Partial<VStackDialogProps>;
}

export interface VStackDynamicSnackbarSetting extends VStackDynamicBaseSetting {
  Ctor: VStackSnackbarStatic;
  props: Partial<VStackSnackbarProps>;
}

export type VStackDynamicSetting =
  | VStackDynamicDialogSetting
  | VStackDynamicSnackbarSetting;

export type VStackDynamicResolver = (value: any) => void;

export interface VStackDynamicInternalSetting {
  id: number;
  setting: VStackDynamicSetting;
  remove: () => void;
  resolve: VStackDynamicResolver;
  reject: () => any;
}

export type VStackDynamicInput<T extends { [key: string]: any }> =
  | string
  | number
  | boolean
  | null
  | undefined
  | (T & { content: VStackDynamicChildren });

export type ResolvedVStackDynamicInput<
  T extends { content: VStackDynamicChildren },
> = {
  props: Omit<T, 'content'>;
  children: VStackDynamicChildren;
};

export function resolveVStackDynamicInput<
  T extends { content: VStackDynamicChildren },
>(input: VStackDynamicInput<T>): ResolvedVStackDynamicInput<T> {
  const _input: T =
    input === null || typeof input !== 'object'
      ? ({ content: input } as T)
      : input;

  const props: Omit<T, 'content'> = {
    ..._input,
  };
  delete (props as T).content;

  return {
    props,
    children: _input.content,
  };
}

export type VStackDynamicDialogInput = VStackDynamicInput<
  Partial<VStackDialogProps>
>;

export type VStackDynamicSnackbarInput = VStackDynamicInput<
  Partial<VStackSnackbarProps>
>;
