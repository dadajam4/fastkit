import { ComponentPublicInstance, VNodeChild, h, VNode } from 'vue';
import { VStackControl } from './control';

export interface StackableComponent {
  new (): ComponentPublicInstance<
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any,
    any
  >;
}

type ComponentProps<T extends StackableComponent> = InstanceType<T>['$props'];

type ComponentSlots<T extends StackableComponent> = Omit<
  InstanceType<T>['$slots'],
  'default'
> & {
  default?: DefaultSlot;
};

type SlotLike = (...args: any[]) => any;

type SlotsLike = Record<keyof any, SlotLike>;

type NormalizeSlot<Slot extends SlotLike | undefined> = (
  ...args: Parameters<Exclude<Slot, undefined>>
) => VNodeChild;

type RawSlots<Slots extends SlotsLike> = {
  [K in keyof Slots]: NormalizeSlot<Slots[K]> | VNodeChild;
};

type DefaultSlot = (stackControl: VStackControl) => VNodeChild;

export type DefaultContent = VNodeChild | DefaultSlot;

export type ExtractDynamicStackProps<
  T extends StackableComponent,
  _Slots = ComponentSlots<T>,
> = (ComponentProps<T> & { content?: DefaultContent }) | null;

export type ExtractDynamicStackSlots<
  T extends StackableComponent,
  _Slots = ComponentSlots<T>,
> = RawSlots<_Slots extends SlotsLike ? _Slots : SlotsLike>;

export type DynamicStackPayload<Payload = any> = Promise<Payload>;

export type StackableLauncher<
  T extends StackableComponent,
  Payload = any,
  _Props = ExtractDynamicStackProps<T>,
> = ((content: DefaultContent) => DynamicStackPayload<Payload>) &
  ((props: _Props, content: DefaultContent) => DynamicStackPayload<Payload>) &
  ((
    props: _Props,
    slots: ExtractDynamicStackSlots<T>,
  ) => DynamicStackPayload<Payload>);

export interface DynamicStackSettings<T extends StackableComponent> {
  Ctor: T;
  props: any;
  slots: any;
}

const isObject = (source: unknown): source is Record<keyof any, any> =>
  !!source && typeof source === 'object' && !Array.isArray(source);

const normalizeSlot = (source: unknown) => {
  if (typeof source === 'function') return source;
  if (typeof source === 'string') {
    const tmp: (VNode | string)[] = [];
    const lines = source.trim().split('\n');
    lines.forEach((line, index) => {
      if (index !== 0) tmp.push(h('br'));
      tmp.push(line);
    });
    return () => tmp;
  }
  return () => source;
};

export function resolveDynamicStackSettings<T extends StackableComponent>(
  Ctor: T,
  contentOrProps: DefaultContent | ExtractDynamicStackProps<T>,
  contentOrSlots?: DefaultContent | ExtractDynamicStackSlots<T>,
  propsResolver?: (
    props: ExtractDynamicStackProps<T>,
  ) => ExtractDynamicStackProps<T>,
): DynamicStackSettings<T> {
  let slots: any;
  let props: any;

  if (isObject(contentOrProps)) {
    slots = isObject(contentOrSlots)
      ? {
          ...contentOrSlots,
        }
      : {
          default: contentOrSlots,
        };
    props = {
      ...contentOrProps,
    };
    if ('content' in props) {
      slots.default = props.content;
      delete props.content;
    }
  } else {
    slots = {
      default: contentOrProps,
    };
  }

  for (const key of Object.keys(slots)) {
    slots[key] = normalizeSlot(slots[key]);
  }

  if (propsResolver) {
    props = propsResolver(props);
  }

  return {
    Ctor,
    props: {
      ...props,
      lazyBoot: true,
      modelValue: true,
    },
    slots,
  };
}

export type DynamicStackResolver = (value: any) => void;

export interface DynamicStackInternalSetting {
  id: number;
  setting: DynamicStackSettings<any>;
  remove: () => void;
  resolve: DynamicStackResolver;
  reject: () => any;
}
