import { isBetween } from '../validators';
import { createRule } from '../factories';

/**
 * 値が一定の範囲内の値であるか
 * min &lt;= value &lt;= max
 */
export const between = createRule<{ min: number; max: number }>({
  name: 'between',
  validate: isBetween,
  message: (value, { constraints }) => {
    const { min, max } = constraints;
    return `Must be ${min} to ${max}.`;
  },
  constraints: { min: 0, max: Infinity },
});
