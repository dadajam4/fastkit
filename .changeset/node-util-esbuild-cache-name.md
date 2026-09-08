---
'@fastkit/node-util': patch
---

Keep the `esbuildRequire` cache directory name within the filename length limit.

The name was the entry point's **absolute path** with every separator replaced by `_`, collapsing the whole path into one segment. Most filesystems cap a single path segment at 255 bytes (`NAME_MAX`), so a deep enough entry point failed the build outright:

```
✘ [ERROR] Failed to create output directory: mkdir
  .../node_modules/.esbuild-require/_Users_me_projects_app_node_modules_.pnpm_@fastkit+vui@0.19.23_…_dist_builtins_color-scheme.ts:
  file name too long
```

Any consumer passing a path from `require.resolve()` reaches this quickly, because Node returns the realpath — under pnpm that means the virtual store directory, peer-dependency hash included. Measured in a real monorepo, the same entry point flattens to 92 bytes as a symlink path under the repository root and 232 as a realpath, so checking the repository out one directory deeper was enough to break it.

The name is now the entry point's basename plus a 16-character hash of its absolute path: unique per entry point, stable across runs, readable, and at most 77 bytes. Everything outside `[A-Za-z0-9_.-]` in the basename is replaced, so each character is one byte and the bound holds for a non-ASCII path too. This also fixes Windows in passing — only `/` was replaced, so a `C:\…` path kept its separators and its drive colon.

Cache directories written by earlier versions are left behind under `node_modules/.esbuild-require/`; they are a cache and can be deleted.
