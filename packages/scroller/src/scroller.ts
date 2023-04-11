import { EV } from '@fastkit/ev';
import {
  visibilityManager,
  VisibilityStateListener,
} from '@fastkit/visibility';
import { IN_WINDOW } from '@fastkit/helpers';
import { isDocumentElement, isBodyElement } from './util';
import { logger } from './logger';

import { enableScroll, disableScroll } from './prevent-scroll';

export * from './prevent-scroll';

import {
  ScrollPosition,
  ScrollOptions,
  ScrollBaseSettings,
  ScrollToElementTarget,
  ScrollResult,
  ScrollerScrollOptions,
  ScrollToElementSettings,
  scrollToElementSettingsDefaults as _scrollToElementSettingsDefaults,
  scrollBy,
  scrollTo,
  scrollToElement,
  scrollToSide,
  scrollToTop,
  scrollToRight,
  scrollToBottom,
  scrollToLeft,
  scrollToLeftTop,
  scrollToLeftBottom,
  scrollToRightTop,
  scrollToRightBottom,
  ScrollToSideTargets,
  ScrollToElementOptions,
} from './scroll';

import { defaultBaseSettings } from './scroll/schemes';

export * from './scroll';

export type ScrollToElementAddtionalOffset =
  | number
  | { x?: number; y?: number }
  | ((scroller: Scroller) => number | { x?: number; y?: number } | undefined);

/**
 * [[Scroller]]を任意のElementまでスクロールさせる際のオプションです。
 * 詳細は [[ScrollerScrollOptions]] 及び、 [[ScrollToElementSettings]] を参照してください。
 */
export type ScrollerScrollToElementOptions = Partial<
  ScrollerScrollOptions & ScrollToElementSettings
>;

// Scroller は設定されたコンテキスト要素に応じてscrollやsize検知のリスナを
// window か 自身のelementに切り替えます
type ScrollerEventTarget = Window | Element;

/**
 * Scrollerに縦スクロールが発生した際の方向を示すTypeです。
 */
export type ScrollYDirection = 'top' | 'bottom';

/**
 * Scrollerに横スクロールが発生した際の方向を示すTypeです。
 */
export type ScrollXDirection = 'left' | 'right';

/**
 * Scrollerにスクロールが発生した際の方向を示すTypeです。
 */
export type ScrollDirection = ScrollYDirection | ScrollXDirection;

/**
 * スクロールの軸を示します。
 * xは水平、
 * yは垂直をそれぞれ示します
 */
export type ScrollAxis = 'x' | 'y';

export interface ScrollSizeOvserverSetting {
  interval: number;
  width: boolean;
  height: boolean;
}

/**
 * Scrollerの基本セッティングです。
 * 個々のフィールドの詳細は[[Scroller]]の同名プロパティを参照してください。
 */
export interface ScrollerSetting {
  el: Element | string | null;
  scrollingJudgeInterval: number;
  baseAxis: ScrollAxis;
  scrollSizeOvserver: Partial<ScrollSizeOvserverSetting>;
}

/**
 * Elementのscrollイベントを検知した際に、通知する情報です
 * 現在のスクロールポジションや、スクロール開始（or前回のtick）からのスクロール量が渡されます。
 */
export interface ScrollerPayload {
  /**
   * [[Scroller.scrollTop]] が渡されます
   */
  top: number;

  /**
   * [[Scroller.scrollLeft]] が渡されます
   */
  left: number;

  /**
   * [[Scroller.scrollBottom]] が渡されます
   */
  bottom: number;

  /**
   * [[Scroller.scrollRight]] が渡されます
   */
  right: number;

  /**
   * 発生したスクロールの軸が渡されます。
   * 斜めスクロールが発生した際は、x、yのうち移動量が大きいものが自動判定されて渡されます。
   * どちらも同じ移動量であった場合は[[Scroller.baseAxis]]の設定値が渡されます。
   */
  axis: ScrollAxis;

  /**
   * 発生したスクロールの方向が渡されます。
   * 斜めスクロールが発生した際は、x、yのうち移動量が大きいものが自動判定されて渡されます。
   * どちらも同じ移動量であった場合は[[Scroller.baseAxis]]の設定値が渡されます。
   */
  direction: ScrollDirection;

  /**
   * 発生したスクロールの水平方向が渡されます。
   */
  directionX: ScrollXDirection;

  /**
   * 発生したスクロールの垂直方向が渡されます。
   */
  directionY: ScrollYDirection;

  // tick ammount at element.on('scroll') detect

  /**
   * [[Scroller.on]]('scroll')時の前回からの水平移動量が渡されます。
   */
  tickedX: number;

  /**
   * [[Scroller.on]]('scroll')時の前回からの垂直移動量が渡されます。
   */
  tickedY: number;

  /**
   * [[Scroller.on]]('scrollStart')時からの合計水平移動量が渡されます。
   */
  totalX: number;

  /**
   * [[Scroller.on]]('scrollStart')時からの合計垂直移動量が渡されます。
   */
  totalY: number;
}

/**
 * Scrollerは設定されたElementのスクロール開始、tick、終了を検知し
 * イベントを通知します。
 * これらのイベントを購読する事でスクロール量や移動方向を検知可能です。
 */
export interface ScrollerScrollEventMap {
  /**
   * スクロールの開始時に発生します。
   */
  scrollStart: ScrollerPayload;

  /**
   * 毎スクロール検知時に発生します。
   */
  scroll: ScrollerPayload;

