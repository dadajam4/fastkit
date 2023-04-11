import { type VuiService, type IconName } from '@fastkit/vui';
import {
  type Editor,
  type Extensions,
  type Node,
  type Extension,
  type Mark,
  type AnyExtension,
  type EditorOptions,
} from '@tiptap/vue-3';
import { VNodeChild } from 'vue';

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

export type WysiwygEditorEvent = (typeof EDITOR_EVENTS)[number];

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
  private readonly _vui: () => VuiService;

  get vui() {
    return this._vui();
  }

  constructor(
    vuiGetter: () => VuiService,
    opts: WysiwygEditorEventsOptions = {},
  ) {
    this._vui = vuiGetter;

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

export type WysiwygExtensionFactory<Options = any, Storage = any> = (
  ctx: WysiwygEditorInitializeContext,
) =>
  | Extension<Options, Storage>
  | Node<Options, Storage>
  | Mark<Options, Storage>;

export interface CreatedWysiwygExtension<Options = any, Storage = any> {
  __isCreatedWysiwygExtension: true;
  _configs: Partial<Options>[];
  configure(
    options?: Partial<Options>,
  ): CreatedWysiwygExtension<Options, Storage>;
  raw: WysiwygExtensionSource<Options, Storage>;
}

export type WysiwygExtensionSource<Options = any, Storage = any> =
  | Extension<Options, Storage>
  | Node<Options, Storage>
  | Mark<Options, Storage>
  | WysiwygExtensionFactory<Options, Storage>;

export type RawWysiwygExtension<Options = any, Storage = any> =
  | WysiwygExtensionSource<Options, Storage>
  | CreatedWysiwygExtension<Options, Storage>;

// export function createWysiwygExtension<Options = any, Storage = any>(
//   extension: Extension<Options, Storage>,
// ): Extension<Options, Storage>;
// export function createWysiwygExtension<Options = any, Storage = any>(
//   node: Node<Options, Storage>,
// ): Node<Options, Storage>;
// export function createWysiwygExtension<Options = any, Storage = any>(
//   mark: Mark<Options, Storage>,
// ): Mark<Options, Storage>;
// export function createWysiwygExtension<Options = any, Storage = any>(
//   factory: WysiwygExtensionFactory<Options, Storage>,
// ): WysiwygExtensionFactory<Options, Storage>;

function isCreatedWysiwygExtension<Options = any, Storage = any>(
  source: unknown,
): source is CreatedWysiwygExtension<Options, Storage> {
  return (
    !!source &&
    typeof source === 'object' &&
    (source as CreatedWysiwygExtension).__isCreatedWysiwygExtension === true
  );
}

export function createWysiwygExtension<Options = any, Storage = any>(
  extension: WysiwygExtensionSource<Options, Storage>,
) {
  const ext: CreatedWysiwygExtension<Options, Storage> = {
    __isCreatedWysiwygExtension: true,
    _configs: [],
    configure: (opts) => {
      opts && ext._configs.push(opts);
      return ext;
    },
    raw: extension,
  };
  return ext;
}

function resolveRawWysiwygExtension(
  raw: RawWysiwygExtension,
  ctx: WysiwygEditorInitializeContext,
): AnyExtension {
  if (isCreatedWysiwygExtension(raw)) {
    const { raw: _raw, _configs } = raw;
    let ext = typeof _raw === 'function' ? _raw(ctx) : _raw;
    _configs.forEach((config) => {
      ext = ext.configure(config);
    });
    return ext;
  }
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
  icon:
    | IconName
    | ((ctx: WysiwygEditorContext) => IconName | (() => VNodeChild));
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
