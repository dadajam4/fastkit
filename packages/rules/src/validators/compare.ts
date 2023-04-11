/**
 * 比較条件文字
 */
export type CompareExt = '<=' | '>=' | '<>' | '!=' | '<' | '>' | '=';

/**
 * 比較条件情報
 */
export interface CompareCondition {
  ammount: number;
  ext: CompareExt;
  isNotEqual: boolean;
  hasEqual: boolean;
  hasGreater: boolean;
  hasNotGreater: boolean;
}

/**
 * 比較文字から比較条件情報を生成する
 */
export function conditionStringToCompareConditions(
  conditions: number | string | (number | string)[],
): CompareCondition[] {
  conditions = Array.isArray(conditions) ? conditions : [conditions];
  return conditions.map((condition) => {
    condition = String(condition);
    const extMatch = condition.match(/^(<=|>=|<>|!=|<|>|=)+/);
    const valueMatch = condition.match(/[\d.]+/);
    const ext: CompareExt = extMatch ? (extMatch[0] as CompareExt) : '=';
    const ammount = valueMatch ? parseFloat(valueMatch[0]) : 0;
    const isNotEqual = ['<>', '!='].includes(ext);
    const hasEqual = !isNotEqual && ext.includes('=');
    const hasGreater = !isNotEqual && ext.includes('>');
    const hasNotGreater = !isNotEqual && ext.includes('<');
    return { ammount, ext, isNotEqual, hasEqual, hasGreater, hasNotGreater };
  });
}

/**
 * 比較条件情報を利用して値を比較する
 */
export function compareValueByCompareCondition(
  value: any,
  condition: CompareCondition,
): boolean {
  const { ammount } = condition;
  if (condition.isNotEqual) {
    return value !== ammount;
  }

  if (condition.hasEqual && value === ammount) {
    return true;
  }
  if (condition.hasGreater) {
    return value > ammount;
  }
  if (condition.hasNotGreater) {
    return value < ammount;
  }
  return false;
}

/**
 * 比較条件文字か比較条件情報を利用して値を比較する
 */
export function compareValueByCompareConditions(
  value: any,
  conditions: CompareCondition | CompareCondition[],
): boolean {
  conditions = Array.isArray(conditions) ? conditions : [conditions];
  for (const condition of conditions) {
    if (!compareValueByCompareCondition(value, condition)) {
      return false;
    }
  }
  return true;
}
