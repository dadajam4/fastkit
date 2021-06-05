import { createThemeBucket } from './theme';
import {
  ColorScopeOptionalKey,
  ColorSchemeSource,
  ColorSchemeJSON,
  ColorScheme,
} from './schemes';
export * from './schemes';

export function createColorScheme<
  TN extends string,
  PN extends string,
  SN extends string,
  VN extends string = string,
  OK extends ColorScopeOptionalKey = ColorScopeOptionalKey,
>(
  source: ColorSchemeSource<TN, PN, SN, VN, OK>,
): ColorScheme<TN, PN, SN, VN, OK> {
  const rawVariants = [...(source.variants || [])];
  const optionals = [...(source.optionals || [])];
  const themeNames: TN[] = [];
  const scopeNames: SN[] = [];
  const paletteNames: PN[] = [];
  let scopeResolvers = source.scopeResolvers || {};
  if (typeof scopeResolvers === 'function') {
    scopeResolvers = scopeResolvers();
  }
  const variantSources = rawVariants.map((rawVariant) => {
    return typeof rawVariant === 'string'
      ? {
          name: rawVariant,
        }
      : rawVariant;
  });

  const variants = variantSources.map(({ name }) => name);

  const scheme: ColorScheme<TN, PN, SN, VN, OK> = {
    get defaultTheme() {
      return themeNames[0];
    },
    get source() {
      return source;
    },
    get variants() {
      return variants;
    },
    get variantSources() {
      return variantSources;
    },
    get optionals() {
      return optionals;
    },
    get themes() {
      return themes;
    },
    get themeNames() {
      return themeNames;
    },
    get scopeNames() {
      return scopeNames;
    },
    get paletteNames() {
      return paletteNames;
    },
    get scopeResolvers() {
      return scopeResolvers;
    },
    toJSON(): ColorSchemeJSON<TN, PN, SN, VN, OK> {
      return {
        themes: themes.map((theme) => theme.toJSON()),
        variants: variants.slice(),
        themeNames: themeNames.slice(),
        paletteNames: paletteNames.slice(),
        scopeNames: scopeNames.slice(),
      };
    },
  };

  const themeSources = source.themes;

  themeSources.forEach((theme) => {
    (theme.palette as any) = [...(theme.palette || [])];
    (theme.scopes as any) = [...(theme.scopes || [])];

    const { name, palette = [], scopes = [] } = theme;

    if (!themeNames.includes(name)) themeNames.push(name);
    palette.forEach(([paletteName]) => {
      if (!paletteNames.includes(paletteName)) paletteNames.push(paletteName);
    });
    scopes.forEach(([scopeName]) => {
      if (!scopeNames.includes(scopeName)) scopeNames.push(scopeName);
    });
  });

  themeSources.forEach((theme) => {
    const { palette = [], scopes = [], scopeDefaults } = theme;
    if (!scopeDefaults) {
      for (const t of themeSources) {
        if (t === theme) continue;
        let td = t.scopeDefaults;
        if (td) {
          if (typeof td === 'object') {
            td = { ...td };
          }
          (theme as any).scopeDefaults = td;
        }
      }
    }

    paletteNames.forEach((paletteName) => {
      if (palette.find((p) => p[0] === paletteName)) return;
      for (const t of themeSources) {
        if (t === theme) continue;
        const tp = t.palette;
        if (!tp) continue;
        const hit = tp.find((_p) => _p[0] === paletteName);
        if (hit) {
          palette.push(hit);
          break;
        }
      }
    });
    scopeNames.forEach((scopeName) => {
      if (scopes.find((s) => s[0] === scopeName)) return;
      for (const t of themeSources) {
        if (t === theme) continue;
        const ts = t.scopes;
        if (!ts) continue;
        const hit = ts.find((_s) => _s[0] === scopeName);
        if (hit) {
          scopes.push(hit);
          break;
        }
      }
    });
    palette.sort((a, b) => {
      const an = a[0];
      const bn = b[0];
      const ai = paletteNames.indexOf(an);
      const bi = paletteNames.indexOf(bn);
      if (ai < bi) return -1;
      if (ai > bi) return 1;
      return 0;
    });
    scopes.sort((a, b) => {
      const an = a[0];
      const bn = b[0];
      const ai = scopeNames.indexOf(an);
      const bi = scopeNames.indexOf(bn);
      if (ai < bi) return -1;
      if (ai > bi) return 1;
      return 0;
    });
  });

  const themes = createThemeBucket(source.themes, { scheme });

  return scheme;
}
