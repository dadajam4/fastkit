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
