import * as alphaHelper from './alphaHelper';
import { safeRemainderOperation } from '@fastkit/helpers';
import { isEmpty } from '@fastkit/helpers';
export { isEmpty } from '@fastkit/helpers';

export function isRequired(value: any): boolean {
  return !isEmpty(value);
}

export function isFilled(value: unknown): value is Array<unknown> {
  return Array.isArray(value) && value.every(isRequired);
}

export function isPattern(value: any, pattern: string | RegExp): boolean {
  if (typeof pattern === 'string') {
    pattern = new RegExp(pattern);
  }
  return pattern.test(value);
}

/**
 * 文字（number含む） or オブジェクト（の場合はキーの数） or 配列の長さを取得する
 * 型がマッチしていない場合は0
 */
export function getLength(value: any): number {
  if (value == null) return 0;
  if (typeof value === 'number') {
    value = String(value);
  }

  if (typeof value === 'string' || Array.isArray(value)) {
    return value.length;
  }

  if (typeof value === 'object') {
    return Object.keys(value).length;
  }

  // esline-disable-next-line no-extra-boolean-cast
  return value ? value.length || 0 : 0;
}

/**
 * 長さをチェックする条件オブジェクト
 */
export interface LengthCondition {
  min: number;
  max: number;
}

/**
 * 文字（number含む） or オブジェクト（の場合はキーの数） or 配列の長さをチェックする
 */
export function isLength(value: any, condition: number | LengthCondition) {
  const l = getLength(value);
  if (typeof condition === 'object') {
    const { min = 0, max } = condition;
    if (l < min) return false;
    if (max !== undefined && l > max) return false;
    return true;
  } else {
    return l === condition;
  }
}

/**
 * 文字（number含む） or オブジェクト（の場合はキーの数） or 配列の長さが一定以上の長さであるか
 */
export function isMinLength(value: any, min: number) {
  return getLength(value) >= min;
}

/**
 * 文字（number含む） or オブジェクト（の場合はキーの数） or 配列の長さが一定以下の長さであるか
 */
export function isMaxLength(value: any, max: number) {
  return getLength(value) <= max;
}

export const EMAIL_REGEXP =
  /^(?=.{1,254}$)(?=.{1,64}@)[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+(\.[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+)*@[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*$/;

/**
 * Eメール形式として正しいか
 */
export function isEmail(value: any): value is string {
  return typeof value === 'string' && EMAIL_REGEXP.test(value);
}

/**
 * カンマ区切りのEメール形式として正しいか
 */
export function isMultipleEmail(value: any): value is string {
  if (typeof value !== 'string') return false;
  return value.split(',').every((str) => isEmail(str.trim()));
}

export const URL_REGEXP =
  /^(?:(?:https?|ftp):\/\/)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00A1-\uFFFF0-9]-*)*[a-z\u00A1-\uFFFF0-9]+)(?:\.(?:[a-z\u00A1-\uFFFF0-9]-*)*[a-z\u00A1-\uFFFF0-9]+)*(?:\.(?:[a-z\u00A1-\uFFFF]{2,})))(?::\d{2,5})?(?:\/\S*)?$/;

export function isUrl(value: any): value is string {
  return typeof value === 'string' && URL_REGEXP.test(value);
}

/**
 * 数字のみで構成されているか
 */
export function isNumeric(value: any): boolean {
  return /^[0-9]+$/.test(String(value));
}

/**
 * 整数のみで構成されているか（つまりマイナス文字は許容）
 */
export function isInteger(value: any): boolean {
  return /^-?[0-9]+$/.test(String(value));
}

/**
 * 曖昧一致しているか
 * value == requiredValue
 */
export function isEqual(value: any, requiredValue: any): boolean {
  // eslint-disable-next-line eqeqeq
  return value == requiredValue;
}

/**
 * 曖昧不一致しているか
 * value != requiredValue
 */
export function isNotEqual(value: any, requiredValue: any): boolean {
  // eslint-disable-next-line eqeqeq
  return value != requiredValue;
}

/**
 * 厳格一致しているか
 * value === requiredValue
 */
export function isStrictEqual(value: any, requiredValue: any): boolean {
  return value === requiredValue;
}

/**
 * 厳格不一致しているか
 * value !== requiredValue
 */
export function isNotStrictEqual(value: any, requiredValue: any): boolean {
  return value !== requiredValue;
}

