import { style } from '@vanilla-extract/css';
import { calc } from '@vanilla-extract/css-utils';

import { tokens } from '../../styles';

export const container = style({});

export const padded = style({
  paddingLeft: tokens.container.padding,
  paddingRight: tokens.container.padding,
});

export const pulled = style({
  marginLeft: calc.multiply(tokens.container.padding, -1),
  marginRight: calc.multiply(tokens.container.padding, -1),
});

export const states = {
  padded,
  pulled,
};

export const inner = style({
  width: '100%',
});
