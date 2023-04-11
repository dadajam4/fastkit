export { VuiInjectionKey } from './injections';

import { VNodeChild, reactive, UnwrapNestedRefs } from 'vue';
import { ScopeName, ColorVariant } from '@fastkit/color-scheme';
import type { IconName, RawIconProp } from './components/VIcon';
import {
  type VueStackService,
  type VDialogProps,
  type VStackControl,
  resolveVStackDynamicInput,
} from '@fastkit/vue-stack';
import { type VNodeChildOrSlot } from '@fastkit/vue-utils';
import { type VueColorSchemePluginSettings } from '@fastkit/vue-color-scheme';
import type { Router } from 'vue-router';
import { RouterLink, useLink, UseLinkOptions } from 'vue-router';
import { setDefaultRouterLink } from '@fastkit/vue-action';
import { LocationService } from '@fastkit/vue-location';
import { VForm } from './components/VForm';
import { VTextField, TextFieldInput } from './components/VTextField';
import { VueForm, FormControlHinttipDelay } from '@fastkit/vue-form-control';
import { getDocumentScroller, UseScroller } from '@fastkit/vue-scroller';
import { ControlSize } from './schemes';

export type UseLinkResult = ReturnType<typeof useLink>;

export interface VuiFormPromptSettings<
  T extends { [key: string]: any } = { [key: string]: any },
> extends Partial<VDialogProps> {
  state: T;
  size?: ControlSize;
}

export interface VuiPromptOptions extends Partial<VDialogProps> {
  input?: Omit<TextFieldInput, 'modelValue'> & { initialValue?: string };
}

export type RawVuiPromptOptions = string | VuiPromptOptions;

const DEFAULT_AUTO_SCROLL_TO_ELEMENT_OFFSET_TOP = -20;
const DEFAULT_TEXTAREA_ROWS = 3;

export interface VuiServiceUISettings {
  primaryScope: ScopeName;
  plainVariant: ColorVariant;
  containedVariant: ColorVariant;
  warningScope: ScopeName;
  errorScope: ScopeName;
  buttonDefault: {
    color: ScopeName;
    variant: ColorVariant;
  };
  tabDefault: {
    color: ScopeName;
  };
  dialogOk?: {
    color?: ScopeName;
    variant?: ColorVariant;
  };
  dialogCancel?: {
    color?: ScopeName;
    variant?: ColorVariant;
  };
  dialogClose?: {
    color?: ScopeName;
    variant?: ColorVariant;
  };
  hinttipDelay?: FormControlHinttipDelay;
  noDataMessage?: VNodeChildOrSlot;
  noResultsMessage?: VNodeChildOrSlot;
  loadingMessage?: VNodeChildOrSlot;
  failedToLoadDataMessage?: VNodeChildOrSlot;
}

export type RawVuiServiceUISettings = Partial<VuiServiceUISettings>;

export function mergeVuiServiceUISettings(
  base: VuiServiceUISettings,
  overrides?: RawVuiServiceUISettings,
): VuiServiceUISettings {
  if (!overrides) {
    return base;
  }
  const merged: VuiServiceUISettings = {
    ...base,
  };
  Object.entries(overrides).forEach(([key, value]) => {
    if (value) {
      (merged as any)[key] = value;
    }
  });
  return merged;
}

export interface VuiServiceIconSettings {
  menuDown: IconName;
  navigationExpand: RawIconProp;
  prev: RawIconProp;
  next: RawIconProp;
  sort: RawIconProp;
  editorTextColor: IconName;
  editorformatBold: IconName;
  editorformatUnderline: IconName;
  editorformatItalic: IconName;
  editorformatListBulleted: IconName;
  editorformatListNumbered: IconName;
  editorLink: IconName;
  editorLinkOff: IconName;
  editorUndo: IconName;
  editorRedo: IconName;
  hinttip: IconName;
  clear: IconName;
  reload: IconName;
}

export type RawVuiServiceIconSettings = Partial<VuiServiceIconSettings>;

export function mergeVuiServiceIconSettings(
  base: VuiServiceIconSettings,
  overrides?: RawVuiServiceIconSettings,
): VuiServiceIconSettings {
  if (!overrides) {
    return base;
  }
  const merged: VuiServiceIconSettings = {
    ...base,
  };
  Object.entries(overrides).forEach(([key, value]) => {
    if (value) {
      (merged as any)[key] = value;
    }
  });
  return merged;
}

export type VuiVNodeResolver = () => VNodeChild;

export interface VuiServiceOptions {
  router: Router;
  RouterLink?: any;
  useLink?: (props: UseLinkOptions) => UseLinkResult;
  colorScheme: VueColorSchemePluginSettings;
  uiSettings: VuiServiceUISettings;
  icons: VuiServiceIconSettings;
  selectionSeparator?: VuiVNodeResolver;
  autoScrollToElementOffsetTop?: number | (() => number | undefined);
  textareaRows?: number;
  requiredChip?: VuiVNodeResolver;
}

export interface RawVuiServiceOptions
  extends Omit<Partial<VuiServiceOptions>, 'uiSettings' | 'icons'> {
  uiSettings?: RawVuiServiceUISettings;
  icons?: RawVuiServiceIconSettings;
}

