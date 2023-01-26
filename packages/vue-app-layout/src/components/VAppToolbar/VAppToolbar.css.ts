import { style, globalStyle } from '@vanilla-extract/css';
import { calc } from '@vanilla-extract/css-utils';
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
  const toolbarComputed = computedTokens.toolbar[y];
  const systemBarComputed = computedTokens.systemBar[y];
  const computedHeightToken = extractTokenName(toolbarComputed.height);
  const computedOffsetEndToken = extractTokenName(toolbarComputed.offsetEnd);

  const host = style({
    height: tokens.toolbar[y].height,
    left: toolbarComputed.left,
    right: toolbarComputed.right,
    [y]: systemBarComputed.offsetEnd,
  });

  const positionStyles = {
    host,
  };

  globalStyle(':root', {
    vars: {
      [computedHeightToken]: '0px',
      [computedOffsetEndToken]: calc.add(
        toolbarComputed.height,
        systemBarComputed.height,
      ),
      ...horizontals((x) => [extractTokenName(toolbarComputed[x]), '0px']),
    },
  });

  globalStyle(`:root:has(${host})`, {
    vars: {
      [computedHeightToken]: tokens.toolbar[y].height,
    },
  });

  return [y, positionStyles];
});
