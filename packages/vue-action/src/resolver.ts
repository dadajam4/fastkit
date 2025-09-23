import type { SetupContext, VNode } from 'vue';
import type { Router } from 'vue-router';
import { toKebabCase } from '@fastkit/helpers';
import type {
  ActionableInheritProps,
  ActionableCustomProps,
  ActionableCustomPropsInput,
  ExtractedActionableCustomProps,
} from './schema';

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
    CustomActionableAttrsResolverContext {
  getAttr<AttrName extends keyof ActionableInheritProps>(
    attrName: AttrName,
  ): ActionableInheritProps[AttrName];
}

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
) =>
  | ActionableInheritProps
  | [
      attrs: ActionableInheritProps | undefined | null | false,
      customProps: ActionableCustomPropsInput,
    ]
  | void;

export type ActionableAttrsResolverHandlerSetup = (
  ctx: ActionableAttrsResolverSetupContext,
) => {
  [K in keyof any]: any;
};

export type ActionableRenderWrapper = (
  customProps: ExtractedActionableCustomProps,
  currentNode: VNode,
  attrs: ActionableInheritProps,
) => VNode;

export interface ActionableAttrsResolver {
  setup?: ActionableAttrsResolverHandlerSetup;
  handler?: ActionableAttrsResolverHandler;
}

const _setups: ActionableAttrsResolverHandlerSetup[] = [];
const _handlers: ActionableAttrsResolverHandler[] = [];
const _renderWrappers: ActionableRenderWrapper[] = [];

export function registerActionableRenderWrapper(
  renderWrapper: ActionableRenderWrapper,
) {
  _renderWrappers.push(renderWrapper);
}

export function applyActionableRenderWrappers(
  customProps: ExtractedActionableCustomProps,
  currentNode: VNode,
  attrs: ActionableInheritProps,
): VNode {
  let result = currentNode;
  for (const renderWrapper of _renderWrappers) {
    result = renderWrapper(customProps, currentNode, attrs) || result;
  }
  return result;
}

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
  const getAttr: ActionableAttrsResolverContext['getAttr'] = (attrName) => {
    const { attrs } = ctx.setupContext;
    if (attrName in attrs) {
      return attrs[attrName];
    }
    return attrs[toKebabCase(attrName)];
  };

  if (!_setups.length)
    return {
      ...ctx,
      getAttr,
    };
  const modified = { ...ctx } as ActionableAttrsResolverContext;
  for (const setup of _setups) {
    Object.assign(modified, setup(ctx));
  }
  modified.getAttr = getAttr;
  return modified;
}

export function useActionableResolvedAttrs(
  ctx: ActionableAttrsResolverSetupContext,
) {
  const _ctx = initActionableAttrsResolverContext(ctx);
  return (): [
    attrs: ActionableInheritProps,
    customProps: ActionableCustomProps,
  ] => {
    const { attrs } = ctx.setupContext;
    if (!_handlers.length) return [{ ...attrs }, {}];
    let modifiedAttrs = { ...attrs };
    let customProps = {} as ActionableCustomProps;
    for (const handler of _handlers) {
      const handlerResult = handler(modifiedAttrs, _ctx);
      if (Array.isArray(handlerResult)) {
        modifiedAttrs = handlerResult[0] || modifiedAttrs;
        customProps = handlerResult[1] || customProps;
      } else {
        modifiedAttrs = handlerResult || modifiedAttrs;
      }
    }
    return [modifiedAttrs, customProps];
  };
}
