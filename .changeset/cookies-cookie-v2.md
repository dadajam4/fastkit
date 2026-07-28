---
"@fastkit/cookies": minor
---

Update `cookie` from 1.x to 2.x.

The public API is unchanged — the re-exported `ParseOptions` and `SerializeOptions` types are byte-for-byte identical between cookie 1.1.1 and 2.0.1, and cookie serialization/parsing produces the same output (verified across the attribute matrix, including the `TypeError` cases for invalid values). Internally, the calls moved off the aliases cookie 2 removed: `parse` → `parseCookie`, and `serialize(name, value, options)` → `stringifySetCookie({ ...attributes, name, value }, { encode })`, since object mode is now the only supported signature and `encode` lives in a separate argument.

Note that cookie 2 is ESM-only and declares `engines.node >= 22`, so consumers of this package inherit that floor. `@fastkit/cookies` already ships ESM only, so nothing changes about how it is consumed.
