---
'@fastkit/plugboy': patch
---

`plugboy build` and `plugboy stub` no longer rewrite a workspace dependency's range. A package that declares `workspace:*` or `workspace:~` keeps it, so `package.json` stays in sync with the lockfile after a build. Previously every `workspace:` range was rewritten to `workspace:^`, which made a frozen `pnpm install` fail with `ERR_PNPM_OUTDATED_LOCKFILE`.
