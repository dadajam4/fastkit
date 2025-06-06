import { type SetupContext, computed, mergeProps, ref } from 'vue';
import {
  RouterLink,
  useRouter,
  type Router,
  type RouteLocationRaw,
} from 'vue-router';
import { withCtx } from '@fastkit/vue-utils';
import type {
  UseActionableOptions,
  Actionable,
  ActionableInheritProps,
  ActionableTag,
  ActionableRouterLinkProps,
  RouterLinkPropKey,
  CustomRouterLinkPropKey,
  ActionableRouterLinkSettings,
} from './schema';
import { resolveRelativeLocationRaw } from './utils';
import { DEFAULT_ACTIVE_CLASS, DEFAULT_EXACT_ACTIVE_CLASS } from './constants';
import { useActionableResolvedAttrs } from './resolver';

let _defaultRouterLink = RouterLink;

export type RouteActionHandler = (
  to: RouteLocationRaw,
  router: Router,
) => RouteLocationRaw | ReturnType<Router['resolve']> | undefined;

let _routeActionHandler: RouteActionHandler | undefined;

export const registerRouteActionHandler = (handler: RouteActionHandler) => {
  _routeActionHandler = handler;
};

const _ROUTER_PROP_KEYS: RouterLinkPropKey[] = [
  'activeClass',
  'ariaCurrentValue',
  'custom',
  'exactActiveClass',
  'replace',
  'to',
];

const ACTIONABLE_ROUTER_PROP_KEYS = [..._ROUTER_PROP_KEYS];

export function setDefaultRouterLink(
  Component: typeof RouterLink,
  customPropKeys?: CustomRouterLinkPropKey[],
) {
  _defaultRouterLink = Component;
  if (customPropKeys) {
    ACTIONABLE_ROUTER_PROP_KEYS.push(...(customPropKeys as any));
  }
}

const noop = () => {};

const isRightClick = (ev: MouseEvent) =>
  ev.button !== undefined && ev.button !== 0;

const isWithControlKey = (ev: MouseEvent) =>
  !!(ev.metaKey || ev.altKey || ev.ctrlKey || ev.shiftKey);

const unWrapFn = (
  source: string | undefined | (() => string | undefined),
): string | undefined => (typeof source === 'function' ? source() : source);

const normalizeBoolean = <T extends boolean | string | undefined>(
  value: T,
): T | boolean => {
  if ((value as any) === '') return true;
  return value;
};

let _defaultActionableClassName: string | undefined;

export function setDefaultActionableClassName(className: string) {
  _defaultActionableClassName = className;
}

