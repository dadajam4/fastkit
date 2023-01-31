import { createGlobalTheme } from '@vanilla-extract/css';
import { tokens } from './tokens.css';
import { horizontals, verticals } from './utils';

createGlobalTheme(':root', tokens, {
  zIndex: '10',
  transition: {
    duration: '200ms',
    function: 'ease',
  },
  stack: {
    backdrop: {
      color: 'rgba(0, 0, 0, 0.5)',
    },
  },
  systemBar: {
    height: '30px',
    ...verticals((y) => [
      y,
      {
        height: tokens.systemBar.height,
      },
    ]),
  },
  toolbar: {
    height: '60px',
    ...verticals((y) => [
      y,
      {
        height: tokens.toolbar.height,
      },
    ]),
  },
  drawer: {
    width: '240px',
    railWidth: '56px',
    ...horizontals((x) => [
      x,
      { width: tokens.drawer.width, railWidth: tokens.drawer.railWidth },
    ]),
  },
  container: {
    padding: '32px',
  },
});
