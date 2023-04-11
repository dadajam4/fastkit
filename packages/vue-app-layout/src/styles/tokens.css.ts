import { createGlobalThemeContract, globalStyle } from '@vanilla-extract/css';
import { verticals, horizontals, sticks, extractTokenName } from './utils';

/**
 * Style token in vue-app-layout
 *
 * This token can be customized depending on the application used.
 */
export const tokens = createGlobalThemeContract({
  /**
   * Base value for z-index of floating elements.
   * @default "10"
   */
  zIndex: 'val-zIndex',
  /** Transition at element open/close */
  transition: {
    /**
     * Duration of transitions
     * @default "250ms"
     */
    duration: 'val-transition-duration',
    /**
     * timing function
     *
     * * Fade transitions will have `linear` applied instead of this value.
     *
     * @default "ease"
     */
    function: 'val-transition-function',
  },
  /** Elements covering windows and viewports */
  stack: {
    /** Back drop overlay */
    backdrop: {
      /**
       * Overlay Color
       * @default "rgba(0, 0, 0, 0.5)"
       */
      color: 'val-stack-backdrop-color',
    },
  },
  /** Token for system bar */
  systemBar: {
    /**
     * System bar default height
     * @default "30px"
     */
    height: 'val-systemBar-height',
    ...verticals((y) => [
      y,
      {
        /**
         * System bar height
         * @default "val-systemBar-height"
         */
        height: `val-${y}SystemBar-height`,
      },
    ]),
  },
  /** Token for toolbar */
  toolbar: {
    /**
     * Toolbar default height
     * @default "60px"
     */
    height: 'val-toolbar-height',
    ...verticals((y) => [
      y,
      {
        /**
         * Toolbar height
         * @default "val-toolbar-height"
         */
        height: `val-${y}Toolbar-height`,
      },
    ]),
  },
  /** Token for Drawer */
  drawer: {
    /**
     * Drawer default width
     * @default "240px"
     */
    width: 'val-drawer-width',
    /**
     * Width of drawer in rail condition
     * @default "56px"
     */
    railWidth: 'val-drawer-railWidth',
    ...horizontals((x) => [
      x,
      {
        /**
         * Drawer width
         * @default "val-drawer-width"
         */
        width: `val-${x}Drawer-width`,
        /**
         * Width of drawer in rail condition
         * @default "val-drawer-railWidth"
         */
        railWidth: `val-${x}Drawer-railWidth`,
      },
    ]),
  },
  /** Token for container */
  container: {
    /**
     * Left and right margins of container
     *
     * It is recommended that this value be controlled by media queries, etc.
     * @default "32px"
     */
    padding: 'val-container-padding',
  },
});

/**
 * Token holding the value computed by vue-app-layout
 *
 * It can be used in applications as needed.
 */
