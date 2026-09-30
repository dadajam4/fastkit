---
'@fastkit/color-scheme-gen': minor
---

Give the built-in scheme's `warning` scope a readable text color

`createSimpleColorScheme()` now sets `outlineText` on the `warning` scope in
light themes. It is derived from the warning palette color: the hue is shifted
12.8° toward amber, then 28.8% black is mixed in. Darkening the warning color
without the shift turns it gold. With the default `#f8c200` this gives
`#b06400`, 4.5:1 on white, where `#f8c200` itself is 1.65:1. Dark themes are
unchanged.

Anything that draws text with `outlineText` picks this up, including the
`plain`, `outlined` and `inverted` variants with the `warning` color.
