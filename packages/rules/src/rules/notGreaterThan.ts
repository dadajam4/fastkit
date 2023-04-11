import { isNotGreaterThan } from '../validators';
import { createRule } from '../factories';
import { RulesError } from '../logger';

/**
 * 値が一定以下の値であるか
 * value &lt;= max
 */
export const notGreaterThan = createRule<number>({
  name: 'notGreaterThan',
  validate: isNotGreaterThan,
  message: (value, { constraints: max }) => {
    if (max !== undefined) {
      return `Must be ${max} or less.`;
    }
    throw new RulesError('The constraint settings are incorrect.');
  },
  constraints: Infinity,
});
