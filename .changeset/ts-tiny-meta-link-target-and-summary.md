---
'@fastkit/ts-tiny-meta': minor
---

Stop handing a symbol reference over as a URL, and carry a preview of what it
resolves to instead.

`MetaDocLink.url` documents itself as "only set if a transitionable URL exists".
It was set unconditionally: `{@link https://example.com Label}` produced a real
URL, and `{@link Catcher.from from}` produced `"Catcher.from"` — a symbol
reference, under a field that promises somewhere to navigate to. A consumer that
believed the field got exactly what it asked for and rendered a dead anchor.

`url` is now set only for the URL form. A symbol reference goes into a new
field that says what it is:

```ts
interface MetaDocLink {
  type: MetaDocLinkType;
  name: string;
  /** Only set if a transitionable URL exists */
  url?: string;
  /** The symbol reference as written, such as `"Catcher.from"` */
  target?: string;
  /** Preview of the symbol `target` names */
  summary?: MetaDocLinkSummary;
}
```

## Migration

Anything reading `link.url` for a symbol reference now reads `link.target`, and
must not use it as an `href`. A reference is not a location; resolving one to a
page, an anchor or a source URL is the consumer's own decision, which is why
this package no longer pretends to have made it.

A tag written without a label — `{@link Api}` — also used to come out with an
empty `name`, because the label and the reference were read from different
places and only the label was consulted. `name` now falls back to the reference.

## What the preview carries

A resolved reference brings `summary` along, so that a consumer can show the
declaration where the reference stands rather than sending the reader away from
the paragraph that explains it:

```ts
interface MetaDocLinkSummary {
  /** Source text of the referenced declaration */
  text: string;
  /** `true` when `text` was cut short */
  truncated?: boolean;
  /** Description of the declaration, flattened to plain text */
  description?: string;
  /** `true` when the declaration lives in `node_modules` */
  external?: boolean;
}
```

It is one level deep, and deliberately so. A preview carries the declaration it
points at, never what that declaration in turn points at, so a cycle between two
symbols is harmless and the payload cannot grow with the size of the type graph.
A nested `{@link}` inside a preview's own description collapses to its label for
the same reason. Declarations are capped at 20 lines, so a reference to a large
interface cannot drag the whole body along with it; `truncated` says when that
happened.

`summary` is absent when the reference does not resolve, which is the signal to
fall back — plain text reads better than an anchor that goes nowhere. Measured
over the `@fastkit/catcher` documentation, all 12 references resolve, and the
previews add 6.8 KB to a 26.0 KB payload.
