---
'@fastkit/plugboy': minor
---

Ship every declared stylesheet in dependency order, including a package's single stylesheet.

A package with one `css: true` entry used to get its stylesheet from tsdown's own merge (`css.splitting: false`). That merge concatenates chunks in bundle order: entry chunks first, the chunks they import after. When the base styles a package composes from end up in a chunk of their own, they are appended after the rules built on them, and win:

```ts
// src/styles/reset.css.ts, also reachable from a second entry
export const buttonReset = style({ padding: 0 });

// src/components/item.css.ts
export const item = style([buttonReset, { padding: 12 }]);
// published stylesheet: .item { padding: 12px } … .buttonReset { padding: 0 }
// -> the element renders with padding: 0
```

This is what happens with vanilla-extract composition, which leaves no JavaScript import of the composed file, so it becomes a CSS-only chunk. It happens just as well with a plain `.css` file shared between entries. Whether a package is hit depends only on its entry layout. Storybook and other Vite dev setups apply the styles in source order, so they do not show it; only the published stylesheet does.

plugboy now builds every declared `./<entry>.css` itself, from the per-chunk stylesheets, in the order Vite uses for `build.cssCodeSplit: false`: each chunk after the chunks it imports statically, and dynamically imported chunks after all of those.

- In a workspace with `css: true` entries, `css.splitting` defaults to `true`. tsdown's merge is no longer used unless `splitting` is declared.
- **One CSS entry:** the stylesheet holds the CSS of every chunk, as before, with CSS behind `import()` included. It is written under `css.fileName` when that is set, and under the declared `<entry>.css` otherwise. This also fixes a workspace built without the vanilla-extract plugin, whose stylesheet was emitted as tsdown's default `style.css` rather than the file its `./<entry>.css` export points at.
- **Several CSS entries:** each stylesheet now also includes CSS reached through `import()`, which was previously left behind in a chunk-named file that no export points at.
- The `@layer` declarations that plugboy restores at the top of a stylesheet are merged in the same order.

Every stylesheet this repository publishes is byte-identical; all of them build their styles into a single chunk.

What is guaranteed is dependency order, per chunk. It is not the order Vite's dev server applies, which injects styles one module at a time, so two rules that do not depend on each other can still end up in a different relative order than in Storybook. Where such a pair targets the same element with the same specificity, make the intended winner explicit with `@layer`, or by composing one from the other.

If you set `css: { splitting: true }` to work around this, you can remove it. Declaring `splitting: false` keeps tsdown's merge in bundle order.

The chunk ordering is exported as `orderChunks`, `orderPackageChunks`, `entryChunksInDeclaredOrder` and `captureChunkGraph`, so a plugin that emits CSS itself can use the same order.
