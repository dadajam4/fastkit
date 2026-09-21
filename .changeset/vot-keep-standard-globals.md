---
'@fastkit/vot': patch
---

Stop the node adapter from breaking `instanceof Response`.

`@hono/node-server` replaces `globalThis.Request` and `globalThis.Response` the
first time a request listener is built, unless told not to, and vot did not tell
it not to. The two replacements are not symmetric:

| | | `instanceof` after the swap |
| --- | --- | --- |
| `Request` | `class extends GlobalRequest` | works |
| `Response` | a standalone class, no `extends` | **false for every native one** |

So inside a vot application, `x instanceof Response` was false for everything
`fetch()` returns. vot now passes `overrideGlobalObjects: false` at both entries
— the node adapter and the dev middleware — and the standard globals stay the
platform's.

## Why this was expensive to find

Nothing static can see it. `typecheck`, `build` and the dependency audits are
all green; the types say `Response`, and they are right. It only appears once a
request is served, and it appears as an error thrown by whichever library did
the check, which points at the consumer rather than at the substitution.

The consumer that found it uses [openapi-fetch](https://github.com/openapi-ts/openapi-typescript/tree/main/packages/openapi-fetch),
whose middleware contract is "return a `Response` only when you modify it" and
which enforces that with `if (!(result instanceof Response)) throw`. A handler
that returned the response unmodified — redundant, but not wrong — therefore
threw on every call, and every server-rendered page that touched the API became
a 500.

## Why it is vot's to fix rather than to document

vot 2's contract is web-standard throughout: `VotRequestHandler` is
`(request: Request) => Promise<Response | undefined>`, and anything
runtime-specific is quarantined behind `VotRuntimeContext.native` on purpose. A
global substitution escapes that quarantine and applies process-wide, invisibly,
to code that never asked for the node adapter.

vot cannot promise that `instanceof` works everywhere — cross-realm checks are
nobody's to guarantee. It can promise not to be the reason it stops working.

## What it costs

Opting out is not free. hono's replacement exists so that a response built from
a string keeps the string, and the fast path can write it straight out with
`outgoing.end(body)`; a native `Response` carries a `ReadableStream` instead, so
the same response goes through `getReader()`, an awaited read and a rebuilt
header record.

Measured on Node 24.16.0, 16 concurrent keep-alive connections, median of 3:

| | cost | per request |
| --- | ---: | ---: |
| a 45KB string, no work | -55% | +29us |
| `serveStatic`, 45KB file | -5.1% | +3.4us |
| a 2-byte response | -21% | +3.2us |
| **45KB after a 3ms render** | **-0.9%** | +28us |

The overhead is flat — about 3us fixed, plus a component that scales with the
body — so the percentage says more about the denominator than about the change.
On the path vot actually spends its time, rendering, it is under 1%.

The real fix belongs upstream: `static [Symbol.hasInstance]` on hono's class
would keep the fast path *and* answer correctly, which neither this nor
documentation can do together. Measured at +5ns per check — roughly three orders
of magnitude less than what is paid here. It is tracked as
[honojs/node-server#321](https://github.com/honojs/node-server/issues/321), open
and unanswered since March 2026, which is why vot does not wait for it. If it
lands, this option can be dropped.

Closes #289.
