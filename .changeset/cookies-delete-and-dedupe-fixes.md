---
"@fastkit/cookies": patch
---

Fix `Cookies#delete()`, which never worked, and stop `Cookies#set()` from emitting duplicate `Set-Cookie` headers. Adds the package's first test suite, which is what surfaced all three problems.

- `delete()` and `set()` called each other in a loop — `set()` routed an empty value to `delete()`, and `delete()` re-entered `set()` with `''` — so every `delete()` ended in `RangeError: Maximum call stack size exceeded`. The header-writing logic now lives in a private `write()` that both entry points call. `set(name, '', options)` also forwards its options, so deleting a cookie scoped by `path` / `domain` targets the right cookie instead of a bare name.
- `update()` ended with an `Object.assign(this.bucket, cookies)` that wrote the raw value back after the loop above it had already deleted the key, so a removed cookie reappeared in the bucket as `''`. The loop already maintains the bucket, so the trailing assign is gone.
- `areCookiesEqual()` compared the cookie value, so re-setting a cookie under an existing name appended a second `Set-Cookie` instead of replacing the stale one. Cookies are overwritten by key and attributes, not by value, so the value is now excluded. `sameSite` is also normalized on both sides, because one side comes from a parsed header while the other comes from `createCookie()`, which defaults it — without that, anything set without an explicit `sameSite` still duplicated.
