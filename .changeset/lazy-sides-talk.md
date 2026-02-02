---
'@fastkit/plugboy': patch
---

A fix has been added to work around an issue where `@import` rules were removed when the imported CSS target was an external module, due to the current behavior of rolldown.
