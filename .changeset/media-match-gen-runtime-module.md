---
'@fastkit/media-match-gen': minor
---

Add `runtimeModule`, so the generated code can name a module the project already declares.

The emitted `.ts` imported `registerMediaMatchConditions` from — and augmented — `@fastkit/media-match` by a hard-coded name. That file lands in the *consuming* project, so the specifier resolves from there, and pnpm places into a project's `node_modules` only what the project itself declares. Naming the leaf package therefore forced every project to declare `@fastkit/media-match` as well.

```ts
new MediaMatchGeneratorRunner({ src, dest, runtimeModule: '@acme/ui' });
```

The module it names has to re-export `registerMediaMatchConditions`, `MediaMatchKey` and `MediaMatchKeyMap`. Module augmentation follows a re-export to the interface it aliases, so `MediaMatchKeyMap` still merges into the one `@fastkit/media-match` declares.

The default is unchanged (`@fastkit/media-match`), so standalone use emits exactly what it did before.

**`@fastkit/media-match` moves from `dependencies` to an optional peer dependency.** This package never imported it: the specifier existed only inside the emitted template, and what a package *emits* is the consumer's to resolve. It is optional because a project that points `runtimeModule` elsewhere does not need it.

Under pnpm nothing changes — a nested copy was never visible to the generated tree, so a project using the default already had to declare `@fastkit/media-match` itself. Under npm or Yarn it did resolve, by hoisting, and it will not any more: npm does not auto-install *optional* peers. If you use this package standalone with the default `runtimeModule` on either, declare it:

```sh
npm install @fastkit/media-match
```
