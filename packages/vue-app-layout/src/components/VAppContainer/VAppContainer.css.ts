import { calc } from '@vanilla-extract/css-utils';
import { component } from '~/styles/layers.css';

import { tokens } from '../../styles';

export const container = component.style({});

export const padded = component.style({
  paddingLeft: tokens.container.padding,
  paddingRight: tokens.container.padding,
});

export const pulled = component.style({
  marginLeft: calc.multiply(tokens.container.padding, -1),
  marginRight: calc.multiply(tokens.container.padding, -1),
});

export const states = {
  padded,
  pulled,
};

export const inner = component.style({
  width: '100%',
});
