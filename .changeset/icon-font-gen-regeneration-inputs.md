---
'@fastkit/icon-font-gen': patch
---

Include the generator's version and options in the regeneration check.

The decision to skip work compared only the source directory against the hash stored beside the output:

```ts
const hash = new HashComparator(options.src, options.dest);
```

so nothing about the generator itself entered into it. After upgrading `@fastkit/icon-font-gen` (or `@fastkit/vite-plugin-vui`), a project whose icon sources had not changed kept the **previously generated** output — indefinitely, even where the new version would emit something different. The same held for an option change: switching `formats` or `startUnicode` alone did not trigger a regeneration.

Consumers were left deleting the output directory themselves whenever any `@fastkit/*` version moved, which is a workaround that has to guess which directories are generated and compares version strings rather than ranges.

The comparison now also covers this package's version and the effective options for the entry. `src` and `dest` stay out of it: `src` has its own content hash, `dest` holds the meta file, and keeping absolute paths out leaves the meta file portable between machines and CI.

Upgrading to this version regenerates each entry once, because a meta file written by an earlier version carries no record of these inputs.
