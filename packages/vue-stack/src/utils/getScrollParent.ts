export function getScrollParent(el?: HTMLElement | null): HTMLElement {
  while (el) {
    if (hasScrollbar(el)) return el;
    el = el.parentElement!;
  }

  return document.scrollingElement as HTMLElement;
}

export function getScrollParents(
  el?: Element | null,
  stopAt?: Element | null,
): HTMLElement[] {
  const elements: HTMLElement[] = [];
  if (stopAt && el && !stopAt.contains(el)) return elements;

  const { scrollingElement } = document;

  let hasDocumentScrollingElement = false;

  while (el) {
    if (hasScrollbar(el)) {
      elements.push(el as HTMLElement);
      if (el === scrollingElement) {
        hasDocumentScrollingElement = true;
      }
    }
    if (el === stopAt) break;
    el = el.parentElement!;
  }

  if (scrollingElement && !hasDocumentScrollingElement) {
    elements.push(scrollingElement as HTMLElement);
  }

  return elements;
}

export function hasScrollbar(el?: Element | null) {
  if (!el || el.nodeType !== Node.ELEMENT_NODE) return false;

  const style = window.getComputedStyle(el);
  return (
    style.overflowY === 'scroll' ||
    (style.overflowY === 'auto' && el.scrollHeight > el.clientHeight)
  );
}
