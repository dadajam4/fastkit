import {
  // AnyData,
  AnyResolvers,
  AnyNormalizer,
  CatcherBuilderOptions,
  CatcherConstructor,
  Catcher,
  CatcherData,
  ResolverContext,
} from './schemes';
import { nativeErrorResolver } from './resolvers/native';
import { isObject } from '@fastkit/helpers';

export function isCatcher(source: unknown): source is Catcher {
  return source instanceof Error && (source as Catcher).isCatcher === true;
}

export function isCatcherData<T extends Catcher>(
  source: unknown,
): source is T['data'] {
  return isObject<CatcherData>(source) && source.$__catcher === true;
}

export function build<
  Resolvers extends AnyResolvers,
  Normalizer extends AnyNormalizer<Resolvers>,
>(
  opts: CatcherBuilderOptions<Resolvers, Normalizer>,
): CatcherConstructor<Resolvers, Normalizer> {
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
      return new this(unknownException, overrides);
    }

    static create(exceptionInfo: unknown) {
      return new this(exceptionInfo);
    }

    constructor(infoOrException: unknown, overrides?: unknown) {
      if (isCatcher(infoOrException) && overrides === undefined) {
        // If the error information is the Catcher instance itself, it will return itself
        return infoOrException;
      }

      super();

      const { resolvers = [], normalizer } = opts;

      if (!(resolvers as any).includes(nativeErrorResolver)) {
        // Native Error resolvers are forced to be inserted into the last stage of the resolver.
        (resolvers as any).unshift(nativeErrorResolver);
      }

      if (isCatcherData(infoOrException)) {
        // If the error information is data that can be recovered as a Catcher instance, it will be recovered only.
        this.data = infoOrException;
      } else if (overrides !== undefined) {
        // In the case of standardization for the original exception
        this.source = new BuildedCatcher(infoOrException);
        this.resolvedData = this.source.resolvedData;
        this.data = {
          ...this.source.data,
          ...(overrides as any),
        };
      } else {
        let resolved = false;

        const ctx: ResolverContext = {
          resolve: () => {
            resolved = true;
          },
        };

        for (const resolver of resolvers) {
          const result = resolver(infoOrException, ctx);
          if (result) {
            Object.assign(this.resolvedData, result);
            if (resolved) {
              break;
            }
          }
        }

        this.data = {
          $__catcher: true,
          name: opts.defaultName || 'CatcherError',
          ...normalizer(this.resolvedData as any)(infoOrException),
        };

        const { nativeError } = this.resolvedData;
        if (nativeError) {
          (['stack', 'message', 'name'] as const).forEach((nativeProp) => {
            if (this.data[nativeProp] == null && nativeError[nativeProp]) {
              this.data[nativeProp] = nativeError[nativeProp];
            }
          });
        }
      }

      Object.keys(this.data).forEach((key) => {
        Object.defineProperty(this, key, {
          get: () => {
            return this.data[key];
          },
          set: (value) => {
            this.data[key] = value;
          },
        });
      });
    }

    toJSONString(indent?: number | boolean) {
      if (indent === true) {
        indent = 2;
      }
      const data = {
        ...this.data,
        // messages: this.messages as any,
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

// const Hoge = build({
//   resolvers: [
//     () => {
//       return {
//         axios: {},
//       };
//     },
//   ],
//   normalizer: (resolvedData) => {
//     // this!.
//     // this.
//     // resolvedData.
//     const { axios } = resolvedData;

//     return () => {
//       return {
//         status: 500,
//         axiosData: axios,
//       };
//     };
//   },
// });

// const hoge = new Hoge();

// hoge.resolvedData.

// hoge.data.

// hoge.resolvedData.

// hoge.resolvedData.

// hoge
// hoge.
// hoge.
// hoge.
// hoge.
// hoge.
// hoge.
// hoge.
// hoge.s

// hoge.data.
