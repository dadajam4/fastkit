---
'@fastkit/vui': patch
---

Restore the breakpoint-suffixed after-effects classes

Since the after-effects stylesheets moved from the legacy `@import` to the
module system, `@fastkit/vui/after-effects.scss` emitted only the unsuffixed
utility classes. Every `--<breakpoint>` variant -- `grid-size-6--md`,
`grid-size-12--xs`, the responsive spacing and text classes -- was missing from
the built CSS.

A grid item declared per-breakpoint therefore matched no width rule at all:

```tsx
<VGridItem size={{ xs: 12, md: 6 }} />
// class="... grid-size-12--xs grid-size-6--md" -- neither class existed
```

The item collapsed to its content width with nothing logged, so the layout
broke silently.

`mq-each`, which loops over a project's own breakpoints, comes from the
media-match Sass that `@fastkit/vite-plugin-vui` generates and injects into
every entry stylesheet. Under `@import` that reached the sub-stylesheets;
under `@use` each of them has its own scope, and the `mixin-exists` guard they
carried turned the loss into missing CSS instead of a build error. The loop now
runs in `after-effects.scss` itself -- the entry the injection actually reaches
-- and the emitted CSS is identical to what the legacy `@import` produced,
declaration order included. When no `mq-each` is in scope the stylesheet now
warns rather than dropping the variants quietly.

No change is needed in projects that use `@fastkit/vite-plugin-vui`.

`@fastkit/vui/after-effects/{display-flow,text,spacing}.scss` are now
mixin-only: importing one directly no longer emits CSS on its own. Import
`@fastkit/vui/after-effects.scss` instead, or `@include` the mixin the module
exports (`display-flow.display-flow`, `text.text`, `spacing.spacing`), passing
a breakpoint suffix if you drive the loop yourself.
