# @fastkit/color

🌐 [English](https://github.com/dadajam4/fastkit/blob/main/packages/color/README.md) | 日本語

「色」をコントロールするための包括的な値オブジェクト実装。RGB、HSL、HEX形式の相互変換、色の操作（明度・彩度調整、混色など）、W3C X11色名のサポートを提供します。

## 機能

- **多様な色形式サポート**: RGB、RGBA、HSL、HSLA、HEX、W3C X11色名
- **色空間変換**: RGB ⇔ HSL の自動変換と同期
- **色操作メソッド**: lighten、darken、saturate、desaturate、mix
- **チェーンメソッド**: メソッドチェーンによる直感的な色操作
- **TypeScript完全サポート**: 厳密な型定義による型安全性
- **不変性オプション**: clone()メソッドによる安全な色操作
- **JSON対応**: toJSON()メソッドによるシリアライゼーション

## インストール

```bash
npm install @fastkit/color
```

## 基本的な使用方法

### Color インスタンスの作成

```typescript
import { Color } from '@fastkit/color'

// HEX形式から作成
const color1 = new Color('#ff6b35')

// RGB配列から作成
const color2 = new Color([255, 107, 53])

// RGBA配列から作成
const color3 = new Color([255, 107, 53, 0.8])

// RGBオブジェクトから作成
const color4 = new Color({ r: 255, g: 107, b: 53 })

// HSLオブジェクトから作成
const color5 = new Color({ h: 15, s: 1, l: 0.6 })

// W3C X11色名から作成
const color6 = new Color('tomato')

// CSS形式の文字列から作成
const color7 = new Color('rgb(255, 107, 53)')
const color8 = new Color('hsl(15, 100%, 60%)')
```

### 色の取得

```typescript
const color = new Color('#ff6b35')

// RGB値の取得
console.log(color.red())    // 255
console.log(color.green())  // 107
console.log(color.blue())   // 53

// HSL値の取得
console.log(color.hue())        // 15
console.log(color.saturation()) // 1
console.log(color.lightness())  // 0.6

// アルファ値の取得
console.log(color.alpha()) // 1

// 文字列形式の取得
console.log(color.hex())   // '#ff6b35'
console.log(color.rgb())   // 'rgb(255,107,53)'
console.log(color.rgba())  // 'rgba(255,107,53,1)'
console.log(color.toString()) // '#ff6b35' (デフォルトはHEX)
```

### 色の設定

```typescript
const color = new Color('#ff6b35')

// RGB値の設定（チェーンメソッド）
color.red(200).green(150).blue(100)

// HSL値の設定
color.hue(180).saturation(0.8).lightness(0.5)

// アルファ値の設定
color.alpha(0.7)

// 複数の色形式で再設定
color.set('#3498db')
color.set([52, 152, 219])
color.set({ h: 204, s: 0.7, l: 0.53 })
```

## 色の操作

### 明度・彩度の調整

```typescript
const color = new Color('#3498db')

// 明度を上げる（明るくする）
const lightColor = color.clone().lighten(0.2)

// 明度を下げる（暗くする）
const darkColor = color.clone().darken(0.3)

// 彩度を上げる（鮮やかにする）
const vibrancyColor = color.clone().saturate(0.4)

// 彩度を下げる（くすませる）
const mutedColor = color.clone().desaturate(0.5)

// グレースケール変換
const grayColor = color.clone().grayscale()
```

### 色の混合

```typescript
const baseColor = new Color('#3498db')

// 他の色と混合（デフォルト50%）
const mixedColor = baseColor.clone().mix('#e74c3c')

// 混合比率を指定
const mixedColor2 = baseColor.clone().mix('#e74c3c', 0.3)

// RGB個別値の混合
const redMixed = baseColor.clone().mixRed(255, 0.4)
const greenMixed = baseColor.clone().mixGreen(100, 0.6)
const blueMixed = baseColor.clone().mixBlue(50, 0.2)

// アルファ値の混合
const alphaMixed = baseColor.clone().mixAlpha(0.5, 0.8)
```

### HSLモデルでの混合

```typescript
const color1 = new Color({ h: 180, s: 0.8, l: 0.6 })
const color2 = new Color({ h: 300, s: 0.9, l: 0.4 })

// HSLモデルで混合
const hslMixed = color1.clone().mix(color2, { per: 0.4, model: 'hsl' })

// 部分的なHSL値での混合
const hueMixed = color1.clone().mix({ h: 60 }, 0.3)
```

## 色情報の取得

### JSON形式での取得

```typescript
const color = new Color('#ff6b35')

// RGBA情報の取得
const rgba = color.rgbaJSON()
// { r: 255, g: 107, b: 53, a: 1 }

// HSLA情報の取得
const hsla = color.hslaJSON()
// { h: 15, s: 1, l: 0.6, a: 1 }

// 完全な色情報の取得
const info = color.info()
// {
//   r: 255, g: 107, b: 53, h: 15, s: 1, l: 0.6, a: 1,
//   hex: '#ff6b35', rgb: 'rgb(255,107,53)', rgba: 'rgba(255,107,53,1)',
//   hsl: 'hsl(15,100%,60%)', hsla: 'hsla(15,100%,60%,1)'
// }

// JSON.stringify対応
const jsonString = JSON.stringify(color)
```

### 色の分析

```typescript
const color = new Color('#ff6b35')

// HSP明度（知覚的明度）
console.log(color.brightness()) // 0 〜 1

// HWB白さ
console.log(color.whiteness()) // 0 〜 1

// HSV明度
console.log(color.value()) // 0 〜 1

// HWB黒さ
console.log(color.blackness()) // 0 〜 1
```

## 高度な使用例

### 色のパレット生成

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

### テーマ色の生成

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

### グラデーション色の計算

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

### アクセシビリティ対応

```typescript
function getContrastColor(backgroundColor: string): string {
  const bg = new Color(backgroundColor)
  const brightness = bg.brightness()

  // 明度が0.5以下なら白、それ以外は黒を返す
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

  // コントラストが不足している場合は調整
  if (bgBrightness > 0.5) {
    // 背景が明るい場合はテキストを暗くする
    return text.clone().darken(minContrast - contrast).hex()
  } else {
    // 背景が暗い場合はテキストを明るくする
    return text.clone().lighten(minContrast - contrast).hex()
  }
}

const contrastColor = getContrastColor('#3498db')
const accessibleText = ensureContrast('#666666', '#f0f0f0')
```

### カスタム色効果

```typescript
// カスタム効果付きColorクラス
const vintageColor = new Color('#3498db', {
  effectState: (state) => {
    // ヴィンテージ効果：彩度を下げて茶色を混ぜる
    const vintage = new Color(state)
    return vintage.desaturate(0.3).mix('#8b7355', 0.1).info()
  }
})

console.log(vintageColor.hex()) // ヴィンテージ効果が適用された色
```

## API リファレンス

### Color クラス

#### コンストラクタ
```typescript
constructor(source?: ColorSource, opts?: ColorOptions)
```

#### 色の設定・取得メソッド
- `red(r?: number)`: 赤色値の設定・取得
- `green(g?: number)`: 緑色値の設定・取得
- `blue(b?: number)`: 青色値の設定・取得
- `hue(h?: number | string)`: 色相の設定・取得
- `saturation(s?: number)`: 彩度の設定・取得
- `lightness(l?: number)`: 明度の設定・取得
- `alpha(a?: number)`: アルファ値の設定・取得

#### 色変換メソッド
- `rgb()`: RGB文字列の取得
- `rgba()`: RGBA文字列の取得
- `hex()`: HEX文字列の取得
- `toString()`: HEX文字列の取得（デフォルト）

#### 色操作メソッド
- `lighten(per: number)`: 明度を上げる
- `darken(per: number)`: 明度を下げる
- `saturate(per: number)`: 彩度を上げる
- `desaturate(per: number)`: 彩度を下げる
- `grayscale()`: グレースケール変換
- `mix(mixSource: ColorSource, options?: RawMixOptions)`: 色の混合

#### ユーティリティメソッド
- `clone()`: インスタンスの複製
- `brightness()`: HSP明度の取得
- `whiteness()`: HWB白さの取得
- `value()`: HSV明度の取得
- `blackness()`: HWB黒さの取得

#### データ取得メソッド
- `rgbaJSON()`: RGBA情報の取得
- `hslaJSON()`: HSLA情報の取得
- `info()`: 完全な色情報の取得
- `toJSON()`: JSON.stringify対応

### 型定義

#### ColorSource
```typescript
type ColorSource =
  | RGBArray              // [r, g, b] or [r, g, b, a]
  | ColorModelInfo        // { model: 'rgb'|'hsl', channels: [...] }
  | Partial<RGBA>         // { r?, g?, b?, a? }
  | Partial<HSLA>         // { h?, s?, l?, a? }
  | ColorInfo             // 完全な色情報
  | ColorImplements       // Colorインスタンス
  | string                // HEX, RGB, HSL, W3C X11色名
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

## W3C X11 色名サポート

140以上のW3C X11色名をサポート：

```typescript
const red = new Color('red')
const blue = new Color('cornflowerblue')
const green = new Color('forestgreen')
const purple = new Color('mediumorchid')
```

サポートされる色名の例：
- 基本色: `red`, `green`, `blue`, `yellow`, `cyan`, `magenta`
- グレー系: `lightgray`, `darkgray`, `silver`, `dimgray`
- 特殊色: `tomato`, `cornflowerblue`, `mediumseagreen`, `goldenrod`

## 関連パッケージ

- `@fastkit/tiny-logger` - ロギング機能（内部依存）

## ライセンス

MIT
