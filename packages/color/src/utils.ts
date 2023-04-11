import {
  ColorModelInfo,
  AngleType,
  ColorSource,
  ColorInfo,
  RawMixOptions,
  MixOptions,
} from './schemes';
import { w3cx11 } from './colors/w3cx11';
import { ColorError } from './error';

function createLimiter(max: number, min = 0) {
  return function limiter(value: number) {
    if (value < min) {
      value = min;
    } else if (value > max) {
      value = max;
    }
    return value;
  };
}

export const rgbValueLimiter = createLimiter(255);

export const perValueLimiter = createLimiter(1);

export function rgbLimitation(r: number, g: number, b: number) {
  r = rgbValueLimiter(r);
  g = rgbValueLimiter(g);
  b = rgbValueLimiter(b);
  return [r, g, b];
}

export function hslLimitation(h: number, s: number, l: number) {
  h = h % 360;
  s = perValueLimiter(s);
  l = perValueLimiter(l);
  return [h, s, l];
}

export function toHexChunk(source: number) {
  return (source | (1 << 8)).toString(16).slice(1);
}

export function hsl2rgb(
  h: number,
  s: number,
  l: number,
): [number, number, number] {
  let r: number, g: number, b: number, max: number, min: number;

  h = h % 360;

  if (l < 0.5) {
    max = l + l * s;
    min = l - l * s;
  } else {
    max = l + (1 - l) * s;
    min = l - (1 - l) * s;
  }

  const hp = 360 / 6;
  const q = h / hp;
  if (q <= 1) {
    r = max;
    g = (h / hp) * (max - min) + min;
    b = min;
  } else if (q <= 2) {
    r = ((hp * 2 - h) / hp) * (max - min) + min;
    g = max;
    b = min;
  } else if (q <= 3) {
    r = min;
    g = max;
    b = ((h - hp * 2) / hp) * (max - min) + min;
  } else if (q <= 4) {
    r = min;
    g = ((hp * 4 - h) / hp) * (max - min) + min;
    b = max;
  } else if (q <= 5) {
    r = ((h - hp * 4) / hp) * (max - min) + min;
    g = min;
    b = max;
  } else {
    r = max;
    g = min;
    b = ((360 - h) / hp) * (max - min) + min;
  }

  return [r * 255, g * 255, b * 255];
}

export function rgb2hsl(
  r: number,
  g: number,
  b: number,
): [number, number, number] {
  r = r / 255;
  g = g / 255;
  b = b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;

  let h = 0;
  const l = (max + min) / 2;
  const tmp = 1 - Math.abs(max + min - 1);
  const s = tmp === 0 ? 0 : diff / tmp;

  switch (min) {
    case max:
      h = 0;
      break;
    case r:
      h = 60 * ((b - g) / diff) + 180;
      break;
    case g:
      h = 60 * ((r - b) / diff) + 300;
      break;
    case b:
      h = 60 * ((g - r) / diff) + 60;
      break;
  }
  return [h, s, l];
}

/**
 * Regular expression instance for extracting HEX(A) color information from a specified string
 *
 * - "#f09"
 * - "#F09"
 * - "#ff0099"
 * - "#f09f"
 * - "#FF0099FF"
 */
const hexMatchRe = /^#([0-9a-f]{3,8})$/;

const hexExtractRe =
  /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})?/i;

/**
 * Regular expression instance for extracting RGB(A) color information from a specified string
 *
 * @example
 * ## Inputs
 * - "rgb(255,0,153)"
 * - "rgb(255.0,0.1,.1)"
 * - "rgb(255, 0, 153.0)"
 * - "rgb(100%,0%,60%)"
 * - "rgb(100%, 0%, 60%)"
 * - "rgb(255, 0, 153, 1)"
 * - "rgb(255, 0, 153, 100%)"
 * - "rgb(255 0 153 / 1)"
 * - "rgb(255 0 153 / 100%)"
 *
 * ## Outputs
 * 1 - model: "rgb" | "rgba"
 * 2 - red: "255" | "100%" | "255.0" | "0.1" | ".1" | ".1%" | "-255.0" | "-.1%"
 * 3 - green: "255" | "100%" | "255.0" | "0.1" | ".1" | ".1%" | "-255.0" | "-.1%"
 * 4 - blue: "255" | "100%" | "255.0" | "0.1" | ".1" | ".1%" | "-255.0" | "-.1%"
 * 7 - alpha: ".1" | "0.1" | "10%" | ".1%" | "0.1%" | "10.0%"
 */
