import { SetupContext, computed, mergeProps, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import {
  UseActionableOptions,
  Actionable,
  ActionableInheritProps,
  ActionableTag,
  ActionableRouterLinkProps,
  RouterLinkPropKey,
  CustomRouterLinkPropKey,
  ActionableRouterLinkSettings,
} from './schemes';
import { resolveRelativeLocationRaw } from './utils';
import { DEFAULT_ACTIVE_CLASS, DEFAULT_EXACT_ACTIVE_CLASS } from './constants';

let _defaultRouterLink = RouterLink;

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

const unWrapFn = (
  source: string | undefined | (() => string | undefined),
): string | undefined => (typeof source === 'function' ? source() : source);

export function useActionable(
  setupContext: SetupContext<any>,
  opts: UseActionableOptions = {},
): Actionable {
  const guardInProgress = ref(false);
  const states = computed<Omit<Actionable, 'guardInProgress'>>(() => {
    const ctxAttrs = { ...setupContext.attrs } as any;
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
    delete ctxAttrs.tag;
    delete ctxAttrs.href;
    delete ctxAttrs.target;
    delete ctxAttrs.rel;
    delete ctxAttrs.name;
    delete ctxAttrs.charset;
    delete ctxAttrs.hreflang;
    delete ctxAttrs.download;
    delete ctxAttrs.media;
    delete ctxAttrs.ping;
    delete ctxAttrs.referrerpolicy;
    delete ctxAttrs.type;
    delete ctxAttrs.linkFallbackTag;
    delete ctxAttrs.onClick;
    delete ctxAttrs.guard;

    const { guard, onClick, disabled } = props;

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

    const isDisabled = !!(disabled || ctxAttrs.ariaDisabled);
    let hasAction = !!(onClick || to || href);
    const actionable = hasAction && !isDisabled;

    let action: ((ev: MouseEvent) => void) | undefined;

    const handleClick = async (ev: MouseEvent): Promise<void> => {
      // don't action on right click
      if (ev.button !== undefined && ev.button !== 0) return;

      if (isDisabled || guard) {
        ev.preventDefault();
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

      const finalEvent = ev.defaultPrevented ? new MouseEvent(ev.type, ev) : ev;

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
      const router = useRouter();

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

      action = () =>
        router[routerLinkProps.replace ? 'replace' : 'push'](
          _to,
          // avoid uncaught errors are they are logged anyway
        ).catch(noop);

      const _handleClick = (ev: MouseEvent) => {
        ev.preventDefault();
        handleClick(ev);
      };

      const slots: ActionableRouterLinkSettings['slots'] = (children) => {
        return {
          default: ({ href, isActive, isExactActive }) => {
            const classes = [
              isActive && activeClass,
              isExactActive && exactActiveClass,
            ];
            return (
              <a {...attrs} class={classes} href={href} onClick={_handleClick}>
                {children}
              </a>
            );
          },
        };
      };

      routerLink = {
        props: routerLinkProps,
        slots,
      };
    } else if (href) {
      Tag = tag || 'a';
      dynamicAttrs.href = href;
      dynamicAttrs.rel = props.rel;
      dynamicAttrs.download = props.download;
      dynamicAttrs.media = props.media;
      dynamicAttrs.ping = props.ping;
      dynamicAttrs.referrerpolicy = props.referrerpolicy;

      if (guard || onClick) {
        action = (ev) => {
          const isForceBlank =
            ev.shiftKey || ev.ctrlKey || ev.metaKey || ev.altKey;
          const target = isForceBlank ? '_blank' : dynamicAttrs.target;
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
    actionable && classes.push(actionableClass, propsActionableClass);
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
  });

  return {
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
