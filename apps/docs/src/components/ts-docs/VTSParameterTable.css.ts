import { style, StyleRule } from '@vanilla-extract/css';

function vuiStyle(rule: StyleRule, debugId?: string): string {
  return style(
    {
      '@layer': {
        vui: rule,
      },
    },
    debugId,
  );
}

export const table = vuiStyle({
  width: '100%',
});

export const cellBase = vuiStyle({
  textAlign: 'left',
  verticalAlign: 'middle',
});

export const headCell = vuiStyle({
  color: 'inherit',
});

export const cell = vuiStyle({
  borderTop: 'solid 1px rgba(0, 0, 0, .1)',
});

export const name = vuiStyle({
  fontWeight: '700',
  color: 'var(--palette-primary)',
});

export const requiredChip = vuiStyle({
  color: 'var(--palette-error)',
});

export const description = vuiStyle({
  background: 'rgba(0, 0, 0, .05)',
});
