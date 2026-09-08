---
'@fastkit/stylelint-config': patch
---

Drop the unused `stylelint-config-css-modules` dependency.

The config has never extended it — nothing in the package, or anywhere in this repository, references it — so it was installed with every consumer for nothing.

A project that extends `stylelint-config-css-modules` in its own config while relying on this package to install it has to declare it directly now, which is where that dependency belongs.
