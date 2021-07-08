import {
  AnyData,
  AnyResolvers,
  AnyNormalizers,
  CatcherBuilderOptions,
  CatcherConstructor,
  Catcher,
  CatcherData,
} from './schemes';
import { nativeErrorResolver } from './resolvers/native';

export function isCatcher(source: unknown): source is Catcher {
  return (
    source != null &&
    typeof source === 'object' &&
    (source as Catcher).isCatcher === true
  );
}

export function isCatcherData<T extends AnyData>(
  source: unknown,
): source is CatcherData<T> {
  return (
    source != null &&
    typeof source === 'object' &&
    (source as CatcherData<T>).$_catcherCaught === true
  );
}

export function build<
  Resolvers extends AnyResolvers,
  Normalizers extends AnyNormalizers,
>(
  opts: CatcherBuilderOptions<Resolvers, Normalizers>,
): CatcherConstructor<Resolvers, Normalizers> {
  class BuildedCatcher extends Error implements Catcher {
    readonly isCatcher = true;
    readonly data: CatcherData<AnyData>;
    source: any;

    constructor(source: any) {
      super();

      const { defaultName, resolvers = [], normalizers = [] } = opts;
      let data: CatcherData<AnyData>;

      if (isCatcher(source)) {
        data = source.data;
        this.source = source.source;
      } else {
        this.source = source;
        if (isCatcherData(source)) {
          data = source;
        } else {
          data = {
            $_catcherCaught: true,
            name: defaultName || 'CatcherError',
          };

          if (!(resolvers as any).includes(nativeErrorResolver)) {
            (resolvers as any).unshift(nativeErrorResolver);
          }

          for (const resolver of resolvers) {
            const resolved = resolver(source);
            if (resolved) {
              Object.assign(data, resolved);
              break;
            }
          }

          for (const normalizer of normalizers) {
            Object.assign(data, normalizer(data));
          }
        }
      }

      this.data = data;

      return new Proxy(this, {
        get: (target, prop) => {
          const value = data[prop as string];
          return value === undefined ? (this as any)[prop] : value;
        },
        set: (target, prop, value) => {
          data[prop as string] = value;
          return true;
        },
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
      return JSON.stringify(data, null, indent || undefined);
    }

    toJSON() {
      return JSON.parse(this.toJSONString());
    }
  }

  return BuildedCatcher as unknown as CatcherConstructor<Resolvers>;
}
