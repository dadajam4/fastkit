---
'@fastkit/vite-plugin-vui': major
---

Stop requiring `@fastkit/vue-page`

The generated installer passed `RouterLink: VPageLink` to `installVuiPlugin`, so
every project using this plugin had to have `@fastkit/vue-page` resolvable from
its own root -- the generated tree lives in the consumer's project and imports it
by name. That declaration is what made the duplicate-instance failure in #224
possible: the application resolved one copy of `@fastkit/vue-page` and
`@fastkit/vot` resolved another, and since the package carries Vue injection
identity -- a module-local `Symbol` key, and a static message queue behind
`createScrollBehavior` -- the two halves could not see each other. Nothing failed
at build time; scroll restoration simply stopped resolving at runtime.

The default was not earning that cost. `VPageLink` is a three-line adapter that
renders `VuePageControl.RouterLink`, and `VuePageControl` defaults to
vue-router's `RouterLink` -- which is what `@fastkit/vui` falls back to anyway.
So it changed nothing unless an application set `routerOptions.RouterLink` and
did *not* pass the same value to `installVui`. In exactly that case it made
things worse: the template filled `RouterLink` but never `useLink`, leaving
`@fastkit/vui` rendering a locale-aware link component while resolving `href`
and `isActive` through vue-router's plain `useLink`. A mismatched pair.

An application that wants `@fastkit/vui`'s links to follow its page layer passes
both, which is the complete form and what this repo's own docs app already did:

```ts
installVui(ctx, {
  RouterLink: ctx.RouterLink,
  useLink: ctx.useLink,
});
```

`@fastkit/vue-page` is gone from `peerDependencies`, from the generated tree's
resolvability check, and from the README's install line. This plugin now knows
nothing about the routing layer -- matching `@fastkit/vui` itself, which never
depended on `@fastkit/vue-page` at all.

With this removed, `@fastkit/vot` is the only package that resolves
`@fastkit/vue-page`, so it cannot be duplicated. Applications reach the page API
through `@fastkit/vot`, which re-exports all of it.

**Migration.** If you relied on the default -- you set
`routerOptions.RouterLink` but did not forward it to `installVui` -- pass
`RouterLink` and `useLink` explicitly as above.

Otherwise nothing changes. You may now drop `@fastkit/vue-page` from your
`package.json`, importing from `@fastkit/vot` instead:

```ts
import { VPage, useVuePageControl, createPrefetch } from '@fastkit/vot';
```

Module augmentation moves with it -- `declare module '@fastkit/vot'` merges into
the re-exported declarations, so `VuePageControl` extensions keep working:

```ts
declare module '@fastkit/vot' {
  interface VuePageControl {
    $myService: MyService;
  }
}
```
