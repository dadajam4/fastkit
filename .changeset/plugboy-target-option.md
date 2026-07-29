---
"@fastkit/plugboy": minor
---

Accept tsdown's `target` option in the workspace and project configurations.

plugboy forwarded only a fixed subset of tsdown options (`define`, `deps`, `copy`, …), and `target` was not among them, so consumers had no way to control which JavaScript syntax the output is downleveled for. tsdown then fell back to its own default — the package's `engines.node` field — and applied no transformation at all when that field was absent, which is the case for most packages.

`target` can now be declared in `plugboy.workspace.ts`, or in `plugboy.project.ts` to apply one target to every workspace. A workspace value replaces the project value outright rather than merging, since a target list describes a single environment set; `false` (tsdown's "apply no transformation") is preserved as an explicit workspace-level opt-out.
