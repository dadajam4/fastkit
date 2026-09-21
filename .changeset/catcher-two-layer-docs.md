---
'@fastkit/catcher': patch
---

Say which of the two layers is serialized, where it will actually be read.

`data` and `resolvedData` are the core of the design and their names are one word apart. The hazard is copying out of the second into the first: a resolver holds the whole response — `set-cookie`, a `url` that may carry a signed-URL signature, a body that may hold far more than the message you were after — and only what the normalizer returns is serialized. Spreading one into the other puts all of it wherever the error is logged.

This package's own README made exactly that mistake, which is what makes it worth saying in the editor rather than in the documentation alone. Their JSDoc previously read "Error information fully processed by custom resolvers and normalizers" and "Data extracted by custom resolvers" — accurate, and no help at the moment the mistake is made. They now state which one leaves the process, which one does not, and what is in the one that does not.

`AnyNormalizer` says the same thing from the other side: it is the boundary, and what it returns is the whole of what is serialized.

No API change. The rename these names probably want is a separate question, deliberately not taken here.
