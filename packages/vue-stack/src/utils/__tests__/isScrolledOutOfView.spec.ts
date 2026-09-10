import { describe, it, expect } from 'vitest';
import { isScrolledOutOfView } from '../isScrolledOutOfView';

function entry(
  isIntersecting: boolean,
  rect: { width: number; height: number },
): IntersectionObserverEntry {
  return {
    isIntersecting,
    boundingClientRect: rect as DOMRectReadOnly,
  } as IntersectionObserverEntry;
}

describe('isScrolledOutOfView', () => {
  it('is false while the element intersects the viewport', () => {
    expect(isScrolledOutOfView(entry(true, { width: 80, height: 24 }))).toBe(
      false,
    );
  });

  it('is true for a rendered element that left the viewport', () => {
    expect(isScrolledOutOfView(entry(false, { width: 80, height: 24 }))).toBe(
      true,
    );
  });

  it('is false for an element that is not rendered at all', () => {
    // `display: none` and detached elements report `isIntersecting: false` too,
    // but they have no layout box. Closing a stack on them breaks activators
    // that are deliberately hidden while the stack is open (issue #208).
    expect(isScrolledOutOfView(entry(false, { width: 0, height: 0 }))).toBe(
      false,
    );
  });

  it('keeps a collapsed-on-one-axis element out of view', () => {
    expect(isScrolledOutOfView(entry(false, { width: 0, height: 24 }))).toBe(
      true,
    );
    expect(isScrolledOutOfView(entry(false, { width: 80, height: 0 }))).toBe(
      true,
    );
  });
});
