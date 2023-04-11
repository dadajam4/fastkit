import type { AnySpaceStatic } from './schemes';

/**
 * Context object to control & support strategy behavior
 */
export class VueI18nContext {
  /** Internationalization Space Definition */
  readonly Space: AnySpaceStatic;

  /** List of valid locale names in this space */
  get availableLocales() {
    return this.Space.availableLocales;
  }

  /** base locale name */
  get baseLocale() {
    return this.Space.baseLocale;
  }

  constructor(Space: AnySpaceStatic) {
    this.Space = Space;
  }
}
