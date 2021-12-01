import {
  dateIsNotLessThan,
  dateIsNotGreaterThan,
  dateIsBetween,
  BetweenDateConstraints,
} from '../validators';
import { createRule } from '../factories';

/**
 * 日時が一定値以上か
 * value &gt;= minDate
 */
export const minDate = createRule<number | string | Date>({
  name: 'minDate',
  validate: dateIsNotLessThan,
  message: (value, { constraints: dateToCompare }) => {
    return 'It is not a selectable date range.';
  },
  constraints: 0,
});

/**
 * 日時が一定値以上か
 * value &lt;= maxDate
 */
export const maxDate = createRule<number | string | Date>({
  name: 'maxDate',
  validate: dateIsNotGreaterThan,
  message: (value, { constraints: dateToCompare }) => {
    return 'It is not a selectable date range.';
  },
  constraints: 0,
});

/**
 * 日時が一定範囲内か
 * value &gt;= condition.min && value &lt;= condition.max
 */
export const betweenDate = createRule<BetweenDateConstraints>({
  name: 'betweenDate',
  validate: dateIsBetween,
  message: (value, { constraints: dateToCompare }) => {
    return 'It is not a selectable date range.';
  },
  constraints: {},
});
