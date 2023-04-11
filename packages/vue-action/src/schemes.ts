import type { PropType, ExtractPropTypes, CSSProperties } from 'vue';
import type { ButtonHTMLAttributes } from 'vue';
import type { RouterLinkProps, RouteLocationRaw } from 'vue-router';

export interface ActionableInheritPropOptions {
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
}

export const actionableInheritProps: ActionableInheritPropOptions = {} as any;

export type ActionableInheritProps = ExtractPropTypes<
  typeof actionableInheritProps
>;

export type ActionableTag = any;

export interface ActionableAttrs {
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

export interface ActionableContext {
  Tag: ActionableTag;
  attrs: Record<string, unknown>;
  clickable: boolean;
}

export interface UseActionableOptions {
  clickableClassName?: string | (() => string | undefined);
  RouterLink?: any;
  linkFallbackTag?: string | (() => string | undefined);
}
