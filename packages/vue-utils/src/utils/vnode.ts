import type { VNode, VNodeTypes } from '@vue/runtime-core';

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
