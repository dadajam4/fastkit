export function isBodyElement(el: Element): el is HTMLBodyElement {
  return el.tagName.toLowerCase() === 'body';
}

export function getContainerDimension(el: Element) {
  if (isBodyElement(el)) {
    const documentElement = <HTMLElement>document.documentElement;
    return {
      // width: window.innerWidth,
      // height: window.innerHeight,
      width: documentElement.clientWidth,
      height: documentElement.clientWidth,
    };
  } else {
    return {
      width: el.clientWidth,
      height: el.clientHeight,
    };
  }
}

export function $(selectorOrElement: string | Element): HTMLElement | null {
  if (typeof selectorOrElement !== 'string')
    return selectorOrElement as HTMLElement;
  return document.querySelector(selectorOrElement);
}

export function cumulativeOffset(element: Element) {
  let top = 0;
  let left = 0;
  let el: HTMLElement | null = element as HTMLElement;

  while (el) {
    top += el.offsetTop || 0;
    left += el.offsetLeft || 0;
    el = el.offsetParent as HTMLElement;
  }

  return {
    top: top,
    left: left,
  };
}

export type HTMLElementEventMapKey =
  | keyof HTMLElementEventMap
  | 'DOMMouseScroll'
  | 'mousewheel';

export function on(
  element: Element,
  events: HTMLElementEventMapKey | HTMLElementEventMapKey[],
  handler: EventListenerOrEventListenerObject,
  opts = { passive: false },
) {
  if (!Array.isArray(events)) events = [events];
  for (let i = 0; i < events.length; i++) {
    element.addEventListener(events[i], handler, opts);
  }
}

export function off(
  element: Element,
  events: HTMLElementEventMapKey | HTMLElementEventMapKey[],
  handler: EventListenerOrEventListenerObject,
) {
  if (!Array.isArray(events)) events = [events];
  for (let i = 0; i < events.length; i++) {
    element.removeEventListener(events[i], handler);
  }
}

export function warn(message: string): void {
  if (typeof console === 'object' && console.warn) {
    console.warn(`[scroll] ${message}`);
  }
}

export function error(message: string): Error {
  return new Error(`[scroll] ${message}`);
}
