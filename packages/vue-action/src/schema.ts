import type {
  PropType,
  ExtractPropTypes,
  CSSProperties,
  ButtonHTMLAttributes,
  VNode,
  UnwrapRef,
  VNodeChild,
  ExtractPublicPropTypes,
} from 'vue';
import type { RouterLinkProps, useLink, Router } from 'vue-router';
import {
  type PointableAttributesProps,
  type FocusableAttributesProps,
  POINTABLE_ATTRIBUTES_PROP_KEYS,
  FOCUSABLE_ATTRIBUTES_PROP_KEYS,
} from '@fastkit/vue-utils';

type RouterLinkSlotPayload = UnwrapRef<ReturnType<typeof useLink>>;

type ActionableGuardResult = boolean | void;

type ActionableGuardReturnValue =
  | ActionableGuardResult
  | Promise<ActionableGuardResult>;

/** Guard function for actionable components */
export type ActionableGuard = (ev: PointerEvent) => ActionableGuardReturnValue;

export interface CustomRouterLinkProps {}

export type RouterLinkPropKey = keyof RouterLinkProps;

export interface ActionableRouterLinkProps
  extends Partial<Pick<RouterLinkProps, 'to'>>,
    Omit<RouterLinkProps, 'to'>,
    CustomRouterLinkProps {}

const ROUTER_LINK_PROPS = [
  'to',
  'replace',
  'custom',
  'activeClass',
  'exactActiveClass',
  'ariaCurrentValue',
  'viewTransition',
] as const;

export const isRouterLinkProp = (
  source: unknown,
): source is RouterLinkPropKey =>
  ROUTER_LINK_PROPS.includes(source as RouterLinkPropKey);

export type ActionableRouterLinkPropKey = keyof ActionableRouterLinkProps;

export type CustomRouterLinkPropKey = keyof CustomRouterLinkProps;

const CUSTOM_ROUTER_LINK_PROPS: CustomRouterLinkPropKey[] = [];

export function registerCustomRouterLinkProps(...props: any[]) {
  CUSTOM_ROUTER_LINK_PROPS.push(...(props as CustomRouterLinkPropKey[]));
}

export const isCustomRouterLinkProp = (
  source: unknown,
): source is CustomRouterLinkPropKey =>
  CUSTOM_ROUTER_LINK_PROPS.includes(source as CustomRouterLinkPropKey);

export const isActionableRouterLinkPropKey = (
  source: unknown,
): source is ActionableRouterLinkPropKey =>
  isRouterLinkProp(source) || isCustomRouterLinkProp(source);

