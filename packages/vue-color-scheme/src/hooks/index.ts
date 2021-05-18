import { computed, inject, ComputedRef } from 'vue';
import { useHead } from '@vueuse/head';
import {
  ThemeName,
  ScopeName,
  PaletteName,
  ColorSchemeVariant,
} from '../types';
import { VueColorSchemeInjectionKey } from '../plugin';
import { ColorSchemeError } from '../logger';

export interface ColorSchemeHooksProps {
  readonly theme?: ThemeName;
  readonly color?: ScopeName;
  readonly textColor?: PaletteName;
  readonly borderColor?: PaletteName;
  readonly contained?: boolean;
  readonly outlined?: boolean;
  readonly plain?: boolean;
  readonly defaultVariant?: ColorSchemeVariant;
}

export function useColorVariantClasses(ctx: ColorSchemeHooksProps) {
  const colorVariantClasses = computed(() => {
    const classes: string[] = [];
    const { contained, outlined, plain, defaultVariant } = ctx;
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

export function useThemeClass(ctx: ColorSchemeHooksProps) {
  const themeClass = computed(() => {
    const { theme } = ctx;
    return theme ? `${theme}-theme` : undefined;
  });
  return themeClass;
}

export function useScopeColorClass(ctx: ColorSchemeHooksProps) {
  const scopeColorClass = computed(() => {
    const { color } = ctx;
    return color ? `${color}` : undefined;
  });
  return scopeColorClass;
}

export function useTextColorClass(ctx: ColorSchemeHooksProps) {
  const textColorClass = computed(() => {
    const { textColor } = ctx;
    return textColor ? `${textColor}-text` : undefined;
  });
  return textColorClass;
}

export function useBorderColorClass(ctx: ColorSchemeHooksProps) {
  const borderColorClass = computed(() => {
    const { borderColor } = ctx;
    return borderColor ? `${borderColor}-border` : undefined;
  });
  return borderColorClass;
}

export interface ColorClassesControl {
  themeClass: ComputedRef<string | undefined>;
  scopeColorClass: ComputedRef<string | undefined>;
  textColorClass: ComputedRef<string | undefined>;
  borderColorClass: ComputedRef<string | undefined>;
  colorVariantClasses: ComputedRef<string[]>;
  colorClasses: ComputedRef<string[]>;
}

export function useColorClasses(
  ctx: ColorSchemeHooksProps,
): ColorClassesControl {
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
    colorVariantClasses,
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
