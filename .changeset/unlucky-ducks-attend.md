---
'@fastkit/plugboy': patch
---

Fixed failure to retrieve configuration files in projects configured with polyrepo.

This was due to the `allowMissing` option of the `findConfig` method sometimes not working properly.
