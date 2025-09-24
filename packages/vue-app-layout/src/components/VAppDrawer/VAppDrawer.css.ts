import { calc } from '@vanilla-extract/css-utils';
import { objectFromArray } from '@fastkit/helpers';
import { component } from '~/styles/layers.css';
import { tokens, computedTokens, extractTokenName } from '../../styles';
import { horizontals, verticals } from '../../helpers';
import { createSimpleVueTransition } from '../../styles/transition';
import { VAL_Y_POSITIONS, VAL_STICK_Y_POSITIONS } from '../../schemes';
import { booting } from '../../composables/booting.css';

const stickes = objectFromArray.build(VAL_STICK_Y_POSITIONS);

export const host = component.style({});

export const bodyBase = component.style({
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

  const host = component.style({});

  /**
   * Styles applied to body elements
   *
   * * This style name should not be compounded because we want to use it for Vue transitions as well!
   */
  const body = component.style({
    [x]: 0,
    width,
    pointerEvents: 'auto',
    willChange: 'transform',
    transition: `width ${computed.transition}`,
  });

  const positionStyles = {
    host,
    body,
    isActive: component.style({
      // zIndex: calc.add(tokens.zIndex, 2),
    }),
    isStatic: component.style({
      zIndex: tokens.zIndex,
    }),
    isRale: component.style({}),
    hasBackdrop: component.style({}),
    stickedTo: verticals((y) => [
      y,
      stickes((stickPosition) => [stickPosition, component.style({})]),
    ]),
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

  component.pushGlobalVars(':root', {
    [widthToken]: tokens.drawer[x].width,
    [offsetEndToken]: '0px',
    [staticOffsetEndToken]: '0px',
    [transitionToken]: '0s',
  });

  component.pushGlobalVars(`:root:has(${positionStyles.isRale})`, {
    [widthToken]: tokens.drawer[x].railWidth,
  });

  component.pushGlobalVars(
    `:root:has(${positionStyles.host}:not(${booting}))`,
    {
      [transitionToken]: tokens.transition.duration,
    },
  );

  component.pushGlobalVars(`:root:has(${positionStyles.isActive})`, {
    [offsetEndToken]: width,
  });

  component.pushGlobalVars(`:root:has(${positionStyles.isStatic})`, {
    [offsetEndToken]: width,
    [staticOffsetEndToken]: width,
  });

  VAL_Y_POSITIONS.forEach((y) => {
    const computedTokenName = extractTokenName(computed[y]);
    const systemBarComputed = computedTokens.systemBar[y];
    const toolbarComputed = computedTokens.toolbar[y];

    component.pushGlobalVars(':root', {
      [computedTokenName]: systemBarComputed.offsetEnd,
    });

    component.pushGlobalVars(
      `:root:has(${positionStyles.stickedTo[y].toolbar})`,
      {
        [computedTokenName]: toolbarComputed.offsetEnd,
      },
    );

    VAL_STICK_Y_POSITIONS.forEach((stickPosition) => {
      const stickClass = positionStyles.stickedTo[y][stickPosition];
      const targets: ('systemBar' | 'toolbar')[] = [];
      if (stickPosition === 'window') {
        targets.push('systemBar', 'toolbar');
      } else if (stickPosition === 'systemBar') {
        targets.push('toolbar');
      }

      targets.forEach((target) => {
        component.pushGlobalVars(
          `:root:has(${stickClass}):has(${positionStyles.isStatic}), :root:has(${stickClass}):has(${positionStyles.isActive}):not(:has(${positionStyles.hasBackdrop}))`,
          {
            [extractTokenName(computedTokens[target][y][x])]: width,
          },
        );
      });
    });
  });

  return [x, positionStyles];
});

component.dumpGlobalVars();
