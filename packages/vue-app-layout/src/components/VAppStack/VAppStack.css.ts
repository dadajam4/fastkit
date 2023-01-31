import { style, globalStyle } from '@vanilla-extract/css';
import { calc } from '@vanilla-extract/css-utils';
import {
  tokens,
  computedTokens,
  verticals,
  horizontals,
  sticks,
  bars,
} from '../../styles';
import { VAL_Y_POSITIONS, VAL_BAR_TYPES } from '../../schemes';

export const host = style({
  position: 'fixed',
  zIndex: calc.add(tokens.zIndex, 2),
  pointerEvents: 'none',
  overflow: 'hidden',
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'stretch',
  justifyContent: 'stretch',
});

export const inner = style({
  position: 'relative',
  width: '100%',
  height: '100%',
  flex: '1 1 100%',
  overflow: 'hidden',
});

export const hostPositions = {
  ...verticals((y) => [
    y,
    sticks.y((stick) => [
      stick,
      style({
        // [y]: stick === 'window' ? '0px' : computedTokens[stick][y].offsetEnd,
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

export const barSpacers = verticals((y) => [
  y,
  bars((bar) => {
    const { transition } = computedTokens[bar][y];

    return [
      bar,
      style({
        height: '0px',
        flex: '0 0 0px',
        transition: `all ${transition}`,
      }),
    ];
  }),
]);

VAL_Y_POSITIONS.forEach((y) => {
  const hostPosition = hostPositions[y];
  const barSpacer = barSpacers[y];

  VAL_BAR_TYPES.forEach((bar) => {
    const { height } = computedTokens[bar][y];
    const classes = [`${hostPosition[bar]} ${barSpacer[bar]}`];
    if (bar === 'systemBar') {
      classes.push(`${hostPosition.toolbar} ${barSpacer[bar]}`);
    }

    globalStyle(classes.join(', '), {
      height,
      flexBasis: height,
    });
  });
});

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
