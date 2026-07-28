---
"@fastkit/async-control": patch
"@fastkit/cache-control": patch
"@fastkit/catcher": patch
"@fastkit/color": patch
"@fastkit/color-scheme": patch
"@fastkit/color-scheme-gen": patch
"@fastkit/eslint-config": patch
"@fastkit/eslint-config-vue": patch
"@fastkit/ev": patch
"@fastkit/hashed-sync": patch
"@fastkit/helpers": patch
"@fastkit/i18n": patch
"@fastkit/icon-font": patch
"@fastkit/media-match": patch
"@fastkit/media-match-gen": patch
"@fastkit/nodepack": patch
"@fastkit/object-path": patch
"@fastkit/plugboy-vanilla-extract-plugin": patch
"@fastkit/plugboy-vue-jsx-plugin": patch
"@fastkit/plugboy-vue-plugin": patch
"@fastkit/rules": patch
"@fastkit/scroller": patch
"@fastkit/sprite-images": patch
"@fastkit/tiny-logger": patch
"@fastkit/ts-tiny-meta": patch
"@fastkit/universal-logger": patch
"@fastkit/vanilla-extract-utils": patch
"@fastkit/vite-plugin-vui": patch
"@fastkit/visibility": patch
"@fastkit/vot-i18n": patch
"@fastkit/vue-action": patch
"@fastkit/vue-app-layout": patch
"@fastkit/vue-body-scroll-lock": patch
"@fastkit/vue-click-outside": patch
"@fastkit/vue-color-scheme": patch
"@fastkit/vue-disabled-reason": patch
"@fastkit/vue-form-control": patch
"@fastkit/vue-i18n": patch
"@fastkit/vue-keyboard": patch
"@fastkit/vue-location": patch
"@fastkit/vue-media-match": patch
"@fastkit/vue-resize": patch
"@fastkit/vue-scoped-loading": patch
"@fastkit/vue-sortable": patch
"@fastkit/vue-transitions": patch
"@fastkit/vue-utils": patch
"@fastkit/vue-visibility": patch
---

Rebuild with the updated toolchain. No functional changes.

`tsdown` moved from 0.22.3 to 0.22.14 (and with it rolldown from 1.1.3 to 1.2.0), which changes the emitted output even for packages whose sources are untouched — rolldown hoists some expressions into local bindings, and declaration printing differs in where it wraps lines. Comparing every `dist` file against `main`, built twice per side to filter out the known non-reproducible declaration output, 56 packages differ across 59 `.d.mts`, 26 `.map`, 18 `.mjs` and 1 `.css` file, all of them incidental.

A few packages here also carry a refreshed dependency range — `fs-extra` 11.4.0, `typescript-eslint` 8.65.0, `eslint-plugin-vue` 10.10.0, `@vanilla-extract/rollup-plugin` 1.5.4. Each stays within the major the previous range already allowed, so resolution does not change for anyone; the declarations are just brought back in line.

These are published together so the incidental output differences are versioned explicitly, rather than riding along unannounced in whatever release happens to touch these packages next.
