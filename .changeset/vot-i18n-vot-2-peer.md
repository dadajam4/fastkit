---
'@fastkit/vot-i18n': major
---

Require `@fastkit/vot` 2.

Nothing here changes: this package reads `ctx.cookies` and `ctx.request`, and both come through vot's server-context rework untouched. What moves is the floor — a project still on vot 1 cannot take this version.

