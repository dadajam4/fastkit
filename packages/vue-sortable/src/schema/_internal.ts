import { type Options, type SortableEvent, type MoveEvent } from 'sortablejs';

type OptionName = keyof Options;

type ExtractEventName<T extends string> = T extends `on${string}` ? T : never;

export type EventOptionName = ExtractEventName<OptionName>;

export type NormalOptionName = Exclude<OptionName, EventOptionName>;

export type NormalOptions = Pick<Options, NormalOptionName>;

export type EventOptions = Pick<Options, EventOptionName>;

export const NORMAL_OPTION_NAMES = [
  // Core
  'animation',
  'bubbleScroll',
  'chosenClass',
  'dataIdAttr',
  'delay',
  'delayOnTouchOnly',
  'direction',
  'disabled',
  'dragClass',
  'draggable',
  'dragoverBubble',
  'dropBubble',
  'easing',
  'emptyInsertThreshold',
  'fallbackClass',
  'fallbackOffset',
  'fallbackOnBody',
  'fallbackTolerance',
  'filter',
  'forceFallback',
  'ghostClass',
  'group',
  'ignore',
  'invertSwap',
  'invertedSwapThreshold',
  // AutoScroll
  'scroll',
  'forceAutoScrollFallback',
  'scrollFn',
  'scrollSensitivity',
  'scrollSpeed',
  'bubbleScroll',
  // MultiDrag
  'multiDrag',
  'selectedClass',
  'multiDragKey',
  'avoidImplicitDeselect',
  // Swap
  'swap',
  'swapClass',
  // OnSpill
  'revertOnSpill',
  'removeOnSpill',
] as const satisfies NormalOptionName[];

export const EVENT_OPTION_NAMES = [
  // Core
  'onAdd',
  'onChange',
  'onChoose',
  'onClone',
  'onEnd',
  'onFilter',
  'onMove',
  'onRemove',
  'onSort',
  'onStart',
  'onUnchoose',
  'onUpdate',
  // MultiDrag
  'onSelect',
  'onDeselect',
  // OnSpill
  'onSpill',
] as const satisfies EventOptionName[];

export const OPTION_NAMES = [...NORMAL_OPTION_NAMES, ...EVENT_OPTION_NAMES];

export type AnyEvent = SortableEvent | MoveEvent;
