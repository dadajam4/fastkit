---
'@fastkit/color-scheme-gen': patch
'@fastkit/media-match-gen': patch
---

Stop generating the deprecated Sass `if()` function

The SCSS these two generators emit called Sass's `if()` in three places. Dart
Sass now deprecates that syntax in favour of the CSS one, so every project
building against a recent `sass` gets:

```
DEPRECATION WARNING [if-function]: The Sass if() syntax is deprecated in favor of the modern CSS syntax.
```

Sass reports the warning once per root stylesheet that reaches the generated
file, so three call sites became 786 warnings in a real build (524 from
`media-match.scss`, 262 from `color-scheme.scss`). Nothing was broken -- but the
noise buried the warnings a project raised about its *own* stylesheets, and the
generated files are not editable downstream, leaving
`silenceDeprecations: ['if-function']` as the only way out.

The three calls are now `@if` / `@else` statements. The modern CSS-style
`if(sass(cond): a; else: b)` would have worked too, but only on very recent Dart
Sass; `@if` / `@else` has always been available, so the generated output stays
compatible with the `sass` versions these packages already supported.

The emitted CSS is byte-for-byte identical -- verified by compiling
`@fastkit/vui`'s `after-effects.scss` (~500 KB of output, the heaviest `mq-each`
consumer) and a stylesheet exercising `palette-border` in both branches against
the old and new generators. Both packages now carry a test that compiles their
generated SCSS and asserts Sass reports no deprecations.

No action is needed beyond upgrading and regenerating.
