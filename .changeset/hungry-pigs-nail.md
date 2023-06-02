---
'@fastkit/vui': patch
---

The alert and confirm dialogs were designed to display backdrops by default, but this was no longer being done due to the vue-stack migration.
This behavior has been fixed and backdrops are now displayed as before.
Backdrops can still be optionally disabled.
