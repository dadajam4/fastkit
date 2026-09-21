# Request and response

🌐 English | [日本語](./ssr-request-response-ja.md)

On the server, a vot render is handed the incoming request and a place to write
the outgoing status, headers and cookies. Both are web-standard: a `Request`
and a `Headers`, with nothing tied to `node:http`, so the same code runs on
whatever runtime the adapter does.

This page covers what is there, what is absent in the browser, and what
`vot generate` does with all of it.

## Reading the request

`VuePageControl.request` is the incoming `Request`, and `undefined` in the
browser.

```ts
import { createVotPlugin } from '@fastkit/vot';

export const localePlugin = createVotPlugin({
  setup(ctx) {
    const language = ctx.request?.headers.get('accept-language');
    // ...
  },
});
```

The same control is available from a component with `useVuePageControl()`.

`undefined` in the browser is the load-bearing part. The same component renders
twice — once here, once after hydration — so anything reading the request has
to have an answer for the second time as well, or the two renders disagree and
hydration breaks. Read it on the server, put what you need into state, and read
the state on both sides.

For the Node objects behind the request, when you knowingly target the node
adapter:

```ts
import { getNodeRuntime } from '@fastkit/vot/adapters/node';
import type { VotRuntimeContext } from '@fastkit/vot';

const runtime = ctx.server?.runtime as VotRuntimeContext | undefined;
const { incoming, outgoing } = getNodeRuntime(runtime) ?? {};
```

The cast is needed because `VuePageServerContext.runtime` is typed `unknown`
— that side of the boundary does not know about adapters, deliberately.
`getNodeRuntime` checks the adapter name at runtime and returns `undefined` for
anything else, so the cast is asserting nothing the call does not verify.

From a component, `useContext().runtime` is already a `VotRuntimeContext` and
needs no cast:

```ts
import { useContext } from '@fastkit/vot';
import { getNodeRuntime } from '@fastkit/vot/adapters/node';

const { incoming, outgoing } = getNodeRuntime(useContext().runtime) ?? {};
```

## Writing to the response

`VuePageControl.response` is the draft for this render — `{ status?,
statusText?, headers }`, where `headers` is a `Headers`. It is `undefined` in
the browser.

```ts
ctx.response?.headers.set('cache-control', 'private, no-store');
```

Because it is a `Headers` rather than a plain object, a multi-value
`Set-Cookie` survives out of the renderer intact.

For a status with a body, or a redirect, use the control's own helpers rather
than writing the draft by hand — they also stop the render at the right moment:

```ts
ctx.writeResponse({ status: 404 });

ctx.redirect('/signin'); // 302
ctx.redirect({ path: '/signin', statusCode: 301 });
ctx.redirect({ name: 'signin', query: { next: ctx.route.fullPath } });
```

`writeResponse` takes `{ status?, statusText?, headers? }` with `headers` as a
plain record, which is why `Set-Cookie` belongs on the draft or on the cookie
jar rather than here.

## Cookies

`VuePageControl.cookies` is a [`Cookies`](../../cookies) jar and works on both
sides, which is the point of it — the same call is correct in a plugin, in a
component and after hydration.

```ts
ctx.cookies.get('theme');
ctx.cookies.set('theme', 'dark', { path: '/', maxAge: 60 * 60 * 24 * 365 });
ctx.cookies.delete('theme');
```

On the server the jar reads the request and appends to the response draft, so a
cookie set during a render reaches the browser with that page. In the browser
it reads and writes `document.cookie`, and `httpOnly` throws — the browser
cannot set one, and failing loudly is better than writing a cookie that quietly
is not `httpOnly`.

## Forwarding request headers to an upstream API

A server render that calls your own API usually has to carry the browser's
headers with it — the session cookie above all. `fetch` on the server starts
from nothing, so this is explicit work, and vot does not do it for you: only
your application knows whether the thing it is calling is trusted.

```ts
const forwarded = new Headers(ctx.request?.headers);
for (const name of ['transfer-encoding', 'keep-alive', 'upgrade', 'expect', 'content-length']) {
  forwarded.delete(name);
}
const res = await fetch(`${API_ORIGIN}/me`, { headers: forwarded });
```

Two different kinds of header get removed here, and it helps to keep them
apart.

**Headers that always break.** The five above are hop-by-hop or derived from
the body. `fetch` rejects the first four outright — `TypeError: fetch failed`,
with causes like `invalid transfer-encoding header` and
`expect header not supported` — and a stale `content-length` fails once it
disagrees with the body it is now attached to. These have nothing to do with
where you are sending the request; drop them always.

**Headers whose answer depends on the destination.** `cookie`,
`authorization`, `host`, `accept`, `accept-encoding`. Forwarding these to your
own API is normal. Forwarding them to a third party leaks your users'
credentials. There is no default that is right for both, which is why this is
the application's decision and not a helper vot can hand you: if the
destination is not first-party, list the headers you mean to send rather than
removing the ones you do not.

Note also that a render whose output depends on the incoming request is a
render that cannot be cached or statically generated, which is the subject of
the next section.

## `vot generate`

`vot generate` starts a real server and crawls it over plain HTTP, saving each
page's HTML to `index.html`. So the request and response are real, but they are
not a visitor's:

- **The request is the crawler's.** No cookies, no `accept-language`, no
  authorization. The URL's host is the local preview server, not your domain.
- **Only the HTML body is kept.** Whatever was written to the response draft —
  status, headers, `Set-Cookie` — is discarded once the page is on disk. A
  cookie set during a generated render reaches nobody.
- **A non-200 page is skipped rather than generated.** That includes a
  redirect: `vot generate` prints
  `skip generate status[302] >>> /the/path` and moves on, leaving no file. A
  page that redirects unauthenticated visitors will simply be missing from the
  output.

Where a page has to behave differently, branch on `__VOT_GENERATE__`, which the
build defines as a constant so the unused side is dropped:

```ts
if (!__VOT_GENERATE__) {
  ctx.response?.headers.set('cache-control', 'private, no-store');
}
```

The rule of thumb: the further a page's output depends on who asked for it, the
less it belongs in `vot generate`. Statically generating a page and then
personalising it per request are two answers to the same question, and a page
has to pick one.
