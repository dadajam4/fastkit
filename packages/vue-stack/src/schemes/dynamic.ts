import { h, VNode, VNodeChild } from 'vue';

import { VStackControl } from './control';
import type { VDialogStatic, VDialogProps } from '../components/VDialog';
import type { VSnackbarStatic, VSnackbarProps } from '../components/VSnackbar';
import type { VMenuStatic, VMenuProps } from '../components/VMenu';
import type {
  VSheetModalStatic,
  VSheetModalProps,
} from '../components/VSheetModal';

// export type VStackDynamicCtor = VDialogStatic;

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
  Ctor: VDialogStatic;
  props: Partial<VDialogProps>;
}

export interface VStackDynamicSnackbarSetting extends VStackDynamicBaseSetting {
  Ctor: VSnackbarStatic;
  props: Partial<VSnackbarProps>;
}

export interface VStackDynamicMenuSetting extends VStackDynamicBaseSetting {
  Ctor: VMenuStatic;
  props: Partial<VMenuProps>;
}

export interface VStackDynamicSheetSetting extends VStackDynamicBaseSetting {
  Ctor: VSheetModalStatic;
  props: Partial<VSheetModalProps>;
}

// import type { VSheetModalStatic, VSheetModalProps } from '../components/VSheetModal';

export type VStackDynamicSetting =
  | VStackDynamicDialogSetting
  | VStackDynamicSnackbarSetting
  | VStackDynamicMenuSetting
  | VStackDynamicSheetSetting;

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
  Partial<VDialogProps>
>;

export type VStackDynamicSnackbarInput = VStackDynamicInput<
  Partial<VSnackbarProps>
>;

export type VStackDynamicMenuInput = VStackDynamicInput<Partial<VMenuProps>>;

export type VStackDynamicSheetInput = VStackDynamicInput<
  Partial<VSheetModalProps>
>;
