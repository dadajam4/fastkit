---
"@fastkit/icon-font-gen": minor
---

Update `webfont` from 11.x to 12.x, and add `otf` to the supported icon font formats.

`IconFontFormat` used to be derived through a deep `webfont/dist/src/types/OptionsBase` import. webfont 12 introduced an `exports` map that only publishes the package root, so that path is no longer reachable and `OptionsBase` is not part of the public type surface. The type is now derived from the exported `webfont` function's own signature, which removes the dependency on webfont's internal layout.

webfont 12 also added `otf` to its format union, so `otf` (CSS `format("opentype")`) is now selectable through `formats`. The default is still `['woff2']`, so existing configurations generate exactly the same files — verified by regenerating the docs icon font under both 11.2.26 and 12.5.0 and comparing SHA-256 hashes of the emitted `.css`, `.ts` and `.woff2`, which are identical.

Note that webfont 12 raises its Node requirement from `>=12.0.0` to `>=24.14.0`, and consumers of this package inherit that floor.
