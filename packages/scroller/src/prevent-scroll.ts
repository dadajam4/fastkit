// space: 32, page up: 33, page down: 34, end: 35, home: 36
// left: 37, up: 38, right: 39, down: 40
export const SCROLLABLE_KEY_CODES = [32, 33, 34, 35, 36, 37, 38, 39, 40];

export interface PreventScrollOptions {
  hideScrollbar: boolean;
}

export interface PreventScrollContext {
  options: PreventScrollOptions;
  el: PreventScrollElement;
  overflowOrigin?: string | null;
  lockPosition: {
    x: number;
    y: number;
  };
}

export interface PreventScrollElement extends HTMLElement {
  __ps_ctx__: PreventScrollContext;
}

const eventListenerOptions: AddEventListenerOptions = {
  passive: false,
};

const handleWheel = (e: WheelEvent) => {
  e.preventDefault();
};

const handleScroll = (e: Event) => {
  const el = e.target as PreventScrollElement;
  if (el && el.__ps_ctx__) {
    el.scrollTo(el.__ps_ctx__.lockPosition.x, el.__ps_ctx__.lockPosition.y);
  }
};

const handleKeydown = (e: KeyboardEvent) => {
  if (
    e.target &&
    ['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)
  ) {
    return;
  }
  if (SCROLLABLE_KEY_CODES.includes(e.which)) {
    e.preventDefault();
  }
};

export function enableScroll(el: Element) {
  const _el: PreventScrollElement = <PreventScrollElement>el;
  if (!_el.__ps_ctx__) return;

  const { options } = _el.__ps_ctx__;

  _el.removeEventListener('wheel', handleWheel, eventListenerOptions);
  _el.removeEventListener('scroll', handleScroll, eventListenerOptions);
  _el.removeEventListener('keydown', handleKeydown);

  if (options.hideScrollbar) {
    _el.style.overflow = _el.__ps_ctx__.overflowOrigin as string;
  }
  delete (_el as any).__ps_ctx__;
}

export function disableScroll(
  el: Element,
  opts: Partial<PreventScrollOptions> = {},
) {
  const { hideScrollbar = false } = opts;

  const _el: PreventScrollElement = <PreventScrollElement>el;
  if (_el.__ps_ctx__) return;

  const options = {
    hideScrollbar,
  };

  _el.__ps_ctx__ = {
    options,
    el: _el,
    overflowOrigin: _el.style.overflow,
    lockPosition: {
      x: _el.scrollLeft || (_el as any).scrollX,
      y: _el.scrollTop || (_el as any).scrollY,
    },
  };

  if (options.hideScrollbar) {
    _el.style.overflow = 'hidden';
  }

  _el.addEventListener('wheel', handleWheel, eventListenerOptions);
  _el.addEventListener('scroll', handleScroll, eventListenerOptions);
  _el.addEventListener('keydown', handleKeydown);
}
