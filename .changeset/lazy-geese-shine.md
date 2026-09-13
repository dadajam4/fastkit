---
'@fastkit/vot': patch
---

Inline the page's stylesheets into the SSR dev response

Opening a page against the `vot` dev server painted unstyled HTML for a moment
before the styles appeared. `createSSRDevHandler` built the response from
`index.html`, the SSR render result and the render context, and none of those
carry CSS: Vite serves stylesheets as JavaScript modules in dev and emits no
`<link rel="stylesheet">`, so the document had zero styles until the client
entry had been fetched, parsed and executed. `vot build` + `vot serve` were
never affected, because the client build writes real stylesheet links into
`index.html`.

The dev handler now walks the SSR module graph once the render is done --
per request, since the set of stylesheets depends on which route was rendered --
and inlines each one into the head as a `<style>` element. They carry the
`data-vite-dev-id` attribute Vite's HMR client looks for, so on hydration it
adopts the existing elements instead of appending a second copy, and CSS hot
updates keep replacing them in place.

Order matters as much as presence, because the client never reorders what it
adopts: whatever order the response ships is the cascade for the rest of the
session. A plain depth-first walk does not reproduce it -- a module behind a
dynamic import is reached on the way down, but the browser only runs it after
the whole static graph. The walk therefore defers dynamically imported modules
(via the transform result's `dynamicDeps`) and drains them afterwards, which
reproduces the order the client applies stylesheets in, and with it the order
`vot build` produces.

Fixes #219
