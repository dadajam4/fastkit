export type IMaskEventType = 'accept' | 'complete';

export type IMaskEvent = CustomEvent<IMask.InputMask<any>>;

export function createIMaskEvent(
  type: IMaskEventType,
  eventInitDict?: CustomEventInit<IMask.InputMask<any>>,
): IMaskEvent {
  return new CustomEvent<IMask.InputMask<any>>(type, eventInitDict);
}

export type IMaskTypedValue = string | number | Date;

// import IMask, { AnyMaskedOptions } from 'imask';
import IMask from 'imask';
type AnyMaskedOptions = any;

export type IMaskInput =
  | AnyMaskedOptions
  | string
  | false
  | null
  | undefined
  | void;

export function resolveIMaskInput(
  source?: IMaskInput,
): AnyMaskedOptions | undefined {
  if (typeof source === 'string') {
    source = {
      mask: source,
    };
  }
  if (source) {
    return source;
  }
}
