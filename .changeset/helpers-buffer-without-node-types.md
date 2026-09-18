---
'@fastkit/helpers': minor
---

Stop requiring Node's types for `isBuffer`, and fix `copyBuffer` in the browser.

`isBuffer` and `copyBuffer` named `Buffer` in their signatures, so the published declarations needed `@types/node` — in a browser-first package that 21 others depend on, for two functions. Consumers without those types got `TS2591: Cannot find name 'Buffer'` from inside `@fastkit/helpers` with `skipLibCheck: false`, and silently unchecked members otherwise.

```ts
// before
declare function isBuffer(source: unknown): source is Buffer;
declare function copyBuffer(cur: Buffer | ArrayBufferView): Buffer;

// after
declare function isBuffer<T extends Uint8Array = Uint8Array>(source: unknown): source is T;
declare function copyBuffer(cur: Uint8Array | ArrayBufferView): Uint8Array;
```

`isBuffer` narrows to `Uint8Array` by default, and a consumer who does have Node's types names what they expect: `isBuffer<Buffer>(value)` narrows to `Buffer` as before. `copyBuffer` is not generic — it *constructs* the value, so a caller-chosen return type would be an unchecked cast — and `Buffer` extends `Uint8Array`, so the declared type covers what it returns either way.

**`copyBuffer` no longer throws in a browser.** It called `Buffer.from` unconditionally, so it raised `ReferenceError: Buffer is not defined` wherever the global is absent — and `@fastkit/cloner` calls it for every `ArrayBufferView` it deep-clones, so cloning an object holding a typed array threw. It now takes the Node path only when the global exists and copies with plain ES otherwise. In Node the result is still a `Buffer`, still an independent copy, and a view's `byteOffset` is still respected.

**What can change for you:** `copyBuffer`'s declared return is `Uint8Array` rather than `Buffer`, so `Buffer`-only methods on the result need a cast — or `isBuffer<Buffer>()` first. Reading it as bytes is unaffected.
