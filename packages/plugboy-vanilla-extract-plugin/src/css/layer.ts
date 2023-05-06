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

type LayerStyleRules = NonNullable<StyleRule['@layer']>[string];

type LayerGlobalStyleRules = NonNullable<GlobalStyleRule['@layer']>[string];

export interface LayerStyle {
  layerName: string;
  parentLayerName: string | null;
  /**
   * @see {@link style}
   */
  (rule: LayerStyleRules, debugId?: string): string;

  /**
   * @see {@link style}
   */
  style(rule: LayerStyleRules, debugId?: string): string;

  /**
   * @see {@link globalStyle}
   */
  global(selector: string, rule: LayerGlobalStyleRules): void;

  /**
   * @see {@link _createGlobalTheme}
   */
  globalTheme: typeof _createGlobalTheme;

  defineNestedLayer(
    globalNameOrNestedOptions?: string | DefineLayerOptions,
  ): LayerStyle;

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
}

export interface DefineLayerParentOptions {
  parent?: string;
}

export interface DefineLayerScopedOptions {
  /** Debug ID */
  debugId?: string;
  globalName?: never;
}

export interface DefineLayerGlobalOptions {
  debugId?: never;
  /** Parent layer name */
  globalName: string;
}

export type DefineLayerOptions =
  | DefineLayerScopedOptions
  | DefineLayerGlobalOptions;

export type DefineNestableLayerOptions = DefineLayerOptions &
  DefineLayerParentOptions;

function isGlobalOptions(
  options: DefineLayerOptions,
): options is DefineLayerGlobalOptions {
  return 'globalName' in options;
}

function normalizeToObject<T extends DefineLayerOptions>(
  source?: string | T,
): T {
  if (!source) return {} as T;
  if (typeof source === 'string') return { globalName: source } as unknown as T;
  return source;
}

export function defineLayerStyle(
  globalNameOrOptions?: string | DefineNestableLayerOptions,
): LayerStyle {
  const options = normalizeToObject(globalNameOrOptions);
  const { parent } = options;

  const layerName = isGlobalOptions(options)
    ? globalLayer({ parent }, options.globalName)
    : layer({ parent }, options.debugId);

  const layerStyle: LayerStyle = function layerStyle(rule, debugId) {
    return style(
      {
        '@layer': {
          [layerName]: rule,
        },
      },
      debugId,
    );
  };

  layerStyle.layerName = layerName;
  layerStyle.parentLayerName = parent || null;
  layerStyle.style = layerStyle;

  layerStyle.global = function layerGlobalStyle(selector, rule) {
    return globalStyle(selector, {
      '@layer': {
        [layerName]: rule,
      },
    });
  };

  layerStyle.globalTheme = (...args: any) =>
    (createGlobalTheme as any)(layerName, ...args);

  let _varQueues: [string, Record<string, string>][] = [];

  layerStyle.pushGlobalVars = function pushGlobalVars(selector, vars) {
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
      });
    }
    _varQueues = [];
  };

  layerStyle.defineNestedLayer = function defineNestedLayer(
    globalNameOrNestedOptions,
  ) {
    const options = normalizeToObject(globalNameOrNestedOptions);
    return defineLayerStyle({
      ...options,
      parent: layerName,
    });
  };

  return layerStyle;
}
