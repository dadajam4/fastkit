import Prism from 'prismjs';

/**
 * Publish the core as a global before any grammar file runs.
 *
 * `prismjs/components/prism-*` are written for script-tag use: each one ends by
 * calling into a **global** `Prism`. The core only publishes one under Node
 * (`global.Prism`), which does nothing in a browser, and the bundler wraps the
 * core in a lazy CJS factory that nothing has called by the time those files
 * execute — so they throw `ReferenceError: Prism is not defined` and the page
 * loses every grammar it was supposed to register.
 *
 * Importing the core here and assigning the global makes that dependency
 * explicit, so it is ordered rather than hoped for: a module that imports this
 * one is guaranteed to see a global `Prism`.
 */
(globalThis as typeof globalThis & { Prism?: unknown }).Prism = Prism;

export default Prism;
