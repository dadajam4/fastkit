import { HIDDEN, VISIBILITY_CHANGE } from './constants';
import { IN_WINDOW } from '@fastkit/helpers';

export type VisibilityTypedCallback = (event: Event) => any;
export type VisibilityStateListener = (
  state: VisibilityState,
  event: Event,
) => any;

interface VisibilityTypedCallbacks {
  visible: VisibilityTypedCallback[];
  hidden: VisibilityTypedCallback[];
}

const states = ['visible', 'hidden'] as const;

export type VisibilityState = (typeof states)[number];

function getVisibilityState(): VisibilityState {
  if (!IN_WINDOW) return 'hidden';
  return document[HIDDEN] ? 'hidden' : 'visible';
}

export class VisibilityManager {
  private _state: VisibilityState = getVisibilityState();
  private _stateListeners: VisibilityStateListener[] = [];
  private _typedCallbacks: VisibilityTypedCallbacks = {
    visible: [],
    hidden: [],
  };

  get state(): VisibilityState {
    return this._state;
  }

  get isVisible(): boolean {
    return this._state === 'visible';
  }
  get isHidden(): boolean {
    return this._state === 'hidden';
  }

  constructor() {
    if (IN_WINDOW) {
      document.addEventListener(
        VISIBILITY_CHANGE,
        (e) => {
          this._setState(getVisibilityState(), e);
        },
        false,
      );
    }
  }

  private _setState(state: VisibilityState, event: Event): void {
    if (this._state !== state) {
      this._state = state;
      this._triggerStateListeners(state, event);
      this._triggerTypedCallback(state, event);
    }
  }

  private _triggerStateListeners(state: VisibilityState, event: Event): void {
    const listeners = this._stateListeners.slice();
    listeners.forEach((listener) => {
      listener(state, event);
    });
  }

  private _triggerTypedCallback(state: VisibilityState, event: Event): void {
    const callbacks = this._typedCallbacks[state].slice();
    callbacks.forEach((callback) => {
      callback(event);
    });
  }

  change(listener: VisibilityStateListener): () => void {
    this._stateListeners.push(listener);
    const remover = () => {
      this.remove(listener, 'change');
    };
    return remover;
  }

  visible(callback: VisibilityTypedCallback): () => void {
    this._typedCallbacks.visible.push(callback);
    const remover = () => {
      this.remove(callback, 'visible');
    };
    return remover;
  }

  hidden(callback: VisibilityTypedCallback): () => void {
    this._typedCallbacks.hidden.push(callback);
    const remover = () => {
      this.remove(callback, 'hidden');
    };
    return remover;
  }

  remove(
    listenerOrCallback: VisibilityStateListener | VisibilityTypedCallback,
    targetState?: VisibilityState | 'change',
  ): void {
    if (!targetState || targetState === 'change') {
      const index = this._stateListeners.indexOf(
        <VisibilityStateListener>listenerOrCallback,
      );
      if (index !== -1) {
        this._stateListeners.splice(index, 1);
        return;
      }
    }

    for (const state of states) {
      if (targetState && state !== targetState) continue;
      const targets = this._typedCallbacks[state];
      const index = targets.indexOf(
        <VisibilityTypedCallback>listenerOrCallback,
      );
      if (index !== -1) {
        targets.splice(index, 1);
        return;
      }
    }
  }
}
