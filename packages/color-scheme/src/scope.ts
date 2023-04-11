import { Color } from '@fastkit/color';
import { createBucket } from './utils';
import { ColorSchemeError } from './logger';
import {
  ColorScopeOptionalKey,
  ColorScopeSource,
  ColorScopeContext,
  ColorScope,
  ColorScopeResolverResult,
  ColorScopeResolver,
  ColorScopeOptionals,
  ColorScopeJSON,
  ColorScopesContext,
  ColorScopesBucket,
} from './schemes';

export function createColorScope<
  TN extends string = string,
  PN extends string = string,
  SN extends string = string,
  VN extends string = string,
  OK extends ColorScopeOptionalKey = ColorScopeOptionalKey,
>(
  source: ColorScopeSource<TN, PN, SN, VN, OK>,
  ctx: ColorScopeContext<TN, PN, SN, VN, OK>,
): ColorScope<TN, PN, SN, VN, OK> {
  const { scheme, theme, palette, scopes } = ctx;
  const { optionals } = scheme;
  const { scopeResolvers } = theme;
  const [name, _main, optionalSources] = source;
  const optionalValues: ColorScopeOptionals<OK> = {};
  // eslint-disable-next-line prefer-const
  let main: Color;

  const scope: ColorScope<TN, PN, SN, VN, OK> = {
    get scheme() {
      return scheme;
    },
    get theme() {
      return theme;
    },
    get palette() {
      return palette;
    },
    get scopes() {
      return scopes;
    },
    get source() {
      return source;
    },
    get ctx() {
      return ctx;
    },
    get name() {
      return name;
    },
    get main() {
      return main.clone();
    },
    get optionals() {
      return optionals;
    },
    toJSON(): ColorScopeJSON<SN, OK> {
      const json: ColorScopeJSON<SN, OK> = {
        name,
        main: main.toString(),
      };
      for (const optional of optionals) {
        const color = optionalValues[optional];
        if (color) {
          (json as any)[optional] = color.toString();
        }
      }
      return json;
    },
    ...(undefined as unknown as ColorScopeOptionals<OK>),
  };

  main = resolve(_main, true);

  optionals.forEach((key) => {
    Object.defineProperty(scope, key, {
      get() {
        const color = optionalValues[key];
        if (color) {
          return color.clone();
        }
      },
    });
  });

  function resolve<R extends boolean>(
    source: ColorScopeResolverResult | ColorScopeResolver<TN, PN, SN, VN, OK>,
    required?: R,
  ): R extends true ? Color : Color | void | null | false {
    if (typeof source === 'function') {
      source = source(scope);
    }
    if (source) {
      return new Color(source) as any;
    }
    if (required) {
      throw new ColorSchemeError('missing color');
    }
    return source as any;
  }

  optionals.forEach((key) => {
    const sourceColor = optionalSources && optionalSources[key];
    let color = resolve(sourceColor);
    if (!color && color === undefined) {
      const resolver = scopeResolvers[key];
      if (resolver) {
        const s = resolver(scope);
        if (s) color = new Color(s);
      }
    }
    if (color) {
      (optionalValues as any)[key] = color;
    }
  });

  return scope;
}

export function createColorScopeBucket<
  TN extends string = string,
  PN extends string = string,
  SN extends string = string,
  VN extends string = string,
  OK extends ColorScopeOptionalKey = ColorScopeOptionalKey,
>(
  sources: ColorScopeSource<TN, PN, SN, VN, OK>[] = [],
  ctx: ColorScopesContext<TN, PN, SN, VN, OK>,
) {
  const scopes = createBucket<
    SN,
    ColorScope<TN, PN, SN, VN, OK>,
    ColorScope<TN, PN, SN, VN, OK>,
    ColorScopesContext<TN, PN, SN, VN, OK>,
    ColorScopeJSON<SN, OK>[],
    ColorScopesBucket<TN, PN, SN, VN, OK>
  >(
    'ColorScopes',
    (push, instance) => {
      sources.forEach((source) => {
        push(
          createColorScope(source, {
            ...ctx,
            scopes: instance,
          }),
        );
      });
    },
    ctx,
    (value) => value,
    (values) => {
      return values.map((theme) => theme.toJSON());
    },
  );
  return scopes;
}
