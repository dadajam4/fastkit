export type RGBArray =
  | [number, number, number]
  | [number, number, number, number];

/**
 * RGB color values
 */
export interface RGB {
  /**
   * red 0 to 255
   */
  r: number;

  /**
   * green 0 to 255
   */
  g: number;

  /**
   * blue 0 to 255
   */
  b: number;
}

/**
 * RGBA color values
 */
export interface RGBA extends RGB {
  /**
   * alpha 0 to 1
   */
  a: number;
}

/**
 * HSL color values
 */
export interface HSL {
  /**
   * hue 0 to 360
   */
  h: number;

  /**
   * saturation 0 to 1
   */
  s: number;

  /**
   * lightness 0 to 1
   */
  l: number;
}

/**
 * HSLA color values
 */
export interface HSLA extends HSL {
  /**
   * alpha 0 to 1
   */
  a: number;
}

// /**
//  * Color information to blend. Object (RGBA | HSLA) | Color String | Alpha(0 to 1)
//  */
// export type MixAmmount = Partial<RGBA> | Partial<HSLA> | string | number;

/**
 * Color information
 */
export interface ColorInfo extends RGB, HSL {
  /**
   * alpha 0 to 1
   */
  a: number;

  /**
   * HEX color string ex. `#00fe63`, (with alpha &lt; 1) `#00fe6399`
   */
  hex: string;

  /**
   * RGB color string ex. `rgba(100,255,92)`
   */
  rgb: string;

  /**
   * RGBA color string ex. `rgba(100,255,92,0.2)`
   */
  rgba: string;

  /**
   * HSL color string ex. `hsl(180,100%,50%)`
   */
  hsl: string;

  /**
   * HSLA color string ex. `hsla(180,100%,50%,0.2)`
   */
  hsla: string;
}

export interface ColorImplements {
  info(): ColorInfo;
}

export type ColorModel = 'rgb' | 'hsl';

export interface ColorModelInfo {
  model: ColorModel;
  // hex?: string;
  channels: [number, number, number, number];
}

/**
 * Source for generating color information
 * - RGB(A) Array `[red, green, blue(, alpha)]` {@link RGBArray}
 * - Color model information object {@link ColorModelInfo}
 * - RGBA(A) Object `{ r: red, g: green, b: blue, a?: alpha}` {@link RGBA}
 * - HSL(A) Object `{ h: hue, s: saturation, l: lightness, a?: alpha}` {@link HSLA}
 * - Color information object {@link ColorInfo}
 * - Color string HEX | RGB(A) | HSL(A) | W3C X11 Color Name
 */
export type ColorSource =
  | RGBArray
  | ColorModelInfo
  | Partial<RGBA>
  | Partial<HSLA>
  | ColorInfo
  | ColorImplements
  | string;

/**
 * {@link https://developer.mozilla.org/ja/docs/Web/CSS/angle}
 */
export type AngleType = 'deg' | 'rad' | 'grad' | 'turn';

export interface MixOptions {
  per: number;
  model: ColorModel;
}

export type RawMixOptions = Partial<MixOptions> | number;