  /**
   * スクロールの終了時に発生します。
   */
  scrollEnd: ScrollerPayload;
}

/**
 * Scrollerに発生するイベントの全てです。
 */
export interface ScrollerEventMap extends ScrollerScrollEventMap {
  /**
   * Scrollerが利用可能になった時（Elementが設定されて初期化が完了した）に発生します。
   */
  ready: void;

  /**
   * [[Scroller.state]]が変更された時に発生します。
   */
  changeState: ScrollerState;

  /**
   * [[Scroller.el]]のサイズ変更を検知した際に発生します。
   */
  resize: { width: number; height: number };

  /**
   * [[Scroller.lastAxis]]の変更を検知した際に発生します。
   */
  changeAxis: ScrollAxis;

  /**
   * [[Scroller.lastDirection]]の変更を検知した際に発生します。
   */
  changeLastDirection: ScrollDirection;

  /**
   * [[Scroller.lastYDirection]]の変更を検知した際に発生します。
   */
  changeLastYDirection: ScrollYDirection;

  /**
   * [[Scroller.lastXDirection]]の変更を検知した際に発生します。
   */
  changeLastXDirection: ScrollXDirection;
}

/**
 * Scrollerの状態を示します。
 */
export enum ScrollerState {
  /**
   * Scrollerが初期化されていない（Elementが設定されていない）状態を示します。
   */
  Pending = 'pending',

  /**
   * Scrollerが初期化されているが、[[Scroller.el]]のリサイズやスクロールのイベント監視が動作していない状態を示します。
   */
  Ready = 'ready',

  /**
   * Scrollerが初期化されていて、[[Scroller.el]]のリサイズやスクロールのイベント監視が動作している状態を示します。
   */
  Running = 'running',

  /**
   * [[Scroller.destroy]]が実行され、Scrollerが利用不可である状態を示します。
   */
  Destroyed = 'destroyed',
}

/**
 * Scrollerクラスの状態を監視＆同期するオブジェクトが
 * 保有すべきプロパティ一覧です。
 * 個々のプロパティ名は、同名のScrollerクラスのプロパティを参照して下さい
 */
export interface ScrollerObserver {
  state: ScrollerState;
  isPending: boolean;
  isReady: boolean;
  isRunning: boolean;
  isDestroyed: boolean;
  scrollEnabled: boolean;
  containerWidth: number;
  containerHeight: number;
  scrollWidth: number;
  scrollHeight: number;
  scrollableX: boolean;
  scrollableY: boolean;
  scrollTop: number;
  scrollLeft: number;
  scrollRight: number;
  scrollBottom: number;
  lastAxis: ScrollAxis;
  lastDirection: ScrollDirection;
  lastYDirection: ScrollYDirection;
  lastXDirection: ScrollXDirection;
  nowScrolling: boolean;
}

/**
 * Scrollerクラスの状態を監視＆同期するオブジェクトが
 * 保有すべきプロパティ一のキー覧です。
 */
export type ScrollerObservableKeys = keyof ScrollerObserver;
const scrollerObservableKeys: ScrollerObservableKeys[] = [
  'state',
  'isPending',
  'isReady',
  'isRunning',
  'isDestroyed',
  'scrollEnabled',
  'containerWidth',
  'containerHeight',
  'scrollWidth',
  'scrollHeight',
  'scrollableX',
  'scrollableY',
  'scrollTop',
  'scrollLeft',
  'scrollRight',
  'scrollBottom',
  'lastAxis',
  'lastDirection',
  'lastYDirection',
  'lastXDirection',
  'nowScrolling',
];

/**
 * スクロールを停止させるためのソースオブジェクト
 */
export type ScrollStopper = number | string | Record<string, unknown> | symbol;

/**
 * 任意のElement（or HTML Document）のスクロールやサイズ変更を監視し、その情報を通知するクラスです。<br>
 * <a href="https://dadajam4.github.io/dadajam4/ev/classes/_ev_.ev.html" target="_blank">EV</a>を継承しており、イベントの購読[[Scroller.on]]等のインターフェースを利用するか、
 * [[Scroller.observe]]メソッドを利用します。<br>
 * [[Scroller.on]]、[[Scroller.once]]で購読可能なイベントについては[[ScrollerEventMap]]を参照してください。
 */
export class Scroller extends EV<ScrollerEventMap> {
  /**
   * Scrollerクラスの状態を監視＆同期するオブジェクトが
   * 保有すべきプロパティ一のキーの配列です。
   */
  static readonly scrollerObservableKeys = scrollerObservableKeys;

  /**
   * Scrollerの状態を示すenum値です。
   * {@link ScrollerState}
   */
  static readonly States = ScrollerState;

  /**
   * スクロールを検知してから、移動がなくなった際に、何ms後にスクロール終了と判定するかのインターバル値を示します。
   * デフォルトは500です。
   */
  scrollingJudgeInterval = 500;

  /**
   * 縦、横のどちらのスクロールを基準とするかを示します。
   * デフォルトはyです。<br>
   * この設定は[[Scroller.toElement]]のデフォルト値にも影響します。
   */
  baseAxis: ScrollAxis = 'y';

  /**
   * スクロール系メソッド[[Scroller.to]]等を利用する際のデフォルトの設定を示します。
   */
  scrollSettingsDefaults: ScrollBaseSettings = { ...defaultBaseSettings };

