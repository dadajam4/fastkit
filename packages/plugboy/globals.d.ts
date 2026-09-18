// Plugboy's own globals, and nothing else.
//
// Separate from `env.d.ts` because that file also mirrors a subset of Vite's
// `vite/client` module declarations, and every one of those is declared by
// `vite/client` too. A project that loads both gets a duplicate identifier for
// each (issue #246), so a project that needs `vite/client` -- for
// `import.meta.env`, `?url`, `?worker` and the rest that Plugboy has no loader
// for -- references this file instead and takes the asset types from Vite.
//
// This file must remain a SCRIPT (no top-level `import`/`export`). A trailing
// `export {}` would make it a module, and a `declare const` in a module file is
// not a global.

/**
 * Whether the code is running in a development context.
 *
 * @remarks
 * - `stub`: always `true`.
 * - published `build`: replaced with a runtime check of the consumer's
 *   environment (`process.env.NODE_ENV === 'development'` or
 *   `import.meta.env.DEV === true`), so the branch is evaluated at the
 *   consumer's runtime rather than eliminated.
 */
declare const __PLUGBOY_DEV__: boolean;

/**
 * The bundle is in stub mode.
 *
 * @remarks In stub mode, source code is executed in the source directory. This flag is available because of the different way of loading files in relative paths.
 */
declare const __PLUGBOY_STUB__: boolean;