export const computedTokens = createGlobalThemeContract({
  /** Transition at element open/close */
  transition: 'val-computed-transition',
  /**
   * Calculated values for system bar
   */
  systemBar: {
    ...verticals((y) => {
      return [
        y,
        {
          /**
           * Height that the system bar occupies on the screen
           *
           * - When not displayed, it is `0px`.
           */
          height: `val-computed-${y}SystemBar-height`,
          /**
           * Coordinates of the end of the system bar inside the screen
           *
           * This value is always the same as `"val-computed-${y}SystemBar-height"`.
           */
          offsetEnd: `val-computed-${y}SystemBar-offsetEnd`,
          /**
           * Coordinates for starting point of transition
           *
           * This value is used inside vue-app-layout.
           */
          transitionOut: `val-computed-${y}SystemBar-transitionOut`,
          /**
           * Offset coordinates of the left edge of the system bar
           *
           * Width of the left drawer when it satisfies the following conditions
           *
           * - The upper end stick position is set to a position other than the system bar.
           * - Statically placed or opened in non-overlay mode
           */
          left: `val-computed-${y}SystemBar-left`,
          /**
           * Offset coordinates of the right edge of the system bar
           *
           * Width of the right drawer when it satisfies the following conditions
           *
           * - The upper end stick position is set to a position other than the system bar.
           * - Statically placed or opened in non-overlay mode
           */
          right: `val-computed-${y}SystemBar-right`,
          /**
           * Transition at system bar open/close
           *
           * This value is set to `0s` until the first rendering completes in the browser to avoid busy animations, such as during page transitions.
           */
          transition: `val-computed-${y}SystemBar-transition`,
        },
      ];
    }),
  },
  /**
   * Calculated values for toolbar
   */
  toolbar: {
    ...verticals((y) => {
      return [
        y,
        {
          /**
           * Height that the toolbar occupies on the screen
           *
           * - When not displayed, it is `0px`.
           */
          height: `val-computed-${y}Toolbar-height`,
          /**
           * Coordinates of the end of the toolbar inside the screen
           *
           * This value is usually the same as `"val-computed-${y}Toolbar-height"`, but if the system bar is displayed, `"val-computed-${y}SystemBar-height"` is added.
           */
          offsetEnd: `val-computed-${y}Toolbar-offsetEnd`,
          /**
           * Coordinates for starting point of transition
           *
           * This value is used inside vue-app-layout.
           */
          transitionOut: `val-computed-${y}Toolbar-transitionOut`,
          /**
           * Offset coordinates of the left edge of the toolbar
           *
           * Width of the left drawer when it satisfies the following conditions
           *
           * - The upper end stick position is set to a position other than the toolbar.
           * - Statically placed or opened in non-overlay mode
           */
          left: `val-computed-${y}Toolbar-left`,
          /**
           * Offset coordinates of the right edge of the toolbar
           *
           * Width of the right drawer when it satisfies the following conditions
           *
           * - The upper end stick position is set to a position other than the toolbar.
           * - Statically placed or opened in non-overlay mode
           */
          right: `val-computed-${y}Toolbar-right`,
          /**
           * Transition at toolbar open/close
           *
           * This value is set to `0s` until the first rendering completes in the browser to avoid busy animations, such as during page transitions.
           */
          transition: `val-computed-${y}Toolbar-transition`,
        },
      ];
    }),
  },
  stack: {
    ...horizontals((x) => [
      x,
      sticks.x((stickPosition) => [
        stickPosition,
        `val-computed-stack-${x}-${stickPosition}`,
      ]),
    ]),
    ...verticals((y) => [
      y,
      sticks.x((stickPosition) => [
        stickPosition,
        `val-computed-stack-${y}-${stickPosition}`,
      ]),
    ]),
  },
  /**
   * Calculated value of Drawer
   */
  drawer: {
    ...horizontals((x) => [
      x,
      {
        /**
         * Drawer width
         *
         * Size differs between normal and rail conditions.
         */
        width: `val-computed-${x}Drawer-width`,
        /**
         * Offset coordinates of top edge
         *
         * When the stick is installed, the inner end coordinates of the toolbar are applied, otherwise the inner end coordinates of the system bar are applied.
         */
        top: `val-computed-${x}Drawer-top`,
        /**
         * Offset coordinates of bottom edge
         *
         * When the stick is installed, the inner end coordinates of the toolbar are applied, otherwise the inner end coordinates of the system bar are applied.
         */
        bottom: `val-computed-${x}Drawer-bottom`,
        /**
         * Coordinates of the end of the drawer inside the screen
         */
        offsetEnd: `val-computed-${x}Drawer-offsetEnd`,
        /**
         * Transition at drawer open/close
         *
         * This value is set to `0s` until the first rendering completes in the browser to avoid busy animations, such as during page transitions.
         */
        transition: `val-computed-${x}Drawer-transition`,
      },
    ]),
  },
  staticDrawer: {
    ...horizontals((x) => [
      x,
      {
        /**
         * Coordinates of the end of the static drawer inside the screen
         */
        offsetEnd: `val-computed-${x}StaticDrawer-offsetEnd`,
      },
    ]),
  },
  /**
   * Calculated value of Viewport (main visible area of the document)
   */
  viewport: {
    /**
     * Offset coordinates of the top edge of the viewport
     * * Height of upper toolbar and system bar
     */
    top: 'val-computed-viewport-top',
    /**
     * Offset coordinates of the bottom edge of the viewport
     * * Lower toolbar and system bar height
     */
    bottom: 'val-computed-viewport-bottom',
    /**
     * Offset coordinates of the left edge of the viewport
     *
     * Width when left drawer is stationary or opened in non-overlay mode
     */
    left: 'val-computed-viewport-left',
    /**
     * Offset coordinates of the right edge of the viewport
     *
     * Width when right drawer is stationary or opened in non-overlay mode
     */
    right: 'val-computed-viewport-right',
    /** Viewport Width */
    width: 'val-computed-viewport-width',
    /** Viewport Height */
    height: 'val-computed-viewport-height',
  },
});

globalStyle(':root', {
  vars: {
    [extractTokenName(
      computedTokens.transition,
    )]: `${tokens.transition.duration} ${tokens.transition.function}`,
    ...verticals((y) => [
      extractTokenName(computedTokens.viewport[y]),
      computedTokens.toolbar[y].offsetEnd,
    ]),
    [extractTokenName(
      computedTokens.viewport.width,
    )]: `calc(100svw - ${computedTokens.drawer.left.offsetEnd} - ${computedTokens.drawer.right.offsetEnd})`,
    [extractTokenName(
      computedTokens.viewport.height,
    )]: `calc(100svh - ${computedTokens.toolbar.top.offsetEnd} - ${computedTokens.toolbar.bottom.offsetEnd})`,
  },
});
