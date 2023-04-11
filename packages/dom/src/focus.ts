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
