import { describe, it, expect } from 'vitest';
import { toHashInputs } from '../src/generator';
import type { IconFontEntry } from '../src/schema';
import pkg from '../package.json';

const entry = (overrides: Partial<IconFontEntry> = {}): IconFontEntry => ({
  name: 'icons',
  fontName: 'icons',
  prefix: 'icons',
  display: 'block',
  src: '/abs/path/to/svg',
  dest: '/abs/path/to/out',
  formats: ['woff2'],
  ...overrides,
});

describe('toHashInputs', () => {
  it('should carry this package’s version', () => {
    expect(toHashInputs(entry()).generator).toBe(pkg.version);
  });

  it('should leave the absolute paths out, so the meta file stays portable', () => {
    const inputs = toHashInputs(entry());
    expect(inputs.options).not.toHaveProperty('src');
    expect(inputs.options).not.toHaveProperty('dest');
    expect(JSON.stringify(inputs)).not.toContain('/abs/path');
  });

  it('should differ when an option that changes the output changes', () => {
    const before = JSON.stringify(toHashInputs(entry()));
    for (const overrides of [
      { formats: ['woff2', 'otf'] } as Partial<IconFontEntry>,
      { startUnicode: 0xea01 },
      { prefix: 'other' },
      { fontHeight: 512 },
      { display: 'swap' as const },
    ]) {
      expect(JSON.stringify(toHashInputs(entry(overrides)))).not.toBe(before);
    }
  });

  it('should not differ when only the paths change', () => {
    expect(JSON.stringify(toHashInputs(entry()))).toBe(
      JSON.stringify(
        toHashInputs(entry({ src: '/elsewhere', dest: '/elsewhere/out' })),
      ),
    );
  });
});
