---
'@fastkit/plugboy': minor
---

Add `@fastkit/plugboy/globals`, for projects that also reference `vite/client`.

`@fastkit/plugboy/env` declares ambient modules for the non-JS imports plugboy bundles, mirroring a subset of Vite's. Every one of those 51 modules — plus the top-level `CSSModuleClasses` — is declared by `vite/client` as well, so a project referencing both got a duplicate identifier for each: 88 errors under `skipLibCheck: false`, and silence (with the types still overlapping) under the default `skipLibCheck: true`.

`@fastkit/plugboy/globals` declares only `__PLUGBOY_DEV__` and `__PLUGBOY_STUB__`. A project that needs `vite/client` — for `import.meta.env`, `?url`, `?worker` or anything else plugboy has no loader for — references that instead, and takes the module types from Vite, whose set is a superset of plugboy's.

```jsonc
{
  "compilerOptions": {
    // plugboy only — unchanged
    "types": ["@fastkit/plugboy/env"]
    // plugboy and Vite
    // "types": ["@fastkit/plugboy/globals", "vite/client"]
  }
}
```

Nothing is required of a project that references `@fastkit/plugboy/env` alone: it still provides both the globals and the module types, and the entry is unchanged.
