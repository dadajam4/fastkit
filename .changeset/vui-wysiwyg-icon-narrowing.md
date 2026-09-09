---
'@fastkit/vui-wysiwyg': patch
---

Drop an unnecessary `as any` on the resolved toolbar icon name.

A tool's `icon` may be a function returning `IconName | (() => VNodeChild) | undefined`. The `typeof _child === 'function'` check already narrows that to `IconName | undefined` in the `else` branch, so the assignment needed no cast — it just turned off checking on the one line where a tool's icon name is decided at runtime.

No behaviour change; the value was always an `IconName`.