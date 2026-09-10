---
'@fastkit/vue-stack': patch
---

Stop `hideOnInvisible` from closing a stack when its activator is hidden by CSS.

`hideOnInvisible` (default `true`) observes the activator with an
`IntersectionObserver` and closes the stack as soon as it stops intersecting.
An element hidden with `display: none` — or removed from the document — also
reports `isIntersecting: false`, so the stack closed in cases that have nothing
to do with scrolling.

That broke a common pattern: a row action button rendered only while its row is
hovered. Opening its menu and then moving the pointer into the popover (which is
teleported under `.v-stack-container`) drops the row's `:hover`, the activator
becomes `display: none`, and the menu closed the moment you tried to use it.

Entries are now checked against `boundingClientRect`: an element that is not
rendered generates no layout box, so only an activator that still has one — and
is therefore genuinely outside the viewport — closes the stack. This matches the
documented intent of the option, and matches the guard `updateActivatorRect`
already applies to the same measurement. `hideOnInvisible={false}` is no longer
needed as a workaround for deliberately hidden activators.

One caveat worth knowing when you rely on this: an activator with no layout box
cannot be measured either, so the stack keeps the last position it resolved and
stops following the activator while it is hidden. Prefer keeping the activator
rendered for as long as its stack is open. `data-v-stack-activated` is set on
the activator element for exactly that (tracked as #209):

```scss
.row:not(:hover) .row__menu-button:not([data-v-stack-activated]) {
  display: none;
}
```

Closes #208