const rgbMatchRe =
  /^(rgba?)\(\s*(-?[\d]*\.?\d+%?)[,\s]\s*(-?[\d]*\.?\d+%?)[,\s]\s*(-?[\d]*\.?\d+%?)\s*((,|\/)\s*([\d]*\.?\d+%?))?\s*\)$/;

/**
 * Regular expression instance for extracting HSL(A) color information from a specified string
 *
 * @example
 * ## Inputs
 * - "hsl(270,60%,70%)"
 * - "hsl(270deg,60%,70%)"
 * - "hsl(270, 60%, 50%, .15)"
 * - "hsl(270, 60%, 50%, 15%)"
 * - "hsl(270 60% 50% / .15)"
 * - "hsl(270 60% 50% / 15%)"
 * - "hsl(4.71239rad, 60%, 70%)"
 * - "hsl(.75turn, 60%, 70%)"
 *
 * ## Outputs
 * 1 - model: "hsla" | "hsla"
 * 2 - hue: "180" | "180.5" "180deg" | "1rad" | "-180" | "4.71239" | "-4.71239"
 * 3 - hue unit: "deg" | "rad" | "grad" | "turn"
 * 4 - saturation: "255" | "100%" | "255.0" | "0.1" | ".1" | ".1%" | "-255.0" | "-.1%"
 * 5 - lightness: "255" | "100%" | "255.0" | "0.1" | ".1" | ".1%" | "-255.0" | "-.1%"
 * 8 - alpha: ".1" | "0.1" | "10%" | ".1%" | "0.1%" | "10.0%"
 */
const hslMatchRe =
  /^(hsla?)\(\s*(-?[\d]*\.?\d+(deg|rad|grad|turn)?)[,\s]\s*(-?[\d]*\.?\d+%?)[,\s]\s*(-?[\d]*\.?\d+%?)\s*((,|\/)\s*([\d]*\.?\d+%?))?\s*\)$/;

const hueMatchRe = /^(-?[\d]*\.?\d+)(deg|rad|grad|turn)?$/;

export function parseHue2deg(hue: string | number) {
  if (typeof hue === 'number') return hue;
  const match = hue.match(hueMatchRe);
  if (!match) {
    throw new ColorError(`Invalid hue format: ${hue}`);
  }
  const _h = match[1];
  const _u = (match[2] || 'deg') as AngleType;
  let h = parseFloat(_h);
  if (_u === 'grad') {
    h = grad2degree(h);
  } else if (_u === 'rad') {
    h = radian2degree(h);
  } else if (_u === 'turn') {
    h = turn2degree(h);
  }
  h = h % 360;
  return h;
}

/**
 * Normalizes an ambiguous hex color string
 * @param hex - hex color string ex. `#0fa`, `#0FA`,`#00ffaa`, (with alpha) `#0fa9`
 * @returns rounded hex color string ex. `#00ffaa`, (with alpha) `#00ffaa99`
 */
function createRoundedHex(hex: string): string {
  hex = hex.toLowerCase();
  if (hex.length > 5) return hex;
  return (
    '#' +
    hex
      .replace('#', '')
      .split('')
      .map((s) => s.repeat(2))
      .join('')
  );
}

function resolveString(source: string, max: number) {
  let value = parseFloat(source);
  if (source.endsWith('%')) {
    value = (value * max) / 100;
  }
  return value;
}

function radian2degree(radian: number) {
  return radian * (180 / Math.PI);
}

// function degree2radian(degree: number) {
//   return degree * (Math.PI / 180);
// }

function grad2degree(grad: number) {
  return (grad / 400) * 360;
}

// function degree2grad(degree: number) {
//   return (degree / 360) * 400;
// }

function turn2degree(turn: number) {
  return turn * 360;
}

// function degree2turn(degree: number) {
//   return degree / 360;
// }

function hex2rgba(source: string): [number, number, number, number] {
  const match = source.match(hexExtractRe);
  if (!match) {
    throw new ColorError(`Invalid HEX format: ${source}`);
  }
  const _r = match[1];
  const _g = match[2];
  const _b = match[3];
  const _a = match[4];
  return [
    parseInt(_r, 16),
    parseInt(_g, 16),
    parseInt(_b, 16),
    _a == null ? 1 : parseInt(_a, 16) / 255,
  ];
}

