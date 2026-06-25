---
'@fastkit/plugboy': patch
---

Improve the type hints shown for `defineWorkspaceConfig` / `defineProjectConfig`.

Both helpers declared a generic type parameter (`<Config extends UserWorkspaceConfig>` / `<Config extends UserProjectConfig>`) that the return type never used, so it added nothing but noise: on hover the parameter showed up as the opaque `Config`, hiding the field-level types and JSDoc of the underlying config type. The generic is removed and the config is typed directly (`config: UserWorkspaceConfig` / `config: UserProjectConfig`), giving callers a clean signature and proper per-field hints. Behavior is unchanged.
