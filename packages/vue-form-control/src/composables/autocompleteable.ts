import { ExtractPropTypes, computed, PropType } from 'vue';
import { createPropsOptions } from '@fastkit/vue-utils';
import { FormNodeControlBaseOptions } from './node';
import { FormAutoComplete } from '../schemes';

export function createAutocompleteableInputProps() {
  return {
    ...createPropsOptions({
      autocomplete: [String, Boolean] as PropType<FormAutoComplete | boolean>,
    }),
  };
}
export type AutocompleteableInputProps = ExtractPropTypes<
  ReturnType<typeof createAutocompleteableInputProps>
>;

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface AutocompleteableInputControlOptions
  extends FormNodeControlBaseOptions {}

export function createAutocompleteableInputControl(
  props: AutocompleteableInputProps,
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

export type AutocompleteableInputControl = ReturnType<
  typeof createAutocompleteableInputControl
>;
