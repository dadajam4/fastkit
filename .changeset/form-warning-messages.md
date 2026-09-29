---
'@fastkit/vue-form-control': minor
'@fastkit/vui': minor
---

Show warnings on form nodes without blocking submission

A form node takes a new `warningMessages` prop (`string | string[]`), next to
`errorMessages`. Warnings are shown to the user like errors, but they do not
make the node invalid, do not fail `validate()` and do not block form
submission.

```tsx
<VTextField
  v-model={price.value}
  warningMessages={
    price.value >= 100000 ? 'Is this amount correct?' : undefined
  }
/>
```

Warnings are routed by the same settings as errors, so no new configuration is
needed:

- They follow `showOwnValidationMessages`, and a form group or wrapper with
  `collectValidationMessages` collects them the way it collects errors.
- A detached node's warnings stay with that node.
- While a node has an error, its own warnings are not shown. Warnings of other
  nodes are unaffected.

**`@fastkit/vue-form-control`**

- `FormNodeControl`: `warnings`, `warningMessages`, `firstWarningMessage`,
  `hasMyWarning`, and `warned` (this node or a descendant has a warning; it is
  independent of `invalid`).
- `FormGroupControl`: `warningMessages` also collects the warnings of nodes
  that have no error.
- `FormNodeWrapper`: `warned`, `warningMessages`, `firstWarningMessage` and
  `renderFirstWarning()`. `renderMessage()` now shows the first error, then the
  first warning, then the hint.
- New types `FormNodeWarning` and `FormNodeWarningMessageSource`.

**`@fastkit/vui`**

Every form component shows warnings in the `warningScope` color (`warning` by
default), below errors in precedence: `VTextField`, `VTextarea`, `VNumberField`,
`VSelect`, `VFileInput`, `VCheckbox`, `VCheckboxGroup`, `VRadioGroup`,
`VSwitch`, `VSwitchGroup` and anything else built on `VFormControl` or
`VControlField`.

- The warning state draws its label, message, field lines and checkable icon
  with the scope's `outlineText` color and falls back to its main color, since
  a warning color is often too light to read on the page background. Errors
  keep using the main color.
- New state classes: `v-form-control--warned`, `v-control-field--warned`,
  `v-checkable--warned` and `v-form--warned`.
- `VCheckable` takes a `warned` prop.
- `VuiColorProvider` gains `warning`, and `className()` accepts `'warning'`.
  A custom provider supplied through `VuiColorProviderInjectionKey` must add
  `warning`.
