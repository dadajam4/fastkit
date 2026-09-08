---
'@fastkit/helpers': minor
---

**Breaking:** rename `DefaultsScheme` / `DefaultsSchemeSource` / `createIndexSignatureDefaultsScheme` to `DefaultsSchema` / `DefaultsSchemaSource` / `createIndexSignatureDefaultsSchema`.

These describe the shape of default values, so the word is **schema** — a description of the structure of data — not **scheme**, which is a plan or an arrangement (a URI scheme, a color scheme). Every comparable API in the ecosystem spells it that way (JSON Schema, `zod`'s `ZodSchema`, Mongoose's `Schema`, GraphQL's schema), so `Scheme` here read as a typo.

### Migration

A search and replace over the three names, longest first so the `Source` variant is not left half-renamed:

| Before                               | After                                |
| ------------------------------------ | ------------------------------------ |
| `DefaultsSchemeSource`               | `DefaultsSchemaSource`               |
| `DefaultsScheme`                     | `DefaultsSchema`                     |
| `createIndexSignatureDefaultsScheme` | `createIndexSignatureDefaultsSchema` |

```sh
# from the project root, adjust the path list to taste
grep -rl 'DefaultsScheme\|createIndexSignatureDefaultsScheme' src \
  | xargs sed -i '' \
    -e 's/DefaultsSchemeSource/DefaultsSchemaSource/g' \
    -e 's/DefaultsScheme/DefaultsSchema/g' \
    -e 's/createIndexSignatureDefaultsScheme/createIndexSignatureDefaultsSchema/g'
```

Nothing else changes: the types describe the same shapes, `mergeDefaults` behaves identically, and the parameter names inside it are renamed the same way (visible in editor signature hints only). No deprecated aliases are kept — the old names are gone in this release, so a missed reference fails at compile time rather than silently living on.
