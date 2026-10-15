---
'@fastkit/vue-disabled-reason': minor
---

- Unmount the reason layers when the component unmounts or when a container is no longer targeted. The layers are rendered imperatively and were never torn down, which leaked the component instances they held.
- Add a `disabled` prop. When specified, it takes precedence over the state detected from the DOM, so a wrapped component that already knows its own state (e.g. a readonly input that carries the `disabled` attribute) can report it accurately. DOM detection remains the fallback when it is not specified.