export function mergeVuiServiceOptions(
  base: VuiServiceOptions,
  overrides?: RawVuiServiceOptions,
): VuiServiceOptions {
  if (!overrides) {
    return base;
  }
  const merged: VuiServiceOptions = {
    ...base,
    uiSettings: mergeVuiServiceUISettings(
      base.uiSettings,
      overrides.uiSettings,
    ),
    icons: mergeVuiServiceIconSettings(base.icons, overrides.icons),
  };
  const excludes = ['uiSettings', 'icons'];
  Object.entries(overrides).forEach(([key, value]) => {
    if (value && !excludes.includes(key)) {
      (merged as any)[key] = value;
    }
  });
  return merged;
}

export class VuiService {
  readonly options: VuiServiceOptions;

  readonly selectionSeparator: VuiVNodeResolver;
  readonly autoScrollToElementOffsetTop?: number | (() => number | undefined);
  readonly textareaRows?: number;
  readonly requiredChip?: VuiVNodeResolver;
  readonly router: Router;
  readonly location: LocationService;
  readonly stack: VueStackService;
  readonly useLink: typeof useLink;

  get scroller(): UseScroller {
    return getDocumentScroller();
  }

  constructor(options: VuiServiceOptions, stackService: VueStackService) {
    this.options = options;
    this.configure();

    const {
      selectionSeparator = () => ', ',
      autoScrollToElementOffsetTop = DEFAULT_AUTO_SCROLL_TO_ELEMENT_OFFSET_TOP,
      textareaRows = DEFAULT_TEXTAREA_ROWS,
      requiredChip = () => '*',
    } = options;
    this.selectionSeparator = selectionSeparator;
    this.autoScrollToElementOffsetTop = autoScrollToElementOffsetTop;
    this.textareaRows = textareaRows;
    this.requiredChip = requiredChip;
    this.router = options.router;
    this.location = new LocationService({
      router: this.router,
    });
    this.stack = stackService;
    this.useLink = options.useLink || useLink;
  }

  configure(options?: Partial<VuiServiceOptions>) {
    options && Object.assign(this.options, options);
    setDefaultRouterLink(this.getRouterLink());
  }

  getRouterLink() {
    return this.options.RouterLink || RouterLink;
  }

  setting<K extends keyof VuiServiceUISettings>(
    key: K,
  ): VuiServiceUISettings[K] {
    return this.options.uiSettings[key] as VuiServiceUISettings[K];
  }

  icon<K extends keyof VuiServiceIconSettings>(
    iconType: K,
  ): VuiServiceIconSettings[K] {
    return this.options.icons[iconType] as VuiServiceIconSettings[K];
  }

  getAutoScrollToElementOffsetTop() {
    let { autoScrollToElementOffsetTop } = this;
    if (typeof autoScrollToElementOffsetTop === 'function') {
      autoScrollToElementOffsetTop = autoScrollToElementOffsetTop();
    }
    return autoScrollToElementOffsetTop || 0;
  }

  getRequiredChip() {
    const { requiredChip } = this;
    return requiredChip && requiredChip();
  }

  dialog(...args: Parameters<VueStackService['dialog']>) {
    return this.stack.dialog(...args);
  }

  alert(...args: Parameters<VueStackService['alert']>) {
    return this.stack.alert(...args);
  }

  confirm(...args: Parameters<VueStackService['confirm']>) {
    return this.stack.confirm(...args);
  }

  snackbar(...args: Parameters<VueStackService['snackbar']>) {
    return this.stack.snackbar(...args);
  }

  menu(...args: Parameters<VueStackService['menu']>) {
    return this.stack.menu(...args);
  }

  formPrompt<T extends { [key: string]: any } = { [key: string]: any }>(
    settings: VuiFormPromptSettings<T>,
    slot: (
      state: UnwrapNestedRefs<T>,
      ctx: { form: VueForm; stack: VStackControl },
    ) => VNodeChild,
  ): Promise<T | false | undefined> {
    let form: VueForm | undefined;

    const options = {
      dense: true,
      ...settings,
    };

    const { size, state } = options;

    const _state = reactive(state);

    options.actions = options.actions || [
      this.stack.action('cancel', undefined, { size }),
      this.stack.action('ok', undefined, {
        size,
        onClick: () => {
          if (form) {
            const ev = new Event('submit');
            form.handleSubmit(ev);
          }
        },
      }),
    ];

    const resolved = resolveVStackDynamicInput({
      ...options,
      content: (stack) => {
        return (
          <VForm
            disableAutoScroll
            size={size}
            // onVnodeMounted={(vnode) => {
            //   form = (vnode.component as any).ctx.form as VueForm;
            // }}
            onVnodeBeforeUnmount={() => {
              form = undefined;
            }}
            onSubmit={(ev) => {
              stack.resolve(_state);
            }}
            v-slots={{
              default: (_form) => {
                form = _form;
                return slot(_state, { form, stack });
              },
            }}
          />
        );
      },
    });

    return this.dialog(resolved);
  }

  prompt(rawOptions: RawVuiPromptOptions = {}) {
    const options: VuiPromptOptions =
      typeof rawOptions === 'string'
        ? {
            input: {
              label: rawOptions,
            },
          }
        : {
            ...rawOptions,
          };

    options.input = {
      ...options.input,
    };

    options.dense = true;

    const { initialValue: value = '' } = options.input;
    const { size } = options.input;

    delete options.input.initialValue;

    return this.formPrompt(
      {
        size,
        ...options,
        state: {
          input: value,
        },
      },
      (state) => <VTextField {...options.input} v-model={state.input} />,
    ).then((result) => {
      return result ? result.input : result;
    });
  }
}
