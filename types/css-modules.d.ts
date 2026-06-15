// Ambient declarations for side-effect style imports (e.g. `import './x.scss'`).
//
// These style files are processed by the bundler, not the type checker. Up to
// TypeScript 5.x an unresolved side-effect import was tolerated silently, but
// TypeScript 6.0 reports TS2882 for side-effect imports that resolve to no
// module or declaration. Declaring them as empty wildcard modules keeps the
// imports valid for every package in the monorepo.
//
// This file must stay a script (no top-level `import`/`export`) so that the
// `declare module` entries are treated as ambient wildcard declarations rather
// than module augmentations. It is loaded globally via the `types` entry in
// `tsconfig.base.json` (referenced as `../../types/css-modules`, resolved
// relative to each extending package config). A real resolved module (such as a
// Vanilla Extract `*.css.ts`) still takes precedence over these wildcards.
declare module '*.scss' {}
declare module '*.sass' {}
declare module '*.css' {}
