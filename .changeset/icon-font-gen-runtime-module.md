---
'@fastkit/icon-font-gen': patch
---

Add `runtimeModule`, so the generated code can name a module the project already declares.

The emitted `.ts` imported `registerIconNames` from — and augmented — `@fastkit/icon-font` by a hard-coded name:

```ts
import { registerIconNames } from '@fastkit/icon-font';
declare module '@fastkit/icon-font' {
  export interface IconNameMap { 'mdi-check': true, … }
}
```

That file lands in the *consuming* project, so the specifier resolves from there, and pnpm places into a project's `node_modules` only what the project itself declares. Naming the leaf package therefore forced every project to declare `@fastkit/icon-font`, on top of whatever kit it was already using. A peer declaration cannot lift that: an auto-installed peer lands in the virtual store, where the generated tree cannot see it.

`runtimeModule` names the module instead:

```ts
generate({ entries, dest, runtimeModule: '@acme/ui' });
```

The module it names has to re-export `@fastkit/icon-font`'s `registerIconNames`, `ICON_NAMES`, `IconName` and `IconNameMap`. Module augmentation follows a re-export to the interface it aliases, so `IconNameMap` still merges into the one `@fastkit/icon-font` declares and every derived type agrees — the project just never has to name it.

The default is unchanged (`@fastkit/icon-font`), so standalone use, including the `icon-font` CLI, emits exactly what it did before.

`runtimeModule` is part of the regeneration check, so changing it regenerates rather than leaving the old module name in place.

**`@fastkit/icon-font` moves from `dependencies` to an optional peer dependency.** This package never imported it: the specifier existed only inside the emitted template, and what a package *emits* is the consumer's to resolve, not something to install beside itself. It is optional because a project that points `runtimeModule` elsewhere does not need it at all.

Under pnpm nothing changes — a nested copy was never visible to the generated tree, so a project using the default already had to declare `@fastkit/icon-font` itself. Under npm or Yarn it did resolve, by hoisting, and it will not any more: npm does not auto-install *optional* peers. If you use this package standalone with the default `runtimeModule` on either, declare it:

```sh
npm install @fastkit/icon-font
```
