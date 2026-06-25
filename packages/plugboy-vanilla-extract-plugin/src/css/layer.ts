import {
  style,
  layer,
  globalLayer,
  StyleRule,
  globalStyle,
  GlobalStyleRule,
  createGlobalTheme as _createGlobalTheme,
} from '@vanilla-extract/css';
import { addFunctionSerializer } from '@vanilla-extract/css/functionSerializer';
import { createGlobalTheme } from './theme';

type CustomStyleRules = Record<string, any>;

type _LayerStyleRules = NonNullable<StyleRule['@layer']>[string];

type LayerStyleRules<CustomRules extends CustomStyleRules | null = null> =
  CustomRules extends null ? _LayerStyleRules : _LayerStyleRules & CustomRules;

type ClassNames = string | ClassNames[];

type ComplexLayerStyleRule<CustomRules extends CustomStyleRules | null = null> =
  | LayerStyleRules<CustomRules>
  | (LayerStyleRules<CustomRules> | ClassNames)[];

type _LayerGlobalStyleRules = NonNullable<GlobalStyleRule['@layer']>[string];

type LayerGlobalStyleRules<CustomRules extends CustomStyleRules | null = null> =
  CustomRules extends null
    ? _LayerGlobalStyleRules
    : _LayerGlobalStyleRules & CustomRules;

type AnyStyleRule<CustomRules extends CustomStyleRules | null = null> =
  | LayerStyleRules<CustomRules>
  | LayerGlobalStyleRules<CustomRules>;

type LayerStyleHooks<CustomRules extends CustomStyleRules | null = null> = {
  style?: (rule: ComplexLayerStyleRule<CustomRules>, debugId?: string) => void;
  global?: (selector: string, rule: LayerGlobalStyleRules<CustomRules>) => void;
  anyStyle?: (style: AnyStyleRule<CustomRules>) => void;
};

export interface LayerStyle<
  CustomRules extends CustomStyleRules | null = null,
> {
  layerName: string;
  parentLayerName: string | null;
  /**
   * @see {@link style}
   */
  (rule: ComplexLayerStyleRule<CustomRules>, debugId?: string): string;

  /**
   * @see {@link style}
   */
  style(rule: ComplexLayerStyleRule<CustomRules>, debugId?: string): string;

  /**
   * @see {@link globalStyle}
   */
  global(selector: string, rule: LayerGlobalStyleRules<CustomRules>): void;

  /**
   * @see {@link _createGlobalTheme}
   */
  globalTheme: typeof _createGlobalTheme;

  defineNestedLayer(
    globalNameOrNestedOptions?: string | DefineLayerOptions<CustomRules>,
  ): LayerStyle<CustomRules>;

  /**
   * Add global CSS variable with layer
   *
   * @remarks The vanilla-extract API is buggy when handling layered css variables.
   *
   * @param selector - selector
   * @param vars - variables
   */
  pushGlobalVars(selector: string, vars: Record<string, string>): void;

  /**
   * Output variables accumulated by `pushGlobalVars`.
   *
   * @remarks The vanilla-extract API is buggy when handling layered css variables.
   */
  dumpGlobalVars(): void;
  hooks: LayerStyleHooks<CustomRules>;
}

export interface DefineLayerParentOptions {
  parent?: string;
}

export interface DefineLayerBaseOptions<
  CustomRules extends CustomStyleRules | null = null,
> {
  hooks?: LayerStyleHooks<CustomRules>;
}

export interface DefineLayerScopedOptions<
  CustomRules extends CustomStyleRules | null = null,
> extends DefineLayerBaseOptions<CustomRules> {
  /** Debug ID */
  debugId?: string;
  globalName?: never;
}

export interface DefineLayerGlobalOptions<
  CustomRules extends CustomStyleRules | null = null,
> extends DefineLayerBaseOptions<CustomRules> {
  debugId?: never;
  /** Parent layer name */
  globalName: string;
}

export type DefineLayerOptions<
  CustomRules extends CustomStyleRules | null = null,
> =
  | DefineLayerScopedOptions<CustomRules>
  | DefineLayerGlobalOptions<CustomRules>;

