import {
  ScrollOptions,
  ScrollResult,
  defaultSettings,
  ScrollPosition,
} from './schemes';
import { $, error } from './util';
import { scrollTo } from './scroll-to';

/**
 * y軸の両端の辺を示します。
 */
export type ScrollYSide = 'top' | 'bottom';

/**
 * x軸の両端の辺を示します。
 */
export type ScrollXSide = 'left' | 'right';

/**
 * コンテナの4辺を示します。
 */
export type ScrollSide = ScrollYSide | ScrollXSide;

/**
 * コンテナの辺へスクロールさせる際のターゲット指定のパターンです。
 */
export type ScrollToSideTargets =
  | ScrollSide
  | [ScrollSide]
  | [ScrollYSide, ScrollXSide]
  | [ScrollXSide, ScrollYSide];

/**
 * コンテナをいずれかの辺までスクロールします。
 * @param targets - 辺を指定します。シングルの文字列、及び配列に対応しています。
 * @param options - スクロールオプション
 */
export function scrollToSide(
  targets: ScrollToSideTargets,
  options?: ScrollOptions,
): ScrollResult {
  const sides: ScrollSide[] = typeof targets === 'string' ? [targets] : targets;
  const position: Partial<ScrollPosition> = {};

  const hasRight = sides.includes('right');
  const hasBottom = sides.includes('bottom');

  if (sides.includes('top')) {
    position.y = 0;
  }

  if (sides.includes('left')) {
    position.x = 0;
  }

  if (hasRight || hasBottom) {
    const container =
      (options && options.container) || defaultSettings.container;
    const $container = $(container) as HTMLElement;
    if (!$container) throw error('missing container ' + container);

    if (hasRight) position.x = $container.scrollWidth;
    if (hasBottom) position.y = $container.scrollHeight;
  }

  return scrollTo(position, options);
}

/**
 * コンテナを上辺までスクロールします。
 * @param options - スクロールオプション
 */
export function scrollToTop(options?: ScrollOptions) {
  return scrollToSide('top', options);
}

/**
 * コンテナを右辺までスクロールします。
 * @param options - スクロールオプション
 */
export function scrollToRight(options?: ScrollOptions) {
  return scrollToSide('right', options);
}

/**
 * コンテナを下辺までスクロールします。
 * @param options - スクロールオプション
 */
export function scrollToBottom(options?: ScrollOptions) {
  return scrollToSide('bottom', options);
}

/**
 * コンテナを左辺までスクロールします。
 * @param options - スクロールオプション
 */
export function scrollToLeft(options?: ScrollOptions) {
  return scrollToSide('left', options);
}

/**
 * コンテナを左上コーナーまでスクロールします。
 * @param options - スクロールオプション
 */
export function scrollToLeftTop(options?: ScrollOptions) {
  return scrollToSide(['left', 'top'], options);
}

/**
 * コンテナを左下コーナーまでスクロールします。
 * @param options - スクロールオプション
 */
export function scrollToLeftBottom(options?: ScrollOptions) {
  return scrollToSide(['left', 'bottom'], options);
}

/**
 * コンテナを右上コーナーまでスクロールします。
 * @param options - スクロールオプション
 */
export function scrollToRightTop(options?: ScrollOptions) {
  return scrollToSide(['right', 'top'], options);
}

/**
 * コンテナを右下コーナーまでスクロールします。
 * @param options - スクロールオプション
 */
export function scrollToRightBottom(options?: ScrollOptions) {
  return scrollToSide(['right', 'bottom'], options);
}
