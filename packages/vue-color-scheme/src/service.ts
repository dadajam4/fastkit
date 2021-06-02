import { App, computed, inject, ref, Ref } from 'vue';
import { useHead } from '@vueuse/head';
import {
  ColorSchemeVariant,
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
    const { contained, outlined, plain, defaultVariant } = props;
    let variant: ColorSchemeVariant | undefined;
    if (contained) {
      variant = 'contained';
    } else if (outlined) {
      variant = 'outlined';
    } else if (plain) {
      variant = 'plain';
    } else if (defaultVariant) {
      variant = defaultVariant;
    }
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
    let { theme } = props;
    if (!theme && service) {
      theme = service.rootTheme as any;
    }
    return theme ? `${theme}-theme` : undefined;
  });
  return themeClass;
}

export function useScopeColorClass(props: ColorSchemeHooksProps) {
  const scopeColorClass = computed(() => {
    const { color } = props;
    return color ? `${color}` : undefined;
  });
  return scopeColorClass;
}

export function useTextColorClass(props: ColorSchemeHooksProps) {
  const textColorClass = computed(() => {
    const { textColor } = props;
    return textColor ? `${textColor}-text` : undefined;
  });
  return textColorClass;
}

export function useBorderColorClass(props: ColorSchemeHooksProps) {
  const borderColorClass = computed(() => {
    const { borderColor } = props;
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
    defaultScope,
    defaultVariant,
  } = opts;
  const props = {
    contained: Boolean,
    outlined: Boolean,
    plain: Boolean,
    defaultVariant: {
      type: String,
      default: defaultVariant || undefined,
    },
  } as unknown as Props;
  if (theme) (props as any)[theme] = String;
  if (color)
    (props as any)[color] = {
      type: String,
      default: defaultScope,
    };
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
