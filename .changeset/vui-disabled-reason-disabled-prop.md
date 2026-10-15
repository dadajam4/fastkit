---
'@fastkit/vui': minor
---

- `VDisabledReason`'s `disabled` now tells whether the target is disabled and takes precedence over DOM detection. It replaces the `disabled` inherited from the menu props, which had no effect. Callers that passed it see the new behavior: `false` hides the reason even on a disabled target, and `true` activates the tooltip and the overlay (which catches clicks) on an enabled one.