/**
 * 値が一定以上の値であるか
 * value &gt;= min
 */
export function isNotLessThan(value: any, min: any): boolean {
  const parsedValue = parseFloat(value);
  const minValue = parseFloat(min);
  if (isNaN(parsedValue)) {
    return false;
  }
  if (isNaN(parsedValue)) {
    return true;
  }
  return parsedValue >= minValue;
}

/**
 * 値が一定を超える値であるか
 * value &gt; min
 */
export function isGreaterThan(value: any, min: any): boolean {
  const parsedValue = parseFloat(value);
  const minValue = parseFloat(min);
  if (isNaN(parsedValue)) {
    return false;
  }
  if (isNaN(parsedValue)) {
    return true;
  }
  return parsedValue > minValue;
}

/**
 * 値が一定以下の値であるか
 * value &lt;= max
 */
export function isNotGreaterThan(value: any, max: any): boolean {
  const parsedValue = parseFloat(value);
  const minValue = parseFloat(max);
  if (isNaN(parsedValue)) {
    return true;
  }
  if (isNaN(parsedValue)) {
    return false;
  }
  return parsedValue <= minValue;
}

/**
 * 値が一定未満の値であるか
 * value &lt; max
 */
export function isLessThan(value: any, max: any): boolean {
  const parsedValue = parseFloat(value);
  const minValue = parseFloat(max);
  if (isNaN(parsedValue)) {
    return true;
  }
  if (isNaN(parsedValue)) {
    return false;
  }
  return parsedValue < minValue;
}

/**
 * 値が一定の範囲内の値であるか
 * min &lt;= value &lt;= max
 */
export function isBetween(
  value: any,
  condition: { min: number; max: number },
): boolean {
  return (
    isNotLessThan(value, condition.min) &&
    isNotGreaterThan(value, condition.max)
  );
}

/**
 * 半角英字
 */
export function isAlpha(value: any, locale: string): boolean {
  const reMap = alphaHelper.alpha;
  const helper = (locale && reMap[locale]) || undefined;
  return helper
    ? helper.test(value)
    : Object.keys(reMap).some((loc) => reMap[loc].test(value));
}

/**
 * 半角英字＆アンダースコア＆ハイフン
 */
export function isAlphaDash(value: any, locale?: string): boolean {
  const reMap = alphaHelper.alphaDash;
  const helper = (locale && reMap[locale]) || undefined;
  return helper
    ? helper.test(value)
    : Object.keys(reMap).some((loc) => reMap[loc].test(value));
}

/**
 * 半角英字＆数字
 */
export function isAlphaNumeric(value: any, locale?: string): boolean {
  const reMap = alphaHelper.alphaNumeric;
  const helper = (locale && reMap[locale]) || undefined;
  return helper
    ? helper.test(value)
    : Object.keys(reMap).some((loc) => reMap[loc].test(value));
}

/**
 * 半角英字＆スペース
 */
export function isAlphaSpaces(value: any, locale?: string): boolean {
  const reMap = alphaHelper.alphaSpaces;
  const helper = (locale && reMap[locale]) || undefined;
  return helper
    ? helper.test(value)
    : Object.keys(reMap).some((loc) => reMap[loc].test(value));
}

// eslint-disable-next-line no-irregular-whitespace
export const kanaRe = /^[ｧ-ﾝﾞﾟ\-ァ-ヶー　\s\d]+$/;

export function isKana(value: unknown): value is string {
  return typeof value === 'string' && kanaRe.test(value);
}

export const kanaAlphaNumericRe = /^[ｧ-ﾝﾞﾟ\-ァ-ヶー\sA-Z\d.,]+$/i;

export function isKanaAlphaNumeric(value: unknown): value is string {
  return typeof value === 'string' && kanaAlphaNumericRe.test(value);
}

export const creditCardHolderRe = /^[a-z\d ,\-./]+$/i;
export function isCreditCardHolder(value: unknown) {
  return typeof value === 'string' && creditCardHolderRe.test(value);
}

export function isMultipleOf(value: any, step: number) {
  if (typeof value === 'string') {
    value = value.trim();
    if (!value || isNaN(value)) return false;
    value = Number(value);
  }
  if (typeof value !== 'number') return false;
  return safeRemainderOperation(value, step) === 0;
}
