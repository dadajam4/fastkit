---
"@fastkit/plugboy": minor
"@fastkit/plugboy-vanilla-extract-plugin": patch
---

Accept tsdown's `css` option in the workspace and project configurations.

`WorkspaceSetupContext.css` already existed, but only as an internal channel for plugins to seed — it was absent from `UserWorkspaceConfig` / `UserProjectConfig`, so consumers could not influence how stylesheets are processed or emitted (file name, preprocessor options, CSS modules, syntax lowering).

`css` can now be declared in `plugboy.workspace.ts` and `plugboy.project.ts`; the workspace value is shallow-merged over the project one, since the keys are independent. `WorkspaceSetupContext.css` is seeded from that merged value, and plugins are now expected to merge their defaults *under* it so a configured value always wins.

`@fastkit/plugboy-vanilla-extract-plugin` follows that rule: it now merges `splitting` / `fileName` instead of assigning them. Its CSS merge depends on both, so its README documents that consumers should leave those two keys to the plugin — every other `css` option is free to use. Builds that set no `css` option are unaffected.
