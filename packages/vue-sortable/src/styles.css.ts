import { style, globalStyle } from '@vanilla-extract/css';

/**
 * いずれかの要素をドラッグ中にドキュメントに付与されるクラス
 */
export const dragging = 'v-sortable-dragging';
globalStyle(`.${dragging}`, {});

/**
 * このクラスを適用しておくことで、
 * このディレクティブが適用されているいずれかのドラッグが動作中にポインターイベントを抑制します
 */
export const disabledPointerWhenDragging = 'v-sortable-interact';
globalStyle(`.${dragging} .${disabledPointerWhenDragging}`, {
  pointerEvents: 'none',
});

export const disabled = 'v-sortable-disabled';
globalStyle(`.${disabled}`, {});
// export const disabled = style({});

export const guardInProgress = style({
  cursor: 'not-allowed',
});

export const availableItem = 'v-sortable-available-item';
