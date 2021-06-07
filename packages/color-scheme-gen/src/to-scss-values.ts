import { ColorScheme, COLOR_SCOPE_DEFAULTS_KEYS } from '@fastkit/color-scheme';

export function toScssValues(scheme: ColorScheme<any, any, any, any>): string {
  const rows: string[] = [];
  const { themes } = scheme;

  rows.push('$themes: (');
  themes.forEach(({ name: themeName, palette, scopeDefaults = {}, scopes }) => {
    rows.push(`  ${themeName}: (`);
    rows.push(`    name: '${themeName}',`);

    rows.push(`    palette: (`);
    palette.forEach(({ name: paletteName, value }) => {
      rows.push(`      ${paletteName}: ${value.toString()},`);
    });
    rows.push(`    ),`);

    rows.push(`    scope-defaults: (`);
    COLOR_SCOPE_DEFAULTS_KEYS.forEach((key) => {
      const defaultScope = scopeDefaults[key];
      if (!defaultScope) return;
      rows.push(`      ${key}: (`);
      const json = defaultScope.toJSON();
      Object.entries(json).forEach(([key, value]) => {
        if (value) {
          rows.push(`        ${key}: ${value},`);
        }
      });
      rows.push(`      ),`);
    });
    rows.push(`    ),`);

    rows.push(`    scopes: (`);
    scopes.forEach((scope) => {
      const json = scope.toJSON();
      rows.push(`      ${json.name}: (`);
      rows.push(`        name: '${json.name}',`);
      rows.push(`        main: ${json.main},`);
      Object.entries(json).forEach(([key, value]) => {
        if (['name', 'main'].includes(key) || !value) return;
        rows.push(`        ${key}: ${value},`);
      });
      rows.push(`      ),`);
    });
    rows.push(`    ),`);

    rows.push(`  ),`);
  });
  rows.push(`);`);

  return rows.join('\n');
}