  /**
   * [[Scroller.toElement]]のデフォルトオプションの設定を示します。
   */
  scrollToElementSettingsDefaults: ScrollerScrollToElementOptions = {
    ..._scrollToElementSettingsDefaults,
  };

  scrollSizeOvserver?: ScrollSizeOvserverSetting;

  /**
   * 設定されたElement要素です。
   * 初期化が完了していない時には本getterはundefinedを返却する事に注意してください。
   */
  get el() {
    return this._el;
  }

  /**
   * 現在の状態です。<br>
   * {@link ScrollerState}
   */
  get state(): ScrollerState {
    return this._state;
  }

  /**
   * 未初期化である場合trueを示します。
   */
  get isPending(): boolean {
    return this._state === ScrollerState.Pending;
  }

  /**
   * 初期化済み＆停止状態である場合trueを示します。
   */
  get isReady(): boolean {
    return this._state === ScrollerState.Ready;
  }

  /**
   * 初期化済み＆動作中である場合trueを示します。
   */
  get isRunning(): boolean {
    return this._state === ScrollerState.Running;
  }

  /**
   * インスタンスが破棄済みである場合trueを示します。
   */
  get isDestroyed(): boolean {
    return this._state === ScrollerState.Destroyed;
  }

  /**
   * スクロールの有効状態を取得します
   */
  get scrollEnabled(): boolean {
    return this._scrollStoppers.length === 0;
  }

  /**
   * スクロール要素の幅を示します。
   */
  get containerWidth(): number {
    return this._containerWidth;
  }

  /**
   * スクロール要素の高さを示します。
   */
  get containerHeight(): number {
    return this._containerHeight;
  }

  /**
   * スクロール要素内のコンテンツの幅を示します。
   */
  get scrollWidth(): number {
    return this._scrollWidth;
  }

  /**
   * スクロール要素内のコンテンツの高さを示します。
   */
  get scrollHeight(): number {
    return this._scrollHeight;
  }

  /**
   * x軸にスクロール可能な場合trueを示します
   */
  get scrollableX(): boolean {
    return this._scrollWidth > this._containerWidth;
  }

  /**
   * y軸にスクロール可能な場合trueを示します
   */
  get scrollableY(): boolean {
    return this._scrollHeight > this._containerHeight;
  }

  /**
   * 現在の上辺からのスクロール量を示します。
   */
  get scrollTop(): number {
    return this._scrollTop;
  }

  set scrollTop(scrollTop: number) {
    if (!this.el) return;
    this.el.scrollTop = scrollTop;
  }

  /**
   * 現在の右辺からのスクロール量を示します。
   */
  get scrollRight(): number {
    return this._scrollRight;
  }

  set scrollRight(scrollRight: number) {
    if (!this.el) return;
    this.el.scrollLeft = this._scrollWidth - this._containerWidth - scrollRight;
  }

  /**
   * 現在の下辺からのスクロール量を示します。
   */
  get scrollBottom(): number {
    return this._scrollBottom;
  }

  set scrollBottom(scrollBottom: number) {
    if (!this.el) return;
    this.el.scrollTop =
      this._scrollHeight - this._containerHeight - scrollBottom;
  }

  /**
   * 現在の左辺からのスクロール量を示します。
   */
  get scrollLeft(): number {
    return this._scrollLeft;
  }

  set scrollLeft(scrollLeft: number) {
    if (!this.el) return;
    this.el.scrollLeft = scrollLeft;
  }

  /**
   * 現在スクロール中である場合trueを示します。
   */
  get nowScrolling(): boolean {
    return this._nowScrolling;
  }

  /**
   * 最後に検知したスクロールの軸を示します。
   */
  get lastAxis(): ScrollAxis {
    return this._lastAxis;
  }

  /**
   * 最後に検知したスクロールの方向を示します。
   */
  get lastDirection(): ScrollDirection {
    return this._lastDirection;
  }

  /**
   * 最後に検知したスクロールの垂直方向を示します。
   */
  get lastYDirection(): ScrollYDirection {
    return this._lastYDirection;
  }

  /**
   * 最後に検知したスクロールの水平方向を示します。
   */
  get lastXDirection(): ScrollXDirection {
    return this._lastXDirection;
  }

  /**
   * 最後に検知したスクロールにより通知した情報を示します。
   */
  get lastPayload(): ScrollerPayload {
    return {
      top: this._scrollTop,
      left: this._scrollLeft,
      bottom: this._scrollBottom,
      right: this._scrollRight,
      axis: this._lastAxis,
      direction: this._lastDirection,
      directionX: this._lastXDirection,
      directionY: this._lastYDirection,
      tickedX: this._tickedX,
      tickedY: this._tickedY,
      totalX: this._lastTotalX,
      totalY: this._lastTotalY,
    };
  }

  private _el!: Element | null;
  private _eventTarget!: ScrollerEventTarget;
  private _isDocumentElement = false;
  private _isBodyElement = false;
  private _isRootElement = false;
  private _state: ScrollerState = ScrollerState.Pending;
  private _containerWidth = 0;
  private _containerHeight = 0;
  private _scrollWidth = 0;
  private _scrollHeight = 0;
  private _scrollTop = 0;
  private _scrollRight = 0;
  private _scrollBottom = 0;
  private _scrollLeft = 0;
  private _lastAxis: ScrollAxis;
  private _lastDirection: ScrollDirection;
  private _lastYDirection: ScrollYDirection = 'top';
  private _lastXDirection: ScrollXDirection = 'left';
  private _nowScrolling = false;
  // eslint-disable-next-line @typescript-eslint/ban-types
  private _readyResolvers: Function[] = [];
  private _scrollingJudgeTimerId: number | null = null;
  private _startX = 0;
  private _startY = 0;
  private _tickedX = 0;
  private _tickedY = 0;
  private _lastTotalX = 0;
  private _lastTotalY = 0;
  private _scrollListener?: EventListener;
  private _resizeListener?: EventListener;
  private _resizeObserver?: ResizeObserver;
  private _scrollToResult: ScrollResult | null = null;
  private _observers: ScrollerObserver[] = [];
  private _scrollStoppers: ScrollStopper[] = [];
  private _scrollSizeOvserverPollingId: number | null = null;
  private _scrollSizeOvserverSuspended = false;
  private _visibilityListener: VisibilityStateListener;

