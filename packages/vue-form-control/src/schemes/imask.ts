import type {
  MaskedFunction,
  MaskedRegExp,
  MaskedEnum,
  MaskedRange,
  Masked,
  InputMask,
  MaskedDynamic,
  FactoryOpts,
  MaskedDynamicOptions,
  AppendFlags,
} from 'imask';

export type IMaskEventType = 'accept' | 'complete';

export type AnyMaskedOptions = FactoryOpts;

export type IMaskEvent = CustomEvent<InputMask>;

export function createIMaskEvent(
  type: IMaskEventType,
  eventInitDict?: CustomEventInit<InputMask>,
): IMaskEvent {
  return new CustomEvent<InputMask>(type, eventInitDict);
}

export type IMaskTypedValue = string | number | Date;

// eslint-disable-next-line @typescript-eslint/ban-types
type IMaskRawInput = RegExp | Function | string;

function isRawType(source: unknown): source is IMaskRawInput {
  const t = typeof source;
  return t === 'string' || t === 'function' || source instanceof RegExp;
}

type DynamicMaskedMeta = {
  /** Metadata assigned to dynamic mask options. */
  meta?: any;
};

type AnyMaskedOptionsWithMeta = AnyMaskedOptions & DynamicMaskedMeta;

type AnyMaskedWithMeta = Masked & DynamicMaskedMeta;

type MaskedDynamicWithMeta = Omit<
  MaskedDynamic,
  'currentMask' | 'compiledMasks'
> & {
  currentMask?: AnyMaskedWithMeta;
  compiledMasks: AnyMaskedWithMeta[];
};

export type MaskedDynamicOptionsWithMeta = Omit<
  MaskedDynamicOptions,
  'mask' | 'dispatch'
> & {
  mask: AnyMaskedOptionsWithMeta[];
  dispatch?: (
    value: string,
    masked: MaskedDynamicWithMeta,
    flags: AppendFlags,
  ) => Masked;
};

export type IMaskInput =
  | Exclude<AnyMaskedOptions, MaskedDynamicOptions>
  | IMaskRawInput
  | Masked<any>
  | MaskedFunction
  | MaskedRegExp
  | MaskedEnum
  | MaskedRange
  | MaskedDynamicOptionsWithMeta
  | false
  | null
  | undefined
  | void;

export function resolveIMaskInput(
  source?: IMaskInput,
): AnyMaskedOptions | undefined {
  if (isRawType(source)) {
    return <AnyMaskedOptions>{ mask: source };
  }
  if (source) {
    return source as AnyMaskedOptions;
  }
}