/** Attributes for actionable components */
export interface ActionableAttrs extends ActionableRouterLinkProps {
  /**
   * Class name when element is in disabled state
   *
   * @see {@link ActionableStates.disabled}
   */
  disabledClass?: string | (() => string | undefined);
  /**
   * Class name when element has Link or click handler or `button` tag
   *
   * @see {@link ActionableStates.hasAction}
   */
  hasActionClass?: string | (() => string | undefined);
  /**
   * Class name to be assigned when actionable
   *
   * @see {@link ActionableStates.actionable}
   */
  actionableClass?: string | (() => string | undefined);
  /**
   * Class name when guard processing in progress
   */
  guardInProgressClass?: string | (() => string | undefined);
  /**
   * The URL that the hyperlink points to. Links are not restricted to HTTP-based URLs — they can use any URL scheme supported by browsers:
   *
   * - Sections of a page with document fragments
   * - Specific text portions with [text fragments](https://developer.mozilla.org/docs/Web/Text_fragments)
   * - Pieces of media files with media fragments
   * - Telephone numbers with `tel:` URLs
   * - Email addresses with `mailto:` URLs
   * - While web browsers may not support other URL schemes, websites can with [registerProtocolHandler()](https://developer.mozilla.org/docs/Web/API/Navigator/registerProtocolHandler)
   *
   * @see https://developer.mozilla.org/docs/Web/HTML/Element/a#attr-href
   */
  href?: string;
  /**
   * Where to display the linked URL, as the name for a browsing context (a tab, window, or &lt;iframe&gt;). The following keywords have special meanings for where to load the URL:
   *
   * - `_self`: the current browsing context. (Default)
   * - `_blank`: usually a new tab, but users can configure browsers to open a new window instead.
   * - `_parent`: the parent browsing context of the current one. If no parent, behaves as `_self`.
   * - `_top`: the topmost browsing context (the "highest" context that's an ancestor of the current one). If no ancestors, behaves as _self.
   *
   * @see https://developer.mozilla.org/docs/Web/HTML/Element/a#target
   */
  target?: string;
  /**
   * The relationship of the linked URL as space-separated link types.
   *
   * @see https://developer.mozilla.org/docs/Web/HTML/Element/a#rel
   */
  rel?: string;
  /**
   * @see https://developer.mozilla.org/docs/Web/HTML/Element/button#name
   */
  name?: string;
  /**
   * Hints at the human language of the linked URL. No built-in functionality. Allowed values are the same as the [global lang attribute](https://developer.mozilla.org/docs/Web/HTML/Global_attributes/lang).
   *
   * @see https://developer.mozilla.org/docs/Web/HTML/Element/a#hreflang
   */
  hreflang?: string;
  /**
   * @see https://developer.mozilla.org/docs/Web/HTML/Element/a#download
   */
  download?: boolean | string;
  /**
   * @see https://www.w3schools.com/tags/att_a_media.asp
   */
  media?: string;
  /**
   * @see https://developer.mozilla.org/docs/Web/HTML/Element/a#ping
   */
  ping?: string;
  /**
   * @see https://developer.mozilla.org/docs/Web/HTML/Element/a#referrerpolicy
   */
  referrerpolicy?: string;
  /**
   * @see https://developer.mozilla.org/docs/Web/HTML/Element/button#type
   */
  type?: ButtonHTMLAttributes['type'];
  /**
   * @see https://developer.mozilla.org/docs/Web/HTML/Global_attributes/title
   */
  title?: string;
  /**
   * disabled state
   */
  disabled?: boolean;
  /**
   * Guard function for actionable components
   *
   * @see {@link ActionableGuard}
   */
  guard?: ActionableGuard;
}

export type ActionableAttrsKey = keyof ActionableAttrs;

const ACTIONABLE_ATTRS_PROPS = [
  'disabledClass',
  'hasActionClass',
  'actionableClass',
  'guardInProgressClass',
  'href',
  'target',
  'rel',
  'name',
  'hreflang',
  'download',
  'media',
  'ping',
  'referrerpolicy',
  'type',
  'title',
  'disabled',
  'guard',
] as const;

export const isActionableAttrsKey = (
  source: unknown,
): source is ActionableAttrsKey =>
  isActionableRouterLinkPropKey(source) ||
  ACTIONABLE_ATTRS_PROPS.includes(
    source as (typeof ACTIONABLE_ATTRS_PROPS)[number],
  );

type ActionableAttrsRequired = Required<ActionableAttrs>;

type ActionableAttrsProps = {
  [Name in keyof ActionableAttrsRequired]: PropType<
    ActionableAttrsRequired[Name]
  >;
};

export interface ActionableCustomProps {}

export interface ActionableCustomPropsInput
  extends ExtractPublicPropTypes<ActionableCustomProps> {}

export interface ExtractedActionableCustomProps
  extends ExtractPropTypes<ActionableCustomProps> {}

/** Component property options for actionable components */
export interface ActionableInheritPropOptions
  extends ActionableAttrsProps,
    PointableAttributesProps,
    FocusableAttributesProps,
    ActionableCustomProps {
  /** tag name */
  tag: PropType<string>;
  /** class name */
  class: PropType<any>;
  /** style */
  style: PropType<CSSProperties>;
  /**
   * HTML tag name to be adopted if neither the `a` tag nor the `button` tag is resolved
   */
  linkFallbackTag: PropType<string | (() => string | undefined)>;
}

