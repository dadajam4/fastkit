import type { FormNodeError, FormNodeControl } from './composables/node';

export type FormErrorMessageResolver = (
  error: FormNodeError,
  node?: FormNodeControl,
) => string | void;

export interface VueFormServiceOptions {
  errorMessageResolvers?: FormErrorMessageResolver[];
}

export class VueFormService {
  readonly errorMessageResolvers: FormErrorMessageResolver[] = [];

  constructor(options: VueFormServiceOptions = {}) {
    const { errorMessageResolvers } = options;
    errorMessageResolvers &&
      this.errorMessageResolvers.push(...errorMessageResolvers);
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
}
