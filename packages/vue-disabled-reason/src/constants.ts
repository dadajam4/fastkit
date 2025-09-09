/**
 * CSS layer name used for the disabled reason layer.
 * Can be used in CSS `@layer` rules to style the disabled reason layer.
 */
export const DISABLED_REASON_CSS_LAYER_NAME = 'vue-disabled-reason';

/**
 * Data attribute set on elements when the disabled reason layer is activated.
 * Indicates that the disabled reason is currently displayed.
 */
export const DISABLED_REASON_ACTIVATED_ATTR = 'data-disabled-reason-activated';

/**
 * Data attribute used to mark a container element for the disabled reason layer.
 * The layer will be rendered inside this container if present.
 */
export const DISABLED_REASON_CONTAINER_ATTR = 'data-disabled-reason-container';

/**
 * Object to bind the disabled reason container attribute via v-bind.
 * Example usage: `<div v-bind="DISABLED_REASON_CONTAINER_BIND"></div>`
 */
export const DISABLED_REASON_CONTAINER_BIND = {
  [DISABLED_REASON_CONTAINER_ATTR]: '',
};

/**
 * List of standard HTML elements that can be disabled via the `disabled` attribute.
 *
 * DisabledReason component will monitor these elements for disabled state.
 *
 * Note:
 * - The `<a>` tag does not actually support the `disabled` attribute.
 *   It is included here purely for internal implementation convenience.
 */
export const DISABLEABLE_NATIVE_ELEMENTS = [
  'button',
  'a',
  'input:not([type="hidden"])',
  'select',
  'textarea',
  'fieldset',
  'optgroup',
  'option',
] as const;

/**
 * List of ARIA roles whose elements can have a disabled state via `aria-disabled`.
 *
 * DisabledReason component will monitor elements with these roles.
 *
 * Note:
 * - Some roles do not require `aria-disabled` by specification.
 *   They are included here for internal implementation convenience.
 */
export const ARIA_DISABLEABLE_ROLES = [
  'button',
  'link',
  'checkbox',
  'menuitem',
  'menuitemcheckbox',
  'menuitemradio',
  'option',
  'radio',
  'switch',
  'tab',
  'treeitem',
] as const;

/**
 * CSS selector string that matches all elements monitored by
 * DisabledReason for disabled state.
 *
 * Combines:
 * - `DISABLEABLE_NATIVE_ELEMENTS` (HTML elements with `disabled` attribute)
 * - `ARIA_DISABLEABLE_ROLES` (elements with ARIA roles supporting `aria-disabled`)
 *
 * Used internally to locate elements that should be observed for
 * disabled state.
 */
export const DISABLEABLE_ELEMENT_QUERY = `${DISABLEABLE_NATIVE_ELEMENTS.join(', ')}, ${ARIA_DISABLEABLE_ROLES.map((role) => `[role="${role}"]`).join(', ')}`;
