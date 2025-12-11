import {
  ExtractPropTypes,
  SetupContext,
  ref,
  mergeProps,
  watch,
  computed,
  type ComputedRef,
  type InputHTMLAttributes,
  type PropType,
} from 'vue';
import { createPropsOptions } from '@fastkit/vue-utils';
import {
  createFormNodeProps,
  FormNodeControl,
  createFormNodeEmits,
  FormNodeContext,
  FormNodeControlBaseOptions,
} from './node';

const modelValue = Array as PropType<File[]>;

export interface FileInputNodeControlOptions
  extends FormNodeControlBaseOptions {
  defaultMultiple?: boolean;
}

export interface FileInputNodeFile extends File {
  readonly _file: File;
  readonly truncatedName: string;
  readonly readableSize: string;
}

function humanReadableFileSize(
  bytes: number,
  base: 1000 | 1024 = 1000,
): string {
  if (bytes < base) {
    return `${bytes} B`;
  }

  const prefix = base === 1024 ? ['Ki', 'Mi', 'Gi'] : ['k', 'M', 'G'];
  let unit = -1;
  while (Math.abs(bytes) >= base && unit < prefix.length - 1) {
    bytes /= base;
    ++unit;
  }
  return `${bytes.toFixed(1)} ${prefix[unit]}B`;
}

function truncateText(str: string, truncateLength: number) {
  if (str.length < Number(truncateLength)) return str;
  const charsKeepOneSide = Math.floor((Number(truncateLength) - 1) / 2);
  return `${str.slice(0, charsKeepOneSide)}…${str.slice(str.length - charsKeepOneSide)}`;
}

function createFileInputNodeFile(
  file: File,
  truncateLength: number,
): FileInputNodeFile {
  const truncatedName = truncateText(file.name, truncateLength);
  const readableSize = humanReadableFileSize(file.size);

  return {
    ...file,
    _file: file,
    truncatedName,
    readableSize,
  };
}

export interface FileInputNodeSelectionContext {
  files: FileInputNodeFile[];
  totalSize: number;
  totalReadableSize: string;
}

export function createFileInputNodeProps(
  options: FileInputNodeControlOptions = {},
) {
  const { defaultMultiple } = options;
  return {
    ...createFormNodeProps({
      modelValue,
    }),
    ...createPropsOptions({
      /**
       * Defines the file types that the file input field accepts.
       *
       * @example ".doc,.docx,.xml,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
       *
       * @see https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/input/file#accept
       */
      accept: String,
      /**
       * When the `accept` attribute indicates that the input is intended for image
       * or video data, specifies which camera to use for capturing the data.
       *
       * @see https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/input/file#capture
       */
      capture: String as PropType<InputHTMLAttributes['capture']>,
      /**
       * Allows selecting multiple files.
       *
       * @see https://developer.mozilla.org/docs/Web/HTML/Reference/Elements/input/file#multiple
       */
      multiple: {
        type: Boolean,
        default: defaultMultiple,
      },
      /**
       * The number of characters after which the file name will be truncated.
       *
       * @default 22
       */
      truncateLength: {
        type: [Number, String],
        default: 22,
      },
      /** placeholder */
      placeholder: String,
    }),
  };
}
export type FileInputNodeProps = ExtractPropTypes<
  ReturnType<typeof createFileInputNodeProps>
>;

export function createFileInputNodeEmits() {
  return {
    ...createFormNodeEmits({ modelValue }),
  };
}

export function createFileInputNodeSettings() {
  const props = createFileInputNodeProps();
  const emits = createFileInputNodeEmits();
  return { props, emits };
}

export interface FileInputNodeEmits
  extends ReturnType<typeof createFileInputNodeEmits> {}

export type FileInputNodeContext = SetupContext<FileInputNodeEmits>;

export class FileInputNodeControl extends FormNodeControl<File[], File[]> {
  readonly _props: FileInputNodeProps;

  protected _inputElement = ref<HTMLInputElement | null>(null);

  protected _files: ComputedRef<FileInputNodeFile[]>;

  protected _selectionContext: ComputedRef<FileInputNodeSelectionContext>;

  /**
   * `<input />` Element
   */
  get inputElement(): HTMLInputElement | null {
    return this._inputElement.value;
  }

  get multiple() {
    return this._props.multiple;
  }

  get accept() {
    return this._props.accept;
  }

  get capture() {
    return this._props.capture;
  }

  get truncateLength() {
    return Number(this._props.truncateLength);
  }

  get files(): FileInputNodeFile[] {
    return this._files.value;
  }

  get selectionContext(): FileInputNodeSelectionContext {
    return this._selectionContext.value;
  }

  get placeholder() {
    return this._props.placeholder;
  }

  constructor(
    props: FileInputNodeProps,
    ctx: FileInputNodeContext,
    options: FileInputNodeControlOptions = {},
  ) {
    super(props, ctx as unknown as FormNodeContext<File[], File[]>, {
      ...options,
      modelValue,
      shallow: true,
    });
    this._props = props;

    this._handleNodeChange = this._handleNodeChange.bind(this);

    this._files = computed(() => {
      return (this.value || []).map((_file) => {
        return createFileInputNodeFile(_file, this.truncateLength);
      });
    });

    this._selectionContext = computed(() => {
      const { files } = this;
      const totalSize = files.reduce((bytes, { size = 0 }) => bytes + size, 0);
      const totalReadableSize = humanReadableFileSize(totalSize);
      return {
        files,
        totalSize,
        totalReadableSize,
      };
    });

    watch(
      () => props.modelValue,
      (newValue) => {
        const { inputElement } = this;
        if (!inputElement) return;

        const hasModelReset = !Array.isArray(newValue) || !newValue.length;
        if (hasModelReset) {
          inputElement.value = '';
        }
      },
    );
  }

  emptyValue() {
    return [];
  }

  protected _handleNodeChange(ev: Event) {
    const input = ev.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    this.value = this.multiple ? files : files.slice(0, 1);
    // input.value = '';
  }

  createInputElement(override: Omit<InputHTMLAttributes, 'type'> = {}) {
    const attrs: InputHTMLAttributes = {
      id: this.mountedNodeId,
      class: override.class,
      type: 'file',
      name: this.name,
      accept: this.accept,
      capture: this.capture,
      multiple: this.multiple,
      tabindex: this.tabindex,
      readonly: this.isReadonly,
      disabled: this.isDisabled || this.isViewonly,
      onFocus: this.focusHandler,
      onBlur: this.blurHandler,
      onChange: this._handleNodeChange,
    };

    const el = (
      <input {...mergeProps(attrs as any, override)} ref={this._inputElement} />
    );
    return el;
  }

  focus(opts?: FocusOptions) {
    if (this.isDisabled) return;
    this.inputElement?.focus(opts);
  }

  blur() {
    this.inputElement?.blur();
  }
}

export function useFileInputNodeControl(
  props: FileInputNodeProps,
  ctx: FileInputNodeContext,
  options?: FileInputNodeControlOptions,
) {
  const control = new FileInputNodeControl(props, ctx, options);
  return control;
}
