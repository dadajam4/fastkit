import {
  RGBA,
  HSLA,
  ColorImplements,
  ColorSource,
  ColorInfo,
  RawMixOptions,
} from './schemes';
import {
  parseHue2deg,
  parseColorSource,
  mixColorSource,
  maybeRGB,
  maybeHSL,
  resolveMixOptions,
  brightness,
  lighten,
  darken,
  whiteness,
  hsvValue,
  blackness,
  saturate,
  desaturate,
} from './utils';

export interface ColorOptions {
  effectState?: (state: ColorInfo) => ColorInfo;
}

export class Color implements ColorImplements {
  private _state: ColorInfo = {} as unknown as ColorInfo;

  get state() {
    return this._state;
  }

  constructor(source?: ColorSource, opts: ColorOptions = {}) {
    this.set(source);
    if (opts.effectState) {
      this._state = opts.effectState(this._state);
    }
  }

  set(source?: ColorSource) {
    this._setInfo(parseColorSource(source));
  }

  /**
   * Get red value (0 to 255)
   */
  red(): number;
  /**
   * Set red value
   * @param r - red (0 to 255)
   */
  red(r: number): this;
  red(r?: number): number | this {
    const state = this._state;
    if (r === undefined) return state.r;
    if (state.r !== r) {
      this.set([r, state.g, state.b, state.a]);
    }
    return this;
  }

  /**
   * Get green value (0 to 255)
   */
  green(): number;
  /**
   * Set green value
   * @param r - green (0 to 255)
   */
  green(g: number): this;
  green(g?: number): number | this {
    const state = this._state;
    if (g === undefined) return state.g;
    if (state.g !== g) {
      this.set([state.r, g, state.b, state.a]);
    }
    return this;
  }

  /**
   * Get blue value (0 to 255)
   */
  blue(): number;
  /**
   * Set blue value
   * @param r - blue (0 to 255)
   */
  blue(b: number): this;
  blue(b?: number): number | this {
    const state = this._state;
    if (b === undefined) return state.b;
    if (state.b !== b) {
      this.set([state.r, state.g, b, state.a]);
    }
    return this;
  }

  /**
   * Returns the HSL hue of color between -360 and 360deg
   */
  hue(): number;
  /**
   * Set the HSL hue of color
   * @param h - hue between `-360deg and 360deg` or `xxx` or `xxx` or `xxx`
   */
  hue(deg: number): this;
  /**
   * Set the HSL hue of color
   * @param h - hue between `-360deg and 360deg` or `-6.283185307179586rad and 6.283185307179586rad` or `-400grad and 400grad` or `-1turn and 1turn`
   */
  hue(hue: string): this;
  hue(hue?: number | string) {
    const state = this._state;
    if (hue === undefined) return state.h;
    const h = parseHue2deg(hue);
    if (state.h !== h) {
      this.set({ h, s: state.s, l: state.l, a: state.a });
    }
    return this;
  }

  /**
   * Returns the HSL saturation of color (dull) 0 ... 1 (light)
   */
  saturation(): number;
  /**
   * Set the HSL saturation of color
   * @param s - saturation (0 to 1)
   */
  saturation(s: number): this;
  saturation(s?: number) {
    const state = this._state;
    if (s === undefined) return state.s;
    if (state.s !== s) {
      this.set({ h: state.h, s, l: state.l, a: state.a });
    }
    return this;
  }

  /**
   * Returns the HSL lightness of color (dark) 0 ... 1 (vivid)
   */
  lightness(): number;
  /**
   * Set the HSL lightness of color
   * @param l - lightness (0 to 1)
   */
  lightness(l: number): this;
  lightness(l?: number) {
    const state = this._state;
    if (l === undefined) return state.l;
    if (state.l !== l) {
      this.set({ h: state.h, s: state.s, l, a: state.a });
    }
    return this;
  }

  /**
   * Get alpha value (0 to 1)
   */
  alpha(): number;
  /**
   * Set blue value
   * @param r - alpha (0 to 1)
   */
  alpha(a: number): this;
  alpha(a?: number): number | this {
    const state = this._state;
    if (a === undefined) return state.a;
    if (state.a !== a) {
      this.set([state.r, state.g, state.b, a]);
    }
    return this;
  }

  /**
   * @returns RGB color string ex. `rgb(10,255,36)`
   */
  rgb(): string {
    return this._state.rgb;
  }

  /**
   * @returns RGBA color string ex. `rgb(10,255,36)`
   */
  rgba(): string {
    return this._state.rgba;
  }

  /**
   * @returns HEX color string ex. `#00fe64`, (with alpha &lt; 1) `#00fe649a`
   */
  hex(): string {
    return this._state.hex;
  }

  /**
   * Returns a new Color instance cloned based on the current color settings.
   */
  clone(): this {
    return new (this.constructor as any)(this) as this;
  }