export function useActionable(
  setupContext: SetupContext<any>,
  opts: UseActionableOptions = {},
): Actionable {
  const router = useRouter();
  const getAttrs = useActionableResolvedAttrs({
    setupContext,
    router,
  });
  const guardInProgress = ref(false);
  const states = computed<Omit<Actionable, 'guardInProgress' | 'router'>>(
    () => {
      const ctxAttrs = getAttrs();
      const props: ActionableInheritProps = { ...ctxAttrs };

      const disabledClass = unWrapFn(opts.disabledClass);
      const hasActionClass = unWrapFn(opts.hasActionClass);
      const actionableClass = unWrapFn(opts.actionableClass);
      const guardInProgressClass = unWrapFn(opts.guardInProgressClass);
      const propsDisabledClass = unWrapFn(props.disabledClass);
      const propsHasActionClass = unWrapFn(props.hasActionClass);
      const propsActionableClass = unWrapFn(props.actionableClass);
      const propsGuardInProgressClass = unWrapFn(props.guardInProgressClass);

      delete ctxAttrs.disabledClass;
      delete ctxAttrs.hasActionClass;
      delete ctxAttrs.actionableClass;
      delete ctxAttrs.guardInProgressClass;
      delete ctxAttrs.tag;
      delete ctxAttrs.href;
      delete ctxAttrs.target;
      delete ctxAttrs.rel;
      delete ctxAttrs.name;
      delete ctxAttrs.hreflang;
      delete ctxAttrs.download;
      delete ctxAttrs.media;
      delete ctxAttrs.ping;
      delete ctxAttrs.referrerpolicy;
      delete ctxAttrs.type;
      delete ctxAttrs.linkFallbackTag;
      delete ctxAttrs.onClick;
      delete ctxAttrs.guard;

      const { guard, onClick, onMouseenter, onMouseover, onContextmenu } =
        props;
      const disabled = normalizeBoolean(props.disabled);

      const linkFallbackTag = opts.linkFallbackTag || props.linkFallbackTag;
      const fallbackTag =
        typeof linkFallbackTag === 'function'
          ? linkFallbackTag()
          : linkFallbackTag;

      const { tag, href } = props;
      const { to } = props;
      let Tag: ActionableTag;

      const dynamicAttrs: Record<string, unknown> = {};
      let routerLink: ActionableRouterLinkSettings | undefined;

      const ariaDisabled =
        (ctxAttrs as any).ariaDisabled ?? (ctxAttrs as any)['aria-disabled'];
      const isDisabled = !!(
        disabled ||
        ariaDisabled === '' ||
        ariaDisabled === 'true'
      );
      let hasAction = !!(
        onClick ||
        to ||
        href ||
        onMouseenter ||
        onMouseover ||
        onContextmenu
      );
      const actionable = hasAction && !isDisabled;

      let action: ((ev: MouseEvent) => void) | undefined;

      const handleClick = async (ev: MouseEvent): Promise<void> => {
        if (ev.defaultPrevented || isRightClick(ev)) return;
        if (href || to) {
          if (isWithControlKey(ev) || props.target) {
            return;
          }
          ev?.preventDefault();
        }

        if (isDisabled || guard) {
          ev.preventDefault?.();
        }
        if (isDisabled) return;

        if (guard) {
          try {
            guardInProgress.value = true;
            const guardResult = await guard(ev);
            guardInProgress.value = false;
            if (guardResult === false) {
              return;
            }
          } catch (err) {
            guardInProgress.value = false;
            throw err;
          }
        }

        const finalEvent = ev.defaultPrevented
          ? new MouseEvent(ev.type, ev)
          : ev;

        if (onClick) {
          onClick(finalEvent);
          if (finalEvent.defaultPrevented) return;
        }

        action && action(finalEvent);
      };

      let attrs = {
        ...(typeof opts.attrs === 'function'
          ? opts.attrs({ disabled: isDisabled })
          : opts.attrs),
      };

      if (to || href) {
        dynamicAttrs.target = props.target;
      }

      if (to) {
        Tag = opts.RouterLink || _defaultRouterLink;
        const routerLinkProps: ActionableRouterLinkProps = {};

        for (const customPropKey of ACTIONABLE_ROUTER_PROP_KEYS) {
          routerLinkProps[customPropKey] = (props as any)[customPropKey];
          delete ctxAttrs[customPropKey];
        }

        const _to = resolveRelativeLocationRaw(
          to,
          router.currentRoute.value.path,
        );

        routerLinkProps.to = _to;

        const activeClass = [
          routerLinkProps.activeClass,
          opts.activeClass || DEFAULT_ACTIVE_CLASS,
        ];
        const exactActiveClass = [
          routerLinkProps.exactActiveClass,
          opts.exactActiveClass || DEFAULT_EXACT_ACTIVE_CLASS,
        ];

        action = () => {
          const target = _routeActionHandler?.(_to, router) ?? _to;
          return router[routerLinkProps.replace ? 'replace' : 'push'](
            target,
            // avoid uncaught errors are they are logged anyway
          ).catch(noop);
        };

        // @TODO 1. This is support for cases where the href cannot be obtained when used in conjunction with nuxt-i18n.
        let _resolvedHref: string | undefined;

        const slots: ActionableRouterLinkSettings['slots'] = (children) => ({
          // eslint-disable-next-line no-shadow
          default: withCtx(({ href, isActive, isExactActive }) => {
            const classes = [
              isActive && activeClass,
              isExactActive && exactActiveClass,
            ];

            // @TODO 1. This is support for cases where the href cannot be obtained when used in conjunction with nuxt-i18n.
            if (!href) {
              if (_resolvedHref === undefined) {
                _resolvedHref = router.resolve(_to).href;
              }
              href = _resolvedHref;
            }
            return (
              <a {...attrs} class={classes} href={href} onClick={handleClick}>
                {children}
              </a>
            );
          }),
        });

        routerLink = {
          props: routerLinkProps,
          slots,
        };
      } else if (href) {
        Tag = tag || 'a';
        dynamicAttrs.href = href;
        dynamicAttrs.rel = props.rel;
        dynamicAttrs.download = normalizeBoolean(props.download);
        dynamicAttrs.media = props.media;
        dynamicAttrs.ping = props.ping;
        dynamicAttrs.referrerpolicy = props.referrerpolicy;

        if (guard || onClick) {
          action = (ev) => {
            const { target } = dynamicAttrs;
            if (!target) {
              location.href = href;
            } else {
              window.open(
                href,
                target as any,
                dynamicAttrs.referrerpolicy as any,
              );
            }
          };
          attrs.onClick = handleClick;
        }
      } else {
        Tag = tag || (!!props.type && 'button') || fallbackTag || 'button';
        if (Tag === 'button') {
          dynamicAttrs.type = props.type || 'button';
          hasAction = true;
        }

        if (guard || onClick) {
          attrs.onClick = handleClick;
        }
      }

      const classes = [];
      if (props.class) {
        classes.push(props.class);
      }

      isDisabled && classes.push(disabledClass, propsDisabledClass);
      hasAction && classes.push(hasActionClass, propsHasActionClass);
      actionable &&
        classes.push(
          actionableClass,
          propsActionableClass || _defaultActionableClassName,
        );
      guardInProgress.value &&
        classes.push(guardInProgressClass, propsGuardInProgressClass);

      attrs = mergeProps(attrs, ctxAttrs, dynamicAttrs, {
        class: classes,
      });

      if (!attrs.disabled) {
        delete attrs.disabled;
      }

      if (!attrs.hreflang) {
        delete attrs.hreflang;
      }

      if (!attrs.download) {
        delete attrs.download;
      }

      const render: Actionable['render'] = (children) => {
        if (routerLink) {
          return (
            <Tag
              {...routerLink.props}
              custom
              v-slots={routerLink.slots(children)}
            />
          );
        }
        return <Tag {...attrs}>{children}</Tag>;
      };

      return {
        Tag,
        attrs,
        routerLink,
        disabled: isDisabled,
        hasAction,
        actionable,
        render,
      };
    },
  );

  return {
    get router() {
      return router;
    },
    get Tag() {
      return states.value.Tag;
    },
    get attrs() {
      return states.value.attrs;
    },
    get routerLink() {
      return states.value.routerLink;
    },
    get disabled() {
      return states.value.disabled;
    },
    get hasAction() {
      return states.value.hasAction;
    },
    get actionable() {
      return states.value.actionable;
    },
    get guardInProgress() {
      return guardInProgress.value;
    },
    get render() {
      return states.value.render;
    },
  };
}
