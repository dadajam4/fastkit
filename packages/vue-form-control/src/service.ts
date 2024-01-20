import type { FormNodeError, FormNodeControl } from './composables/node';

export type FormErrorMessageResolver = (
  error: FormNodeError,
  node?: FormNodeControl,
) => string | void;

export interface VueFormScrollOptions {
  options?: ScrollIntoViewOptions;
  fn?: (element: HTMLElement, options?: ScrollIntoViewOptions) => void;
}

export interface VueFormServiceOptions {
  errorMessageResolvers?: FormErrorMessageResolver[];
  scroll?: VueFormScrollOptions;
}

/**
 * Root service of `vue-form-control`
 */
export class VueFormService {
  readonly errorMessageResolvers: FormErrorMessageResolver[] = [];

  readonly scroll?: VueFormScrollOptions;

  constructor(options: VueFormServiceOptions = {}) {
    const { errorMessageResolvers, scroll } = options;
    errorMessageResolvers &&
      this.errorMessageResolvers.push(...errorMessageResolvers);
    this.scroll = scroll;
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

    if (fn) {
      return fn(element, _options);
    }
    return element.scrollIntoView(_options);
  }
}