  /**
   * Scrollerインスタンスを作成します。
   * コンテキストとなるElementをこの時点で指定するか否かは任意です。
   *
   * @param settingOrElementOrQueryString - 任意です。{@link ScrollerSetting}か Element（or cssクエリセレクタ文字列）を直接指定します。この時点でElementを指定しない場合は、[[setElement]]を実行するまでインスタンスは動作しません。
   */
  constructor(
    settingOrElementOrQueryString:
      | Partial<ScrollerSetting>
      | Element
      | string = {},
  ) {
    super();

    const convertedSetting: Partial<ScrollerSetting> =
      typeof settingOrElementOrQueryString === 'string' ||
      settingOrElementOrQueryString === null ||
      (IN_WINDOW && settingOrElementOrQueryString instanceof Element)
        ? (settingOrElementOrQueryString = {
            el: <Element | string>settingOrElementOrQueryString,
          })
        : (settingOrElementOrQueryString as Partial<ScrollerSetting>);

    if (convertedSetting.scrollingJudgeInterval !== undefined)
      this.scrollingJudgeInterval = convertedSetting.scrollingJudgeInterval;

    if (convertedSetting.baseAxis) this.baseAxis = convertedSetting.baseAxis;
    this._lastAxis = this.baseAxis;

    const { scrollSizeOvserver } = convertedSetting;
    if (scrollSizeOvserver) {
      this.scrollSizeOvserver = {
        interval: 500,
        width: true,
        height: true,
        ...scrollSizeOvserver,
      };
    }

    this._visibilityListener = () => {
      if (visibilityManager.isVisible) {
        this.update();
        if (this._scrollSizeOvserverSuspended) {
          this._scrollSizeOvserverSuspended = false;
          this._startScrollSizeOvserver();
        }
      } else {
        this._scrollSizeOvserverSuspended =
          this._scrollSizeOvserverPollingId !== null;
        this._stopScrollSizeOvserver();
      }
    };

    this._lastDirection = this._lastAxis === 'y' ? 'top' : 'left';

    // for SSR
    if (!IN_WINDOW) return;

    // Add Visibility Listener
    visibilityManager.change(this._visibilityListener);

    // Skip auto setup when missing scrolling element.
    this.setElement(convertedSetting.el);
  }

  /**
   * インスタンスにElementを設定します。特別な理由（SSRの利用等）によりコンストラクタでElementを指定できない場合、
   * 本メソッドを利用しブラウザコンテキスト配下で本メソッドを実行してください。
   * @param el - Element、もしくはCSSクエリセレクタ文字列を指定します。
   */
  setElement(el?: Element | string | null) {
    if (el === null) return;
    if (!IN_WINDOW)
      logger.error('Element can be set only when it is under DOM context.');

    this.stop();

    let _el: Element | null;
    if (typeof el === 'string') {
      _el = document.querySelector(el);
    } else {
      _el = el || document.scrollingElement;
    }
    if (!_el) {
      const message = 'missing scrolling element';
      logger.error(message, el);
      throw new Error(message);
    }

    this._el = _el;
    this._isDocumentElement = isDocumentElement(_el);
    this._isBodyElement = isBodyElement(_el);
    this._isRootElement = this._isDocumentElement || this._isBodyElement;
    this._eventTarget =
      this._isDocumentElement || this._isBodyElement ? window : this._el;

    this._setup();
  }

  private _scrollToElementAddtionalOffset:
    | ScrollToElementAddtionalOffset
    | undefined;

  setScrollToElementAddtionalOffset(
    offset: ScrollToElementAddtionalOffset | undefined,
  ) {
    this._scrollToElementAddtionalOffset = offset;
  }

  deleteScrollToElementAddtionalOffset() {
    delete this._scrollToElementAddtionalOffset;
  }

  /**
   * インスタンスが実行可能になった際にresolveされるPromiseインスタンスを返却します。
   */
  ready(): Promise<void> {
    this._checkDestroyed();
    if (!this.isPending) return Promise.resolve();
    return new Promise((resolve) => this._readyResolvers.push(resolve));
  }

  /**
   * インスタンスの動作を開始します。本インスタンスはElementが設定され初期化された際に自動で動作を開始しますが、
   * [[Scroller.stop]]メソッドを利用し動作を停止した後に再開する場合に本メソッドを利用します。
   */
  async start(): Promise<void> {
    this._checkDestroyed();
    if (this.isRunning) return;
    await this.ready();
    this._startListeners();
    this._setState(ScrollerState.Running);
  }