export const ACTIONABLE_INHERIT_PROPS = [
  'tag',
  'linkFallbackTag',
  ...POINTABLE_ATTRIBUTES_PROP_KEYS,
  ...FOCUSABLE_ATTRIBUTES_PROP_KEYS,
] as const;

export type ActionableInheritPropKey =
  | ActionableAttrsKey
  | (typeof ACTIONABLE_INHERIT_PROPS)[number];

export const isActionableInheritPropKey = (
  source: unknown,
): source is ActionableInheritPropKey =>
  isActionableAttrsKey(source) ||
  ACTIONABLE_INHERIT_PROPS.includes(
    source as (typeof ACTIONABLE_INHERIT_PROPS)[number],
  );

export const actionableInheritProps: ActionableInheritPropOptions = {} as any;

export type ActionableInheritProps = ExtractPropTypes<
  typeof actionableInheritProps
>;

export interface SplittedActionableAttrs {
  action: {
    [K in ActionableInheritPropKey]?: ActionableInheritProps[K];
  };
  splitted: Record<string, any>;
}

export function splitActionableAttrs(
  attrs: Record<string, any>,
): SplittedActionableAttrs {
  const action: Record<string, any> = {};
  const splitted: Record<string, any> = {};
  for (const [key, value] of Object.entries(attrs)) {
    const bucket = isActionableInheritPropKey(key) ? action : splitted;
    bucket[key] = value;
  }
  return { action, splitted };
}

/** Actionable Tags */
export type ActionableTag = any;

export interface ActionableRouterLinkSettings {
  /**
   * Router Link Props
   *
   * @see {@link ActionableRouterLinkProps}
   */
  props: ActionableRouterLinkProps;
  slots: (children?: VNodeChild) => {
    default: (payload: RouterLinkSlotPayload) => VNodeChild;
  };
}

/** Actionable interface */
export interface Actionable {
  /**
   * Router instance.
   *
   * @see {@link Router}
   */
  readonly router: Router;
  /** Actionable Tags */
  readonly Tag: ActionableTag;
  /** attributes */
  readonly attrs: Record<string, unknown>;
  /**
   * Router Link Settings
   *
   * @see {@link ActionableRouterLinkSettings}
   */
  readonly routerLink?: ActionableRouterLinkSettings;
  /**
   * Disabled state
   *
   * This is `true` if `disabled` or `aria-disabled` is set.
   */
  readonly disabled: boolean;
  /**
   * Link or click handler or `button` tag is set
   */
  readonly hasAction: boolean;
  /**
   * Link or click handler or `button` tag is set and not in an disabled state.
   */
  readonly actionable: boolean;
  // Guard processing in progress
  readonly guardInProgress: boolean;
  /** render actionable element vnode */
  render(children?: VNodeChild): VNode;
}

/** Actionable option */
export interface UseActionableOptions {
  attrs?:
    | Record<string, unknown>
    | ((context: { disabled: boolean }) => Record<string, unknown>);
  /**
   * Class name when element is in disabled state
   *
   * @see {@link ActionableStates.disabled}
   */
  disabledClass?: string | (() => string | undefined);
  /**
   * Class name when element has Link or click handler or `button` tag
   *
   * @see {@link ActionableStates.hasAction}
   */
  hasActionClass?: string | (() => string | undefined);
  /**
   * Class name to be assigned when actionable
   *
   * @see {@link ActionableStates.actionable}
   */
  actionableClass?: string | (() => string | undefined);
  /**
   * Class name when guard processing in progress
   */
  guardInProgressClass?: string | (() => string | undefined);
  /**
   * Class to apply when the link is active
   * @see {@link RouterLinkProps.activeClass}
   */
  activeClass?: string;
  /**
   * Class to apply when the link is exact active
   * @see {@link RouterLinkProps.exactActiveClass}
   */
  exactActiveClass?: string;
  /**
   * `RouterLink` Component
   *
   * This is set when you want to change the behavior with something like NuxtLink.
   */
  RouterLink?: any;
  /**
   * HTML tag name to be adopted if neither the `a` tag nor the `button` tag is resolved
   */
  linkFallbackTag?: string | (() => string | undefined);
}
