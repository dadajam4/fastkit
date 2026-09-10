/**
 * Determine whether an observed element has been scrolled out of view.
 *
 * An element that is not rendered at all also reports `isIntersecting: false`
 * -- most notably one hidden with `display: none`, or one that has been removed
 * from the document. Those are not the same condition as being scrolled out of
 * the viewport, and treating them alike breaks elements that are deliberately
 * hidden by CSS (a row action button shown only on `:hover`, for example).
 *
 * Such an element generates no layout box, so an empty `boundingClientRect`
 * tells the two conditions apart.
 *
 * @param entry - Intersection entry for the observed element
 * @returns `true` when the element is rendered but outside the viewport
 */
export function isScrolledOutOfView(entry: IntersectionObserverEntry): boolean {
  if (entry.isIntersecting) return false;
  const { width, height } = entry.boundingClientRect;
  return width > 0 || height > 0;
}