export type DefineNestableLayerOptions<
  CustomRules extends CustomStyleRules | null = null,
> = DefineLayerOptions<CustomRules> & DefineLayerParentOptions;

function isGlobalOptions(
  options: DefineLayerOptions<any>,
): options is DefineLayerGlobalOptions {
  return 'globalName' in options;
}

function normalizeToObject<T extends DefineLayerOptions<any>>(
  source?: string | T,
): T {
  if (!source) return {} as T;
  if (typeof source === 'string') return { globalName: source } as unknown as T;
  return source;
}

/**
 * Assemble a {@link LayerStyle} object for an already-resolved `layerName`.
 *
 * @remarks
 * This contains the whole object-building logic shared by {@link defineLayerStyle}
 * (build-time, where `layerName` was just produced by `layer()`/`globalLayer()`)
 * and {@link defineLayerStyleFromResolvedName} (runtime re-construction, where
 * `layerName` is the deterministic value carried over from build time). It must
 * NOT call any `@vanilla-extract/css` side-effecting API (no `layer()` /
 * `globalLayer()`), so that re-construction never regenerates a hash-based name.
 *
 * @internal
 */
function buildLayerStyle<CustomRules extends CustomStyleRules | null = null>(
  layerName: string,
  parentLayerName: string | null,
  hooks: LayerStyleHooks<CustomRules>,
): LayerStyle<CustomRules> {
  const layerStyle = function layerStyle(rule, debugId) {
    const rules = Array.isArray(rule) ? rule : [rule];
    const layerAppliedRules = rules.map((_rule) => {
      if (typeof _rule === 'string' || Array.isArray(_rule)) return _rule;
      return {
        '@layer': {
          [layerName]: _rule,
        },
      };
    });
    if (hooks.anyStyle) {
      for (const _rule of rules) {
        if (typeof _rule === 'string' || Array.isArray(_rule)) continue;
        hooks.anyStyle(_rule);
      }
    }
    hooks.style && hooks.style(rule, debugId);
    return style(layerAppliedRules, debugId);
  } as LayerStyle<CustomRules>;

  layerStyle.layerName = layerName;
  layerStyle.parentLayerName = parentLayerName;
  layerStyle.style = layerStyle;
  layerStyle.hooks = hooks;

  layerStyle.global = function layerGlobalStyle(
    selector: string,
    rule: LayerGlobalStyleRules<CustomRules>,
  ) {
    hooks.anyStyle && hooks.anyStyle(rule);
    hooks.global && hooks.global(selector, rule);

    return globalStyle(selector, {
      '@layer': {
        [layerName]: rule,
      },
    });
  };

  layerStyle.globalTheme = (...args: any) =>
    (createGlobalTheme as any)(layerName, ...args);

  let _varQueues: [string, Record<string, string>][] = [];

  layerStyle.pushGlobalVars = function pushGlobalVars(
    selector: string,
    vars: Record<string, string>,
  ) {
    let queue = _varQueues.find((q) => q[0] === selector);
    if (!queue) {
      queue = [selector, {}];
      _varQueues.push(queue);
    }
    Object.assign(queue[1], vars);
  };

  layerStyle.dumpGlobalVars = function dumpGlobalVars() {
    for (const [selector, vars] of _varQueues) {
      layerStyle.global(selector, {
        vars,
      } as any);
    }
    _varQueues = [];
  };

  layerStyle.defineNestedLayer = function defineNestedLayer(
    globalNameOrNestedOptions?: string | DefineLayerOptions<CustomRules>,
  ) {
    const _options = normalizeToObject(globalNameOrNestedOptions);
    const nestedHooks = _options.hooks;

    return defineLayerStyle({
      ..._options,
      hooks: {
        ...hooks,
        ...nestedHooks,
      },
      parent: layerName,
    });
  };

  return layerStyle;
}

