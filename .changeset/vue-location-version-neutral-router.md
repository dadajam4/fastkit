---
'@fastkit/vue-location': minor
---

Fix `useTypedQuery`'s published signature, which named a vue-router 5-only type.

The `router` parameter was left to inference:

```ts
export function useTypedQuery<Schema extends QueriesSchema>(
  schema: Schema,
  router = useRouter(),
)
```

vue-router 5 declares `Router` as a conditional type (`TypesConfig extends Record<'Router', infer T> ? T : RouterClassic`), so the emitted declaration resolved it and printed the `RouterClassic` branch — exported as `_RouterClassic`, a name vue-router 4 does not have:

```ts
declare function useTypedQuery<Schema extends QueriesSchema>(
  schema: Schema,
  router?: import("vue-router")._RouterClassic,
): TypedQuery<Schema>;
```

`peerDependencies` admits `^4.4.0 || ^5.0.0`, so consumers on vue-router 4 got `TS2694: Namespace '"vue-router"' has no exported member '_RouterClassic'` with `skipLibCheck: false`, and an unchecked parameter without it.

The parameter is now annotated as `Router`, which both majors export, and the declaration emits `router?: Router`. Verified against real installs of the published package and this build:

| vue-router | before | after |
| --- | --- | --- |
| 4.4.0 | 1 error | **0** |
| 4.5.1 | 1 error | **0** |
| 4.6.4 | 1 error | **0** |
| 5.2.0 | 0 | 0 |

So the `^4.4.0` floor is honest and the peer range stays as it is — every other vue-router name in the declarations (`NavigationFailure`, `RouteLocationNormalizedLoadedGeneric`, `_RouteLocationBase`, …) already resolves on 4.4.0.

**This can fail a build that used to pass.** On vue-router 4 the parameter was unchecked, so `useTypedQuery(schema, anything)` compiled; it is now checked against `Router`. Calls that omit the argument — the normal case — are unaffected.
