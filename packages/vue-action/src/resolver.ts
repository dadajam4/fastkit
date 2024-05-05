import type { SetupContext } from 'vue';
import type { Router } from 'vue-router';
import type { ActionableInheritProps } from './schema';

export interface CustomActionableAttrsResolverContext {}

/**
 * Context information when resolving attributes
 */
export interface ActionableAttrsResolverSetupContext {
  /**
   * Component setup context
   *
   * @see {@link SetupContext}
   */
  readonly setupContext: SetupContext;
  /**
   * Router instance.
   *
   * @see {@link Router}
   */
  readonly router: Router;
}

/**
 * Context information when resolving attributes
 */
export interface ActionableAttrsResolverContext
  extends ActionableAttrsResolverSetupContext,
    CustomActionableAttrsResolverContext {}

/**
 * Attributes Resolver
 *
 * @param attrs - Attributes for actionable components
 * @param ctx - Context information when resolving attributes
 *
 * @returns If you're swapping objects, it's the attributes object of those.
 *
 * @see {@link ActionableInheritProps}
 * @see {@link ActionableAttrsResolverContext}
 */
export type ActionableAttrsResolverHandler = (
  attrs: ActionableInheritProps,
  ctx: ActionableAttrsResolverContext,
) => ActionableInheritProps | void;

export type ActionableAttrsResolverHandlerSetup = (
  ctx: ActionableAttrsResolverSetupContext,
) => {
  [K in keyof any]: any;
};

export interface ActionableAttrsResolver {
  setup?: ActionableAttrsResolverHandlerSetup;
  handler?: ActionableAttrsResolverHandler;
}

const _setups: ActionableAttrsResolverHandlerSetup[] = [];
const _handlers: ActionableAttrsResolverHandler[] = [];

/**
 * Register attributes Resolver
 *
 * @param resolver - Attributes Resolver
 *
 * @see {@link ActionableAttrsResolver}
 */
export function registerActionableAttrsResolver(
  resolverOrHandler: ActionableAttrsResolver | ActionableAttrsResolverHandler,
) {
  if (typeof resolverOrHandler === 'function') {
    _handlers.push(resolverOrHandler);
  } else {
    const { setup, handler } = resolverOrHandler;
    setup && _setups.push(setup);
    handler && _handlers.push(handler);
  }
}

export function initActionableAttrsResolverContext(
  ctx: ActionableAttrsResolverSetupContext,
): ActionableAttrsResolverContext {
  if (!_setups.length) return ctx;
  const modified = { ...ctx } as ActionableAttrsResolverContext;
  for (const setup of _setups) {
    Object.assign(modified, setup(ctx));
  }
  return modified;
}

export function useActionableResolvedAttrs(
  ctx: ActionableAttrsResolverSetupContext,
) {
  const _ctx = initActionableAttrsResolverContext(ctx);
  return () => {
    const { attrs } = ctx.setupContext;
    if (!_handlers.length) return { ...attrs };
    let modified = { ...attrs };
    for (const handler of _handlers) {
      modified = handler(modified, _ctx) || modified;
    }
    return modified;
  };
}