/**
 * Re-construct a {@link LayerStyle} from a name that was already resolved at
 * build time, WITHOUT re-running `layer()` / `globalLayer()`.
 *
 * @remarks
 * This is the runtime counterpart used by the function serializer (see
 * {@link defineLayerStyle}). Because the `layerName` is passed verbatim, the
 * re-constructed instance points at the exact layer that was emitted into CSS at
 * build time — even for scoped layers whose name is a non-deterministic hash that
 * could never be reproduced by calling `layer()` again.
 *
 * The re-constructed instance carries only deterministic state (`layerName` /
 * `parentLayerName`). It has no `hooks` and none of the additions made via
 * `extend()`; it is a reference handle to an already-built layer, not a fresh
 * style-defining entry point.
 *
 * @internal Not part of the public API; exported only so the serializer's
 *   `importName` can resolve it at runtime.
 */
export function defineLayerStyleFromResolvedName<
  CustomRules extends CustomStyleRules | null = null,
>(layerName: string, parentLayerName: string | null): LayerStyle<CustomRules> {
  return buildLayerStyle<CustomRules>(layerName, parentLayerName, {});
}

export function defineLayerStyle<
  CustomRules extends CustomStyleRules | null = null,
>(
  globalNameOrOptions?: string | DefineNestableLayerOptions<CustomRules>,
): LayerStyle<CustomRules> {
  const options = normalizeToObject(globalNameOrOptions);
  const { parent, hooks = {} } = options;

  const isGlobal = isGlobalOptions(options);

  const layerName = isGlobal
    ? globalLayer({ parent }, options.globalName)
    : layer({ parent }, options.debugId);

  const layerStyle = buildLayerStyle<CustomRules>(
    layerName,
    parent || null,
    hooks,
  );

  // Attach vanilla-extract's official function serializer so that a `LayerStyle`
  // can survive being exported from a `.css.ts` module. The `.css.ts` build is
  // delegated to `@vanilla-extract/rollup-plugin`, whose `serializeVanillaModule`
  // rejects plain function exports. `addFunctionSerializer` registers a
  // descriptor (`__function_serializer__`) so the function is emitted as
  // re-construction code instead of throwing.
  //
  // Two re-construction paths, chosen so each reproduces the SAME `layerName`:
  //
  // - global: re-run `defineLayerStyle({ globalName, parent })`. `globalLayer()`
  //   derives a deterministic name from `globalName`/`parent`, so re-running it at
  //   runtime yields the identical layer. Kept verbatim from the original
  //   implementation, so global behavior (including the runtime `globalLayer()`
  //   call) is unchanged.
  // - scoped: call `defineLayerStyleFromResolvedName(layerName, parentLayerName)`,
  //   which does NOT re-run `layer()`. A scoped layer's name is a hash that cannot
  //   be reproduced by calling `layer()` again, so the build-time name is carried
  //   over as a plain string instead.
  //
  // What re-construction restores (BOTH paths): only the deterministic state —
  // `layerName` / `parentLayerName`. `hooks` (and anything added via `extend()`:
  // extra `anyStyle`, custom methods, etc.) are intentionally NOT serialized,
  // because they hold functions and the serializer args must be plain serializable
  // values. This does not change build behavior: `hooks` run at `.css.ts`
  // evaluation time when `.style()` / `.global()` are called, and the CSS they emit
  // is already baked in before serialization (which only reads
  // `__function_serializer__` and writes re-construction code). The only caveat is
  // purely runtime: an instance re-constructed in a consumer is a *reference
  // handle* to the already-built layer — calling its `.style()` / `.global()` /
  // extended methods there runs without the original hooks. If a runtime-hooked
  // layer is ever needed, keep that instance build-time only, or add a separately
  // serializable descriptor for it.
  if (isGlobal) {
    addFunctionSerializer(layerStyle, {
      importPath: '@fastkit/plugboy-vanilla-extract-plugin/css',
      importName: 'defineLayerStyle',
      args: [
        {
          globalName: options.globalName,
          ...(parent ? { parent } : {}),
        },
      ],
    });
  } else {
    addFunctionSerializer(layerStyle, {
      importPath: '@fastkit/plugboy-vanilla-extract-plugin/css',
      importName: 'defineLayerStyleFromResolvedName',
      args: [layerName, parent || null],
    });
  }

  return layerStyle;
}