export function parseColorString(
  source: string,
): ColorModelInfo & { hex?: string } {
  const _source = source.toLowerCase().trim();
  if (_source === 'transparent') {
    return {
      model: 'rgb',
      channels: [0, 0, 0, 0],
    };
  }
  const x11 = w3cx11[_source as keyof typeof w3cx11];
  let hex: string | undefined = x11;
  if (!hex) {
    const hexMatch = x11 || _source.match(hexMatchRe);
    if (hexMatch) {
      hex = createRoundedHex(_source);
    }
  }
  if (hex) {
    const hex = createRoundedHex(_source);
    const rgba = hex2rgba(hex);
    return {
      model: 'rgb',
      hex,
      channels: rgba,
    };
  }

  const rgbMatch = _source.match(rgbMatchRe);
  if (rgbMatch) {
    const _r = rgbMatch[2];
    const _g = rgbMatch[3];
    const _b = rgbMatch[4];
    const _a = rgbMatch[7];
    const r = resolveString(_r, 255);
    const g = resolveString(_g, 255);
    const b = resolveString(_b, 255);
    const a = _a == null ? 1 : resolveString(_a, 1);
    return {
      model: 'rgb',
      channels: [r, g, b, a],
    };
  }
  const hslMatch = _source.match(hslMatchRe);
  if (hslMatch) {
    const _h = hslMatch[2];
    const _s = hslMatch[4];
    const _l = hslMatch[5];
    const _a = hslMatch[8];

    const h = parseHue2deg(_h);
    const s = resolveString(_s, 1);
    const l = resolveString(_l, 1);
    const a = _a == null ? 1 : resolveString(_a, 1);
    return {
      model: 'hsl',
      channels: [h, s, l, a],
    };
  }

  throw new ColorError(`Invalid color format: ${source}`);
}

/**
 * Returns the hex color string from the rgba information
 * @param r - red 0 to 255
 * @param g - green 0 to 255
 * @param b - blue 0 to 255
 * @param a - alpha 0 to 1
 * @returns hex color string ex. `#00fe6e` (with alpha < 1 ex. `#00fe6e89`)
 */
export function rgba2hex(r: number, g: number, b: number, a = 1): string {
  let result = `#${toHexChunk(r)}${toHexChunk(g)}${toHexChunk(b)}`;
  if (a < 1) {
    result += toHexChunk(Math.round(a * 255));
  }
  return result;
}

export function maybeRGB<T extends ColorSource>(
  source: T,
): source is T & { r?: number; g?: number; b?: number; a?: number } {
  return (
    typeof source === 'object' &&
    ('r' in source || 'g' in source || 'b' in source)
  );
}

export function maybeHSL<T extends ColorSource>(
  source: T,
): source is T & { h?: number; s?: number; l?: number; a?: number } {
  return (
    typeof source === 'object' &&
    ('h' in source || 's' in source || 'l' in source)
  );
}

export function parseColorSource(source?: ColorSource): ColorInfo {
  let rgbResolved = false;
  let hslResolved = false;
  let hex: string | undefined;
  let r = 0;
  let g = 0;
  let b = 0;
  let h = 0;
  let s = 0;
  let l = 0;
  let a = 1;

  if (Array.isArray(source)) {
    [r, g, b, a = a] = source;
    rgbResolved = true;
  } else if (typeof source === 'object') {
    if ('info' in source && typeof source.info === 'function') {
      return source.info();
    }
    if ('model' in source) {
      const { model, channels } = source;
      if (model === 'rgb') {
        [r, g, b, a] = channels;
        rgbResolved = true;
      } else if (model === 'hsl') {
        [h, s, l, a] = channels;
        hslResolved = true;
      }
    } else {
      if ('a' in source) {
        a = source.a == null ? a : source.a;
      }
      if (maybeRGB(source)) {
        g = source.g == null ? g : source.g;
        b = source.b == null ? b : source.b;
        r = source.r == null ? r : source.r;
        rgbResolved = true;
      } else if (maybeHSL(source)) {
        h = source.h == null ? h : source.h;
        s = source.s == null ? s : source.s;
        l = source.l == null ? l : source.l;
        hslResolved = true;
      }
    }
  } else if (typeof source === 'string') {
    const { model, channels, hex: _hex } = parseColorString(source);
    if (model === 'hsl') {
      [h, s, l, a] = channels;
      hslResolved = true;
    } else {
      [r, g, b, a] = channels;
      rgbResolved = true;
      if (_hex) hex = _hex;
    }
  }

  [r, g, b] = rgbLimitation(r, g, b);
  [h, s, l] = hslLimitation(h, s, l);
  a = perValueLimiter(a);

  if (!rgbResolved) {
    [r, g, b] = hsl2rgb(h, s, l);
  }
  if (!hslResolved) {
    [h, s, l] = rgb2hsl(r, g, b);
  }

  if (!hex) {
    hex = rgba2hex(r, g, b, a);
  }

  const rgbStr = `${r},${g},${b}`;
  const rgb = `rgb(${rgbStr})`;
  const rgba = `rgba(${rgbStr},${a})`;
  const hslStr = `${h},${s * 100}%,${l * 100}%`;
  const hsl = `hsl(${hslStr})`;
  const hsla = `hsla(${hslStr},${a})`;

  return {
    r,
    g,
    b,
    h,
    s,
    l,
    a,
    hex,
    rgb,
    rgba,
    hsl,
    hsla,
  };
}

