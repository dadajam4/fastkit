---
'@fastkit/accept-language': patch
'@fastkit/async-control': patch
'@fastkit/body-scroll-lock': patch
'@fastkit/cache-control': patch
'@fastkit/catcher': patch
'@fastkit/cloner': patch
'@fastkit/color': patch
'@fastkit/color-scheme': patch
'@fastkit/color-scheme-gen': patch
'@fastkit/comparator': patch
'@fastkit/cookies': patch
'@fastkit/debounce': patch
'@fastkit/dom': patch
'@fastkit/duration': patch
'@fastkit/ev': patch
'@fastkit/hashed-sync': patch
'@fastkit/helpers': patch
'@fastkit/i18n': patch
'@fastkit/icon-font': patch
'@fastkit/icon-font-gen': patch
'@fastkit/json': patch
'@fastkit/keyboard': patch
'@fastkit/media-match': patch
'@fastkit/media-match-gen': patch
'@fastkit/merge': patch
'@fastkit/node-util': patch
'@fastkit/nodepack': patch
'@fastkit/object-path': patch
'@fastkit/plugboy': patch
'@fastkit/plugboy-sass-plugin': patch
'@fastkit/plugboy-vanilla-extract-plugin': patch
'@fastkit/plugboy-vue-jsx-plugin': patch
'@fastkit/plugboy-vue-plugin': patch
'@fastkit/rules': patch
'@fastkit/scroller': patch
'@fastkit/sprite-images': patch
'@fastkit/tiny-hash': patch
'@fastkit/tiny-logger': patch
'@fastkit/ts-tiny-meta': patch
'@fastkit/universal-logger': patch
'@fastkit/vanilla-extract-utils': patch
'@fastkit/visibility': patch
'@fastkit/vite-kit': patch
'@fastkit/vite-plugin-vui': patch
'@fastkit/vot': patch
'@fastkit/vot-i18n': patch
'@fastkit/vue-action': patch
'@fastkit/vue-app-layout': patch
'@fastkit/vue-body-scroll-lock': patch
'@fastkit/vue-click-outside': patch
'@fastkit/vue-color-scheme': patch
'@fastkit/vue-disabled-reason': patch
'@fastkit/vue-form-control': patch
'@fastkit/vue-i18n': patch
'@fastkit/vue-keyboard': patch
'@fastkit/vue-loading': patch
'@fastkit/vue-location': patch
'@fastkit/vue-media-match': patch
'@fastkit/vue-page': patch
'@fastkit/vue-resize': patch
'@fastkit/vue-scoped-loading': patch
'@fastkit/vue-scroller': patch
'@fastkit/vue-sortable': patch
'@fastkit/vue-stack': patch
'@fastkit/vue-tiny-meta': patch
'@fastkit/vue-transitions': patch
'@fastkit/vue-utils': patch
'@fastkit/vue-visibility': patch
'@fastkit/vui': patch
'@fastkit/vui-wysiwyg': patch
---

Strip the dangling `//# sourceMappingURL=*.d.mts.map` comment from emitted declaration files.

tsdown (rolldown) appends this comment to every `.d.(m)ts` it emits but does not emit the referenced declaration map, so consumers' editors/build tools fail to resolve it. plugboy now removes the comment during build — but only when the referenced map is genuinely absent, so it becomes a no-op automatically if a future tsdown starts emitting real declaration maps.

Every package in this monorepo is built by plugboy, so this patch re-publishes them all with declaration files that no longer point at a missing map.