  /**
   * インスタンスの動作（スクロール、リサイズイベントの検知等）を停止します。
   * 何らかの理由で動作を停止させたい場合に利用してください。
   * 本メソッドを実行後もインスタンス内の状態は保持されたままです。
   * 完全にインスタンスを破棄するためには[[Scroller.destroy]]を利用してください。
   */
  stop(): void {
    this._checkDestroyed();
    if (!this.isRunning) return;
    this._stopListeners();
    this._setState(ScrollerState.Ready);
  }

  /**
   * インスタンスの動作を停止し、内部情報を完全に破棄します。
   * これに伴い、スクロール中であった場合にはキャンセルされ、以後イベント通知は完全に行われません。
   * また[[Scroller.start]]メソッドでの再利用も不可となります。
   * 本インスタンスの利用を完全に停止する場合に必ず実行し、利用側のオブジェクト等において本インスタンスへの参照を完全に削除してください。
   * 本メソッドはSPA等でのサービスにおいては意識的に実行する事を強く推奨します。
   */
  destroy() {
    if (this.isDestroyed) return;
    this.stop();
    this.cancel();
    this._readyResolvers = [];
    this._scrollStoppers = [];
    this._scrollEnable();
    this._observers = [];
    visibilityManager.remove(this._visibilityListener);

    delete (this as any)._el;
    delete (this as any)._eventTarget;
    delete this._scrollListener;
    delete this._resizeListener;
    delete (this as any)._resizeObserver;
    delete (this as any)._scrollToResult;
    delete (this as any)._visibilityListener;

    this.deleteScrollToElementAddtionalOffset();
    this._setState(ScrollerState.Destroyed);
    this.offAll();
  }

  /**
   * インスタンス内部のスクロール量や、Elementのサイズを強制的に更新します。
   * 基本的に利用が必要なケースはありませんが、何らかの理由で更新をトリガーしたい場合に利用します。
   */
  update(): void {
    this._update();
  }

  /**
   * インスタンス内の情報をjsonオブジェクトとして返却します。
   * 情報の詳細は[[ScrollerObserver]]を参照してください。
   */
  toJSON(): ScrollerObserver {
    const json: Partial<ScrollerObserver> = {};
    for (const key of scrollerObservableKeys) {
      json[key] = this[key] as any;
    }
    return <ScrollerObserver>json;
  }

  /**
   * [[Scroller.toJSON]]の情報を文字列として返却します。
   */
  toString(): string {
    return JSON.stringify(this.toJSON());
  }

  /**
   * 本インスタンスの情報を購読するためのオブジェクトを設定する事で、
   * インスタンスの内部情報が変更される度にパラメータが同期されます。
   * 設定するオブジェクトは[[ScrollerObserver]]のインターフェースを満たしていれば内容は問いません。
   * 本機能により同期される方法は単純にオブジェクトプロパティへの変数代入です。
   * 従って対象となるプロパティをgetterとして実装（Ex: Vue computed等、、）しておく事により、
   * 同期を受け取るオブジェクト側でパラメータ変更後の動作をリアクティブに実装可能です。
   * @param observer - 同期させたいオブジェクト
   * @returns 同期を停止するためのメソッド
   */
  observe(observer: ScrollerObserver): () => void {
    if (!this._observers.includes(observer)) {
      this._observers.push(observer);
    }
    this._syncToObserver(observer);
    const unobserve = () => {
      this.unobserve(observer);
    };
    return unobserve;
  }

  /**
   * [[Scroller.observe]]でパラメータ同期中のオブジェクトを停止します。
   * [[Scroller.destroy]]実行時にも、同期中のオブジェクトは全停止されますが、destroy前に任意のタイミングで停止したい場合
   * 本メソッドを利用します。
   * @param observer - 同期中のオブジェクト
   */
  unobserve(observer: ScrollerObserver) {
    const index = this._observers.indexOf(observer);
    if (index !== -1) {
      this._observers.splice(index, 1);
    }
  }

  /**
   * スクロール中であった場合、スクロールをキャンセルします。
   */
  cancel() {
    if (!this._scrollToResult) return;
    this._scrollToResult.cancel();
    this._clearScrollToResult();
  }

  /**
   * x, yの差分pxを指定しスクロールします。
   * メソッド、パラメータの詳細は[[scrollBy]]を参照してください。
   * @param diffX - 横移動量
   * @param diffY - 縦移動量
   * @param options - スクロールオプション
   */
  by(
    diffX: number,
    diffY: number,
    options?: ScrollerScrollOptions,
  ): ScrollResult {
    return this._setScrollToResult(
      scrollBy(diffX, diffY, this._createMergedScrollOptions(options)),
    );
  }

  /**
   * 指定の座標へスクロールします。
   * メソッド、パラメータの詳細は[[scrollTo]]を参照してください。
   * @param scrollPosition - 座標
   * @param options - スクロールオプション
   */
  to(
    scrollPosition: Partial<ScrollPosition>,
    options?: ScrollerScrollOptions,
  ): ScrollResult {
    return this._setScrollToResult(
      scrollTo(scrollPosition, this._createMergedScrollOptions(options)),
    );
  }

  /**
   * 指定の要素の位置へスクロールします。
   * メソッド、パラメータの詳細は[[scrollToElement]]を参照してください。
   * オプションのx, yが未設定であった場合、[[Scroller.baseAxis]]により自動設定されます。
   * @param target - スクロール先の要素
   * @param options - スクロールオプション
   */
  toElement(
    target: ScrollToElementTarget,
    options?: ScrollerScrollToElementOptions,
  ) {
    const merged = this._createMergedScrollToElementOptions(options);
    if (merged.x === undefined) merged.x = this.baseAxis === 'x';
    if (merged.y === undefined) merged.y = this.baseAxis === 'y';

    return this._setScrollToResult(scrollToElement(target, merged));
  }

