import {
  PropType,
  ExtractPropTypes,
  computed,
  SetupContext,
  CSSProperties,
} from 'vue';
import { ButtonHTMLAttributes } from '@vue/runtime-dom';
import { RouterLinkProps, RouteLocationRaw, RouterLink } from 'vue-router';

let _defaultRouterLink = RouterLink;

export function setDefaultRouterLink(Component: typeof RouterLink) {
  _defaultRouterLink = Component;
}

export const navigationableInheritProps = {} as unknown as {
  tag: PropType<string>;
  class: PropType<any>;
  style: PropType<CSSProperties>;
  to: PropType<RouteLocationRaw>;
  replace: PropType<boolean>;
  activeClass: PropType<string>;
  exactActiveClass: PropType<string>;
  custom: PropType<boolean>;
  ariaCurrentValue: {
    type: PropType<RouterLinkProps['ariaCurrentValue']>;
    default: 'page';
  };
  disabled: PropType<boolean>;
  href: PropType<string>;
  target: PropType<string>;
  rel: PropType<string>;
  name: PropType<string>;
  charset: PropType<string>;
  hreflang: PropType<string>;
  download: PropType<boolean | string>;
  media: PropType<string>;
  ping: PropType<string>;
  referrerpolicy: PropType<string>;
  type: PropType<ButtonHTMLAttributes['type']>;
  linkFallbackTag: PropType<string | (() => string | undefined)>;
  onClick: PropType<(ev: MouseEvent) => any>;
};

export type NavigationableInheritProps = ExtractPropTypes<
  typeof navigationableInheritProps
>;

export type NavigationableTag = any;

export interface NavigationableAttrs {
  to?: RouteLocationRaw;
  replace?: boolean;
  activeClass?: string;
  exactActiveClass?: string;
  custom?: boolean;
  ariaCurrentValue?: RouterLinkProps['ariaCurrentValue'];
  href?: string;
  target?: string;
  rel?: string;
  name?: string;
  charset?: string;
  hreflang?: string;
  download?: boolean | string;
  media?: string;
  ping?: string;
  referrerpolicy?: string;
  type?: ButtonHTMLAttributes['type'];
  disabled?: boolean;
}

export interface NavigationableContext {
  Tag: NavigationableTag;
  attrs: Record<string, unknown>;
  clickable: boolean;
}

export interface UseNavigationableOptions {
  clickableClassName?: string | (() => string | undefined);
  RouterLink?: any;
  linkFallbackTag?: string | (() => string | undefined);
}

export function useNavigationable(
  setupContext: SetupContext<any>,
  opts: UseNavigationableOptions = {},
) {
  const ctx = computed<NavigationableContext>(() => {
    const ctxAttrs = { ...setupContext.attrs } as any;
    const props: NavigationableInheritProps = { ...ctxAttrs };
    let { clickableClassName } = opts;
    if (typeof clickableClassName === 'function') {
      clickableClassName = clickableClassName();
    }

    delete ctxAttrs.tag;
    delete ctxAttrs.to;
    delete ctxAttrs.class;
    delete ctxAttrs.replace;
    delete ctxAttrs.activeClass;
    delete ctxAttrs.exactActiveClass;
    delete ctxAttrs.ariaCurrentValue;
    // delete ctxAttrs.disabled;
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

    const { onClick } = props;

    const linkFallbackTag = opts.linkFallbackTag || props.linkFallbackTag;
    const fallbackTag =
      typeof linkFallbackTag === 'function'
        ? linkFallbackTag()
        : linkFallbackTag;
    const { tag, to, href } = props;
    let Tag: NavigationableTag;

    const dynamicAttrs: Record<string, unknown> = {};

    let clickable = false;

    if (to) {
      clickable = true;
      Tag = opts.RouterLink || _defaultRouterLink;
      dynamicAttrs.to = to;
      dynamicAttrs.replace = props.replace;
      dynamicAttrs.activeClass = props.activeClass;
      dynamicAttrs.exactActiveClass = props.exactActiveClass;
      dynamicAttrs.custom = props.custom;
      dynamicAttrs.ariaCurrentValue = props.ariaCurrentValue;
    } else if (href) {
      clickable = true;
      Tag = tag || 'a';
      dynamicAttrs.href = href;
      dynamicAttrs.target = props.target;
      dynamicAttrs.rel = props.rel;
      dynamicAttrs.download = props.download;
      dynamicAttrs.media = props.media;
      dynamicAttrs.ping = props.ping;
      dynamicAttrs.referrerpolicy = props.referrerpolicy;
    } else {
      Tag = tag || (!!props.type && 'button') || fallbackTag || 'button';
      if (Tag === 'button') {
        dynamicAttrs.type = props.type || 'button';
      }
      if (Tag === 'a' || Tag === 'button' || typeof onClick === 'function') {
        clickable = true;
      }
    }

    const classes = [];
    if (props.class) {
      classes.push(props.class);
    }
    if (clickable) {
      classes.push('clickable');
      if (clickableClassName) {
        classes.push(clickableClassName);
      }
    }

    const attrs: Record<string, unknown> = {
      ...ctxAttrs,
      ...dynamicAttrs,
      class: classes,
    };

    if (!attrs.disabled) {
      delete attrs.disabled;
    }

    if (!attrs.hreflang) {
      delete attrs.hreflang;
    }

    if (!attrs.download) {
      delete attrs.download;
    }

    if (onClick) {
      attrs.onClick = (ev: MouseEvent) => {
        if (attrs.disabled) {
          ev.preventDefault();
          return;
        }
        onClick(ev);
      };
    }

    return {
      Tag,
      attrs,
      clickable,
    };
  });
  return ctx;
}
