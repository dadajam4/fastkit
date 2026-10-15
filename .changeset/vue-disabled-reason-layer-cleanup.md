---
'@fastkit/vue-disabled-reason': minor
---

- Unmount the reason layers when the component unmounts or when a container is no longer targeted. The layers are rendered imperatively and were never torn down, which leaked the component instances they held.
- Add a `disabled` prop. When specified, it takes precedence over the state detected from the DOM, so a wrapped component that already knows its own state (e.g. a readonly input that carries the `disabled` attribute) can report it accurately. DOM detection remains the fallback when it is not specified.
- Re-render a reason layer that was removed from its container, e.g. when a text-only child is updated and Vue replaces the container's content.
- Each reason layer is now rendered into its own `display: contents` `<span>` inside the container, so the layer's elements are no longer direct children of the container.
- A `disabled` prop defined in the `props` passed to `defineDisabledReasonComponent` is replaced by the built-in `disabled` prop.