  /**
   * 指定の辺へスクロールします。
   * メソッド、パラメータの詳細は[[scrollToSide]]を参照してください。
   * @param targets - スクロール先
   * @param options - スクロールオプション
   */
  toSide(
    targets: ScrollToSideTargets,
    options?: ScrollerScrollOptions,
  ): ScrollResult {
    return this._setScrollToResult(
      scrollToSide(targets, this._createMergedScrollOptions(options)),
    );
  }

  /**
   * 上辺へスクロールします。
   * メソッド、パラメータの詳細は[[scrollToTop]]を参照してください。
   * @param options - スクロールオプション
   */
  toTop(options?: ScrollerScrollOptions) {
    return this._setScrollToResult(
      scrollToTop(this._createMergedScrollOptions(options)),
    );
  }

  /**
   * 右辺へスクロールします。
   * メソッド、パラメータの詳細は[[scrollToRight]]を参照してください。
   * @param options - スクロールオプション
   */
  toRight(options?: ScrollerScrollOptions) {
    return this._setScrollToResult(
      scrollToRight(this._createMergedScrollOptions(options)),
    );
  }

  /**
   * 下辺へスクロールします。
   * メソッド、パラメータの詳細は[[scrollToBottom]]を参照してください。
   * @param options - スクロールオプション
   */
  toBottom(options?: ScrollerScrollOptions) {
    return this._setScrollToResult(
      scrollToBottom(this._createMergedScrollOptions(options)),
    );
  }

  /**
   * 左辺へスクロールします。
   * メソッド、パラメータの詳細は[[scrollToLeft]]を参照してください。
   * @param options - スクロールオプション
   */
  toLeft(options?: ScrollerScrollOptions) {
    return this._setScrollToResult(
      scrollToLeft(this._createMergedScrollOptions(options)),
    );
  }

  /**
   * 左上コーナーへスクロールします。
   * メソッド、パラメータの詳細は[[scrollToLeftTop]]を参照してください。
   * @param options - スクロールオプション
   */
  toLeftTop(options?: ScrollerScrollOptions) {
    return this._setScrollToResult(
      scrollToLeftTop(this._createMergedScrollOptions(options)),
    );
  }

  /**
   * 左下コーナーへスクロールします。
   * メソッド、パラメータの詳細は[[scrollToLeftBottom]]を参照してください。
   * @param options - スクロールオプション
   */
  toLeftBottom(options?: ScrollerScrollOptions) {
    return this._setScrollToResult(
      scrollToLeftBottom(this._createMergedScrollOptions(options)),
    );
  }

  /**
   * 右上コーナーへスクロールします。
   * メソッド、パラメータの詳細は[[scrollToRightTop]]を参照してください。
   * @param options - スクロールオプション
   */
  toRightTop(options?: ScrollerScrollOptions) {
    return this._setScrollToResult(
      scrollToRightTop(this._createMergedScrollOptions(options)),
    );
  }

  /**
   * 右下コーナーへスクロールします。
   * メソッド、パラメータの詳細は[[scrollToRightBottom]]を参照してください。
   * @param options - スクロールオプション
   */
  toRightBottom(options?: ScrollerScrollOptions) {
    return this._setScrollToResult(
      scrollToRightBottom(this._createMergedScrollOptions(options)),
    );
  }

  /**
   * スクロールの停止を要求します。
   * @param stopper - 停止要求ソース
   */
  pushScrollStopper(stopper: ScrollStopper) {
    if (!this._scrollStoppers.includes(stopper)) {
      this._scrollStoppers.push(stopper);
      if (this._scrollStoppers.length === 1) {
        this._updateScrollable();
        this._syncToObservers(['scrollEnabled']);
      }
    }
    return () => {
      this.removeScrollStopper(stopper);
    };
  }

  /**
   * スクロールの停止要求を解除します。<br>
   * 別のプロセスにより異なる[[ScrollStopper]]が登録されている場合、
   * スクロールは再開されない事に注意してください。
   * @param stopper - 停止要求ソース
   */
  removeScrollStopper(stopper: ScrollStopper) {
    const index = this._scrollStoppers.indexOf(stopper);
    if (index !== -1) {
      this._scrollStoppers.splice(index, 1);
      if (this._scrollStoppers.length === 0) {
        this._updateScrollable();
        this._syncToObservers(['scrollEnabled']);
      }
    }
  }

  private async _setup(): Promise<void> {
    this._updateScrollable();
    this._update();
    this._setState(ScrollerState.Ready);
    this.start();
    this.emit('ready', undefined);
    this._readyResolvers.forEach((resolve) => resolve());
    this._readyResolvers = [];
  }

  private _setState(state: ScrollerState): void {
    if (this._state !== state) {
      this._state = state;
      this._syncToObservers([
        'state',
        'isPending',
        'isReady',
        'isRunning',
        'isDestroyed',
      ]);
      this.emit('changeState', state);
    }
  }

  private _checkDestroyed(): void {
    if (this.isDestroyed) {
      const message = 'already destroyed.';
      logger.error(message);
      throw new Error(message);
    }
  }

  private _update(width?: number, height?: number): void {
    this._updateContainerSize(width, height);
    this._updateScrollSize();
    this._updateScrollPositions();
  }

