---
"@fastkit/vite-plugin-vui": minor
---

Declare the dependencies the plugin actually uses so it resolves without `shamefully-hoist`: `@fastkit/vue-page` as a dependency, and `vue` / `vue-router` as peer dependencies. The generated built-in stylesheet now imports the aggregated `@fastkit/vui/builtins.css` instead of reaching into VUI's individual sub-packages (equivalent CSS output).
