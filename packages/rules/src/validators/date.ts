import { safeGetTimeByDateSource } from '@fastkit/helpers';

/**
 * 日時が一定値以上か
 * value &gt;= minDate
 */
export function dateIsNotLessThan(
  value: number | string | Date,
  minDate: number | string | Date,
) {
  return safeGetTimeByDateSource(value) >= safeGetTimeByDateSource(minDate);
}

/**
 * 日時が一定値以上か
 * value &lt;= maxDate
 */
export function dateIsNotGreaterThan(
  value: number | string | Date,
  maxDate: number | string | Date,
) {
  return safeGetTimeByDateSource(value) <= safeGetTimeByDateSource(maxDate);
}

export interface BetweenDateConstraints {
  min?: number | string | Date;
  max?: number | string | Date;
}

/**
 * 日時が一定範囲内か
 * value &gt;= condition.min && value &lt;= condition.max
 */
export function dateIsBetween(
  value: number | string | Date,
  condition: BetweenDateConstraints,
) {
  const { min, max } = condition;
  return (
    (min == null || dateIsNotLessThan(value, min)) &&
    (max == null || dateIsNotGreaterThan(value, max))
  );
}
