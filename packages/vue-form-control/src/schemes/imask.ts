import IMask, {
  Masked,
  MaskedFunction,
  MaskedRegExp,
  MaskedEnum,
  MaskedRange,
} from 'imask';
import type { AnyMaskedOptions } from 'imask';

export type IMaskEventType = 'accept' | 'complete';

export type IMaskEvent = CustomEvent<IMask.InputMask<any>>;

export function createIMaskEvent(
  type: IMaskEventType,
  eventInitDict?: CustomEventInit<IMask.InputMask<any>>,
): IMaskEvent {
  return new CustomEvent<IMask.InputMask<any>>(type, eventInitDict);
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

type AnyMaskedWithMeta = IMask.AnyMasked & DynamicMaskedMeta;

type MaskedDynamic = IMask.MaskedDynamic;

type MaskedDynamicWithMeta = Omit<
  MaskedDynamic,
  'currentMask' | 'compiledMasks'
> & {
  currentMask?: AnyMaskedWithMeta;
  compiledMasks: AnyMaskedWithMeta[];
};

export type MaskedDynamicOptionsWithMeta = Omit<
  IMask.MaskedDynamicOptions,
  'mask' | 'dispatch'
> & {
  mask: AnyMaskedOptionsWithMeta[];
  dispatch?: (
    value: string,
    masked: MaskedDynamicWithMeta,
    flags: IMask.AppendFlags,
  ) => IMask.AnyMasked;
};

export type IMaskInput =
  | Exclude<AnyMaskedOptions, IMask.MaskedDynamicOptions>
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
    source = <AnyMaskedOptions>{ mask: source };
  }
  if (source) {
    return source;
  }
}
