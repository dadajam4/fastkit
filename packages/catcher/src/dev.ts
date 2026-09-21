/**
 * @file Developer warnings
 *
 * This package describes exceptions, so it must never throw one of its own at
 * somebody who is already handling an error. What it can do is say, while you
 * are developing, that something it was asked to report went missing.
 */

/**
 * Whether developer warnings are emitted
 *
 * Resolved once, at module load, from `process.env.NODE_ENV`:
 *
 * * A bundler that replaces `process.env.NODE_ENV` (Vite, webpack, and others
 *   do it by default) folds this to `false` for a production build, and every
 *   warning -- message strings included -- is dropped as dead code.
 * * In Node it is read at runtime, so an unset `NODE_ENV` warns. That is the
 *   same default React and friends take: a process that has not said it is
 *   production is treated as development.
 * * Where there is no `process` at all -- a browser loading this unbundled --
 *   nothing is emitted, because there is nothing to tell development and
 *   production apart.
 */
const DEV =
  typeof process !== 'undefined' &&
  process.env != null &&
  process.env.NODE_ENV !== 'production';

/**
 * Emit a developer warning, at most once per distinct message
 *
 * A catcher is built once and used at every call site, so a warning about how
 * it was built would otherwise repeat for every exception the application
 * handles -- and an application in a failure loop handles a great many.
 *
 * @param seen - The set that remembers what has already been said. One per
 *   catcher, so two catchers built differently each get their own say.
 * @param message - The warning, without the package prefix
 */
export function devWarn(seen: Set<string>, message: string): void {
  if (!DEV || seen.has(message)) return;
  seen.add(message);
  // eslint-disable-next-line no-console
  console.warn(`[@fastkit/catcher] ${message}`);
}
