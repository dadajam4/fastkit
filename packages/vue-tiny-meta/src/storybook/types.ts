/**
 * @file storybook control annotations...
 * @see https://storybook.js.org/docs/react/essentials/controls#annotation
 */

export type BooleanControl = 'boolean';

export interface BooleanControllable {
  control: BooleanControl;
}

export type NumberControl = {
  type: 'number';
  min?: number;
  max?: number;
  step?: number;
};

export interface NumberControllable {
  control: NumberControl;
}

export type RangeControl = {
  type: 'range';
  min?: number;
  max?: number;
  step?: number;
};

export interface RangeControllable {
  control: RangeControl;
}

export type ObjectControl = 'object';

export interface ObjectControllable {
  control: ObjectControl;
}

export type FileControl = {
  type: 'file';
  /**
   * @example ".png"
   */
  accept: string;
};

export interface FileControllable {
  control: FileControl;
}

export type RadioControl = 'radio';

export interface RadioControllable {
  control: RadioControl;
  options: (string | number)[];
}

export type InlineRadioControl = 'inline-radio';

export interface InlineRadioControllable {
  control: InlineRadioControl;
  options: (string | number)[];
}

export type CheckControl = 'check';

export interface CheckControllable {
  control: CheckControl;
  options: (string | number)[];
}

export type InlineCheckControl = 'inline-check';

export interface InlineCheckControllable {
  control: InlineCheckControl;
  options: (string | number)[];
}

export type SelectControl = 'select';

export interface SelectControllable {
  control: 'select';
  options: (string | number)[];
}

export type MultiSelectControl = 'multi-select';

export interface MultiSelectControllable {
  control: MultiSelectControl;
  options: (string | number)[];
}

export type TextControl = 'text';

export interface TextControllable {
  control: TextControl;
}

export type ColorControl = 'color';

export interface ColorControllable {
  control: ColorControl;
  presetColors?: string[];
}

export type DateControl = 'date';

export interface DateControllable {
  control: DateControl;
}

export type UnControl = null;

export interface UnControllable {
  control: UnControl;
}

export type AnyControllable =
  | BooleanControllable
  | NumberControllable
  | RangeControllable
  | ObjectControllable
  | FileControllable
  | RadioControllable
  | InlineRadioControl
  | CheckControllable
  | InlineCheckControllable
  | SelectControllable
  | MultiSelectControllable
  | TextControllable
  | ColorControllable
  | DateControllable;

// export type ArgTypes<P extends string = string> = Record<P, AnyControllable>;
