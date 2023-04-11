import { isNotLessThan } from '../validators';
import { createRule } from '../factories';
import { RulesError } from '../logger';

/**
 * 値が一定以上の値であるか
 * value &gt;= min
 */
export const notLessThan = createRule<number>({
  name: 'notLessThan',
  validate: isNotLessThan,
  message: (value, { constraints: min }) => {
    if (min !== undefined) {
      return `Must be at least ${min}.`;
    }
    throw new RulesError('The constraint settings are incorrect.');
  },
  constraints: 0,
});
