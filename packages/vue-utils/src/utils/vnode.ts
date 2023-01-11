import type { VNode, VNodeTypes, VNodeChild, Slots } from 'vue';
import { Comment, Text, Fragment, isVNode } from 'vue';

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

export type TypedSlot<Prop = any> = (prop: Prop) => VNodeChild;

export type VNodeChildOrSlot<Prop = any> = VNodeChild | TypedSlot<Prop>;

export function resolveVNodeChildOrSlot<Prop = any>(
  raw: VNodeChildOrSlot<Prop>,
): TypedSlot<Prop> {
  return typeof raw === 'function' ? raw : () => raw;
}

export function resolveVNodeChildOrSlots<Prop = any>(
  ...raws: VNodeChildOrSlot<Prop>[]
): TypedSlot<Prop> | undefined {
  for (const raw of raws) {
    if (raw == null) continue;
    const resolved = resolveVNodeChildOrSlot(raw);
    return resolved;
  }
}

export function cleanupEmptyVNodeChild(child: VNodeChild) {
  if (!Array.isArray(child)) {
    child = [child];
  }
  child = child.filter((row) => {
    if (row == null || row === '' || row === false) return false;
    if (typeof row !== 'object') return true;
    if (Array.isArray(row)) return true;
    if (row.type === Comment) return false;
    if (row.type === Text) {
      if (!row.children || !row.children.length) {
        return false;
      }
    }
    return true;
  });
  if (!child.length) {
    return;
  }
  return child;
}

export function renderSlotOrEmpty(
  slots: Slots | { [key: string]: TypedSlot },
  name = 'default',
  prop?: { [key: string]: unknown },
) {
  const slot = slots[name];
  if (!slot) return;
  return cleanupEmptyVNodeChild(slot(prop));
}

export function isFragment(child: VNodeChild): child is VNode {
  return isVNode(child) && child.type === Fragment;
}
