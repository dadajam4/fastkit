import {
  OptimizeLayerOptions,
  OptimizeMediaOptions,
  CombineRulesOptions,
} from '../postcss';
import type { Options } from 'cssnano';

/**
 * CSS optimization options
 */
export interface OptimizeCSSOptions {
  /**
   * Layer optimization options
   *
   * Disable the operation with `false`.
   *
   * @default true
   */
  layer?: OptimizeLayerOptions | boolean;
  /**
   * Media Query Optimization Options
   *
   * Disable the operation with `false`.
   *
   * @default true
   */
  media?: OptimizeMediaOptions | boolean;
  /**
   * Combine rules Options
   *
   * If unset, no optimization is performed
   */
  combineRules?: CombineRulesOptions;
  /**
   * Options for [cssnano](https://cssnano.co/)
   *
   * Disable the operation with `false`.
   *
   * @default { preset: ['default', { normalizeWhitespace: false }] }
   */
  cssnano?: Options | boolean;
}

export interface ResolvedOptimizeCSSOptions {
  layer?: OptimizeLayerOptions;
  media?: OptimizeMediaOptions;
  combineRules?: CombineRulesOptions;
  cssnano?: Options;
}

export function resolveOptimizeCSSOptions(options: OptimizeCSSOptions) {
  const resolved: ResolvedOptimizeCSSOptions = {};
  const { layer = true, media = true, combineRules, cssnano = true } = options;
  if (layer !== false) {
    resolved.layer = layer === true ? {} : layer;
  }
  if (media !== false) {
    resolved.media = media === true ? {} : media;
  }
  if (combineRules) {
    resolved.combineRules = combineRules;
  }
  if (cssnano !== false) {
    resolved.cssnano =
      cssnano === true
        ? { preset: ['default', { normalizeWhitespace: false }] }
        : cssnano;
  }
  return resolved;
}
