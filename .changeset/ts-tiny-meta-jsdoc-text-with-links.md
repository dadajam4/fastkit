---
'@fastkit/ts-tiny-meta': patch
---

Stop leaking comment syntax into documentation text when a comment contains a `{@link}`.

`MetaDocPart.text` was built from `node.getText()`, which is the node's span of the **source file** — so on a multi-line comment it carried the `/**` opener and every ` * ` line prefix along with it.

The damage was invisible most of the time, because it only showed up when a comment contained a link. Without one, `JSDoc.getComment()` returns a plain string that TypeScript has already stripped; with one, it returns nodes, and the two paths disagreed. Measured on one interface method whose doc opens with a `{@link}` and contains a fenced block:

| | before | after |
| --- | --- | --- |
| part 0 | `"/**\n   * "` | `""` |
| part 1 | `"{@link Api.other other}"` | unchanged |
| part 2 | `", and then some\n   *\n   * ```ts\n   * const a = 1;\n   * ```\n   "` | `", and then some\n\n```ts\nconst a = 1;\n```"` |

A `JSDocText` node carries a `text` that TypeScript has already stripped, and that is what documentation wants; link nodes keep `getText()`, so `{@link Foo.bar baz}` still appears in the flattened text while `part.link` carries it structured.

Anything rendering these parts as markdown was getting bullet lists out of those ` * ` prefixes, and a fenced block inside such a comment was shattered into list items — one fragment being a bare fence with no language. That is what took `pnpm build:docs` down in this repo (#270).

A consumer that was stripping the prefixes itself can stop.
