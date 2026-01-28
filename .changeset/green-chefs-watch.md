---
'@fastkit/vue-stack': patch
---

#### Bug Fixes

- **refElement:** Fixed an issue where `beforeEl?.removeAttribute is not a function` error could occur when the activator element's `$el` was not an `HTMLElement` (e.g., Comment node, Text node, or Proxy instance).

- **withDirectives:** Fixed an issue where "Runtime directive used on component with non-element root node" warning occurred when the activator slot returned a component VNode instead of an element VNode. Component VNodes are now wrapped with a `<div style="display: contents">` to ensure directives work correctly.
