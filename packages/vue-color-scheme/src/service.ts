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
  const result = computed(() => {
    const value = resolveFnValue(props.variant);
    const className = value ? value : undefined;
    return {
      value,
      className,
    };
  });
  return result;
}

export function useThemeClass(
  props: ColorSchemeHooksProps,
  useRootThemeDefault?: boolean,
) {
  let service: VueColorSchemeService | undefined;
  if (useRootThemeDefault) {
    service = useColorScheme();
  }
  const result = computed(() => {
    let value = resolveFnValue(props.theme);
    if (!value && service) {
      value = service.rootTheme as any;
    }
    const className = value ? `${value}-theme` : undefined;
    return {
      value,
      className,
    };
  });
  return result;
}

export function toScopeColorClass(name: string) {
  return `${name}-scope`;
}

export function useScopeColorClass(props: ColorSchemeHooksProps) {
  const result = computed(() => {
    const value = resolveFnValue(props.color);
    const className = value ? toScopeColorClass(value) : undefined;
    return {
      value,
      className,
    };
  });
  return result;
}

export function toTextColorClass(name: string) {
  return `${name}-text`;
}

function resolveFnValue<T extends string>(value?: T | (() => T | undefined)) {
  return typeof value === 'function' ? value() : value;
}

export function useTextColorClass(props: ColorSchemeHooksProps) {
  const result = computed(() => {
    const value = resolveFnValue(props.textColor);
    const className = value ? toTextColorClass(value) : undefined;
    return {
      value,
      className,
    };
  });
  return result;
}

export function useBorderColorClass(props: ColorSchemeHooksProps) {
  const result = computed(() => {
    const value = resolveFnValue(props.borderColor);
    const className = value ? `${value}-border` : undefined;
    return {
      value,
      className,
    };
  });
  return result;
}

export function useColorClasses(
  props: ColorSchemeHooksProps,
  opts: {
    useRootThemeDefault?: boolean;
  } = {},
): ColorClassesResult {
  const theme = useThemeClass(props, opts.useRootThemeDefault);
  const color = useScopeColorClass(props);
  const textColor = useTextColorClass(props);
  const borderColor = useBorderColorClass(props);
  const variant = useColorVariantClasses(props);

  const colorClasses = computed(() => {
    const classes = [theme, color, textColor, borderColor, variant]
      .map((c) => c.value.className)
      .filter((c) => !!c) as string[];
    return classes;
  });
  return {
    theme,
    color,
    textColor,
    borderColor,
    variant,
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
