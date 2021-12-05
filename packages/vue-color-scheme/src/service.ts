import { App, computed, inject, ref, Ref } from 'vue';
import { useHead } from '@vueuse/head';
import {
  PropKey,
  ColorSchemeProps,
  ColorSchemePropsOptions,
  ColorSchemeHooksProps,
  ColorClassesResult,
  VueColorSchemeServiceSettings,
} from './types';
import { ColorSchemeError } from './logger';
import { ThemeName } from '@fastkit/color-scheme';
import { VueColorSchemeServiceInjectionKey } from './injections';

export function useColorVariantClasses(props: ColorSchemeHooksProps) {
  const colorVariantClasses = computed(() => {
    const classes: string[] = [];
    const variant = resolveFnValue(props.variant);
    variant && classes.push(variant);
    return classes;
  });
  return colorVariantClasses;
}

export function useThemeClass(
  props: ColorSchemeHooksProps,
  useRootThemeDefault?: boolean,
) {
  let service: VueColorSchemeService | undefined;
  if (useRootThemeDefault) {
    service = useColorScheme();
  }
  const themeClass = computed(() => {
    let theme = resolveFnValue(props.theme);
    if (!theme && service) {
      theme = service.rootTheme as any;
    }
    return theme ? `${theme}-theme` : undefined;
  });
  return themeClass;
}

export function toScopeColorClass(name: string) {
  return `${name}-scope`;
}

export function useScopeColorClass(props: ColorSchemeHooksProps) {
  const scopeColorClass = computed(() => {
    const color = resolveFnValue(props.color);
    return color ? toScopeColorClass(color) : undefined;
  });
  return scopeColorClass;
}

export function toTextColorClass(name: string) {
  return `${name}-text`;
}

function resolveFnValue<T extends string>(value?: T | (() => T)) {
  return typeof value === 'function' ? value() : value;
}

export function useTextColorClass(props: ColorSchemeHooksProps) {
  const textColorClass = computed(() => {
    const textColor = resolveFnValue(props.textColor);
    return textColor ? toTextColorClass(textColor) : undefined;
  });
  return textColorClass;
}

export function useBorderColorClass(props: ColorSchemeHooksProps) {
  const borderColorClass = computed(() => {
    const borderColor = resolveFnValue(props.borderColor);
    return borderColor ? `${borderColor}-border` : undefined;
  });
  return borderColorClass;
}

export function useColorClasses(
  props: ColorSchemeHooksProps,
  opts: {
    useRootThemeDefault?: boolean;
  } = {},
): ColorClassesResult {
  const themeClass = useThemeClass(props, opts.useRootThemeDefault);
  const scopeColorClass = useScopeColorClass(props);
  const textColorClass = useTextColorClass(props);
  const borderColorClass = useBorderColorClass(props);
  const colorVariantClasses = useColorVariantClasses(props);

  const colorClasses = computed(() => {
    const classes = [
      themeClass,
      scopeColorClass,
      textColorClass,
      borderColorClass,
      colorVariantClasses,
    ]
      .map((c) => c.value)
      .filter((c) => !!c) as string[];
    return classes;
  });
  return {
    themeClass,
    scopeColorClass,
    textColorClass,
    borderColorClass,
    colorVariantClasses,
    colorClasses,
  };
}

export function useColorScheme() {
  const $color = inject(VueColorSchemeServiceInjectionKey);
  if (!$color) throw new ColorSchemeError('missing provided color scheme');
  return $color;
}

export function useInjectTheme() {
  const $color = useColorScheme();
  const htmlClass = computed(() => `${$color.rootTheme}-theme`);
  useHead({
    htmlAttrs: {
      class: htmlClass,
    },
  });
  return $color;
}

export function colorSchemeProps<
  ThemeProp extends PropKey = 'theme',
  ScopeProp extends PropKey = 'color',
  TextColorProp extends PropKey = 'textColor',
  BorderColorProp extends PropKey = 'borderColor',
  Props = ColorSchemeProps<
    ThemeProp,
    ScopeProp,
    TextColorProp,
    BorderColorProp
  >,
>(
  opts: ColorSchemePropsOptions<
    ThemeProp,
    ScopeProp,
    TextColorProp,
    BorderColorProp
  > = {},
) {
  const {
    theme = 'theme',
    color = 'color',
    textColor = 'textColor',
    borderColor = 'borderColor',
  } = opts;
  const props = {
    variant: String,
  } as unknown as Props;
  if (theme) (props as any)[theme] = String;
  if (color) (props as any)[color] = String;
  if (textColor) (props as any)[textColor] = String;
  if (borderColor) (props as any)[borderColor] = String;
  return props;
}

export class VueColorSchemeService {
  readonly _scheme: VueColorSchemeServiceSettings;
  private _rootTheme: Ref<ThemeName>;

  get scheme() {
    return this._scheme;
  }

  get defaultTheme() {
    return this._scheme.defaultTheme;
  }

  get themeNames() {
    return this._scheme.themeNames;
  }

  get paletteNames() {
    return this._scheme.paletteNames;
  }

  get scopeNames() {
    return this._scheme.scopeNames;
  }

  get rootTheme() {
    return this._rootTheme.value;
  }

  set rootTheme(rootTheme) {
    this._rootTheme.value = rootTheme;
  }

  constructor(scheme: VueColorSchemeServiceSettings) {
    this._scheme = scheme;
    this._rootTheme = ref(this.defaultTheme);
  }

  provide(app: App) {
    app.provide(VueColorSchemeServiceInjectionKey, this);
  }
}
