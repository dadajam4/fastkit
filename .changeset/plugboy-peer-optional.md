---
"@fastkit/color-scheme": patch
"@fastkit/icon-font": patch
"@fastkit/media-match": patch
---

Mark the `@fastkit/plugboy` peer dependency as optional. It is only used by the optional `./plugboy-dts-preserve` entry (consumed from within a plugboy build), so consumers of the main entry no longer get a spurious "missing peer dependency" warning.
