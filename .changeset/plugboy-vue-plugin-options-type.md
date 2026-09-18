---
'@fastkit/plugboy-vue-plugin': minor
---

Fix `PluginOptions`, which was an empty type in the published declarations, and start type-checking plugin options again.

`src/types.ts` bound the name `VuePlugin` twice — once as the default import it derives `_Options` from, once as the interface it exports. The emitted declaration dropped the import and kept the expression, so `typeof VuePlugin` pointed at the interface:

```ts
type _Options = NonNullable<Parameters<typeof VuePlugin>[0]>;
interface PluginOptions extends _Options {}
interface VuePlugin extends Plugin { ... }
```

Consumers type-checking with `skipLibCheck: false` got `TS2693: 'VuePlugin' only refers to a type, but is being used as a value here`. With `skipLibCheck: true` the error was hidden and `PluginOptions` collapsed to an empty type — `keyof PluginOptions` was `never`, so every object was accepted.

The import is now named apart from the interface, which is enough for the emitter to keep it, and the options resolve to `unplugin-vue`'s real ones again.

**This can fail a build that used to pass.** Options were unchecked, so `createVuePlugin({ ... })` accepted anything; they are now checked, and a call passing an option that does not exist — or the wrong value type — is rejected. Correct the call against [unplugin-vue's options](https://github.com/unplugin/unplugin-vue), or remove the option. `createVuePlugin()` with no arguments is unaffected.
