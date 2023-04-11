import { style } from '@vanilla-extract/css';

export const host = style({
  padding: 40,
});

export const title = style({
  fontSize: 48,
});

export const description = style({
  marginTop: 32,
  marginBottom: 32,
  lineHeight: 1.8,
});

export const languages = style({
  marginBottom: 32,
});

export const action = style({
  minWidth: 280,
  fontSize: 18,
});

export const powered = style({
  marginTop: 80,
  display: 'inline-flex',
  alignItems: 'center',
});
