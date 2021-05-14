import { computed, inject } from 'vue';
import { useHead } from '@vueuse/head';
import { ThemeName, ScopeName, PaletteName } from '../types';
import { VueColorSchemeInjectionKey } from '../plugin';
import { ColorSchemeError } from '../logger';

export interface ColorSchemeHooksContext {
  readonly theme?: ThemeName;
  readonly color?: ScopeName;
  readonly textColor?: PaletteName;
  readonly borderColor?: PaletteName;
  readonly contained?: boolean;
  readonly outlined?: boolean;
  readonly plain?: boolean;
}

export function useColorVariantClasses(ctx: ColorSchemeHooksContext) {
  const colorVariantClasses = computed(() => {
    const classes: string[] = [];
    const { contained, outlined, plain } = ctx;
    (contained || (!outlined && !plain)) && classes.push('contained');
    outlined && classes.push('outlined');
    plain && classes.push('plain');
    return classes;
  });
  return colorVariantClasses;
}

export function useThemeClass(ctx: ColorSchemeHooksContext) {
  const themeClass = computed(() => {
    const { theme } = ctx;
    return theme ? `${theme}-theme` : undefined;
  });
  return themeClass;
}

export function useScopeColorClass(ctx: ColorSchemeHooksContext) {
  const scopeColorClass = computed(() => {
    const { color } = ctx;
    return color ? `${color}` : undefined;
  });
  return scopeColorClass;
}

export function useTextColorClass(ctx: ColorSchemeHooksContext) {
  const textColorClass = computed(() => {
    const { textColor } = ctx;
    return textColor ? `${textColor}-text` : undefined;
  });
  return textColorClass;
}

export function useBorderColorClass(ctx: ColorSchemeHooksContext) {
  const borderColorClass = computed(() => {
    const { borderColor } = ctx;
    return borderColor ? `${borderColor}-border` : undefined;
  });
  return borderColorClass;
}

export function useColorClasses(ctx: ColorSchemeHooksContext) {
  const themeClass = useThemeClass(ctx);
  const scopeColorClass = useScopeColorClass(ctx);
  const textColorClass = useTextColorClass(ctx);
  const borderColorClass = useBorderColorClass(ctx);
  const colorVariantClasses = useColorVariantClasses(ctx);

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
    colorClasses,
  };
}

export function useColorScheme() {
  const $color = inject(VueColorSchemeInjectionKey);
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
