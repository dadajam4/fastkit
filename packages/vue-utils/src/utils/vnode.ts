import type {
  VNode,
  VNodeTypes,
  VNodeChild,
  Slots,
  VNodeArrayChildren,
  VNodeNormalizedChildren,
} from 'vue';
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

export function cleanupEmptyVNodeChild(
  child: VNodeChild,
): VNodeArrayChildren | undefined {
  if (child == null || child === '' || child === false) return;
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

export function renderVNodeChildOrSlotsOrEmpty(
  raws: VNodeChildOrSlot<void>[],
  prop?: undefined | null,
): VNodeArrayChildren | undefined;
export function renderVNodeChildOrSlotsOrEmpty<Prop>(
  raws: VNodeChildOrSlot<Prop>[],
  prop: Prop,
): VNodeArrayChildren | undefined;

export function renderVNodeChildOrSlotsOrEmpty<Prop>(
  raws: VNodeChildOrSlot<Prop>[],
  prop?: Prop,
): VNodeArrayChildren | undefined {
  const rows = raws
    .map((raw) => (typeof raw === 'function' ? raw(prop as Prop) : raw))
    .flat();
  return cleanupEmptyVNodeChild(rows);
}

export function renderSlotOrEmpty(
  slots: Slots | { [key: string]: TypedSlot },
  // eslint-disable-next-line default-param-last
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

/**
 * Checks whether a given VNode corresponds to a real DOM element.
 *
 * @param vnode - The VNode to check.
 * @returns `true` if the VNode is backed by a real DOM element, otherwise `false`.
 *
 * @example
 * ```ts
 * const vnode = h('div');
 * console.log(isElementVNode(vnode)); // false before mounting
 * ```
 */
export const isElementVNode = (vnode: VNode): boolean => {
  if (!vnode.el) return false;
  return vnode.el instanceof Element;
};

/**
 * A callback hook to control how `findFirstDomVNode` traverses the VNode tree.
 *
 * This function is invoked whenever a DOM-backed VNode is found.
 * You can decide whether to:
 *
 * - **Skip** the current VNode by returning `true`.
 * - **Replace** the current VNode by returning another `VNode`.
 * - **Continue normally** by returning nothing (`void`).
 *
 * @param vnode - The current DOM-backed VNode being visited.
 * @param el - The corresponding real DOM element of the VNode.
 * @returns
 * - `true` to skip the current VNode and continue traversal.
 * - A `VNode` to replace the current one in the traversal.
 * - `void` (or nothing) to accept the current VNode as-is.
 */
export type VNodeSkipHandler = (
  currentVNode: VNode,
  el: Element,
) => boolean | VNode | void;

/**
 * Recursively searches a VNode tree and returns the first VNode
 * that corresponds to a real DOM element.
 *
 * @param children - A VNode or its normalized children to search through.
 * @param skipVNode - Optional callback to skip or replace matched VNodes.
 * @returns The first DOM-backed VNode found, or undefined if none exist.
 */
export const findFirstDomVNode = (
  children: VNode | VNodeNormalizedChildren | undefined,
  skipVNode?: VNodeSkipHandler,
): VNode | undefined => {
  if (!children) return;
  let child = Array.isArray(children) ? children[0] : children;

  if (Array.isArray(child)) return findFirstDomVNode(child, skipVNode);

  if (isVNode(child)) {
    if (isElementVNode(child)) {
      const skipResult = skipVNode?.(child, child.el as Element);
      if (isVNode(skipResult)) {
        child = skipResult;
      } else if (skipResult !== true) {
        return child;
      }
    }

    const subTree = child.component?.subTree;

    const nextTarget =
      (Array.isArray(child.children) && child.children) ||
      (isVNode(subTree) && subTree) ||
      undefined;

    return findFirstDomVNode(nextTarget, skipVNode);
  }
};
