import type {
  PropType,
  ExtractPropTypes,
  CSSProperties,
  ButtonHTMLAttributes,
  VNode,
  UnwrapRef,
  VNodeChild,
} from 'vue';
import type { RouterLinkProps, useLink, Router } from 'vue-router';
import type {
  PointableAttributesProps,
  FocusableAttributesProps,
} from '@fastkit/vue-utils';

type RouterLinkSlotPayload = UnwrapRef<ReturnType<typeof useLink>>;

type ActionableGuardResult = boolean | void;

type ActionableGuardReturnValue =
  | ActionableGuardResult
  | Promise<ActionableGuardResult>;

/** Guard function for actionable components */
export type ActionableGuard = (ev: MouseEvent) => ActionableGuardReturnValue;

export interface CustomRouterLinkProps {}

export type RouterLinkPropKey = keyof RouterLinkProps;

export interface ActionableRouterLinkProps
  extends Partial<Pick<RouterLinkProps, 'to'>>,
    Omit<RouterLinkProps, 'to'>,
    CustomRouterLinkProps {}

export type ActionableRouterLinkPropKey = keyof ActionableRouterLinkProps;

export type CustomRouterLinkPropKey = keyof CustomRouterLinkProps;

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

type ActionableAttrsRequired = Required<ActionableAttrs>;

type ActionableAttrsProps = {
  [Name in keyof ActionableAttrsRequired]: PropType<
    ActionableAttrsRequired[Name]
  >;
};

/** Component property options for actionable components */
export interface ActionableInheritPropOptions
  extends ActionableAttrsProps,
    PointableAttributesProps,
    FocusableAttributesProps {
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

export const actionableInheritProps: ActionableInheritPropOptions = {} as any;

export type ActionableInheritProps = ExtractPropTypes<
  typeof actionableInheritProps
>;

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
