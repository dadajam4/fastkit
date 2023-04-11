import { scroll } from './scroll-by-internal';
import { ScrollOptions, ScrollResult, defaultSettings } from './schemes';
import { $, cumulativeOffset, error } from './util';

/**
 * スクロール先の要素をElement or CSSクエリストリングで示します。
 */
export type ScrollToElementTarget = string | Element;

/**
 * 要素へスクロールする際のオプション設定です。
 */
export interface ScrollToElementSettings {
  /**
   * 要素へスクロールする際、そのスクロール先をずらす際に設定します。<br>
   * x, y 個別に設定が可能ですが、シングルのnumberのみを指定した場合、x, y のそれぞれのオプションが有効な場合にのみその軸に設定されます。
   */
  offset: number | { x?: number; y?: number };

  /**
   * 横スクロールの可否を示します。
   */
  x: boolean;

  /**
   * 縦スクロールの可否を示します。
   */
  y: boolean;
}

/**
 * 要素スクロール利用事のデフォルト設定です。
 * {@link ScrollToElementSettings}
 */
export const scrollToElementSettingsDefaults: ScrollToElementSettings = {
  offset: 0,
  x: false,
  y: true,
};

/**
 * 要素へスクロールさせる際のオプション設定です。
 */
export type ScrollToElementOptions = Partial<
  ScrollOptions & ScrollToElementSettings
>;

/**
 * 任意の要素の位置へスクロールします。
 * @param target - スクロール先の要素
 * @param options - スクロールオプション
 */
export function scrollToElement(
  target: ScrollToElementTarget,
  options: ScrollToElementOptions = {},
): ScrollResult {
  //
  // Setup Options
  //

  const _options = Object.assign({}, scrollToElementSettingsDefaults, options);

  const { x, y } = _options;

  const offsetSource = _options.offset;

  const offset =
    typeof offsetSource === 'number'
      ? { x: offsetSource, y: offsetSource }
      : offsetSource;

  //
  // Setup Elements
  //

  const $target = $(target) as HTMLElement;
  if (!$target) throw error('missing element ' + target);

  const container = _options.container || defaultSettings.container;
  const $container = $(container) as HTMLElement;
  if (!$container) throw error('missing container ' + container);

  const cumulativeOffsetContainer = cumulativeOffset($container);
  const cumulativeOffsetTarget = cumulativeOffset($target);

  const initialY = $container.scrollTop;
  const initialX = $container.scrollLeft;

  const targetY =
    cumulativeOffsetTarget.top -
    cumulativeOffsetContainer.top +
    (offset.y || 0);

  const targetX =
    cumulativeOffsetTarget.left -
    cumulativeOffsetContainer.left +
    (offset.x || 0);

  const diffX = x ? targetX - initialX : 0;
  const diffY = y ? targetY - initialY : 0;

  return scroll(diffX, diffY, _options, {
    $container,
    initialX,
    initialY,
    targetX,
    targetY,
  });
}
