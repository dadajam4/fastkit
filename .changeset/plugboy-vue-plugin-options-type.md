---
'@fastkit/plugboy-vue-plugin': patch
---

Fix `PluginOptions`, which resolved to nothing usable in the published declarations.

`src/types.ts` bound the name `VuePlugin` twice — once as the default import it derives `_Options` from, once as the interface it exports. The emitted declaration dropped the import and kept the expression, so `typeof VuePlugin` pointed at the interface:

```ts
type _Options = NonNullable<Parameters<typeof VuePlugin>[0]>;
interface PluginOptions extends _Options {}
interface VuePlugin extends Plugin { ... }
```

Consumers type-checking with `skipLibCheck: false` got `TS2693: 'VuePlugin' only refers to a type, but is being used as a value here`, and with `skipLibCheck: true` the plugin options degraded to an unchecked type.

The import is now named apart from the interface, so the emitter keeps it and `PluginOptions` resolves to `unplugin-vue`'s real options again. No exported name changes.
