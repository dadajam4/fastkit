---
'@fastkit/vue-action': minor
---

Navigate to the rendered `href` on click, parse string `to` correctly, and render disabled links without `href`

**Navigation on click.** With `to`, a click now calls the `navigate` function
that the RouterLink component passes to its slot, instead of resolving `to`
again with `router.push`. The click goes where the rendered `href` points, so
anything the RouterLink applies to the location (for example NuxtLink's
`trailingSlash`, or a wrapper that adds a locale prefix) also applies to the
navigation. When the slot does not provide `navigate`, the previous
`router.push` is used as before.

`registerRouteActionHandler` is now only called in that fallback. If you
registered a handler only to keep the navigation in sync with your RouterLink
component, it is no longer needed.

**String `to`.**

- The hash keeps its leading `#`. `/a/#b` used to navigate to `/a/b`.
- The query is parsed with Vue Router's `parseQuery`: values are decoded, `=`
  inside a value is kept, and repeated keys become arrays.
- A `to` with a protocol (`https:`, `tel:`, `mailto:`, …) or a
  protocol-relative `to` (`//example.com`) is rendered as a plain `<a href>`
  instead of being joined to the current path. `isExternalLocation()` is
  exported for the same check.

**Disabled links.** A disabled link (with `to` or `href`) is now rendered
without `href`, with `role="link"` and `aria-disabled="true"`, and without the
`disabled` attribute, which `<a>` does not have. It used to keep its `href`, so
a modifier-key click, a middle click or a `target` still followed it, and a
disabled `href` link without `guard` or `onClick` was followed on a plain click.
Buttons keep the `disabled` attribute.

If your styles select a disabled link with `[disabled]`, also select
`[aria-disabled='true']`.
