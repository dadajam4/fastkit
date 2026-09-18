---
'@fastkit/ts-tiny-meta': minor
---

Fix `@fastkit/ts-tiny-meta/client`, whose type reference never resolved.

The ambient entry described a `*.$types.json` import through an extensionless relative path:

```ts
type SourceFileExports = import('./dist/ts-tiny-meta').SourceFileExports;
```

The build emits `dist/ts-tiny-meta.d.mts`, and an extensionless specifier is never resolved to a `.d.mts`. Consumers with `skipLibCheck: false` got two `TS2307` from inside the package; everyone else got an unchecked type, so the default export of a `*.$types.json` import — the entire purpose of the entry — was not typed at all.

It now references the package by name (`import('@fastkit/ts-tiny-meta')`), which also stops the path from depending on the emit layout.

**This can fail a build that used to pass**: member access on an imported `*.$types.json` was unchecked and is now checked against `SourceFileExports` (`refs`, `exports`, `dependencies`). Code reading anything else was already wrong and now says so.

The two placeholder JSDoc comments in the entry are filled in as well.
