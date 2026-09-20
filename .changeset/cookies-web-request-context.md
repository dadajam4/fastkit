---
'@fastkit/cookies': minor
---

Accept a web-standard `Request` / `Headers` pair as a server context.

`Cookies` took a browser `Document` or a Node `{ req, res }` pair, and nothing else. Handed a `Request` it did not throw — it silently did nothing. The detection helpers were the reason: `isIncomingMessage` and `isServerResponse` both start from `isObject`, which asks for `[object Object]`, and a `Request` stringifies to `[object Request]`. So `parse()` fell through to `{}` and every cookie read as absent, while `set()` still updated the in-memory bucket and produced no `Set-Cookie` at all — a session that looks right in development and drops every cookie in production.

There is now a second server context:

```ts
export default {
  async fetch(request: Request): Promise<Response> {
    const headers = new Headers();
    const cookies = new Cookies({ request, headers });

    cookies.get('session_id');
    cookies.set('session_id', id, { httpOnly: true, sameSite: 'strict' });

    return new Response(body, { headers });
  },
};
```

Reading goes through `request.headers.get('cookie')` and writing through `headers.append('set-cookie', …)`, both feeding the same parser and the same duplicate-cookie merge the Node branch has always used. Either half may be left out: `{ request }` alone reads, `{ headers }` alone writes.

Two things are worth knowing about the web branch. `Headers` only appends, so the whole `Set-Cookie` set is rewritten on each `set()` — that is how an overwritten cookie gets taken back out. And there is no `writableEnded` equivalent to consult, so the "response has already been sent" warning is Node-only; on the web branch that check belongs to the transport layer.

`CookiesServerContext` is now `CookiesNodeContext | CookiesWebContext`. Existing `{ req, res }` and `Document` callers are untouched; only code that reads `.req` off a value *typed* as `CookiesServerContext` needs to narrow first.

New exports: the `CookiesWebContext` type and the `isWebRequest` / `isWebHeaders` guards, both duck-typed rather than built on `isObject`.
