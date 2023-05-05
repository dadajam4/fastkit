import { component } from '~/styles/layers.css';
import { computedTokens, extractTokenName, tokens } from '../../styles';
import { verticals, bars } from '../../helpers';
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

export const host = component.style({
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

export const inner = component.style({
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
      component.style({
        height,
        flex: `0 0 ${height}`,
        transition: `all ${transition}`,
      }),
    ];
  }),
]);

export const viewport = component.style({
  flexGrow: '2',
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
});

export const viewportFooter = component.style({
  marginTop: 'auto',
});

component.global(`${viewport}:has(${bodyStyles.isCenter})`, {
  alignItems: 'center',
  justifyContent: 'center',
});

VAL_X_POSITIONS.forEach((x) => {
  const computedPosition = extractTokenName(computedTokens.viewport[x]);
  const drawer = drawerStyles.positions[x];

  component.pushGlobalVars(':root', {
    [computedPosition]: '0px',
  });

  component.pushGlobalVars(
    `:root:has(${drawer.isActive}:not(${drawer.hasBackdrop})), :root:has(${drawer.isStatic})`,
    {
      [computedPosition]: computedTokens.drawer[x].width,
    },
  );
});

export const sideDetect = {
  wrapper: component.style({
    width: 0,
    height: 0,
    overflow: 'hidden',
  }),
  ...objectFromArray(VAL_POSITIONS, (position) => [
    position,
    component.style({
      width: computedTokens.viewport[position],
    }),
  ]),
};

component.dumpGlobalVars();
