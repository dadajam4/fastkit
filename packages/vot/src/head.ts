/**
 * The document-head API, re-exported from `@unhead/vue`.
 *
 * `@fastkit/vot` installs unhead into the application itself -- the client and
 * server halves, the SSR render pass, the plugin ordering -- so an application
 * never creates a head client of its own. What it does need is `useHead` and the
 * input types, and reaching those through `@unhead/vue` would mean declaring
 * `@unhead/vue` in the application and keeping its range aligned with the copy
 * vot resolves. Nothing good comes of letting those two drift: unhead's Vue
 * composables read the client out of Vue's injection context, so a second copy
 * with a different `headSymbol` resolves nothing and `useHead` silently stops
 * applying.
 *
 * Exposing the API from here keeps `@unhead/vue` a `dependency` of this package
 * -- versioned together with `unhead` and `@unhead/ssr`, which is where that
 * decision belongs -- and leaves the application with one specifier to import
 * and nothing to declare.
 *
 * @example
 * ```ts
 * import { useHead, type ReactiveHead } from '@fastkit/vot/head';
 * ```
 */
export * from '@unhead/vue';
