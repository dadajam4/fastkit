---
'@fastkit/plugboy': patch
---

End a generated `package.json` with a newline, and make the change check that
skips the write actually work.

`Workspace#preparePackageJSON()` rewrites the workspace's `package.json` on every
build. It wrote the file with `JSON.stringify`, which emits no final newline, so
a `package.json` touched by hand or by a formatter — the repo's own
`.editorconfig` sets `insert_final_newline = true` — got that newline silently
taken back off by the next build, as a diff in a package the author never
touched.

The check that was supposed to skip an unchanged write could never fire. It held
a compact serialisation of the file and compared it against the *indented* output:

```ts
const originalJSONString = JSON.stringify(json); // compact
const cloned = JSON.parse(originalJSONString);
// ...
const toStr = JSON.stringify(sorted, null, 2); // indented — never equal
if (originalJSONString !== toStr) { /* always taken */ }
```

Both sides are compact now, which is what the check was evidently always meant to
be: it compares the fields and their order, not the layout. plugboy writes when it
has something to say about the contents, and leaves the whitespace between them to
whatever formatter the repo runs. Key order is treated as contents, so
`sortPackageJson` keeps applying to files that already exist.

`plugboy gen` gets the same trailing newline for the `package.json` and
`tsconfig.json` it writes, so a freshly generated package no longer starts out
violating `.editorconfig`.
