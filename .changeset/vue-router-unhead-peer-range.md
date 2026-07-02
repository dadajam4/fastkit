---
"@fastkit/vue-action": patch
"@fastkit/vue-app-layout": patch
"@fastkit/vue-i18n": patch
"@fastkit/vue-loading": patch
"@fastkit/vue-location": patch
"@fastkit/vue-page": patch
"@fastkit/vue-scoped-loading": patch
"@fastkit/vue-stack": patch
"@fastkit/vue-utils": patch
"@fastkit/vui": patch
"@fastkit/vui-wysiwyg": patch
"@fastkit/vue-color-scheme": patch
---

Fix peer dependency ranges that had drifted behind the versions actually built against.

- `vue-router`: widen the peer range from `^4.4.0` to `^4.4.0 || ^5.0.0` across the packages that declare it. Development moved to `vue-router@5.1.0`, but the peer range still only allowed the v4 major, which excluded v5 for consumers and pulled a stale `vue-router@4.6.4` into the lockfile via `@fastkit/vui-wysiwyg`. Both majors are now supported.
- `@unhead/vue` (`@fastkit/vue-color-scheme`): bump the peer range from `^1.8.0` to `^3.0.0` to match the `3.1.3` version used in development. The previous range was two majors behind and emitted spurious peer warnings.
