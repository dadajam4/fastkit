---
'@fastkit/vue-page': minor
---

Make force-prefetch actually remount the page, and scope its state to the control

`prefetchHandler` returning `true` was only ever doing half its job. It kept the
prefetch from being skipped -- that part worked -- but the remount that lets the
page pick the fresh data up never happened.

The flag that drives the remount was recorded **only on the server**:

```ts
export function setForcePrefetchStates(pageKey: string, value: boolean) {
  if (IN_WINDOW) return; // <- browser: do nothing
  ...
}
```

Its one effect is to change the `key` passed to the page component, so the
component is torn down and set up again. A vnode key means nothing to a server
render, which happens once and never reconciles, and keys are not serialized
into the HTML. So the flag was written where it could not act, and never written
where it could. `#230` has the full trace.

The guard is now the other way round. On a client navigation, a `prefetchHandler`
that returns `true` remounts the page as intended.

**The flags also moved onto `VuePageControl`.** They used to live in a
module-level object, which in a long-lived SSR process is shared by every
concurrent request -- two in-flight requests resolving the same page key would
consume each other's entries, and an entry whose page never rendered stayed for
the life of the process. `resetForcePrefetchStates()` existed for that and was
never called; it is removed. Being client-only now makes the sharing moot in
practice, but the control is the honest owner: it is what owns a navigation.

**What to check when upgrading.** If you have a `prefetchHandler` that returns
`true`, the page it applies to will now remount on a client navigation where
before it silently did not. That is the documented behaviour of the API, and
what a `forcePrefetch` is for -- but if a page was relying on surviving that
navigation (holding local component state across it, say), it no longer does.
Return `false`/`undefined` from the handler for those cases.

No API surface changed: `prefetchHandler`, `PrefetchHandlerContext` and the
`forcePrefetch` return value are all as before. The removed
`setForcePrefetchStates` / `getForcePrefetchStates` / `consumeForcePrefetchStates`
/ `resetForcePrefetchStates` functions were internal to `utils.ts` and never
exported from the package entry.
