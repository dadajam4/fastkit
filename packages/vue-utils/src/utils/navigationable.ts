import { PropType, ExtractPropTypes, computed, SetupContext } from 'vue';
import { ButtonHTMLAttributes } from '@vue/runtime-dom';
import { RouterLinkProps, RouteLocationRaw, RouterLink } from 'vue-router';

export const navigationableEmits = {
  click: (ev: MouseEvent) => true,
};

export const navigationableProps = {
  tag: String,
  to: [String, Object] as PropType<RouteLocationRaw>,
  replace: Boolean,
  activeClass: String,
  exactActiveClass: String,
  custom: Boolean,
  ariaCurrentValue: {
    type: String as PropType<RouterLinkProps['ariaCurrentValue']>,
    default: 'page',
  },
  disabled: Boolean,
  href: String,
  target: String,
  rel: String,
  name: String,
  charset: String,
  hreflang: String,
  download: [Boolean, String] as PropType<boolean | string>,
  media: String,
  ping: String,
  referrerpolicy: String,
  type: String as PropType<ButtonHTMLAttributes['type']>,
} as const;

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
  attrs: NavigationableAttrs;
  classes: string[];
  clickable: boolean;
}

export function useNavigationable(
  props: ExtractPropTypes<typeof navigationableProps>,
  fallbackTag?: string | (() => string | undefined),
  setupContext?: SetupContext,
) {
  const onClick = setupContext && setupContext.attrs.onClick;
  const ctx = computed<NavigationableContext>(() => {
    const _fallbackTag =
      typeof fallbackTag === 'function' ? fallbackTag() : fallbackTag;
    const { tag, to, href, disabled, name, charset, hreflang } = props;
    let Tag: NavigationableTag;
    const attrs: NavigationableAttrs = {
      disabled,
      name,
      charset,
      hreflang,
    };

    let clickable = false;

    if (to) {
      clickable = true;
      Tag = RouterLink;
      attrs.to = to;
      attrs.replace = props.replace;
      attrs.activeClass = props.activeClass;
      attrs.exactActiveClass = props.exactActiveClass;
      attrs.custom = props.custom;
      attrs.ariaCurrentValue = props.ariaCurrentValue;
    } else if (href) {
      clickable = true;
      Tag = tag || 'a';
      attrs.href = href;
      attrs.target = props.target;
      attrs.rel = props.rel;
      attrs.download = props.download;
      attrs.media = props.media;
      attrs.ping = props.ping;
      attrs.referrerpolicy = props.referrerpolicy;
    } else {
      Tag = tag || (!!props.type && 'button') || _fallbackTag || 'button';
      if (Tag === 'button') {
        attrs.type = props.type || 'button';
      }
      if (Tag === 'a' || Tag === 'button' || typeof onClick === 'function') {
        clickable = true;
      }
    }

    if (!attrs.disabled) {
      delete attrs.disabled;
    }

    if (!attrs.hreflang) {
      delete attrs.hreflang;
    }

    if (!attrs.download) {
      delete attrs.download;
    }

    // const clickable = Tag !== _fallbackTag || typeof onClick === 'function';

    return {
      Tag,
      attrs,
      clickable,
      classes: clickable ? ['clickable'] : [],
    };
  });
  return ctx;
}
