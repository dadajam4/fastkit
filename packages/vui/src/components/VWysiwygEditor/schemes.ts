import { type VuiService } from '../../service';
import {
  type Editor,
  type Extensions,
  type AnyExtension,
  type EditorOptions,
} from '@tiptap/vue-3';
import { type IconName } from '../VIcon';

const EDITOR_EVENTS = [
  'beforeCreate',
  'create',
  'update',
  'selectionUpdate',
  'transaction',
  'focus',
  'blur',
  'destroy',
] as const;

type PrefixedEventName<S extends string> = `on${Capitalize<S>}`;

const prefixedEventName = <S extends string>(
  source: S,
): PrefixedEventName<S> => {
  return `on${source.charAt(0).toUpperCase()}${source.slice(1)}` as any;
};

export type WysiwygEditorEvent = typeof EDITOR_EVENTS[number];

export type WysiwygEditorPrefixedEvent = PrefixedEventName<WysiwygEditorEvent>;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface WysiwygEditorEventsOptions
  extends Partial<Pick<EditorOptions, WysiwygEditorPrefixedEvent>> {}

export type WysiwygEditorEventsBucket = {
  [EV in WysiwygEditorEvent]: NonNullable<
    WysiwygEditorEventsOptions[PrefixedEventName<EV>]
  >[];
};

export class WysiwygEditorInitializeContext {
  readonly listeners: WysiwygEditorEventsBucket = {} as any;

  constructor(opts: WysiwygEditorEventsOptions = {}) {
    EDITOR_EVENTS.forEach((event) => {
      this.listeners[event] = [];
      const prefixed = prefixedEventName(event);
      const fn = opts[prefixed];
      fn && this.listeners[event].push(fn as any);
    });
  }

  on<EV extends WysiwygEditorEvent>(
    ev: EV,
    handler: NonNullable<WysiwygEditorEventsOptions[PrefixedEventName<EV>]>,
  ) {
    this.listeners[ev].push(handler);
    return () => this.off(ev, handler);
  }

  off<EV extends WysiwygEditorEvent>(
    ev: EV,
    handler: NonNullable<WysiwygEditorEventsOptions[PrefixedEventName<EV>]>,
  ) {
    this.listeners[ev] = this.listeners[ev].filter(
      (_handler) => _handler !== handler,
    ) as any;
  }

  editorOptions() {
    const opts: WysiwygEditorEventsOptions = {};

    EDITOR_EVENTS.forEach((event) => {
      const prefixed = prefixedEventName(event);
      opts[prefixed] = (props) => {
        const handlers = this.listeners[event];
        handlers.forEach((handler) => {
          handler(props as any);
        });
      };
    });

    return opts;
  }
}

export interface WysiwygEditorContext {
  editor: Editor;
  vui: VuiService;
}

export type WysiwygExtensionFactory = (
  ctx: WysiwygEditorInitializeContext,
) => AnyExtension;

export type RawWysiwygExtension = AnyExtension | WysiwygExtensionFactory;

function resolveRawWysiwygExtension(
  raw: RawWysiwygExtension,
  ctx: WysiwygEditorInitializeContext,
): AnyExtension {
  return typeof raw === 'function' ? raw(ctx) : raw;
}

export function resolveRawWysiwygExtensions(
  raws: RawWysiwygExtension[],
  ctx: WysiwygEditorInitializeContext,
) {
  return raws.map((raw) => resolveRawWysiwygExtension(raw, ctx));
}

export interface WysiwygEditorTool {
  key: string;
  icon: IconName | ((ctx: WysiwygEditorContext) => IconName);
  active?: boolean | ((ctx: WysiwygEditorContext) => boolean);
  disabled?: boolean | ((ctx: WysiwygEditorContext) => boolean);
  onClick: (ctx: WysiwygEditorContext, ev: MouseEvent) => any;
  floating?: boolean;
  extensions?: Extensions;
}

export type WysiwygEditorToolFactory<Options = void> = (
  vui: VuiService,
  options?: Options,
) => WysiwygEditorTool | WysiwygEditorTool[];

export type RawWysiwygEditorTool =
  | WysiwygEditorTool
  | WysiwygEditorToolFactory<any>;

function resolveRawWysiwygEditorTool(
  raw: RawWysiwygEditorTool,
  vui: VuiService,
) {
  return typeof raw === 'function' ? raw(vui) : raw;
}

export interface ResolvedWysiwygEditorSettings {
  tools: WysiwygEditorTool[];
  extensions: Extensions;
}

export function resolveRawWysiwygEditorTools(
  rawTools: RawWysiwygEditorTool[],
  vui: VuiService,
): ResolvedWysiwygEditorSettings {
  const tools: WysiwygEditorTool[] = [];
  const extensions: Extensions = [];

  rawTools.forEach((raw) => {
    let resolved = resolveRawWysiwygEditorTool(raw, vui);
    if (!Array.isArray(resolved)) {
      resolved = [resolved];
    }
    resolved.forEach((tool) => {
      tools.push(tool);
      if (tool.extensions) {
        extensions.push(...tool.extensions);
      }
    });
  });

  return {
    tools,
    extensions,
  };
}
