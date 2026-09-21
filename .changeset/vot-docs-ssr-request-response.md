---
'@fastkit/vot': patch
---

Document what a server render is handed, and what `vot generate` does with it.

`VotContext.request` and the cookie jar have been web-standard since 2.0.0, and
neither appeared anywhere outside the type definitions — `request` was not
mentioned in the README at all, and `cookies` only as a dependency in
`@fastkit/vue-page`'s list. So the entry points to reading a request and
writing a response during SSR were discoverable only by reading the types.

The new [request and response guide](https://github.com/dadajam4/fastkit/blob/main/packages/vot/docs/ssr-request-response.md)
covers `request`, `response`, `writeResponse`/`redirect` and `cookies`, why
`request` being `undefined` in the browser is the load-bearing part, forwarding
headers to an upstream API, and what `vot generate` keeps and discards.

That last part is the one nothing else could say. `vot generate` boots a real
server and crawls it over HTTP, so the request and response are real — but the
request is the crawler's (no cookies, no `accept-language`, host is the local
preview server), only the HTML body is kept, and a page that answers non-200 —
a redirect included — is skipped with a warning rather than generated.

No API changes.
