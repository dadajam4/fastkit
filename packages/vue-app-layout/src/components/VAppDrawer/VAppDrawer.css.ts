import { style, globalStyle } from '@vanilla-extract/css';
import { calc } from '@vanilla-extract/css-utils';
import {
  tokens,
  computedTokens,
  horizontals,
  verticals,
  extractTokenName,
  createSimpleVueTransition,
} from '../../styles';
import { VAL_Y_POSITIONS, VAL_STICK_Y_POSITIONS } from '../../schemes';
import { objectFromArray } from '@fastkit/helpers';
import { booting } from '../../composables/booting.css';

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
  const { width } = computed;

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
    transition: `width ${computed.transition}`,
  });

  const positionStyles = {
    host,
    body,
    isActive: style({
      // zIndex: calc.add(tokens.zIndex, 2),
    }),
    isStatic: style({
      zIndex: tokens.zIndex,
    }),
    isRale: style({}),
    hasBackdrop: style({}),
    stickedTo: verticals((y) => {
      return [y, stickes((stickPosition) => [stickPosition, style({})])];
    }),
  };

  const leaveTo = calc.multiply(width, x === 'left' ? -1 : 1);

  createSimpleVueTransition(
    {
      in: {
        transition: `transform ${computed.transition}`,
      },
      out: {
        transform: `translateX(${leaveTo})`,
      },
    },
    body,
  );

  const widthToken = extractTokenName(width);
  const offsetEndToken = extractTokenName(computed.offsetEnd);
  const staticOffsetEndToken = extractTokenName(
    computedTokens.staticDrawer[x].offsetEnd,
  );
  const transitionToken = extractTokenName(computed.transition);

  globalStyle(':root', {
    vars: {
      [widthToken]: tokens.drawer[x].width,
      [offsetEndToken]: '0px',
      [staticOffsetEndToken]: '0px',
      [transitionToken]: '0s',
    },
  });

  globalStyle(`:root:has(${positionStyles.isRale})`, {
    vars: {
      [widthToken]: tokens.drawer[x].railWidth,
    },
  });

  globalStyle(`:root:has(${positionStyles.host}:not(${booting}))`, {
    vars: {
      [transitionToken]: tokens.transition.duration,
    },
  });

  globalStyle(`:root:has(${positionStyles.isActive})`, {
    vars: {
      [offsetEndToken]: width,
    },
  });

  globalStyle(`:root:has(${positionStyles.isStatic})`, {
    vars: {
      [offsetEndToken]: width,
      [staticOffsetEndToken]: width,
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
