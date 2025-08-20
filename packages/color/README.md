
# @fastkit/color

🌐 English | [日本語](https://github.com/dadajam4/fastkit/blob/main/packages/color/README-ja.md)

A comprehensive value object implementation for controlling "color". Provides mutual conversion between RGB, HSL, and HEX formats, color manipulation (brightness/saturation adjustment, color mixing, etc.), and W3C X11 color name support.

## Features

- **Diverse Color Format Support**: RGB, RGBA, HSL, HSLA, HEX, W3C X11 color names
- **Color Space Conversion**: Automatic RGB ⇔ HSL conversion and synchronization
- **Color Manipulation Methods**: lighten, darken, saturate, desaturate, mix
- **Method Chaining**: Intuitive color manipulation through method chaining
- **Full TypeScript Support**: Type safety through strict type definitions
- **Immutability Options**: Safe color manipulation via clone() method
- **JSON Support**: Serialization through toJSON() method

## Installation

```bash
npm install @fastkit/color
```

## Basic Usage

### Creating Color Instances

```typescript
import { Color } from '@fastkit/color'

// Create from HEX format
const color1 = new Color('#ff6b35')

// Create from RGB array
const color2 = new Color([255, 107, 53])

// Create from RGBA array
const color3 = new Color([255, 107, 53, 0.8])

// Create from RGB object
const color4 = new Color({ r: 255, g: 107, b: 53 })

// Create from HSL object
const color5 = new Color({ h: 15, s: 1, l: 0.6 })

// Create from W3C X11 color name
const color6 = new Color('tomato')

// Create from CSS format string
const color7 = new Color('rgb(255, 107, 53)')
const color8 = new Color('hsl(15, 100%, 60%)')
```

### Getting Color Values

```typescript
const color = new Color('#ff6b35')

// Get RGB values
console.log(color.red())    // 255
console.log(color.green())  // 107
console.log(color.blue())   // 53

// Get HSL values
console.log(color.hue())        // 15
console.log(color.saturation()) // 1
console.log(color.lightness())  // 0.6

// Get alpha value
console.log(color.alpha()) // 1

// Get string formats
console.log(color.hex())   // '#ff6b35'
console.log(color.rgb())   // 'rgb(255,107,53)'
console.log(color.rgba())  // 'rgba(255,107,53,1)'
console.log(color.toString()) // '#ff6b35' (default is HEX)
```

### Setting Color Values

```typescript
const color = new Color('#ff6b35')

// Set RGB values (method chaining)
color.red(200).green(150).blue(100)

// Set HSL values
color.hue(180).saturation(0.8).lightness(0.5)

// Set alpha value
color.alpha(0.7)

// Reset with multiple color formats
color.set('#3498db')
color.set([52, 152, 219])
color.set({ h: 204, s: 0.7, l: 0.53 })
```

## Color Manipulation

### Brightness and Saturation Adjustment

```typescript
const color = new Color('#3498db')

// Increase brightness (lighten)
const lightColor = color.clone().lighten(0.2)

// Decrease brightness (darken)
const darkColor = color.clone().darken(0.3)

// Increase saturation (more vivid)
const vibrancyColor = color.clone().saturate(0.4)

// Decrease saturation (muted)
const mutedColor = color.clone().desaturate(0.5)

// Grayscale conversion
const grayColor = color.clone().grayscale()
```

### Color Mixing

```typescript
const baseColor = new Color('#3498db')

// Mix with another color (default 50%)
const mixedColor = baseColor.clone().mix('#e74c3c')

// Specify mixing ratio
const mixedColor2 = baseColor.clone().mix('#e74c3c', 0.3)

// Mix individual RGB values
const redMixed = baseColor.clone().mixRed(255, 0.4)
const greenMixed = baseColor.clone().mixGreen(100, 0.6)
const blueMixed = baseColor.clone().mixBlue(50, 0.2)

// Mix alpha values
const alphaMixed = baseColor.clone().mixAlpha(0.5, 0.8)
```

### HSL Model Mixing

```typescript
const color1 = new Color({ h: 180, s: 0.8, l: 0.6 })
const color2 = new Color({ h: 300, s: 0.9, l: 0.4 })

// Mix in HSL model
const hslMixed = color1.clone().mix(color2, { per: 0.4, model: 'hsl' })

// Mix with partial HSL values
const hueMixed = color1.clone().mix({ h: 60 }, 0.3)
```

## Getting Color Information

### Getting in JSON Format

```typescript
const color = new Color('#ff6b35')

// Get RGBA information
const rgba = color.rgbaJSON()
// { r: 255, g: 107, b: 53, a: 1 }

// Get HSLA information
const hsla = color.hslaJSON()
// { h: 15, s: 1, l: 0.6, a: 1 }

// Get complete color information
const info = color.info()
// {
//   r: 255, g: 107, b: 53, h: 15, s: 1, l: 0.6, a: 1,
//   hex: '#ff6b35', rgb: 'rgb(255,107,53)', rgba: 'rgba(255,107,53,1)',
//   hsl: 'hsl(15,100%,60%)', hsla: 'hsla(15,100%,60%,1)'
// }

// JSON.stringify support
const jsonString = JSON.stringify(color)
```

### Color Analysis

```typescript
const color = new Color('#ff6b35')

// HSP brightness (perceptual brightness)
console.log(color.brightness()) // 0 to 1

// HWB whiteness
console.log(color.whiteness()) // 0 to 1

// HSV brightness
console.log(color.value()) // 0 to 1

// HWB blackness
console.log(color.blackness()) // 0 to 1
```

## Advanced Usage Examples

### Color Palette Generation

```typescript
function generatePalette(baseColor: string, steps: number = 5) {
  const color = new Color(baseColor)
  const palette = []

  for (let i = 0; i < steps; i++) {
    const ratio = i / (steps - 1)
    const lightVariant = color.clone().lighten(ratio * 0.4)
    const darkVariant = color.clone().darken(ratio * 0.4)

    palette.push({
      light: lightVariant.hex(),
      base: color.hex(),
      dark: darkVariant.hex()
    })
  }

  return palette
}

const bluePalette = generatePalette('#3498db', 5)
```

### Theme Color Generation

```typescript
function generateThemeColors(primaryColor: string) {
  const primary = new Color(primaryColor)

  return {
    primary: primary.hex(),
    primaryLight: primary.clone().lighten(0.3).hex(),
    primaryDark: primary.clone().darken(0.2).hex(),
    secondary: primary.clone().hue(primary.hue() + 180).hex(),
    accent: primary.clone().hue(primary.hue() + 60).saturate(0.2).hex(),
    success: '#4caf50',
    warning: '#ff9800',
    error: '#f44336',
    muted: primary.clone().desaturate(0.8).lighten(0.4).hex()
  }
}

const theme = generateThemeColors('#2196f3')
```

### Gradient Color Calculation

```typescript
function generateGradient(
  startColor: string,
  endColor: string,
  steps: number
): string[] {
  const start = new Color(startColor)
  const end = new Color(endColor)
  const gradient = []

  for (let i = 0; i < steps; i++) {
    const ratio = i / (steps - 1)
    const interpolated = start.clone().mix(end, ratio)
    gradient.push(interpolated.hex())
  }

  return gradient
}

const blueToRed = generateGradient('#3498db', '#e74c3c', 10)
```

### Accessibility Support

```typescript
function getContrastColor(backgroundColor: string): string {
  const bg = new Color(backgroundColor)
  const brightness = bg.brightness()

  // Return white if brightness is 0.5 or less, otherwise return black
  return brightness < 0.5 ? '#ffffff' : '#000000'
}

function ensureContrast(
  textColor: string,
  backgroundColor: string,
  minContrast: number = 0.7
): string {
  const text = new Color(textColor)
  const bg = new Color(backgroundColor)

  const textBrightness = text.brightness()
  const bgBrightness = bg.brightness()
  const contrast = Math.abs(textBrightness - bgBrightness)

  if (contrast >= minContrast) {
    return text.hex()
  }

  // Adjust if contrast is insufficient
  if (bgBrightness > 0.5) {
    // If background is bright, darken the text
    return text.clone().darken(minContrast - contrast).hex()
  } else {
    // If background is dark, lighten the text
    return text.clone().lighten(minContrast - contrast).hex()
  }
}

const contrastColor = getContrastColor('#3498db')
const accessibleText = ensureContrast('#666666', '#f0f0f0')
```

### Custom Color Effects

```typescript
// Custom Color class with effects
const vintageColor = new Color('#3498db', {
  effectState: (state) => {
    // Vintage effect: desaturate and mix with brown
    const vintage = new Color(state)
    return vintage.desaturate(0.3).mix('#8b7355', 0.1).info()
  }
})

console.log(vintageColor.hex()) // Color with vintage effect applied
```

## API Reference

### Color Class

#### Constructor
```typescript
constructor(source?: ColorSource, opts?: ColorOptions)
```

#### Color Setting and Retrieval Methods
- `red(r?: number)`: Set/get red color value
- `green(g?: number)`: Set/get green color value
- `blue(b?: number)`: Set/get blue color value
- `hue(h?: number | string)`: Set/get hue value
- `saturation(s?: number)`: Set/get saturation value
- `lightness(l?: number)`: Set/get lightness value
- `alpha(a?: number)`: Set/get alpha value

#### Color Conversion Methods
- `rgb()`: Get RGB string
- `rgba()`: Get RGBA string
- `hex()`: Get HEX string
- `toString()`: Get HEX string (default)

#### Color Manipulation Methods
- `lighten(per: number)`: Increase lightness
- `darken(per: number)`: Decrease lightness
- `saturate(per: number)`: Increase saturation
- `desaturate(per: number)`: Decrease saturation
- `grayscale()`: Convert to grayscale
- `mix(mixSource: ColorSource, options?: RawMixOptions)`: Mix colors

#### Utility Methods
- `clone()`: Clone instance
- `brightness()`: Get HSP brightness
- `whiteness()`: Get HWB whiteness
- `value()`: Get HSV brightness
- `blackness()`: Get HWB blackness

#### Data Retrieval Methods
- `rgbaJSON()`: Get RGBA information
- `hslaJSON()`: Get HSLA information
- `info()`: Get complete color information
- `toJSON()`: JSON.stringify support

### Type Definitions

#### ColorSource
```typescript
type ColorSource =
  | RGBArray              // [r, g, b] or [r, g, b, a]
  | ColorModelInfo        // { model: 'rgb'|'hsl', channels: [...] }
  | Partial<RGBA>         // { r?, g?, b?, a? }
  | Partial<HSLA>         // { h?, s?, l?, a? }
  | ColorInfo             // Complete color information
  | ColorImplements       // Color instance
  | string                // HEX, RGB, HSL, W3C X11 color names
```

#### RGBA / HSLA
```typescript
interface RGBA {
  r: number  // 0-255
  g: number  // 0-255
  b: number  // 0-255
  a: number  // 0-1
}

interface HSLA {
  h: number  // 0-360
  s: number  // 0-1
  l: number  // 0-1
  a: number  // 0-1
}
```

## W3C X11 Color Name Support

Supports 140+ W3C X11 color names:

```typescript
const red = new Color('red')
const blue = new Color('cornflowerblue')
const green = new Color('forestgreen')
const purple = new Color('mediumorchid')
```

Examples of supported color names:
- Basic colors: `red`, `green`, `blue`, `yellow`, `cyan`, `magenta`
- Gray colors: `lightgray`, `darkgray`, `silver`, `dimgray`
- Special colors: `tomato`, `cornflowerblue`, `mediumseagreen`, `goldenrod`

## Related Packages

- `@fastkit/tiny-logger` - Logging functionality (internal dependency)

## License

MIT
