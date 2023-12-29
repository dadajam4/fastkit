import { ExtractPropTypes, computed, PropType } from 'vue';
import { createPropsOptions } from '@fastkit/vue-utils';
import { FormNodeControlBaseOptions } from './node';
import { FormAutoComplete } from '../schemes';

export function createAutocompletableInputProps() {
  return {
    ...createPropsOptions({
      /**
       * The HTML autocomplete attribute lets web developers specify what if any permission the [user agent](https://developer.mozilla.org/docs/Glossary/User_agent) has to provide automated assistance in filling out form field values, as well as guidance to the browser as to the type of information expected in the field.
       *
       * @see https://developer.mozilla.org/docs/Web/HTML/Attributes/autocomplete
       */
      autocomplete: [String, Boolean] as PropType<FormAutoComplete | boolean>,
    }),
  };
}
export type AutocompletableInputProps = ExtractPropTypes<
  ReturnType<typeof createAutocompletableInputProps>
>;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface AutocompletableInputControlOptions
  extends FormNodeControlBaseOptions {}

export function createAutocompletableInputControl(
  props: AutocompletableInputProps,
) {
  const computedAutocomplete = computed(() => {
    let result: FormAutoComplete | undefined;
    const { autocomplete } = props;
    if (typeof autocomplete === 'boolean') {
      result = autocomplete ? 'on' : 'off';
    } else {
      result = autocomplete;
    }
    return result;
  });
  return {
    computedAutocomplete,
  };
}

export type AutocompletableInputControl = ReturnType<
  typeof createAutocompletableInputControl
>;
