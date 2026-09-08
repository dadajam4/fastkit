---
'@fastkit/node-util': minor
---

`HashComparator` can fold extra inputs into its comparison.

A directory hash of `src` answers "did the sources change". It cannot answer "would this run produce something different", which is also decided by the generator's own version and its effective options — neither of which appears in a directory hash. So output could stay in place across an upgrade that would have produced something else.

`inputs` covers that:

```ts
const hash = new HashComparator(src, dest, {
  inputs: { generator: pkg.version, options },
});
```

Anything passed is serialized with object keys sorted — so the order an options object happened to be built in is not a change — hashed, and stored beside the source hash as `inputsHash`. `hasChanged()` compares both. The source hash itself keeps its exact previous meaning, and a meta file written before this existed has no `inputsHash`, which compares unequal to any inputs and therefore regenerates once.

Arrays keep their order significant, since `['woff2', 'otf']` and `['otf', 'woff2']` are different requests.

Omitting `inputs` behaves exactly as before.
