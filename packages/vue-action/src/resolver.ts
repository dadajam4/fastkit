import type { Router } from 'vue-router';
import { ActionableInheritProps } from './schema';

/**
 * Attributes Resolver
 *
 * @param attrs - Attributes for actionable components
 * @param router - Router instance.
 *
 * @returns If you're swapping objects, it's the attributes object of those.
 *
 * @see {@link ActionableInheritProps}
 * @see {@link Router}
 */
export type ActionableAttrsResolver = (
  attrs: ActionableInheritProps,
  router: Router,
) => ActionableInheritProps | void;

const _resolvers: ActionableAttrsResolver[] = [];

/**
 * Register attributes Resolver
 *
 * @param resolver - Attributes Resolver
 *
 * @see {@link ActionableAttrsResolver}
 */
export function registerActionableAttrsResolver(
  resolver: ActionableAttrsResolver,
) {
  _resolvers.push(resolver);
}

/**
 * Resolve attributes
 *
 * @param attrs - Attributes for actionable components
 * @param router - Router instance.
 *
 * @returns Resolved attributes
 *
 * @see {@link ActionableAttrs}
 * @see {@link Router}
 */
export function resolveActionableAttrs(
  attrs: ActionableInheritProps,
  router: Router,
): ActionableInheritProps {
  if (!_resolvers.length) return { ...attrs };
  let modified = { ...attrs };
  for (const resolver of _resolvers) {
    modified = resolver(modified, router) || modified;
  }
  return modified;
}
