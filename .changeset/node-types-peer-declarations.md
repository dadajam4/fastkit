---
'@fastkit/plugboy': patch
'@fastkit/cookies': patch
'@fastkit/vue-page': patch
---

Declare `@types/node`, which the published declarations have always needed.

`@fastkit/plugboy` names `node:fs` and `NodeJS.ErrnoException`, and `@fastkit/cookies` and `@fastkit/vue-page` name `IncomingMessage` / `ServerResponse` from `node:http`. None of them said so, so a consumer without Node's types in scope got errors from inside these packages with `skipLibCheck: false`.

All three already run in Node — they are in the repo's own `RUNS_IN_NODE` set and declare `engines.node` — so `"@types/node": ">=20"` as a peer states an existing implicit requirement, in the shape `@fastkit/vot` already uses. No upper bound: it describes the consumer's Node types rather than an API these packages call.

Patch for the same reason the `engines` additions in #212 were: no code changes, and nothing that was working stops working.
