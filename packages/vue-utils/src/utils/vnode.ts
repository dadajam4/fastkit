import type { VNode, VNodeTypes, VNodeChild, Slots } from '@vue/runtime-core';

export function findVNodeChild(
  vnode: VNode,
  condition: VNodeTypes | ((type: VNodeTypes) => boolean),
): VNode | undefined {
  const { children } = vnode;
  if (!Array.isArray(children)) return;

  const check: (type: VNodeTypes) => boolean =
    typeof condition === 'function'
      ? (condition as (type: VNodeTypes) => boolean)
      : (type: VNodeTypes) => type === condition;

  let hit: VNode | undefined;

  for (const child of children) {
    if (!child || typeof child !== 'object' || !('type' in child)) {
      continue;
    }
    if (check(child.type)) {
      hit = child;
      break;
    }
  }
  return hit;
}

export type TypedSlot<Prop extends any = any> = (prop: Prop) => VNodeChild;

export type VNodeChildOrSlot<Prop extends any = any> =
  | VNodeChild
  | TypedSlot<Prop>;

export function resolveVNodeChildOrSlot<Prop extends any = any>(
  raw: VNodeChildOrSlot<Prop>,
): TypedSlot<Prop> {
  return typeof raw === 'function' ? raw : () => raw;
}

export function resolveVNodeChildOrSlots<Prop extends any = any>(
  ...raws: VNodeChildOrSlot<Prop>[]
): TypedSlot<Prop> | undefined {
  for (const raw of raws) {
    if (raw == null) continue;
    const resolved = resolveVNodeChildOrSlot(raw);
    return resolved;
  }
}

export function renderSlotOrEmpty(
  slots: Slots | { [key: string]: TypedSlot },
  name: string,
  prop?: { [key: string]: unknown },
) {
  const slot = slots[name];
  if (!slot) return;
  const vnodes = slot(prop);
  if (Array.isArray(vnodes)) {
    if (!vnodes.length) return;
  }
  return vnodes;
}
