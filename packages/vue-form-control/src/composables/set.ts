import { ExtractPropTypes, SetupContext, provide } from 'vue';
import { createPropsOptions } from '@fastkit/vue-utils';
import type { FormNodeControl } from './node';
import {
  createFormGroupProps,
  createFormGroupEmits,
  FormGroupOptions,
  FormGroupControl,
} from './group';
import { FormSetInjectionKey } from '../injections';

export interface FormSetOptions extends FormGroupOptions {}

export function createFormSetProps(options: FormSetOptions = {}) {
  return {
    ...createFormGroupProps(),
    ...createPropsOptions({}),
  };
}

export type FormSetProps = ExtractPropTypes<
  ReturnType<typeof createFormSetProps>
>;

export function createFormSetEmits() {
  return {
    ...createFormGroupEmits(),
  };
}

export function createFormSetSettings(options?: FormSetOptions) {
  const props = createFormSetProps(options);
  const emits = createFormSetEmits();
  return { props, emits };
}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface FormSetEmitOptions
  extends ReturnType<typeof createFormSetEmits> {}

export type FormSetContext = SetupContext<FormSetEmitOptions>;

/**
 * Control for handling multiple form nodes as a set
 */
export class FormSetControl extends FormGroupControl {
  readonly _props: FormSetProps;

  protected _getSetState<K extends keyof FormNodeControl>(
    key: K,
  ): FormNodeControl[K] {
    const superValue = super[key];
    if (superValue) return superValue;
    for (const node of this.allNodes) {
      const childValue = node[key];
      if (childValue) return childValue;
    }
    return superValue;
  }

  get isFinalizing() {
    return this._getSetState('isFinalizing');
  }

  get validating() {
    return this._getSetState('validating');
  }

  get focused() {
    return this._getSetState('focused');
  }

  get dirty() {
    return this._getSetState('dirty');
  }

  get touched() {
    return this._getSetState('touched');
  }

  get isRequired() {
    return this._getSetState('isRequired');
  }

  constructor(
    props: FormSetProps,
    ctx: FormSetContext,
    options: FormSetOptions = {},
  ) {
    super(props, ctx, {
      ...options,
    });
    this._props = props;

    provide(FormSetInjectionKey, this);
  }
}

export function useFormSet(
  props: FormSetProps,
  ctx: FormSetContext,
  options?: FormSetOptions,
) {
  const control = new FormSetControl(props, ctx, options);
  return control;
}
