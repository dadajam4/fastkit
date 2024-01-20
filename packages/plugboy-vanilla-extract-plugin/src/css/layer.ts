import {
  style,
  layer,
  globalLayer,
  StyleRule,
  globalStyle,
  GlobalStyleRule,
  createGlobalTheme as _createGlobalTheme,
} from '@vanilla-extract/css';
import { createGlobalTheme } from './theme';

type CustomStyleRules = Record<string, any>;

type _LayerStyleRules = NonNullable<StyleRule['@layer']>[string];

type LayerStyleRules<CustomRules extends CustomStyleRules | null = null> =
  CustomRules extends null ? _LayerStyleRules : _LayerStyleRules & CustomRules;

type ClassNames = string | ClassNames[];

type ComplexLayerStyleRule<CustomRules extends CustomStyleRules | null = null> =
  LayerStyleRules<CustomRules> | (LayerStyleRules<CustomRules> | ClassNames)[];

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
  // eslint-disable-next-line no-shadow
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

export function defineLayerStyle<
  CustomRules extends CustomStyleRules | null = null,
>(
  globalNameOrOptions?: string | DefineNestableLayerOptions<CustomRules>,
): LayerStyle<CustomRules> {
  const options = normalizeToObject(globalNameOrOptions);
  const { parent, hooks = {} } = options;

  const layerName = isGlobalOptions(options)
    ? globalLayer({ parent }, options.globalName)
    : layer({ parent }, options.debugId);

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
  layerStyle.parentLayerName = parent || null;
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
