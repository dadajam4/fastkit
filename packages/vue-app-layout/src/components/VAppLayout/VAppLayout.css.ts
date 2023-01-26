import { style, globalStyle } from '@vanilla-extract/css';
import { computedTokens, extractTokenName, tokens } from '../../styles';
import * as drawerStyles from '../VAppDrawer/VAppDrawer.css';
import { VAL_X_POSITIONS, VAL_POSITIONS } from '../../schemes';
import { objectFromArray } from '@fastkit/helpers';
import * as bodyStyles from '../VAppBody/VAppBody.css';

export const host = style({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  minHeight: '100vh',
  paddingTop: computedTokens.viewport.top,
  paddingBottom: computedTokens.viewport.bottom,
  paddingLeft: computedTokens.viewport.left,
  paddingRight: computedTokens.viewport.right,
  transition: `padding ${computedTokens.transition}`,
  willChange: 'padding',
});

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
        [computedPosition]: tokens.drawer[x].width,
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
