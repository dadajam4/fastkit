---
---

`@fastkit/vot-i18n`'s peer on `@fastkit/vot` is spelled `^2.0.0` rather than
`workspace:^`. No release: `workspace:^` already expands to `^2.0.0` at publish
time, so the package that goes to npm is unchanged. What it prevents is the
floor rising on its own the next time vot is released.
