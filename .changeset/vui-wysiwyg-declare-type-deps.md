---
'@fastkit/vui-wysiwyg': minor
---

Declare `@fastkit/vue-form-control` and `@fastkit/vue-utils`, which the published declarations reference.

`VWysiwygEditor`'s props spread `createFormNodeWrapperProps()`, so `FormNodeControl` and friends reach the emitted `.d.mts` as inline `import()` types — 41 references to one package and 11 to the other. Neither was declared anywhere: the assumption was that they resolve through the required `@fastkit/vui` peer, which depends on both.

They do not. A declaration file's reference is resolved by the consumer's type checker starting from *this* package's directory, and pnpm does not make a dependency's own dependencies reachable from there. The result was 25 `TS2307` inside `@fastkit/vui-wysiwyg/dist/vui-wysiwyg.d.mts` for any consumer with `skipLibCheck: false`, and silently unchecked members for everyone else.

**Nothing is asked of consumers.** Both are declared as `dependencies`, so they arrive with `@fastkit/vui-wysiwyg` under every package manager — and they are already present anyway, since `@fastkit/vui` depends on them. A peer would have forced the requirement outward for no reason: the reference is type-only, and the runtime bundle imports `@fastkit/vui` and nothing else, so there is no runtime identity that needs a single resolver.

Released as a minor rather than a patch because members of those types were unchecked and now are checked; code that relied on the laxity will start reporting errors.

The `@fastkit/vui` peer range also moves from `workspace:^` to an explicit `^1.7.0`, per [docs/dependency-management.md](https://github.com/dadajam4/fastkit/blob/main/docs/dependency-management.md). That is strictly looser than what `workspace:^` published, so nothing breaks.
