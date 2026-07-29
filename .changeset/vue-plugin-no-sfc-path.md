---
"@fastkit/plugboy-vue-plugin": patch
"@fastkit/vue-app-layout": patch
---

Stop publishing the absolute path of every `.vue` file.

`unplugin-vue` defaults `isProduction` to false, which enables the devtools annotations — among them `__file`, holding the **absolute** path of the SFC:

```js
export_helper_default(_sfc_main, [["render", _sfc_render], ["__file", "/Users/someone/projects/acme/packages/ui/src/Button.vue"]]);
```

plugboy builds artifacts for publishing, so `isProduction: true` is the right default; a consumer that wants the annotations can pass `isProduction: false`. Production mode also switches on template inlining, which rewrites a `<script setup>` component's compiled shape — that is a codegen change rather than a leak fix, so `inlineTemplate` is defaulted off and left for the consumer to opt into.

`@fastkit/vue-app-layout` is the only package here with an SFC. Its output loses the `__file` entry and, from the production props codegen, a redundant `required: false` on an optional Boolean prop; the component is otherwise unchanged.
