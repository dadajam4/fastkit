---
'@fastkit/vue-form-control': minor
'@fastkit/vui': minor
---

Rename the settings that decide where validation messages are rendered

`showOwnErrors` and `collectErrorMessages` decide which component renders a
node's validation messages, not whether a node has errors. They are renamed so
the names keep describing that as messages other than errors are added:

| Before                 | After                       | Where                                                                                 |
| ---------------------- | --------------------------- | ------------------------------------------------------------------------------------- |
| `showOwnErrors`        | `showOwnValidationMessages` | form node prop and `FormNodeControl` getter                                           |
| `collectErrorMessages` | `collectValidationMessages` | form group / form node wrapper prop and `FormGroupControl` / `FormNodeWrapper` getter |

Behavior is unchanged. The old names are removed without aliases.

**Migration**

Replace the old names in templates, JSX and code that reads the getters:

```diff
- <VFormGroup collectErrorMessages>
-   <VTextField showOwnErrors={false} />
+ <VFormGroup collectValidationMessages>
+   <VTextField showOwnValidationMessages={false} />
  </VFormGroup>
```

In templates, the kebab-case forms change accordingly:
`show-own-errors` → `show-own-validation-messages`,
`collect-error-messages` → `collect-validation-messages`.

The getters that return the collected messages (`errorMessages`,
`firstErrorMessage`) keep their names.
