---
'@fastkit/vite-plugin-vui': patch
---

Resolve the default color-scheme and media-match sources through `@fastkit/vui`'s exports.

`getBuiltinsDir()` assembled the path by hand:

```ts
path.join(pkgDir, 'node_modules/@fastkit/vui/dist/builtins');
```

That directory only exists when vui happens to be installed _inside_ this package's own directory, which no package manager guarantees. pnpm puts a package's dependencies beside it in the virtual store and leaves no `node_modules` in the package directory at all; npm hoists them to the root. So for anyone who installed this plugin the assembled path was simply absent, and the default `colorScheme` / `mediaMatch` options pointed at nothing — the defaults were usable only from inside this repository, where the workspace link makes the path real.

The directory is now derived from `require.resolve('@fastkit/vui/builtins/color-scheme.ts')`, which goes through vui's own `exports` map and therefore works under any layout. Passing `colorScheme` / `mediaMatch` explicitly, as a project had to do to work around this, keeps behaving exactly as before.
