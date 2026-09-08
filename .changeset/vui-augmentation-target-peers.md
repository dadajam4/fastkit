---
'@fastkit/vui': minor
---

Declare `@fastkit/icon-font`, `@fastkit/color-scheme` and `@fastkit/media-match` as peer dependencies instead of dependencies.

This package exposes their types in its own public types — icon names on `VIcon`, color scopes across the component surface, media-match keys — 32 references in the published `.d.mts`. The generated code in a consuming project then **augments those modules** to replace the placeholder types (`IconName`, `ScopeName`, …) with the project's real values.

A module augmentation only applies to the copy of the module it resolves. As a `dependency`, nothing guaranteed that this package and the consuming project resolve the same copy: matching version ranges deduplicate to one, but a range skew silently produces two, and the augmentation then applies to the copy the app can see while `@fastkit/vui`'s own types keep the placeholders. The symptom is a wall of `TS2322: Type '"mdi-check"' is not assignable to type '"__IconName__"'` with nothing wrong at the site it points to.

As required peers, one copy is the only possible outcome, and an install that has not provided them says so.

Your project has to declare these three directly. That was already the case — the generated `.vui/` tree imports them by name from the project's own directory, so they had to be resolvable there — but it was documented only in this repository's dependency notes. The README now covers it.