  private _updateContainerSize(width?: number, height?: number): void {
    const { el, _isBodyElement } = this;
    if (width === undefined) {
      if (!el) return;
      width = _isBodyElement
        ? (document.documentElement as HTMLElement).clientWidth
        : el.clientWidth;
    }

    if (height === undefined) {
      if (!el) return;
      height = _isBodyElement
        ? (document.documentElement as HTMLElement).clientHeight
        : el.clientHeight;
    }

    const { _containerWidth, _containerHeight } = this;
    this._containerWidth = width;
    this._containerHeight = height;
    if (width !== _containerWidth || height !== _containerHeight) {
      this._syncToObservers([
        'containerWidth',
        'containerHeight',
        'scrollableX',
        'scrollableY',
      ]);
      this.emit('resize', { width, height });
    }
  }

  private _updateScrollSize(): void {
    const { el, _scrollWidth, _scrollHeight } = this;
    if (!el) return;
    this._scrollWidth = el.scrollWidth;
    this._scrollHeight = el.scrollHeight;
    if (
      _scrollWidth !== this._scrollWidth ||
      _scrollHeight !== this._scrollHeight
    ) {
      this._syncToObservers([
        'scrollWidth',
        'scrollHeight',
        'scrollableX',
        'scrollableY',
      ]);
    }
  }

  private _startScrollSizeOvserver() {
    if (!IN_WINDOW) return;

    this._stopScrollSizeOvserver();

    if (this.scrollSizeOvserver) {
      this._scrollSizeOvserverPollingId = window.setInterval(() => {
        if (!this.scrollSizeOvserver || this.isDestroyed) {
          this._stopScrollSizeOvserver();
          return;
        }

        this._updateScrollSize();
      }, this.scrollSizeOvserver.interval);
    }
  }

  private _stopScrollSizeOvserver() {
    if (this._scrollSizeOvserverPollingId !== null) {
      clearInterval(this._scrollSizeOvserverPollingId);
      this._scrollSizeOvserverPollingId = null;
    }
  }

  private _updateScrollPositions(): void {
    if (!this.el) return;
    this._scrollTop = this.el.scrollTop;
    this._scrollLeft = this.el.scrollLeft;

    // advanced values
    this._scrollBottom =
      this._scrollHeight - this._scrollTop - this._containerHeight;
    this._scrollRight =
      this._scrollWidth - this._scrollLeft - this._containerWidth;

    this._syncToObservers([
      'scrollTop',
      'scrollRight',
      'scrollBottom',
      'scrollLeft',
    ]);
  }