  /**
   * Returns the instance by mixing the specified Color information with the current color settings
   * @param mixSource - Color source to mix.
   * @param options - Raw mix options (default: `0.5`) {@link RawMixOptions}
   */
  mix(mixSource: ColorSource, options?: RawMixOptions): this {
    if (
      maybeRGB(mixSource) ||
      (typeof mixSource === 'object' && 'a' in mixSource)
    ) {
      mixSource = {
        ...this.rgbaJSON(),
        ...mixSource,
      };
      options = {
        ...resolveMixOptions(options),
        model: 'rgb',
      };
    } else if (maybeHSL(mixSource)) {
      const { h, s, l, a } = parseColorSource(mixSource);
      mixSource = {
        ...this.hslaJSON(),
        ...{ h, s, l, a },
      };
      options = {
        ...resolveMixOptions(options),
        model: 'hsl',
      };
    }
    const info = mixColorSource(this, mixSource, options);
    this._setInfo(info);
    return this;
  }

  /**
   * Returns the instance by mixing the specified red value with the current color settings
   * @param alpha - alpha 0 to 1
   * @param per - Percentage to mix(0 to 1) (default: `0.5`)
   */
  mixRed(r: number, per?: number): this {
    return this.mix({ r }, per);
  }

  /**
   * Returns the instance by mixing the specified green value with the current color settings
   * @param alpha - alpha 0 to 1
   * @param per - Percentage to mix(0 to 1) (default: `0.5`)
   */
  mixGreen(g: number, per?: number): this {
    return this.mix({ g }, per);
  }

  /**
   * Returns the instance by mixing the specified blue value with the current color settings
   * @param alpha - alpha 0 to 1
   * @param per - Percentage to mix(0 to 1) (default: `0.5`)
   */
  mixBlue(b: number, per?: number): this {
    return this.mix({ b }, per);
  }

  /**
   * Returns the instance by mixing the specified alpha value with the current color settings
   * @param alpha - alpha 0 to 1
   * @param per - Percentage to mix(0 to 1) (default: `0.5`)
   */
  mixAlpha(a: number, per?: number): this {
    return this.mix({ a }, per);
  }

  /**
   * This function also works with template literal ex. `HEX is ${this} .`
   * @returns HEX color string
   */
  toString(): string {
    return this.hex();
  }

  /**
   * Get RGBA color values
   * @returns RGBA color values
   */
  rgbaJSON(): RGBA {
    const { r, g, b, a } = this._state;
    return {
      r,
      g,
      b,
      a,
    };
  }

  /**
   * Get HSLA color values
   * @returns HSLA color values
   */
  hslaJSON(): HSLA {
    const { h, s, l, a } = this._state;
    return {
      h,
      s,
      l,
      a,
    };
  }

  /**
   * Get JSON color information
   *
   * @returns Color information
   */
  info(): ColorInfo {
    return {
      ...this._state,
    };
  }

  /**
   * Get JSON color information
   *
   * This function also works with `JSON.stringify()`
   * @returns Color information
   */
  toJSON(): ColorInfo {
    return this.info();
  }

  /**
   * Set the color information of the instance. This method only sets the state. You should not call another hook, such as a change notification.
   *
   * @param info - Color information
   */
  private _setInfo(info: ColorInfo) {
    const state = this._state;
    state.r = info.r;
    state.g = info.g;
    state.b = info.b;
    state.h = info.h;
    state.s = info.s;
    state.l = info.l;
    state.a = info.a;
    state.hex = info.hex;
    state.rgb = info.rgb;
    state.rgba = info.rgba;
    state.hsl = info.hsl;
    state.hsla = info.hsla;
  }

  /**
   * @returns The HSP brightness value (dark) 0 ... 1 (light)
   */
  brightness() {
    return brightness(this);
  }

  /**
   * Get HWB whiteness
   * @TODO comment
   */
  whiteness() {
    return whiteness(this);
  }

  /**
   * Get HSV brightness
   * @TODO comment
   */
  value() {
    return hsvValue(this);
  }

  /**
   * Get HWB blackness
   * @TODO comment
   */
  blackness() {
    return blackness(this);
  }

  /**
   * Brightens the color of its own instance by a specified ratio and returns the instance.
   * @param per - Percentage (Max: `1`) The opposite effect can be achieved by specifying a negative value.
   */
  lighten(per: number): this {
    const info = lighten(this, per);
    this._setInfo(info);
    return this;
  }

  /**
   * Darkens the color of its own instance by the specified ratio, and returns the instance.
   * @param per - Percentage (Max: `1`) The opposite effect can be achieved by specifying a negative value.
   */
  darken(per: number): this {
    const info = darken(this, per);
    this._setInfo(info);
    return this;
  }

  /**
   * It sets the saturation of its own color to a higher value by a percentage between 0 and 1. The quantity parameter increases the saturation of the HSL by that percentage.
   * @param source - Source for generating color information
   * @param per - Percentage (Max: `1`) The opposite effect can be achieved by specifying a negative value.
   * @returns Color information
   */
  saturate(per: number): this {
    const info = saturate(this, per);
    this._setInfo(info);
    return this;
  }

  /**
   * Set the saturation of your own color as a percentage to a low value between 0 and 1, and use the quantity parameter to reduce the saturation of the HSL by that percentage.
   * @param per - Percentage (Max: `1`) The opposite effect can be achieved by specifying a negative value.
   * @returns Color information
   */
  desaturate(per: number) {
    const info = desaturate(this, per);
    this._setInfo(info);
    return this;
  }

  /**
   * This is identical to `color.saturate(0)`.
   */
  grayscale() {
    return this.saturate(0);
  }
}
