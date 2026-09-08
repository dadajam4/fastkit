---
'@fastkit/i18n': minor
---

**Breaking:** rename the component "scheme" API to "schema".

| Before                        | After                         |
| ----------------------------- | ----------------------------- |
| `I18nComponentScheme`         | `I18nComponentSchema`         |
| `I18nComponentSchemeSettings` | `I18nComponentSchemaSettings` |
| `I18nComponentSchemeImpl`     | `I18nComponentSchemaImpl`     |
| `defineI18nComponentScheme()` | `defineI18nComponentSchema()` |
| `I18nSpace#defineScheme()`    | `I18nSpace#defineSchema()`    |
| `settings.scheme` / `.scheme` | `settings.schema` / `.schema` |

These describe the shape of a component's translations and formats, so the word is **schema** — a description of the structure of data — not **scheme**, which is a plan or an arrangement (a URI scheme, a color scheme). The doc comments in this package already said "Component Schema Settings" and "component schema"; only the identifiers were left behind.

### Migration

A search and replace over the names above, longest first so the `Settings` and `Impl` variants are not left half-renamed:

```sh
grep -rl 'I18nComponentScheme\|defineScheme' src \
  | xargs sed -i '' \
    -e 's/I18nComponentSchemeSettings/I18nComponentSchemaSettings/g' \
    -e 's/I18nComponentSchemeImpl/I18nComponentSchemaImpl/g' \
    -e 's/defineI18nComponentScheme/defineI18nComponentSchema/g' \
    -e 's/I18nComponentScheme/I18nComponentSchema/g' \
    -e 's/defineScheme/defineSchema/g'
```

Then the settings key and property, which are plain `scheme` — `defineComponent({ scheme })` becomes `defineComponent({ schema })`, and `Component.scheme` becomes `Component.schema`. Those need a look rather than a blind replace, since `scheme` is a common enough word to appear elsewhere in a project.

No deprecated aliases are kept. Here `scheme` is a settings key and an instance property, not only a type name, so aliasing it would mean accepting both spellings at runtime and in every `Omit<…, 'scheme'>` for as long as anyone left them alone.

The documentation site is updated with it. No other package in this repository referenced these names — `@fastkit/vue-i18n` re-exports the space and component APIs but never the schema ones — so nothing else changes.
