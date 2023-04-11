import { style, globalStyle } from '@vanilla-extract/css';
import { calc } from '@vanilla-extract/css-utils';
import {
  tokens,
  computedTokens,
  verticals,
  horizontals,
  extractTokenName,
  createSimpleVueTransition,
} from '../../styles';
import {
  VueAppLayoutPositionY,
  VAL_X_POSITIONS,
  VueAppLayoutBarType,
} from '../../schemes';
import { booting } from '../../composables/booting.css';

interface PositionContext {
  computed: (typeof computedTokens)[VueAppLayoutBarType][VueAppLayoutPositionY];
  systemBarComputed: (typeof computedTokens.systemBar)[VueAppLayoutPositionY];
}

interface CreateBarStylesOptions {
  startPosition?: (ctx: PositionContext) => string | number;
  offsetEndAppends?: (ctx: PositionContext) => string | number;
}

const transitionBase = `left ${computedTokens.drawer.left.transition}, right ${computedTokens.drawer.right.transition}`;

export const hostBase = style({
  display: 'flex',
  alignItems: 'stretch',
  position: 'fixed',
  zIndex: calc.add(tokens.zIndex, 1),
  willChange: VAL_X_POSITIONS.join(', '),
});

function createBarStyles(
  type: VueAppLayoutBarType,
  opts: CreateBarStylesOptions = {},
) {
  const { startPosition, offsetEndAppends } = opts;

  const positions = verticals((y) => {
    const computed = computedTokens[type][y];
    const computedHeightToken = extractTokenName(computed.height);
    const computedOffsetEndToken = extractTokenName(computed.offsetEnd);
    const computedTransitionOutToken = extractTokenName(computed.transitionOut);

    const systemBarComputed = computedTokens.systemBar[y];
    const transitionOutVec = y === 'top' ? -1 : 1;
    const ctx: PositionContext = { computed, systemBarComputed };
    const transitions = [transitionBase];
    if (startPosition) {
      transitions.push(`${y} ${computedTokens.transition}`);
    }

    const host = style({
      height: tokens[type][y].height,
      left: computed.left,
      right: computed.right,
      transition: transitions.join(', '),
      [y]: startPosition ? startPosition(ctx) : 0,
    });

    const isUnder = style({
      zIndex: tokens.zIndex,
    });

    createSimpleVueTransition(
      {
        in: {
          transition: `transform ${computedTokens.transition}`,
        },
        out: {
          transform: `translateY(${computed.transitionOut})`,
        },
      },
      host,
    );

    const positionStyles = {
      host,
      isUnder,
    };

    const offsetEnd = offsetEndAppends
      ? calc.add(computed.height, offsetEndAppends(ctx))
      : computed.height;

    const transitionToken = extractTokenName(computed.transition);

    globalStyle(':root', {
      vars: {
        [computedHeightToken]: '0px',
        [computedOffsetEndToken]: offsetEnd,
        [computedTransitionOutToken]: `calc(100% * ${transitionOutVec})`,
        [transitionToken]: '0s',
        ...horizontals((x) => [extractTokenName(computed[x]), '0px']),
      },
    });

    globalStyle(`:root:has(${host}:not(${host}-leave-active))`, {
      vars: {
        [computedHeightToken]: tokens[type][y].height,
      },
    });

    globalStyle(`${host}-enter-active, ${host}-leave-active`, {
      zIndex: `${tokens.zIndex}`,
    });

    globalStyle(`:root:has(${host}:not(${booting}))`, {
      vars: {
        [transitionToken]: computedTokens.transition,
      },
    });

    return [y, positionStyles];
  });

  return {
    positions,
  };
}

export const systemBar = createBarStyles('systemBar');

export const toolbar = createBarStyles('toolbar', {
  startPosition({ systemBarComputed }) {
    return systemBarComputed.offsetEnd;
  },
  offsetEndAppends({ systemBarComputed }) {
    return systemBarComputed.height;
  },
});
