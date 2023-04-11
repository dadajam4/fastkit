import { EV } from './EV';

/**
 * Any tag can be set for the listener. (Registration of objects as well as character strings is also possible)
 * By setting this tag when registering a listener with [[EV.on]] or [[EV.once]]
 * With [[EV.off]] you can release related listeners at once.
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export type EVListenerTag = number | string | symbol | object;
type EVStackRemover = (stack: EVListener) => void;

export class EVListener {
  readonly context: EV;
  readonly type: string | null | undefined;
  readonly tag?: EVListenerTag;
  // eslint-disable-next-line @typescript-eslint/ban-types
  readonly handler: Function;
  readonly once: boolean;

  constructor({
    context,
    remover,
    type,
    tag,
    handler,
    once = false,
  }: {
    context: EV;
    remover: EVStackRemover;
    type: string;
    tag?: EVListenerTag;
    // eslint-disable-next-line @typescript-eslint/ban-types
    handler: Function;
    once: boolean;
  }) {
    this.context = context;
    this._remover = remover;
    this.type = type;
    this.tag = tag;
    this.handler = handler;
    this.once = once;
  }

  /**
   * Remove this instance from parent context.
   */
  remove() {
    if (!this._remover) return;
    this._remover(this);

    const self = this as any;

    self.context = null;
    self._remover = null;
    self.handler = null;
    self.tag = null;

    delete self.context;
    delete self._remover;
    delete self.handler;
    delete self.tag;
  }

  /**
   * Check match condition by type or handler or tag.
   * @param type - event type
   * @param handler - event handler
   * @param tag - event tag
   */
  // eslint-disable-next-line @typescript-eslint/ban-types
  match(type?: string | null, handler?: Function, tag?: EVListenerTag) {
    if (handler && handler !== this.handler) return false;
    if (type && this.type !== type) {
      return false;
    }
    if (tag && this.tag !== tag) {
      return false;
    }
    return true;
  }

  /**
   * Trigger this listener.
   */
  trigger(params?: any) {
    this.handler(params, this);
    if (this.once) {
      this.remove();
    }
  }

  /**
   * @private
   */
  _remover: EVStackRemover;
}
