---
'@fastkit/vue-form-control': patch
---

Fix preserveOrder behavior in FormSelectorControl

The preserveOrder property behavior was inverted from the intended specification:

- `preserveOrder: false` (default) now maintains user selection order
- `preserveOrder: true` now sorts by items order

This is a breaking change that corrects the behavior to match the intended specification.
