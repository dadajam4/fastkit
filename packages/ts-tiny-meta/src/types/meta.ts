import type { PseudoBigInt } from 'typescript';
import { Callable, ObjectLike, ExtractMembers, ClassType } from './general';
import { ParameterDoc, MetaDoc } from './docs';

/**
 * Simple meta information with no properties or union information
 *
 * This is used for individual meta-information on union types, etc.
 */
export interface SingleTypeMeta {
  /** meta kind */
  kind: 'single';
  /** type text */
  text: string;
  /** value of a literal */
  literal?: string | number | PseudoBigInt;
}

/**
 * Body of Basic Meta Information
 */
export interface BasicMetaBody {
  /** Type Documentation */
  docs: MetaDoc[];
  /** type text */
  text: string;
  /**
   * List of meta-information
   *
   * If it is a union type, its individual meta-information is included, otherwise only one meta-information is included
   */
  types: (AnyMeta | SingleTypeMeta)[];
}

/**
 * Basic Meta Information
 *
 * Classes, interfaces, functions, objects, etc. that are not classified under a special meta are parsed into this category.
 */
export interface BasicMeta extends BasicMetaBody {
  /** meta kind */
  kind: 'basic';
  /** name */
  name?: string;
}

/**
 * Parameter Meta Information
 */
export interface ParameterMeta {
  /** meta kind */
  kind: 'parameter';
  /** Parameter name */
  name: string;
  /** type text */
  text: string;
  /** Parameter Documentation */
  docs: ParameterDoc[];
  /** Whether the parameter is optional or not */
  optional: boolean;
  /** Default value */
  defaultValue?: string;
  /**
   * Whether the parameters are Rest parameters or not
   * @see https://developer.mozilla.org/docs/Web/JavaScript/Reference/Functions/rest_parameters
   */
  rest: boolean;
}

/**
 * Callable signature meta-information
 */
export interface SignatureMeta {
  /** meta kind */
  kind: 'signature';
  /** noop */
  name?: undefined;
  /** Signature Documentation */
  docs: MetaDoc[];
  /** type text */
  text: string;
  /** Declaration kind */
  declarationKind: string;
  /** List of parameter meta-information */
  parameters: ParameterMeta[];
  /** Meta-information on return values */
  returnType: BasicMeta;
}

export interface FunctionMetaBody {
  /** type text */
  text: string;
  /** Declaration kind */
  declarationKind: string;
  /**
   * List of signature meta-information
   *
   * If no overloads are defined, typically only one meta-information is included
   */
  signatures: SignatureMeta[];
  /** Function Documentation */
  docs: MetaDoc[];
}

export const FUNCTION_NATIVE_PROPERTIES = [
  'apply',
  'arguments',
  'bind',
  'call',
  'caller',
  'length',
  'name',
  'prototype',
  'toString',
] as const;

export type FunctionNativeProperty =
  (typeof FUNCTION_NATIVE_PROPERTIES)[number];

/**
 * Function Meta Information
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export interface FunctionMata<T extends Function = Function>
  extends FunctionMetaBody {
  /** meta kind */
  kind: 'function';
  /**
   * Function name
   *
   * For unnamed functions, the name is not included.
   */
  name?: string;
  /** Maps meta-information of members belonging to an function */
  properties: ObjectMembers<Omit<T, FunctionNativeProperty>>;
}

/**
 * Basic Information on Object Members
 */
export interface ObjectMemberBase {
  /** Member Name */
  name: string;
}

/**
 * Object Property Meta Information
 */
export interface ObjectPropertyMeta extends ObjectMemberBase, BasicMetaBody {
  /** meta kind */
  kind: 'property';
  /** Whether the property is optional or not */
  optional: boolean;
  /** Whether the property is read-only or not */
  readonly: boolean;
}

/**
 * Meta-information on member methods of an object
 */
export interface ObjectMethodMeta extends ObjectMemberBase, FunctionMetaBody {
  /** meta kind */
  kind: 'method';
}

/**
 * Object Member Meta Information
 */
export type ObjectMemberMeta = ObjectPropertyMeta | ObjectMethodMeta;

/**
 * Maps meta-information of members belonging to an object
 */
export type ObjectMembers<T extends ObjectLike = ObjectLike> = ExtractMembers<
  T,
  ObjectMemberMeta
>;

/**
 * Object Meta Information
 */
export interface ObjectMeta<T extends ObjectLike = ObjectLike> {
  /** meta kind */
  kind: 'object';
  /** name */
  name?: string;
  /** type text */
  text: string;
  /** Object Documentation */
  docs: MetaDoc[];
  /** List of meta-information on constructor signatures */
  constructors: SignatureMeta[];
  /** List of meta-information on callable signature */
  signatures: SignatureMeta[];
  /** Maps meta-information of members belonging to an object */
  properties: ObjectMembers<T>;
}

/**
 * Class Meta Information
 */
export interface ClassMeta<T extends ClassType = ClassType> {
  /** meta kind */
  kind: 'class';
  /** Class name */
  name: string;
  /** type text */
  text: string;
  /** Class Documentation */
  docs: MetaDoc[];
  /** List of meta-information on constructor signatures */
  constructors: SignatureMeta[];
  /** Maps meta-information of members belonging to an class */
  members: ObjectMembers<InstanceType<T>>;
  /** Maps meta-information about static members belonging to a class. */
  staticMembers: ObjectMembers<Omit<T, 'prototype'>>;
}

export interface CustomMeta<T = any> {
  /** meta kind */
  kind: 'custom';
  /** Custom name */
  name: string;
  details: T;
  /** Custom meta Documentation */
  docs: MetaDoc[];
}

export type AnyMeta =
  | BasicMeta
  | SignatureMeta
  | FunctionMata
  | ObjectMeta
  | ClassMeta
  | CustomMeta;

export type InferMeta<T> = T extends ClassType
  ? ClassMeta<T>
  : T extends Callable
    ? FunctionMata
    : T extends ObjectLike
      ? ObjectMeta<T>
      : BasicMeta;
