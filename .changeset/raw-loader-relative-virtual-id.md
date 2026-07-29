---
"@fastkit/plugboy": patch
---

Keep the build machine's paths out of `?raw` imports.

The `?raw` loader built its virtual module id from the resolved absolute path (`\0raw:/home/runner/work/acme-ui/acme-ui/packages/core/src/logo.svg`). rolldown normalizes an ordinary module id against the project when it prints the `//#region <id>` comment that precedes each module in the output, but a virtual id — anything starting with `\0` — is printed verbatim, so the id reached the published bundle. Any package with a `?raw` import published the directory layout and the user name of whatever machine built it; reported from a package published out of CI, where the paths read `/home/runner/work/...`.

The id is now relative to the workspace and resolved back to a path inside `load`. The comment reads `//#region \0raw:src/logo.svg`, and since the id also feeds the chunk's content hash, a chunk carrying a `?raw` module gets a reproducible file name across machines as well.

`rawLoaderPlugin` becomes `createRawLoaderPlugin(workspace)`, matching the other built-in plugins, since the workspace directory is what the id is relative to. Nothing in this repository imports a `?raw` asset, so no published output changes here.
