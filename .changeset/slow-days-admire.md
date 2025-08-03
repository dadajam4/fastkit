---
'@fastkit/vue-form-control': patch
---

Add preserveOrder option to FormSelectorControl

This new option controls how selected items are ordered in multiple selection mode:

- `preserveOrder: false` (default): Selected items are sorted according to the order they appear in the items array
- `preserveOrder: true`: Selected items maintain the order in which they were selected by the user

The option can be configured globally via `defaultPreserveOrder` in FormSelectorControlOptions or per-component via the `preserveOrder` prop.
