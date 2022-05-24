import { AsyncRequestResolver, AsyncRequestState, AsyncFn } from './schemes';
import type { AsyncController } from './controller';

/**
 * Asynchronous processing request.
 */
export class AsyncRequest<Fn extends AsyncFn> {
  /**
   * Parent controller.
   */
  readonly controller: AsyncController<Fn>;

  /**
   * Hash string of runtime argument list.
   */
  readonly hash: string;

  /**
   * List of resolvers for asynchronous processing.
   */
  readonly resolvers: AsyncRequestResolver[] = [];

  /**
   * State of asynchronous processing.
   */
  private _state: AsyncRequestState = 'pending';

  /**
   * Original function.
   */
  private _func: AsyncFn;

  /**
   * State of asynchronous processing.
   */
  get state() {
    return this._state;
  }

  /**
   * Indicates `true` when the process has not yet started.
   */
  get isPending() {
    return this.state === 'pending';
  }

  /**
   * Indicates `true` if processing is in progress.
   */
  get isRunning() {
    return this.state === 'running';
  }

  /**
   * Indicates `true` if the problem has been resolved.
   */
  get isResolved() {
    return this.state === 'resolved';
  }

  /**
   * Indicates `true` if rejected.
   */
  get isRejected() {
    return this.state === 'rejected';
  }

  /**
   * @param controller - Parent controller.
   * @param hash - Hash string of runtime argument list.
   * @param func - Original function.
   */
  constructor(controller: AsyncController<Fn>, hash: string, func: AsyncFn) {
    this.controller = controller;
    this.hash = hash;
    this._func = func;
  }

  /**
   * Adding a Resolver
   *
   * @param resolver - Resolver for asynchronous processing (resolved & rejected).
   * @param autoRun - Pass true to auto-execute with push (this option is ignored if execution has already started)
   */
  push(resolver: AsyncRequestResolver, autoRun?: boolean) {
    this.resolvers.push(resolver);
    autoRun && this.run();
  }

  /**
   * Start processing
   *
   * If processing has already started, nothing is done.
   */
  run() {
    if (!this.isPending) return;

    this._state = 'running';
    return this._func()
      .then((payload) => this.resolve('resolve', payload))
      .catch((err) => this.resolve('reject', err));
  }

  /**
   * Resolve all resolvers
   *
   * @param type - Resolve or Reject.
   * @param payload - Execution Result
   */
  resolve(type: 'resolve' | 'reject', payload: any) {
    this._state = type === 'resolve' ? 'resolved' : 'rejected';
    this.resolvers.forEach((resolver) => {
      resolver[type](payload);
    });
    this.resolvers.length = 0;
    this.controller.removeRequestByHash(this.hash);
  }
}
