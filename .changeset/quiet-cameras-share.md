---
'@fastkit/vite-plugin-vui': minor
---

Stop requiring `@fastkit/vue-page`

**One behaviour change to check.** The generated installer no longer defaults
`RouterLink` to `@fastkit/vue-page`'s `VPageLink`. If your application sets
`routerOptions.RouterLink` but does *not* forward it to `installVui`, its
`@fastkit/vui` links now fall back to vue-router's plain `RouterLink`. Pass both
primitives to keep them following your page layer:

```ts
installVui(ctx, {
  RouterLink: ctx.RouterLink,
  useLink: ctx.useLink,
});
```

That is the complete form, and the one this repo's own docs app already used --
the old default only ever filled `RouterLink`, never `useLink`, so an
application relying on it got a locale-aware link component whose `href` and
`isActive` were still resolved through vue-router's plain `useLink`. A
mismatched pair. Applications that pass both, or that pass neither, are
unaffected.

**Why the default went.** Because the generated tree is written into the
consumer's project and imports `@fastkit/vue-page` by name, that one default
made the package a required peer of every project using this plugin. It was also
the second resolver behind #224: `@fastkit/vot` already held
`@fastkit/vue-page` under `dependencies`, so the application resolved a copy of
its own. The package carries Vue injection identity -- a module-local `Symbol`
key, and a static queue behind `createScrollBehavior` -- so when the two ranges
disagreed, the halves could not see each other and scroll restoration stopped
resolving, with nothing reported at build time.

The default bought almost nobody anything in exchange. `VPageLink` is a
three-line adapter that renders `VuePageControl.RouterLink`, and
`VuePageControl` defaults to vue-router's `RouterLink` -- which is what
`@fastkit/vui` falls back to anyway.

`@fastkit/vue-page` is now gone from `peerDependencies`, from the generated
tree's resolvability check, and from the README's install line. This plugin
knows nothing about the routing layer, matching `@fastkit/vui` itself, which
never depended on `@fastkit/vue-page` at all. `@fastkit/vot` is the only package
that resolves it, so it cannot be duplicated.

**Optional cleanup.** You may now drop `@fastkit/vue-page` from your
`package.json` and reach the page API through `@fastkit/vot`, which re-exports
all of it:

```ts
import { VPage, useVuePageControl, createPrefetch } from '@fastkit/vot';
```

Module augmentation has to move with it, and this is the part that fails
quietly -- `declare module '@fastkit/vue-page'` in a project that can no longer
resolve that specifier becomes a fresh ambient declaration instead of an
augmentation, with no diagnostic:

```ts
declare module '@fastkit/vot' {
  interface VuePageControl {
    $myService: MyService;
  }
}
```
