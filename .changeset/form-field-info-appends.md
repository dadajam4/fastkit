---
'@fastkit/vui': minor
'@fastkit/vui-wysiwyg': patch
---

Stop form fields from dropping `infoAppends` and `hinttipDelay`

Form fields declare the `infoAppends` and `hinttipDelay` props but never passed
them on to `VFormControl`, so both were ignored. `VTextField`, `VTextarea`,
`VNumberField` and `VWysiwygEditor` also replaced the `infoAppends` slot with
their character counter, so the slot was ignored too.

- Every form field now passes `infoAppends` and `hinttipDelay` to
  `VFormControl`.
- The fields with a counter render the caller's `infoAppends` (prop or slot) in
  front of the counter.
- `.v-form-control__appends` now sizes to its content and spaces its items
  apart. It used to shrink to the narrowest width, which broke text into one
  character per line.
