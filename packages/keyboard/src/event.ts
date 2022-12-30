import { IN_WINDOW } from '@fastkit/helpers';
import { KeyType, Key } from './schemes';

export type KBEventName = 'keydown' | 'keypress' | 'keyup';

export interface KBEvent extends KeyboardEvent {
  readonly type: KBEventName;
  readonly key: KeyType;
}

export type KBHandler = (ev: KeyboardEvent) => void;

export interface KBSetting extends RawKBSetting {
  target: GlobalEventHandlers;
  event: KBEventName;
  capture: boolean;
}

export type RawKBSettings = RawKBSetting | RawKBSetting[];

export interface RawKBSetting {
  target?: GlobalEventHandlers;
  key?: KeyType | KeyType[] | Readonly<KeyType[]>;

  /**
   * @default "keydown"
   */
  event?: KBEventName;
  handler: KBHandler;
  capture?: boolean;
}

export type KBSettings = KBSetting[];

interface ComputedKBSetting {
  target: GlobalEventHandlers;
  event: KBEventName;
  capture: boolean;
  settings: KBSettings;
  handler: (ev: KeyboardEvent) => void;
}

function createSetting(rawKBSettings: RawKBSettings): ComputedKBSetting[] {
  const _settings = Array.isArray(rawKBSettings)
    ? rawKBSettings
    : [rawKBSettings];
  const computedSettings: ComputedKBSetting[] = [];

  if (!IN_WINDOW) return computedSettings;

  _settings.forEach((_setting) => {
    const { target = document, event = 'keydown', capture = false } = _setting;
    const setting: KBSetting = {
      ..._setting,
      target,
      event,
      capture,
    };
    let bucket = computedSettings.find(
      (b) => b.target === target && b.event === event && b.capture === capture,
    );
    if (!bucket) {
      bucket = {
        target,
        event,
        capture,
        settings: [],
        handler: (ev) => {
          bucket &&
            bucket.settings.forEach(({ key, handler }) => {
              if (!key || Key.is(ev.key, key)) {
                handler(ev as any);
              }
            });
        },
      };
      computedSettings.push(bucket);
    }
    bucket.settings.push(setting);
  });
  return computedSettings;
}

export class KeyboardService {
  readonly settings: ComputedKBSetting[];
  private _running = false;

  get running() {
    return this._running;
  }

  constructor(settings: RawKBSettings) {
    this.settings = createSetting(settings);
  }

  run() {
    if (this.running) return;
    this.settings.forEach(({ target, event, handler, capture }) => {
      target.addEventListener(event, handler, capture);
    });
    this._running = true;
  }

  stop() {
    if (!this.running) return;
    this.settings.forEach(({ target, event, handler, capture }) => {
      target.removeEventListener(event, handler, capture);
    });
    this._running = false;
  }
}
