import { style } from '@vanilla-extract/css';
import { calc } from '@vanilla-extract/css-utils';
import {
  tokens,
  computedTokens,
  verticals,
  horizontals,
  sticks,
} from '../../styles';

export const host = style({
  position: 'fixed',
  zIndex: calc.add(tokens.zIndex, 1),
  pointerEvents: 'none',
  overflow: 'hidden',
  left: 0,
  right: 0,
});

export const hostPositions = {
  ...verticals((y) => [
    y,
    sticks.y((stick) => [
      stick,
      style({
        [y]: stick === 'window' ? '0px' : computedTokens[stick][y].offsetEnd,
      }),
    ]),
  ]),
  ...horizontals((x) => [
    x,
    sticks.x((stick) => [
      stick,
      style({
        [x]: stick === 'window' ? '0px' : computedTokens[stick][x].offsetEnd,
      }),
    ]),
  ]),
};

export const backdrop = style({
  position: 'absolute',
  pointerEvents: 'auto',
  cursor: 'pointer',
  background: tokens.stack.backdrop.color,
  willChange: 'opacity',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
});
