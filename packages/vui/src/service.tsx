export { VuiInjectionKey } from './injections';

import { VNodeChild } from 'vue';
import { ScopeName, ColorVariant } from '@fastkit/color-scheme';
import type { IconName, RawIconProp } from './components/VIcon';
import {
  type VueColorSchemePluginSettings,
  type VueStackService,
  type VDialogProps,
  resolveVStackDynamicInput,
} from '@fastkit/vue-kit';
import type { Router } from 'vue-router';
import { RouterLink } from 'vue-router';
import { LocationService, setDefaultRouterLink } from '@fastkit/vue-utils';
import { VForm } from './components/VForm';
import { VTextField, TextFieldInput } from './components/VTextField';
import { VueForm } from '@fastkit/vue-form-control';
import { getDocumentScroller } from '@fastkit/vue-scroller';

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
}

export type VuiVNodeResolver = () => VNodeChild;

export interface VuiServiceOptions {
  router: Router;
  RouterLink?: typeof RouterLink;
  colorScheme: VueColorSchemePluginSettings;
  uiSettings: VuiServiceUISettings;
  icons: VuiServiceIconSettings;
  selectionSeparator?: VuiVNodeResolver;
  autoScrollToElementOffsetTop?: number | (() => number | undefined);
  textareaRows?: number;
  requiredChip?: VuiVNodeResolver;
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

  get scroller() {
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

    let { initialValue: value = '' } = options.input;
    const { size } = options.input;

    delete options.input.initialValue;

    let form: VueForm | undefined;

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
            onVnodeMounted={(vnode) => {
              form = (vnode.component as any).ctx.form as VueForm;
            }}
            onVnodeBeforeUnmount={() => {
              form = undefined;
            }}
            onSubmit={(ev) => {
              stack.resolve(value);
            }}>
            <VTextField
              {...options.input}
              modelValue={value}
              onChange={(ev) => {
                stack.value = ev;
                value = ev;
              }}
            />
          </VForm>
        );
      },
    });

    return this.dialog(resolved);
  }
}
