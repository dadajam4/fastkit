import { isObject } from '@fastkit/helpers';
import {
  AnyData,
  AnyResolvers,
  AnyNormalizer,
  CatcherBuilderOptions,
  CatcherConstructor,
  Catcher,
  CatcherData,
  ResolverContext,
} from './schema';
import { nativeErrorResolver } from './resolvers/native';

/**
 * Checks if the value of the specified argument is a catcher instance
 * @param source - Value to be checked
 * @returns true if it is a catcher instance
 */
export function isCatcher(source: unknown): source is Catcher {
  return source instanceof Error && (source as Catcher).isCatcher === true;
}

/**
 * Checks if the value of the specified argument is a data object output from the catcher instance
 * @param source - Value to be checked
 * @returns true if the data is catcher output data
 */
export function isCatcherData<T extends Catcher>(
  source: unknown,
): source is T['data'] {
  return isObject<CatcherData>(source) && source.$__catcher === true;
}

const NATIVE_ERROR_PROPS = ['stack', 'message', 'name'] as const;

function isPromiseLike(source: unknown): source is Promise<unknown> {
  return typeof (source as Promise<unknown>)?.then === 'function';
}

/**
 * Generate exception catcher constructor
 *
 * * The instance type is determined by the custom resolver and normalizer specified in the options
 *
 * @param opts - {@link CatcherBuilderOptions Catcher constructor generation options}
 * @returns Exception catcher constructor
 */
export function build<
  Resolvers extends AnyResolvers,
  Normalizer extends AnyNormalizer<Resolvers>,
