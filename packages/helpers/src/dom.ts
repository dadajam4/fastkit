export const IN_WINDOW = typeof window !== 'undefined';

export const IN_DOCUMENT = typeof document !== 'undefined';

export function isFocusable(element: HTMLElement): boolean {
  if (
    element.tabIndex > 0 ||
    (element.tabIndex === 0 && element.getAttribute('tabIndex') !== null)
  ) {
    return true;
  }

  if ((element as any).disabled) {
    return false;
  }

  switch (element.nodeName) {
    case 'A':
      return !!(element as any).href && (element as any).rel != 'ignore';
    case 'INPUT':
      return (
        (element as any).type != 'hidden' && (element as any).type != 'file'
      );
    case 'BUTTON':
    case 'SELECT':
    case 'TEXTAREA':
      return true;
    default:
      return false;
  }
}

export function attemptFocus(element: HTMLElement): boolean {
  if (!isFocusable(element)) {
    return false;
  }

  // aria.Utils.IgnoreUtilFocusChanges = true;
  try {
    element.focus();
  } catch (e) {}
  // aria.Utils.IgnoreUtilFocusChanges = false;
  return document.activeElement === element;
}

export function focusFirstDescendant(element: HTMLElement): boolean {
  for (let i = 0; i < element.childNodes.length; i++) {
    const child = element.childNodes[i];
    if (
      attemptFocus(child as HTMLElement) ||
      focusFirstDescendant(child as HTMLElement)
    ) {
      return true;
    }
  }
  return false;
}

export function pushDynamicStyle(styleContent: string) {
  if (!__BROWSER__) return;
  const style = document.createElement('style');
  style.innerHTML = styleContent;
  document.head.appendChild(style);
}

export type TransitionEventType =
  | 'transitioncancel'
  | 'transitionend'
  | 'transitionrun'
  | 'transitionstart';

export interface AddTransitionEventOptions extends AddEventListenerOptions {
  properties?: string | string[] | ((propertyName: string) => boolean);
}

export interface AddTransitionendEventOptions
  extends AddTransitionEventOptions {
  includeCancel?: boolean;
}

export type AddTransitionEventResult = {
  start(): void;
  clear(): void;
};

export function addTransitionEvent(
  type: TransitionEventType | TransitionEventType[],
  el: HTMLElement,
  handler: (this: HTMLElement, ev: TransitionEvent) => any,
  opts?: boolean | AddTransitionEventOptions,
): AddTransitionEventResult {
  const types = Array.isArray(type) ? type : [type];
  const options: AddTransitionEventOptions =
    typeof opts === 'object' ? opts : { capture: opts };
  const { once, properties } = options;
  const _properties =
    typeof properties === 'string' ? [properties] : properties;
  delete options.once;
  delete options.properties;

  if (options.capture === undefined) {
    options.capture = false;
  }

  let propertyChecker: ((propertyName: string) => boolean) | undefined;
  if (typeof _properties === 'function') {
    propertyChecker = _properties;
  } else if (_properties) {
    propertyChecker = (propertyName) => _properties.includes(propertyName);
  }

  function _handler(this: HTMLElement, ev: TransitionEvent) {
    if (propertyChecker && !propertyChecker(ev.propertyName)) {
      return;
    }
    handler.call(el, ev);
    if (once) {
      clear();
    }
  }

  function start() {
    types.forEach((type) => {
      el.addEventListener(type, _handler, options);
    });
  }

  function clear() {
    types.forEach((type) => {
      el.removeEventListener(type, _handler, options);
    });
  }

  start();

  return {
    start,
    clear,
  };
}

export function addTransitionendEvent(
  el: HTMLElement,
  handler: (this: HTMLElement, ev: TransitionEvent) => any,
  opts?: boolean | AddTransitionendEventOptions,
) {
  const options = typeof opts === 'boolean' ? { capture: opts } : { ...opts };
  const { includeCancel = true } = options;
  const types: TransitionEventType[] = ['transitionend'];
  if (includeCancel) {
    types.push('transitioncancel');
  }
  delete options.includeCancel;
  return addTransitionEvent(types, el, handler, options);
}
