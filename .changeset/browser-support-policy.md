---
"@fastkit/vue-loading": patch
"@fastkit/vue-scroller": patch
"@fastkit/vue-stack": patch
"@fastkit/vui": patch
"@fastkit/vui-wysiwyg": patch
---

Emit the vendor prefixes the supported browsers still need.

No build target was declared anywhere, so tsdown applied no syntax lowering and lightningcss added no prefixes. The published stylesheets shipped bare `user-select`, which Safari ignores without `-webkit-`, along with `text-fill-color`, `text-size-adjust` and `text-decoration`. Consumers only got working output when their own bundler happened to re-process the CSS with a suitable target — an implicit dependency on someone else's default.

`plugboy.project.ts` now declares one browser support policy for every workspace: Baseline "widely available" as of two years ago, resolved with `browserslist "baseline 2024"` (chrome130 / edge130 / firefox132 / safari18.2 / ios18.2), plus `node22.12`. `css.target` inherits it, so syntax lowering and prefixing always agree with the same list, and the policy is reviewed and bumped on a schedule rather than hardcoded per stylesheet.

Only these five packages ship CSS that changes; every package's JavaScript output is byte-identical, since the syntax in use is already supported by the declared targets.