  private _startListeners() {
    this._stopListeners();

    this._scrollListener = () => {
      this._onScroll();
    };
    this._eventTarget.addEventListener('scroll', this._scrollListener, false);

    if (this._isRootElement) {
      this._resizeListener = () => {
        this._onResize();
      };
      window.addEventListener('resize', this._resizeListener, false);
    } else {
      this._resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width, height } = entry.contentRect;
          this._onResize(width, height);
        }
      });
      this._el && this._resizeObserver.observe(this._el);
    }

    if (visibilityManager.isVisible) {
      this._scrollSizeOvserverSuspended = false;
      this._startScrollSizeOvserver();
    } else {
      this._scrollSizeOvserverSuspended = true;
    }
  }

  private _stopListeners() {
    if (this._scrollListener) {
      this._eventTarget.removeEventListener(
        'scroll',
        this._scrollListener,
        false,
      );
      delete this._scrollListener;
    }

    if (this._resizeListener) {
      if (this._isDocumentElement) {
        window.removeEventListener('resize', this._resizeListener, false);
        delete this._resizeListener;
      }
    }

    if (this._resizeObserver && this._el) {
      this._resizeObserver.unobserve(this._el);
      this._resizeObserver.disconnect();
      delete this._resizeObserver;
    }
  }

  private _clearScrollingJudgeTimer() {
    if (this._scrollingJudgeTimerId !== null) {
      clearTimeout(this._scrollingJudgeTimerId);
      this._scrollingJudgeTimerId = null;
    }
  }

  private _onResize(width?: number, height?: number) {
    this._update(width, height);
  }

  private _triggerScrollTick(event: keyof ScrollerScrollEventMap): void {
    const { _nowScrolling } = this;

    if (event === 'scrollStart') {
      this._startX = this._scrollLeft;
      this._startY = this._scrollTop;
      this._lastTotalX = 0;
      this._lastTotalY = 0;
      this._nowScrolling = true;
    } else if (event === 'scrollEnd') {
      this._nowScrolling = false;
    }

    if (_nowScrolling !== this._nowScrolling) {
      this._syncToObservers('nowScrolling');
    }
    this.emit(event, this.lastPayload);
  }

  private _onScroll() {
    if (!this.scrollEnabled && this._el) {
      this._el.scrollLeft = this._scrollLeft;
      this._el.scrollTop = this._scrollTop;
      return;
    }

    // remenber before values
    const {
      _scrollTop,
      _scrollLeft,
      _lastAxis,
      _lastDirection,
      _lastXDirection,
      _lastYDirection,
    } = this;

    // ,,,and next update values
    this._updateScrollPositions();

    // calicurate scrolled ammount at (ticked time)
    const tickedX = this._scrollLeft - _scrollLeft;
    const tickedY = this._scrollTop - _scrollTop;
    this._tickedX = tickedX;
    this._tickedY = tickedY;

    // update axis
    if (tickedX === tickedY) {
      this._lastAxis = this.baseAxis;
    } else {
      this._lastAxis = Math.abs(tickedX) > Math.abs(tickedY) ? 'x' : 'y';
    }

    // update directions
    if (_scrollTop < this._scrollTop) {
      this._lastYDirection = 'bottom';
    } else if (_scrollTop > this._scrollTop) {
      this._lastYDirection = 'top';
    }

    if (_scrollLeft < this._scrollLeft) {
      this._lastXDirection = 'right';
    } else if (_scrollLeft > this._scrollLeft) {
      this._lastXDirection = 'left';
    }

    this._lastDirection =
      this._lastAxis === 'y' ? this._lastYDirection : this._lastXDirection;

    // judge scroll end by before axis and directions
    const axisIsChanged = this._lastAxis !== _lastAxis;
    const lastXDirectionIsChanged = this._lastXDirection !== _lastXDirection;
    const lastYDirectionIsChanged = this._lastYDirection !== _lastYDirection;
    const lastDirectionIsChanged = this._lastDirection !== _lastDirection;

    if (axisIsChanged) {
      this.emit('changeAxis', this._lastAxis);
    }

    if (lastXDirectionIsChanged) {
      this.emit('changeLastXDirection', this._lastXDirection);
    }

    if (lastYDirectionIsChanged) {
      this.emit('changeLastYDirection', this._lastYDirection);
    }

    if (lastDirectionIsChanged) {
      this.emit('changeLastDirection', this._lastDirection);
    }

    if (
      axisIsChanged ||
      lastXDirectionIsChanged ||
      lastYDirectionIsChanged ||
      lastDirectionIsChanged
    ) {
      this._syncToObservers([
        'lastAxis',
        'lastDirection',
        'lastYDirection',
        'lastXDirection',
      ]);
    }

    if (this._nowScrolling) {
      if (
        axisIsChanged ||
        (_lastAxis === 'y' && lastYDirectionIsChanged) ||
        (_lastAxis === 'x' && lastXDirectionIsChanged)
      ) {
        // emit scroll end & start(both)
        this._triggerScrollTick('scrollEnd');
      } else {
        // add scroll ammounts
        this._lastTotalX = this._scrollLeft - this._startX;
        this._lastTotalY = this._scrollTop - this._startY;
        this._triggerScrollTick('scroll');
      }
    }

    // judge scroll start
    if (!this._nowScrolling) {
      this._updateScrollSize();
      this._triggerScrollTick('scrollStart');
    }

    this._clearScrollingJudgeTimer();
    this._scrollingJudgeTimerId = window.setTimeout(() => {
      this._triggerScrollTick('scrollEnd');
    }, this.scrollingJudgeInterval);
  }

  private _syncToObserver(
    observer: ScrollerObserver,
    keys: ScrollerObservableKeys[] = scrollerObservableKeys,
  ) {
    for (const key of keys) {
      (observer as any)[key] = this[key];
    }
  }

  private _syncToObservers(
    keys: ScrollerObservableKeys | ScrollerObservableKeys[],
  ) {
    if (this._observers.length === 0) return;
    keys = typeof keys === 'string' ? [keys] : keys;
    for (const observer of this._observers) {
      this._syncToObserver(observer, keys);
    }
  }

  private _checkElement() {
    const { _el } = this;
    if (!_el) {
      const message = 'missing element';
      logger.error(message);
      throw new Error(message);
    }
    return _el;
  }

  private _createMergedScrollOptions(
    source?: ScrollerScrollOptions,
  ): ScrollOptions {
    const el = this._checkElement();
    const merged: ScrollOptions = {
      container: el,
      ...this.scrollSettingsDefaults,
      ...source,
    };
    return merged;
  }

  private _createMergedScrollToElementOptions(
    source?: ScrollerScrollToElementOptions,
  ): ScrollToElementOptions {
    const el = this._checkElement();
    const merged: ScrollToElementOptions = {
      container: el,
      ...this.scrollToElementSettingsDefaults,
      ...source,
    };
    let { _scrollToElementAddtionalOffset: addtionalOffset } = this;
    if (!addtionalOffset) return merged;
    if (typeof addtionalOffset === 'function') {
      addtionalOffset = addtionalOffset(this);
    }
    if (!addtionalOffset) return merged;
    if (typeof addtionalOffset === 'number') {
      addtionalOffset = {
        x: addtionalOffset,
        y: addtionalOffset,
      };
    }
    let { offset } = merged;
    if (!offset) {
      merged.offset = addtionalOffset;
      return merged;
    }
    if (typeof offset === 'number') {
      offset = {
        x: offset,
        y: offset,
      };
    }

    offset.x = (offset.x || 0) + (addtionalOffset.x || 0);
    offset.y = (offset.y || 0) + (addtionalOffset.y || 0);
    merged.offset = offset;
    return merged;
  }

  private _clearScrollToResult() {
    if (!this._scrollToResult) return;
    this._scrollToResult = null;
  }

  private _setScrollToResult(result: ScrollResult): ScrollResult {
    this._scrollToResult = result;
    result.promise.then(() => {
      this._clearScrollToResult();
    });
    return result;
  }

  private _updateScrollable() {
    if (this.scrollEnabled) {
      this._scrollEnable();
    } else {
      this._scrollDisable();
    }
  }
  private _scrollEnable() {
    enableScroll(this._checkElement());
  }

  private _scrollDisable() {
    const el = this._checkElement();
    this.cancel();
    disableScroll(el);
  }
}
