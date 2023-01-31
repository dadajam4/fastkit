import { style } from '@vanilla-extract/css';

const barBase = style({
  padding: '0 8px',
  display: 'flex',
  width: '100%',
  alignItems: 'center',
});

export const systemBar = style([
  barBase,
  {
    background: 'var(--palette-secondary)',
    color: '#fff',
    width: '100%',
  },
]);

export const toolbar = style([
  barBase,
  {
    background: 'var(--palette-background)',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
  },
]);

export const toolbarMenu = style({
  margin: '0 8px',
});

export const toolbarEdit = style({
  marginLeft: 'auto',
});

export const drawer = style({
  background: 'var(--palette-background)',
  width: '100%',
  overflowY: 'auto',
  WebkitOverflowScrolling: 'touch',
  paddingBottom: 32,
  vars: {
    '--val-container-padding': '12px',
  },
});

export const drawerRale = style({
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

export const drawerRaleButton = style({
  position: 'absolute',
  margin: 0,
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
});

export const drawerLabel = style({
  height: 'var(--val-topToolbar-height)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});
