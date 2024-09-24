import {
  type ObjectDirective,
  type DirectiveBinding,
  withDirectives,
  type VNode,
  type App,
} from 'vue';
import { installDirective } from '@fastkit/vue-utils';
import { objectFromArray } from '@fastkit/helpers';
import Sortable from 'sortablejs';
import * as Plugins from 'sortablejs';
import * as Styles from '../styles.css';
import { type SortableOptions } from '../schema';
import {
  OPTION_NAMES,
  EVENT_OPTION_NAMES,
  type AnyEvent,
  type NormalOptions,
  type EventOptions,
  type EventOptionName,
} from '../schema/_internal';

if (typeof window !== 'undefined') {
  const { MultiDrag, Swap } = Plugins;
  Sortable.mount(new MultiDrag(), new Swap());
}

export type ExtendedSortableEvent<E, C = undefined> = E extends AnyEvent
  ? {
      [K in keyof E]: K extends 'from' | 'to'
        ? SortableDirectiveElement<C>
        : E[K];
    } & {
      readonly ctx: C;
    }
  : never;

export type ExtendedEventHandlers<C = undefined> = {
  [K in keyof EventOptions]: NonNullable<EventOptions[K]> extends (
    ev: infer E,
    ...args: infer ARGS
  ) => void
    ? (ev: ExtendedSortableEvent<E, C>, ...args: ARGS) => void
    : never;
};

export interface ExtendedSortableOptions<C = undefined>
  extends Omit<SortableOptions, EventOptionName>,
    ExtendedEventHandlers<C> {}

export interface SortableDirectiveValue<C = undefined>
  extends ExtendedSortableOptions<C> {
  onMounted?: (sortable: Sortable) => void;
  inject?: () => C;
}

export type RawSortableDirectiveValue<C = undefined> =
  | SortableDirectiveValue<C>
  | undefined
  | null
  | boolean;

const normalizeRawSortableDirectiveValue = <C = undefined>(
  source: RawSortableDirectiveValue<C>,
): SortableDirectiveValue<C> | false => {
  if (source === true || source === undefined) return {};
  return source || false;
};

export type SortableDirectiveBinding<C = undefined> = DirectiveBinding<
  RawSortableDirectiveValue<C>
>;

const DIRECTIVE_CONTEXT_SYMBOL = Symbol('SortableDirectiveContext');

export interface SortableDirectiveElement<C = undefined> extends HTMLElement {
  [DIRECTIVE_CONTEXT_SYMBOL]: SortableDirectiveContext<C>;
}

export const getSortableDirectiveContext = <C = undefined>(
  el: SortableDirectiveElement<C>,
) => el[DIRECTIVE_CONTEXT_SYMBOL];

type SortableDirectiveHook<C = undefined> = (
  el: SortableDirectiveElement<C>,
  binding: Pick<SortableDirectiveBinding<C>, 'value'>,
) => void;

export type SortableDirective<C = undefined> = ObjectDirective<
  SortableDirectiveElement<C>,
  RawSortableDirectiveValue<C>
>;

type Writeable<T> = {
  -readonly [K in keyof T]?: T[K];
};

type WritableContext<C = undefined> = Writeable<SortableDirectiveContext<C>>;

export type InjectedSortableEvent<E extends AnyEvent, C = undefined> = Omit<
  E,
  'from' | 'to'
> & {
  from: SortableDirectiveElement<C>;
  to: SortableDirectiveElement<C>;
};

export class SortableDirectiveContext<C = undefined> {
  readonly el: SortableDirectiveElement<C>;

  readonly bindingValue!: SortableDirectiveValue<C>;

  readonly sortable!: Sortable;

  private readonly _handlers: ExtendedEventHandlers<C>;

  get ctx(): C {
    return this.bindingValue.inject?.() as C;
  }

  constructor(
    el: SortableDirectiveElement<C>,
    bindingValue: SortableDirectiveValue<C>,
  ) {
    this.el = el;
    this.bindingValue = bindingValue;

    this._handlers = objectFromArray(EVENT_OPTION_NAMES, (eventName) => [
      eventName,
      (ev: any, ...args: any[]) => {
        if (eventName === 'onStart') {
          document.body.classList.add(Styles.dragging);
        } else if (eventName === 'onEnd') {
          document.body.classList.remove(Styles.dragging);
        }

        const originalHandler = this.bindingValue[eventName] as any;
        if (!originalHandler) return;
        Object.defineProperty(ev, 'ctx', {
          get: () => this.ctx,
          enumerable: true,
        });
        originalHandler(ev, ...args);
      },
    ]);

    this.sortable = new Sortable(el, {
      ...(this.bindingValue as NormalOptions),
      ...(this._handlers as EventOptions),
    });
    el[DIRECTIVE_CONTEXT_SYMBOL] = this;
  }

  update(bindingValue: SortableDirectiveValue<C>) {
    for (const optionKey of OPTION_NAMES) {
      const newValue = bindingValue[optionKey];
      if (this.bindingValue[optionKey] !== newValue) {
        if (!EVENT_OPTION_NAMES.includes(optionKey as any)) {
          this.sortable.option(optionKey, newValue);
        }
        (this.bindingValue as any)[optionKey] = newValue;
      }
    }
  }

  destroy() {
    const _self = this as WritableContext<C>;
    this.sortable?.destroy();
    delete _self.sortable;
    delete (this.el as Writeable<SortableDirectiveElement<C>> | undefined)?.[
      DIRECTIVE_CONTEXT_SYMBOL
    ];
    delete _self.el;
    delete _self.bindingValue;
  }
}

const hook: SortableDirectiveHook = (el, binding) => {
  let { [DIRECTIVE_CONTEXT_SYMBOL]: ctx } = el;
  const bindingValue = normalizeRawSortableDirectiveValue(binding.value);

  if (!bindingValue) {
    ctx?.destroy();
    return;
  }

  if (ctx) {
    ctx.update(bindingValue);
  } else {
    ctx = new SortableDirectiveContext(el, bindingValue);
    bindingValue.onMounted?.(ctx.sortable);
  }
};

const beforeUnmount: SortableDirectiveHook = (el) => {
  const { [DIRECTIVE_CONTEXT_SYMBOL]: ctx } = el;
  ctx && ctx.destroy();
};

export const sortableDirective: SortableDirective = {
  mounted: hook,
  updated: hook,
  beforeUnmount,
};

export function sortableDirectiveArgument(
  bindingValue: RawSortableDirectiveValue,
): [SortableDirective, RawSortableDirectiveValue] {
  return [sortableDirective, bindingValue];
}

export function withSortableDirective(
  vnode: VNode,
  bindingValue: RawSortableDirectiveValue,
): VNode {
  return withDirectives(vnode, [sortableDirectiveArgument(bindingValue)]);
}

export interface SortableDirectiveAttrs {
  'v-sortable'?: RawSortableDirectiveValue;
}

export function installSortableDirective(app: App) {
  return installDirective(app, 'sortable', sortableDirective);
}

declare module 'vue' {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface HTMLAttributes extends SortableDirectiveAttrs {}

  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface AllowedComponentProps extends SortableDirectiveAttrs {}
}
