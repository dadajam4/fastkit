import type { FormNodeError, FormNodeControl } from './composables/node';
import type { FormAutoComplete } from './schemes';
import { registerAutocompleteDefault } from './composables/autocompletable';

export type FormErrorMessageResolver = (
  error: FormNodeError,
  node?: FormNodeControl,
) => string | void;

/**
 * Scroll option for the form element
 */
export interface VueFormScrollOptions {
  /**
   * Default scroll option
   *
   * @see {@link ScrollIntoViewOptions}
   */
  options?: ScrollIntoViewOptions;
  /**
   * Scroll handler function
   *
   * @param element - Scroll target element
   * @param options - Scroll option
   * @returns When canceling the default scroll and implementing custom scrolling within the application, return a truthy value.
   */
  fn?: (element: HTMLElement, options?: ScrollIntoViewOptions) => void;
}

export interface VueFormServiceOptions {
  errorMessageResolvers?: FormErrorMessageResolver[];
  /**
   * Scroll option for the form element
   *
   * @see {@link VueFormScrollOptions}
   */
  scroll?: VueFormScrollOptions;
  /**
   * Default value for text input autocomplete.
   *
   * @see {@link FormAutoComplete}
   */
  defaultAutocomplete?: FormAutoComplete | boolean | undefined;
}

/**
 * Root service of `vue-form-control`
 */
export class VueFormService {
  readonly errorMessageResolvers: FormErrorMessageResolver[] = [];

  /**
   * Scroll option for the form element
   *
   * @see {@link VueFormScrollOptions}
   */
  readonly scroll?: VueFormScrollOptions;

  constructor(options: VueFormServiceOptions = {}) {
    const { errorMessageResolvers, scroll } = options;
    errorMessageResolvers &&
      this.errorMessageResolvers.push(...errorMessageResolvers);
    this.scroll = scroll;

    registerAutocompleteDefault(options.defaultAutocomplete);
  }

  addMessageResolver(
    resolvers: FormErrorMessageResolver | FormErrorMessageResolver[],
  ) {
    if (!Array.isArray(resolvers)) resolvers = [resolvers];
    this.errorMessageResolvers.push(...resolvers);
  }

  resolveErrorMessage(
    error: FormNodeError,
    node?: FormNodeControl,
  ): string | void {
    for (const resolver of this.errorMessageResolvers) {
      const result = resolver(error, node);
      if (result) return result;
    }
  }

  scrollToElement(element: HTMLElement, options?: ScrollIntoViewOptions) {
    const { scroll } = this;
    const _options: ScrollIntoViewOptions = {
      behavior: 'smooth',
      ...scroll?.options,
      ...options,
    };
    const fn = scroll?.fn;

    if (fn?.(element, _options)) {
      return;
    }
    return element.scrollIntoView(_options);
  }
}
