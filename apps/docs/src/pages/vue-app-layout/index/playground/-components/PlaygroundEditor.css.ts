import { style } from '@vanilla-extract/css';

export const defaultHeading = style({});

export const defaultHeadingLabel = style({
  display: 'inline-block',
  borderBottom: 'solid 2px var(--palette-primary)',
  padding:
    '0 calc(var(--val-container-padding) * 0.5) 0 var(--val-container-padding)',
});

export const item = style({});

export const level = style({
  paddingLeft: '1em',
  borderBottom: 'dotted 1px',
  borderLeft: 'dotted 1px',
  borderBottomLeftRadius: '8px',
});

export const levelActivator = style({
  margin: '1em 0 1em -1em',
});

export const field = style({});
