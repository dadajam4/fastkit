import { scroll } from './scroll-by-internal';
import {
  ScrollOptions,
  defaultSettings,
  ScrollPosition,
  ScrollResult,
} from './schemes';
import { $, error } from './util';

/**
 * 任意の位置（px）へコンテナをスクロールします。
 * @param scrollPosition - スクロール先を指定します。x, y 共にオプショナルなるです。未指定の軸は現在のスクロール値のまま保持されます。
 * @param options - スクロールオプション
 */
export function scrollTo(
  scrollPosition: Partial<ScrollPosition>,
  options: ScrollOptions = {},
): ScrollResult {
  let { x, y } = scrollPosition;
  const container = options.container || defaultSettings.container;
  const $container = $(container) as HTMLElement;
  if (!$container) throw error('missing container ' + container);
  const initialY = $container.scrollTop;
  const initialX = $container.scrollLeft;
  if (x === undefined) x = initialX;
  if (y === undefined) y = initialY;
  const diffX = x - initialX;
  const diffY = y - initialY;

  return scroll(diffX, diffY, options, {
    $container,
    initialX,
    initialY,
    targetX: x,
    targetY: y,
  });
}
