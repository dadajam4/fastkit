import {
  style,
  layer,
  globalLayer,
  StyleRule,
  globalStyle,
  GlobalStyleRule,
} from '@vanilla-extract/css';

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

  defineNestedLayer(
    globalNameOrNestedOptions?: string | NestedLayerOptions,
  ): LayerStyle;
}

export interface DefineLayerBaseOptions {
  parent?: string;
}

export interface DefineLayerScopedOptions extends DefineLayerBaseOptions {
  debugId?: string;
}

export interface DefineLayerGlobalOptions extends DefineLayerBaseOptions {
  globalName: string;
}

export type DefineLayerOptions =
  | DefineLayerScopedOptions
  | DefineLayerGlobalOptions;

export type NestedLayerOptions = Omit<DefineLayerOptions, 'parent'>;

function isGlobalOptions(
  options: DefineLayerOptions,
): options is DefineLayerGlobalOptions {
  return 'globalName' in options;
}

function normalizeToObject<T extends NestedLayerOptions>(
  source?: string | T,
): T {
  if (!source) return {} as T;
  if (typeof source === 'string') return { globalName: source } as unknown as T;
  return source;
}

export function defineLayerStyle(
  globalNameOrOptions?: string | DefineLayerOptions,
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
