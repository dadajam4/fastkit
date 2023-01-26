import { style, globalStyle } from '@vanilla-extract/css';
import { calc } from '@vanilla-extract/css-utils';
import {
  tokens,
  computedTokens,
  horizontals,
  verticals,
  extractTokenName,
} from '../../styles';
import { VAL_Y_POSITIONS, VAL_STICK_Y_POSITIONS } from '../../schemes';
import { objectFromArray } from '@fastkit/helpers';

const stickes = objectFromArray.build(VAL_STICK_Y_POSITIONS);

export const host = style({});

export const bodyBase = style({
  position: 'absolute',
  top: 0,
  bottom: 0,
  display: 'flex',
  alignItems: 'stretch',
  justifyContent: 'stretch',
});

export const positions = horizontals((x) => {
  const computed = computedTokens.drawer[x];
  const { width } = tokens.drawer[x];

  const host = style({});

  /**
   * Styles applied to body elements
   *
   * * This style name should not be compounded because we want to use it for Vue transitions as well!
   */
  const body = style({
    [x]: 0,
    width,
    pointerEvents: 'auto',
    willChange: 'transform',
  });

  const positionStyles = {
    host,
    body,
    isActive: style({}),
    isStatic: style({}),
    hasBackdrop: style({}),
    stickedTo: verticals((y) => {
      return [y, stickes((stickPosition) => [stickPosition, style({})])];
    }),
  };

  const leaveTo = calc.multiply(width, x === 'left' ? -1 : 1);

  globalStyle(`${body}-enter-active, ${body}-leave-active`, {
    transition: `transform ${computedTokens.transition}`,
  });

  globalStyle(`${body}-enter-from, ${body}-leave-to`, {
    transform: `translateX(${leaveTo})`,
  });

  const offsetEnd = extractTokenName(computed.offsetEnd);
  const staticOffsetEnd = extractTokenName(
    computedTokens.staticDrawer[x].offsetEnd,
  );

  globalStyle(':root', {
    vars: {
      [offsetEnd]: '0px',
      [staticOffsetEnd]: '0px',
    },
  });

  globalStyle(`:root:has(${positionStyles.isActive})`, {
    vars: {
      [offsetEnd]: width,
    },
  });

  globalStyle(`:root:has(${positionStyles.isStatic})`, {
    vars: {
      [offsetEnd]: width,
      [staticOffsetEnd]: width,
    },
  });

  VAL_Y_POSITIONS.forEach((y) => {
    const computedTokenName = extractTokenName(computed[y]);
    const systemBarComputed = computedTokens.systemBar[y];
    const toolbarComputed = computedTokens.toolbar[y];

    globalStyle(':root', {
      vars: {
        [computedTokenName]: systemBarComputed.offsetEnd,
      },
    });

    globalStyle(`:root:has(${positionStyles.stickedTo[y]})`, {
      vars: {
        [computedTokenName]: toolbarComputed.offsetEnd,
      },
    });

    VAL_STICK_Y_POSITIONS.forEach((stickPosition) => {
      const stickClass = positionStyles.stickedTo[y][stickPosition];
      const targets: ('systemBar' | 'toolbar')[] = [];
      if (stickPosition === 'window') {
        targets.push('systemBar', 'toolbar');
      } else if (stickPosition === 'systemBar') {
        targets.push('toolbar');
      }

      targets.forEach((target) => {
        globalStyle(
          `:root:has(${stickClass}):has(${positionStyles.isStatic}), :root:has(${stickClass}):has(${positionStyles.isActive}):not(:has(${positionStyles.hasBackdrop}))`,
          {
            vars: {
              [extractTokenName(computedTokens[target][y][x])]: width,
            },
          },
        );
      });
    });
  });

  return [x, positionStyles];
});
