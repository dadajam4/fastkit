import { Properties as CSSProperties } from 'csstype';

export function docReady(callback: (document: Document) => any) {
  if (typeof document === 'undefined') {
    throw new Error('document-ready only runs in the browser');
  }
  const state = document.readyState;
  if (state === 'complete' || state === 'interactive') {
    return setTimeout(() => {
      callback(document);
    }, 0);
  }

  document.addEventListener('DOMContentLoaded', function onLoad() {
    callback(document);
  });
}

export function isArrayLike<T = any>(source: unknown): source is Array<T> {
  return (
    !!source &&
    typeof source === 'object' &&
    typeof (source as any).length === 'number'
  );
}

export function $<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  data: {
    className?: string;
    attrs?: {
      [attr: string]: string;
    };
    style?: CSSProperties;
    on?: {
      [K in keyof HTMLElementEventMap]?: (
        this: HTMLElement,
        ev: HTMLElementEventMap[K],
      ) => any;
    };
  } = {},
  children?: string | HTMLElement | (string | HTMLElement)[],
): HTMLElementTagNameMap[K] {
  data = data || {};

  const $el = document.createElement(tag);

  if (data.className) {
    $el.className = data.className;
  }

  if (data.attrs) {
    for (const key in data.attrs) {
      $el.setAttribute(key, data.attrs[key]);
    }
  }

  if (data.style) {
    for (const prop in data.style) {
      $el.style[prop as any] = (data.style as any)[prop];
    }
  }

  if (data.on) {
    for (const ev in data.on) {
      const listener = (data.on as any)[ev];
      $el.addEventListener(ev, function (e) {
        listener(e);
      });
    }
  }

  if (children) {
    if (!isArrayLike(children)) {
      children = [children];
    }

    for (let i = 0, l = children.length; i < l; i++) {
      const child = children[i];
      if (typeof child === 'string') {
        $el.innerHTML = child;
      } else if (child instanceof HTMLElement) {
        $el.appendChild(child);
      }
    }
  }

  return $el;
}
