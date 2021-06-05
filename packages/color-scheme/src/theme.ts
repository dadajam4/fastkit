import { Color } from '@fastkit/color';
import { createColorPaletteBucket } from './palette';
import { createColorScopeBucket } from './scope';
import { createBucket, mergeScopeResolverMaps } from './utils';
import {
  ColorScopeOptionalKey,
  ColorThemeSource,
  ColorThemeContext,
  ColorThemeJSON,
  ColorTheme,
  ColorThemesContext,
  ColorThemeBucket,
  ColorScopeDefault,
  ColorScopeDefaultJSON,
  ColorScopeDefaults,
  ColorScopeDefaultsJSON,
  COLOR_SCOPE_DEFAULTS_KEYS,
} from './schemes';

export function createTheme<
  TN extends string,
  PN extends string,
  SN extends string,
  VN extends string = string,
  OK extends ColorScopeOptionalKey = ColorScopeOptionalKey,
>(
  source: ColorThemeSource<TN, PN, SN, VN, OK>,
  ctx: ColorThemeContext<TN, PN, SN, VN, OK>,
): ColorTheme<TN, PN, SN, VN, OK> {
  const { name, palette: paletteSource, scopes: scopesSource } = source;
  // ctx.main.brightness()

  let _scopeDefaults: typeof source.scopeDefaults | null | false | void =
    source.scopeDefaults;
  let { scopeResolvers: _scopeResolvers = {} } = source;
  if (typeof _scopeResolvers === 'function') {
    _scopeResolvers = _scopeResolvers();
  }

  const { scheme, themes } = ctx;
  const { optionals } = scheme;

  const scopeResolvers = mergeScopeResolverMaps(
    optionals,
    scheme.scopeResolvers,
    _scopeResolvers,
  );

  const scopeDefaults: ColorScopeDefaults<TN, PN, SN, VN, OK> = {
    toJSON(): ColorScopeDefaultsJSON<OK> {
      const json: ColorScopeDefaultsJSON<OK> = {};
      for (const key of COLOR_SCOPE_DEFAULTS_KEYS) {
        const def = scopeDefaults && scopeDefaults[key];
        if (def) {
          json[key] = def.toJSON();
        }
      }
      return json;
    },
  };

  let isLight: boolean | null = null;

  const theme: ColorTheme<TN, PN, SN, VN, OK> = {
    get source() {
      return source;
    },
    get ctx() {
      return ctx;
    },
    get scheme() {
      return scheme;
    },
    get themes() {
      return themes;
    },
    get optionals() {
      return optionals;
    },
    get scopeResolvers() {
      return scopeResolvers;
    },
    get name() {
      return name;
    },
    get palette() {
      return palette;
    },
    get scopes() {
      return scopes;
    },
    get scopeDefaults() {
      return scopeDefaults;
    },
    get isLight() {
      if (typeof isLight === 'boolean') return isLight;
      const background = theme.palette('background' as any);
      if (!background) {
        isLight = true;
      } else {
        isLight = background.brightness() > 0.5;
      }
      return isLight;
    },
    get isDark() {
      return !theme.isLight;
    },
    toJSON(): ColorThemeJSON<TN, PN, SN, VN, OK> {
      const json: ColorThemeJSON<TN, PN, SN, VN, OK> = {
        name,
        palette: palette.toJSON(),
        scopes: scopes.toJSON(),
      };
      if (_scopeDefaults) {
        json.scopeDefaults = scopeDefaults.toJSON();
      }
      return json;
    },
  };
  const palette = createColorPaletteBucket(paletteSource, { ...ctx, theme });
  if (typeof _scopeDefaults === 'function') {
    _scopeDefaults = _scopeDefaults({ theme, palette });
  }

  if (_scopeDefaults) {
    for (const key of COLOR_SCOPE_DEFAULTS_KEYS) {
      const _defSource = _scopeDefaults[key];
      const main = new Color();
      const scopeDefault: ColorScopeDefault<TN, PN, SN, VN, OK> = {
        get defaults() {
          return scopeDefaults;
        },
        get theme() {
          return theme;
        },
        get palette() {
          return palette;
        },
        get main() {
          return main;
        },
        ...(undefined as unknown as { [K in OK]?: Color }),
        toJSON(): ColorScopeDefaultJSON<OK> {
          const json: ColorScopeDefaultJSON<OK> = {
            main: main.toString(),
          };
          if (optionalSources) {
            optionals.forEach((optional) => {
              const color = scopeDefault[optional];
              if (color) {
                (json as any)[optional] = color.toString();
              }
            });
          }
          return json;
        },
      };

      const defSource =
        typeof _defSource === 'function'
          ? _defSource(scopeDefault)
          : _defSource;

      if (!defSource) continue;

      main.set(defSource[0]);
      const optionalSources = defSource[1];

      if (optionalSources) {
        optionals.forEach((optional) => {
          const sourceColor = optionalSources[optional];
          if (sourceColor) {
            const color = new Color(sourceColor);
            Object.defineProperty(scopeDefault, optional, {
              get() {
                return color;
              },
            });
          }
        });
      }
      scopeDefaults[key] = scopeDefault;
    }
  }

  const scopes = createColorScopeBucket(scopesSource, {
    ...ctx,
    theme,
    palette,
  });

  return theme;
}

export function createThemeBucket<
  TN extends string = string,
  PN extends string = string,
  SN extends string = string,
  VN extends string = string,
  OK extends ColorScopeOptionalKey = ColorScopeOptionalKey,
>(
  sources: ColorThemeSource<TN, PN, SN, VN, OK>[] = [],
  ctx: ColorThemesContext<TN, PN, SN, VN, OK>,
) {
  const themes = createBucket<
    TN,
    ColorTheme<TN, PN, SN, VN, OK>,
    ColorTheme<TN, PN, SN, VN, OK>,
    ColorThemesContext<TN, PN, SN, VN, OK>,
    ColorThemeJSON<TN, PN, SN, VN, OK>[],
    ColorThemeBucket<TN, PN, SN, VN, OK>
  >(
    'ColorThemes',
    (push, instance) => {
      sources.forEach((source) =>
        push(
          createTheme(source, {
            ...ctx,
            themes: instance,
          }),
        ),
      );
    },
    ctx,
    (value) => value,
    (values) => {
      return values.map((theme) => theme.toJSON());
    },
  );

  return themes;
}