export function resolveMixOptions(options?: RawMixOptions): MixOptions {
  if (typeof options === 'number') {
    options = {
      per: options,
    };
  }

  return {
    model: 'rgb',
    per: 0.5,
    ...options,
  };
}

const modelKeys = {
  rgb: ['r', 'g', 'b', 'a'] as const,
  hsl: ['h', 's', 'l', 'a'] as const,
};

type ModelValueKey =
  | (typeof modelKeys)['rgb'][number]
  | (typeof modelKeys)['hsl'][number];

export function mixColorSource(
  baseSource: ColorSource,
  mixSource: ColorSource,
  options?: RawMixOptions,
): ColorInfo {
  const { per, model } = resolveMixOptions(options);
  if (per === 0) {
    return parseColorSource(baseSource);
  } else if (per === 1) {
    return parseColorSource(mixSource);
  }

  const baseColor = parseColorSource(baseSource);
  const mixColor = parseColorSource(mixSource);
  const channels = modelKeys[model].map((key: ModelValueKey) => {
    const baseValue = baseColor[key];
    const mixValue = mixColor[key];
    if (mixValue === undefined) return baseValue;

    const baseIsLarge = baseValue > mixValue;
    const diff = baseIsLarge ? baseValue - mixValue : mixValue - baseValue;
    const ammount = diff * per * (baseIsLarge ? -1 : 1);
    const mixedValue = baseValue + ammount;
    return mixedValue;
  }) as [number, number, number, number];
  return parseColorSource({
    model,
    channels,
  });
}

/**
 * Returns color information with the specified color brightened by the specified ratio.
 * @param source - Source for generating color information
 * @param per - Percentage (Max: `1`) The opposite effect can be achieved by specifying a negative value.
 * @returns Color information
 */
export function lighten(source: ColorSource, per: number): ColorInfo {
  const info = parseColorSource(source);
  let { r, g, b } = info;
  const amount = 255 * per;
  r += amount;
  g += amount;
  b += amount;
  return parseColorSource([r, g, b, info.a]);
}

/**
 * Returns color information for a specified color, darkened by a specified ratio.
 * @param source - Source for generating color information
 * @param per - Percentage (Max: `1`) The opposite effect can be achieved by specifying a negative value.
 * @returns Color information
 */
export function darken(source: ColorSource, per: number): ColorInfo {
  return lighten(source, -per);
}

/**
 * @returns The HSP brightness value (dark) 0 ... 1 (light)
 */
export function brightness(source: ColorSource) {
  const { r, g, b } = parseColorSource(source);
  return (r * 299 + g * 587 + b * 114) / 1000 / 255;
}

/**
 * Get HWB whiteness
 * @TODO comment
 */
export function whiteness(source: ColorSource) {
  const { r, g, b } = parseColorSource(source);
  return Math.min(r, g, b) / 255;
}

/**
 * Get HSV brightness
 * @TODO comment
 */
export function hsvValue(source: ColorSource) {
  const { r, g, b } = parseColorSource(source);
  return Math.max(r, g, b) / 255;
}

/**
 * Get HWB blackness
 * @TODO comment
 */
export function blackness(source: ColorSource) {
  const value = hsvValue(source);
  return 1 - value;
}

/**
 * Creates a more saturated color of color with an amount between 0 and 1. The amount parameter increases the HSL saturation by that percent.
 * @param source - Source for generating color information
 * @param per - Percentage (Max: `1`) The opposite effect can be achieved by specifying a negative value.
 * @returns Color information
 */
export function saturate(source: ColorSource, per: number): ColorInfo {
  const info = parseColorSource(source);
  const { h, s, l, a } = info;
  return parseColorSource({ h, s: s + per, l, a });
}

/**
 * Creates a less saturated color of color with an amount between 0 and 1. The amount parameter decreases the HSL saturation by that percent.
 * @param source - Source for generating color information
 * @param per - Percentage (Max: `1`) The opposite effect can be achieved by specifying a negative value.
 * @returns Color information
 */
export function desaturate(source: ColorSource, per: number): ColorInfo {
  return saturate(source, -per);
}
