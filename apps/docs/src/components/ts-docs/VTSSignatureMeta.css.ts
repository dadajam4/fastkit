import { style, StyleRule } from '@vanilla-extract/css';

function vuiStyle(rule: StyleRule, debugId?: string): string {
  return style(
    {
      '@layer': {
        ['vui']: rule,
      },
    },
    debugId,
  );
}

export const signatureTitle = vuiStyle({
  display: 'flex',
  alignItems: 'center',
  whiteSpace: 'nowrap',
  ':after': {
    content: '',
    display: 'block',
    height: '1px',
    width: '100%',
    background: 'currentcolor',
    opacity: '0.25',
    marginLeft: '1em',
  },
});

export const signatureTitleCount = vuiStyle({
  opacity: '0.75',
});
