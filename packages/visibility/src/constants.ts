let _hidden = 'hidden';
let _visibilityChange = 'visibilitychange';

export const HAS_DOCUMENT = typeof document !== 'undefined';

if (HAS_DOCUMENT) {
  if (document.hidden !== undefined) {
    _hidden = 'hidden';
    _visibilityChange = 'visibilitychange';
  } else if ((document as any).mozHidden !== undefined) {
    _hidden = 'mozHidden';
    _visibilityChange = 'mozvisibilitychange';
  } else if ((document as any).msHidden !== undefined) {
    _hidden = 'msHidden';
    _visibilityChange = 'msvisibilitychange';
  } else if ((document as any).webkitHidden !== undefined) {
    _hidden = 'webkitHidden';
    _visibilityChange = 'webkitvisibilitychange';
  }
}

export const HIDDEN = _hidden as 'hidden';
export const VISIBILITY_CHANGE = _visibilityChange as 'visibilitychange';
