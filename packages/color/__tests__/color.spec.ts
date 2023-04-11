import { describe, it, expect } from 'vitest';
import { Color, ColorInfo } from '../src';

const informations: [...any[], ColorInfo][] = [
  [
    [],
    {
      r: 0,
      g: 0,
      b: 0,
      h: 0,
      s: 0,
      l: 0,
      a: 1,
      hex: '#000000',
      rgb: 'rgb(0,0,0)',
      rgba: 'rgba(0,0,0,1)',
      hsl: 'hsl(0,0%,0%)',
      hsla: 'hsla(0,0%,0%,1)',
    },
  ],
  [
    ['#f0a'],
    {
      r: 255,
      g: 0,
      b: 170,
      h: 320,
      s: 1,
      l: 0.5,
      a: 1,
      hex: '#ff00aa',
      rgb: 'rgb(255,0,170)',
      rgba: 'rgba(255,0,170,1)',
      hsl: 'hsl(320,100%,50%)',
      hsla: 'hsla(320,100%,50%,1)',
    },
  ],
  [
    ['#0af'],
    {
      r: 0,
      g: 170,
      b: 255,
      h: 200,
      s: 1,
      l: 0.5,
      a: 1,
      hex: '#00aaff',
      rgb: 'rgb(0,170,255)',
      rgba: 'rgba(0,170,255,1)',
      hsl: 'hsl(200,100%,50%)',
      hsla: 'hsla(200,100%,50%,1)',
    },
  ],
  [
    ['#f0aa'],
    {
      r: 255,
      g: 0,
      b: 170,
      h: 320,
      s: 1,
      l: 0.5,
      a: 0.6666666666666666,
      hex: '#ff00aaaa',
      rgb: 'rgb(255,0,170)',
      rgba: 'rgba(255,0,170,0.6666666666666666)',
      hsl: 'hsl(320,100%,50%)',
      hsla: 'hsla(320,100%,50%,0.6666666666666666)',
    },
  ],
  [
    ['#ff00aAaA'],
    {
      r: 255,
      g: 0,
      b: 170,
      h: 320,
      s: 1,
      l: 0.5,
      a: 0.6666666666666666,
      hex: '#ff00aaaa',
      rgb: 'rgb(255,0,170)',
      rgba: 'rgba(255,0,170,0.6666666666666666)',
      hsl: 'hsl(320,100%,50%)',
      hsla: 'hsla(320,100%,50%,0.6666666666666666)',
    },
  ],
  [
    ['rgba(255, 0, 170, 1)'],
    {
      r: 255,
      g: 0,
      b: 170,
      h: 320,
      s: 1,
      l: 0.5,
      a: 1,
      hex: '#ff00aa',
      rgb: 'rgb(255,0,170)',
      rgba: 'rgba(255,0,170,1)',
      hsl: 'hsl(320,100%,50%)',
      hsla: 'hsla(320,100%,50%,1)',
    },
  ],
  [
    ['rgb(255,\n0,    170)'],
    {
      r: 255,
      g: 0,
      b: 170,
      h: 320,
      s: 1,
      l: 0.5,
      a: 1,
      hex: '#ff00aa',
      rgb: 'rgb(255,0,170)',
      rgba: 'rgba(255,0,170,1)',
      hsl: 'hsl(320,100%,50%)',
      hsla: 'hsla(320,100%,50%,1)',
    },
  ],
  [
    [{ r: 255, g: 0, b: 170, a: 0.5 }],
    {
      r: 255,
      g: 0,
      b: 170,
      h: 320,
      s: 1,
      l: 0.5,
      a: 0.5,
      hex: '#ff00aa80',
      rgb: 'rgb(255,0,170)',
      rgba: 'rgba(255,0,170,0.5)',
      hsl: 'hsl(320,100%,50%)',
      hsla: 'hsla(320,100%,50%,0.5)',
    },
  ],
  [
    [{ r: 255, b: 170 }],
    {
      r: 255,
      g: 0,
      b: 170,
      h: 320,
      s: 1,
      l: 0.5,
      a: 1,
      hex: '#ff00aa',
      rgb: 'rgb(255,0,170)',
      rgba: 'rgba(255,0,170,1)',
      hsl: 'hsl(320,100%,50%)',
      hsla: 'hsla(320,100%,50%,1)',
    },
  ],
];

describe('constract', () => {
  it('should can constract', () => {
    const colors = informations.map(([args, expected]) => {
      const color = new Color(...args);
      const result = color.toJSON();
      expect(result).toStrictEqual(expected);
      const fromHsla = new Color(result.hsla);
      expect(fromHsla.toJSON()).toStrictEqual(expected);
      return color;
    });
    colors.forEach((color) => {
      const expected = color.toJSON();
      const cloned = new Color(color);
      expect(cloned.toJSON()).toStrictEqual(expected);
      expect(cloned === color).toStrictEqual(false);
    });
  });

  it('should can extend', () => {
    class ExtendedColor extends Color {}
    const testColor = new ExtendedColor('#f00');
    expect(testColor).toBeInstanceOf(ExtendedColor);
    expect(testColor).toBeInstanceOf(Color);
  });
});

// describe('r(), g(), b(), a()', () => {
//   it('should can get', () => {
//     informations.map(([args, expected]) => {
//       const color = new Color(...args);
//       expect(color.r()).toStrictEqual(expected.r);
//       expect(color.g()).toStrictEqual(expected.g);
//       expect(color.b()).toStrictEqual(expected.b);
//       expect(color.a()).toStrictEqual(expected.a);
//       return color;
//     });
//   });

//   it('should can set', () => {
//     const color = new Color('#aaa');
//     color.r(204);
//     expect(color.toJSON()).toStrictEqual({
//       r: 204,
//       g: 170,
//       b: 170,
//       a: 1,
//       rgb: 'rgb(204,170,170)',
//       rgba: 'rgba(204,170,170,1)',
//       hex: '#ccaaaa',
//     });
//     color.g(222);
//     expect(color.toJSON()).toStrictEqual({
//       r: 204,
//       g: 222,
//       b: 170,
//       a: 1,
//       rgb: 'rgb(204,222,170)',
//       rgba: 'rgba(204,222,170,1)',
//       hex: '#ccdeaa',
//     });
//     color.b(239);
//     expect(color.toJSON()).toStrictEqual({
//       r: 204,
//       g: 222,
//       b: 239,
//       a: 1,
//       rgb: 'rgb(204,222,239)',
//       rgba: 'rgba(204,222,239,1)',
//       hex: '#ccdeef',
//     });
//     color.a(0.2);
//     expect(color.toJSON()).toStrictEqual({
//       r: 204,
//       g: 222,
//       b: 239,
//       a: 0.2,
//       rgb: 'rgb(204,222,239)',
//       rgba: 'rgba(204,222,239,0.2)',
//       hex: '#ccdeef33',
//     });
//     color.a(0.1);
//     expect(color.toJSON()).toStrictEqual({
//       r: 204,
//       g: 222,
//       b: 239,
//       a: 0.1,
//       rgb: 'rgb(204,222,239)',
//       rgba: 'rgba(204,222,239,0.1)',
//       hex: '#ccdeef1a',
//     });
//   });
// });

// describe('lightness', () => {
//   it('lightness', () => {
//     const color1 = new Color('#e1d7d2');
//     console.log(color1.lightness());

//     const color2 = new Color('#f2ece4');
//     console.log(color2.lightness());

//     const color3 = new Color('#dadbdf');
//     console.log(color3.lightness());
//   });
// });
