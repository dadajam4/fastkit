import { EasingName } from './easings';

/**
 * スクロール系メソッドの基本オプション設定です。
 */
export interface ScrollBaseSettings {
  /**
   * アニメーションの総合時間をms単位で指定します。
   */
  duration: number;

  /**
   * アニメーションのイージングを指定します。
   * {@link EasingName}
   */
  easing: EasingName;

  /**
   * スクロールアニメーションがユーザーのインタラクションにより中断可能かをboolean値で示します。
   */
  cancelable: boolean;
}

/**
 * Scrollerで利用するスクロール系メソッドのオプション設定です。
 */
export interface ScrollerScrollSettings extends ScrollBaseSettings {
  onProgoress?: ScrollCallback;
  onCancel?: ScrollCallback;
  onDone?: ScrollCallback;
}

export interface ScrollSettings extends ScrollerScrollSettings {
  container: string | Element;
}

export type ScrollerScrollOptions = Partial<ScrollerScrollSettings>;
export type ScrollOptions = Partial<ScrollSettings>;

/**
 * スクロール関連メソッドによるスクロールアニメーションをキャンセルするメソッドです。<br>
 * ユーザーのインタラクション起因の中断の場合、Eventオブジェクトが渡されます。
 */
export type ScrollCanceller = (
  event?: Event | null,
  checkCancelable?: boolean,
) => void;

/**
 * スクロール関連メソッドの返却値となるインターフェースです。
 */
export interface ScrollResult {
  /**
   * スクロールをキャンセルするメソッドです。
   */
  cancel: ScrollCanceller;

  /**
   * スクロールの完了、キャンセル、中断を問わず終了を検知するPromiseインスタンスです。
   */
  promise: Promise<void>; // resolve when done or cancel

  /**
   * スクロール開始位置から完了位置までの想定px数をx、y軸共に返却します。<br>
   * スクロールが途中でキャンセルされた場合はこのpxが加算されていない事もあります。
   */
  plans: { x: number; y: number };
}

/**
 * スクロール関連の各種メソッドにおいて、コールバックメソッドに渡されるインターフェースです。
 */
export interface ScrollCallbackValues {
  /**
   * スクロール中のコンテナ要素です。
   */
  container: Element;

  /**
   * スクロールの進捗を0〜1で示します。
   */
  progress: number;

  /**
   * スクロールが中断されている場合trueを示します。
   */
  aborted: boolean;

  /**
   * ユーザーのインタラクションによりスクロールが中断されていた場合、そのEventオブジェクトが設定されます。
   */
  abortEventSource: Event | null;
}

export type ScrollCallback = (
  scrollToCallbackValues: ScrollCallbackValues,
) => any;

/**
 * スクロール値をx軸、y軸で示します。
 */
export interface ScrollPosition {
  x: number;
  y: number;
}

export const defaultBaseSettings: ScrollBaseSettings = {
  duration: 500,
  easing: 'ease',
  cancelable: true,
};

export const defaultSettings: ScrollSettings = {
  get container(): Element {
    return document.scrollingElement as Element;
  },
  ...defaultBaseSettings,
};