>(
  opts: CatcherBuilderOptions<Resolvers, Normalizer>,
): CatcherConstructor<Resolvers, Normalizer> {
  const { resolvers = [], normalizer, defaultName = 'CatcherError' } = opts;

  if (!(resolvers as any).includes(nativeErrorResolver)) {
    // Native Error resolvers are forced to be inserted into the last stage of the resolver.
    (resolvers as any).unshift(nativeErrorResolver);
  }

  function createResolverContext(resolvedData: AnyData, canAwait: boolean) {
    let stopped = false;
    const ctx: ResolverContext = {
      resolve: () => {
        stopped = true;
      },
      get resolvedData() {
        return resolvedData;
      },
      canAwait,
    };
    return { ctx, isStopped: () => stopped };
  }

  /**
   * Run every resolver over an exception, without awaiting any of them
   *
   * This is what the synchronous entry points use. An instance is an `Error`
   * that has to exist by the time it is thrown, so there is nowhere to await:
   * a resolver that hands back a promise contributes nothing here, because the
   * normalizer runs before it could settle. The rejection is swallowed rather
   * than left to surface as an unhandled one, and the remaining resolvers still
   * get their turn.
   */
  function runResolvers(infoOrException: unknown, resolvedData: AnyData): void {
    const { ctx, isStopped } = createResolverContext(resolvedData, false);
    for (const resolver of resolvers) {
      const result = resolver(infoOrException, ctx);
      if (isPromiseLike(result)) {
        result.catch(() => undefined);
        continue;
      }
      if (result) {
        Object.assign(resolvedData, result);
        if (isStopped()) {
          break;
        }
      }
    }
  }

  /**
   * Run every resolver over an exception, awaiting each one
   *
   * Used by {@link CatcherConstructor.fromAsync fromAsync} /
   * {@link CatcherConstructor.createAsync createAsync}, which normalize only
   * once this has settled -- so a resolver may reach for something the
   * synchronous path cannot, such as a `Response` body.
   */
  async function runResolversAsync(infoOrException: unknown): Promise<AnyData> {
    const resolvedData: AnyData = {};
    const { ctx, isStopped } = createResolverContext(resolvedData, true);
    for (const resolver of resolvers) {
      // Sequential on purpose, exactly like the synchronous pass: a resolver
      // may read what an earlier one left in `ctx.resolvedData`, and
      // `ctx.resolve()` is meant to stop the ones after it.

      const result = await resolver(infoOrException, ctx);
      if (result) {
        Object.assign(resolvedData, result);
        if (isStopped()) {
          break;
        }
      }
    }
    return resolvedData;
  }

  class BuildedCatcher extends Error implements Catcher {
    readonly isCatcher = true;

    readonly data!: Catcher['data'];

    readonly resolvedData: Catcher['resolvedData'] = {} as any;

    readonly source?: any;

    get histories() {
      const histories: Catcher[] = [];
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      let parent = this;
      while (parent) {
        histories.push(parent);
        parent = parent.source;
      }
      return histories;
    }

    get messages() {
      const messages: string[] = [];
      let beforeMessage: string | undefined;
      this.histories.forEach((history) => {
        const { message } = history;
        if (message !== beforeMessage) {
          messages.push(message);
          beforeMessage = message;
        }
      });
      return messages;
    }

    static from(unknownException: unknown, overrides?: unknown) {
      return new this(unknownException, overrides, true);
    }

    static create(exceptionInfo: unknown) {
      return new this(exceptionInfo);
    }

    static async fromAsync(unknownException: unknown, overrides?: unknown) {
      if (isCatcher(unknownException) && overrides === undefined) {
        return unknownException;
      }
      // Recovering stored data does not run resolvers, so there is nothing to
      // await for it.
      const preResolved = isCatcherData(unknownException)
        ? undefined
        : await runResolversAsync(unknownException);
      return new this(unknownException, overrides, true, preResolved);
    }

    static async createAsync(exceptionInfo: unknown) {
      const preResolved = isCatcherData(exceptionInfo)
        ? undefined
        : await runResolversAsync(exceptionInfo);
      return new this(exceptionInfo, undefined, undefined, preResolved);
    }

    constructor(
      infoOrException: unknown,
      overrides?: unknown,
      isUnknown?: boolean,
      /**
       * What the resolvers already produced, when they were run ahead of time
       * so they could be awaited
       *
       * @internal
       */
      preResolved?: AnyData,
    ) {
      if (isCatcher(infoOrException) && overrides === undefined) {
        // If the error information is the Catcher instance itself, it will return itself
        return infoOrException;
      }

      super();

      if (isCatcherData(infoOrException)) {
        // If the error information is data that can be recovered as a Catcher instance, it will be recovered only.
        this.data = infoOrException;
      } else if (overrides !== undefined) {
        // In the case of standardization for the original exception
        this.source = new BuildedCatcher(
          infoOrException,
          undefined,
          true,
          preResolved,
        );
        this.resolvedData = this.source.resolvedData;
        this.data = {
          ...this.source.data,
          ...(overrides as any),
        };
      } else {
        const { resolvedData } = this;
        if (preResolved) {
          // Already produced by `runResolvers`, which was able to await.
          Object.assign(resolvedData, preResolved);
        } else {
          runResolvers(infoOrException, resolvedData);
        }

        this.data = {
          $__catcher: true,
          name: defaultName,
          ...normalizer(resolvedData as any)(
            isUnknown ? undefined : infoOrException,
          ),
        };

        const { nativeError } = resolvedData;
        if (nativeError) {
          NATIVE_ERROR_PROPS.forEach((nativeProp) => {
            if (this.data[nativeProp] == null && nativeError[nativeProp]) {
              this.data[nativeProp] = nativeError[nativeProp];
            }
          });
        }
      }

      if (!this.data.stack) {
        this.data.stack = this.stack;
      }

      Object.keys(this.data).forEach((key) => {
        Object.defineProperty(this, key, {
          get: () => this.data[key],
          set: (value) => {
            this.data[key] = value;
          },
          enumerable: true,
        });
      });
    }

    toJSONString(indent?: number | boolean) {
      if (indent === true) {
        indent = 2;
      }
      const data = {
        ...this.data,
      };

      if (data.name === undefined) {
        data.name = this.name;
      }
      if (data.message === undefined) {
        data.message = this.message;
      }
      if (data.stack === undefined) {
        data.stack = this.stack;
      }
      return JSON.stringify(
        {
          ...data,
          messages: this.messages,
        },
        null,
        indent || undefined,
      );
    }

    toJSON() {
      return JSON.parse(this.toJSONString());
    }
  }

  return BuildedCatcher as unknown as CatcherConstructor<Resolvers, Normalizer>;
}
