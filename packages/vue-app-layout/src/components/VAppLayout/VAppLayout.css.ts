import { style, globalStyle } from '@vanilla-extract/css';
import {
  computedTokens,
  extractTokenName,
  tokens,
  verticals,
  bars,
} from '../../styles';
import * as drawerStyles from '../VAppDrawer/VAppDrawer.css';
import { VAL_X_POSITIONS, VAL_POSITIONS } from '../../schemes';
import { objectFromArray } from '@fastkit/helpers';
import * as bodyStyles from '../VAppBody/VAppBody.css';

const transitions = [
  ...VAL_X_POSITIONS.map(
    (position) =>
      `padding-${position} ${computedTokens.drawer[position].transition}`,
  ),
];

export const host = style({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  minHeight: '100vh',
  paddingLeft: computedTokens.viewport.left,
  paddingRight: computedTokens.viewport.right,
  transitionTimingFunction: tokens.transition.function,
  transition: transitions.join(', '),
  willChange: 'padding',
});

export const inner = style({
  flexGrow: '2',
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
});

export const barSpacers = verticals((y) => [
  y,
  bars((bar) => {
    const { height, transition } = computedTokens[bar][y];

    return [
      bar,
      style({
        height,
        flex: `0 0 ${height}`,
        transition: `all ${transition}`,
      }),
    ];
  }),
]);

export const viewport = style({
  flexGrow: '2',
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
});

export const viewportFooter = style({
  marginTop: 'auto',
});

globalStyle(`${viewport}:has(${bodyStyles.isCenter})`, {
  alignItems: 'center',
  justifyContent: 'center',
});

VAL_X_POSITIONS.forEach((x) => {
  const computedPosition = extractTokenName(computedTokens.viewport[x]);
  const drawer = drawerStyles.positions[x];

  globalStyle(':root', {
    vars: {
      [computedPosition]: '0px',
    },
  });

  globalStyle(
    `:root:has(${drawer.isActive}:not(${drawer.hasBackdrop})), :root:has(${drawer.isStatic})`,
    {
      vars: {
        [computedPosition]: computedTokens.drawer[x].width,
      },
    },
  );
});

export const sideDetect = {
  wrapper: style({
    width: 0,
    height: 0,
    overflow: 'hidden',
  }),
  ...objectFromArray(VAL_POSITIONS, (position) => [
    position,
    style({
      width: computedTokens.viewport[position],
    }),
  ]),
};
