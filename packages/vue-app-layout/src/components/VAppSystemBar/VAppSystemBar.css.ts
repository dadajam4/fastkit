import { style, globalStyle } from '@vanilla-extract/css';
import {
  tokens,
  computedTokens,
  verticals,
  horizontals,
  extractTokenName,
} from '../../styles';

export const host = style({
  display: 'flex',
  alignItems: 'stretch',
  position: 'fixed',
  zIndex: tokens.zIndex,
  transition: `left ${computedTokens.transition}, right ${computedTokens.transition}`,
  willChange: 'left, right',
});

export const positions = verticals((y) => {
  const systemBarComputed = computedTokens.systemBar[y];
  const computedHeightToken = extractTokenName(systemBarComputed.height);
  const computedOffsetEndToken = extractTokenName(systemBarComputed.offsetEnd);

  const host = style({
    height: tokens.systemBar[y].height,
    left: systemBarComputed.left,
    right: systemBarComputed.right,
    [y]: 0,
  });

  const positionStyles = {
    host,
  };

  globalStyle(':root', {
    vars: {
      [computedHeightToken]: '0px',
      [computedOffsetEndToken]: systemBarComputed.height,
      ...horizontals((x) => [extractTokenName(systemBarComputed[x]), '0px']),
    },
  });

  globalStyle(`:root:has(${host})`, {
    vars: {
      [computedHeightToken]: tokens.systemBar[y].height,
    },
  });
  return [y, positionStyles];
});
