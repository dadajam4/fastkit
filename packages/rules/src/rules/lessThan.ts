import { isLessThan } from '../validators';
import { createRule } from '../factories';
import { RulesError } from '../logger';

/**
 * 値が一定未満の値であるか
 * value &lt; max
 */
export const lessThan = createRule<number>({
  name: 'lessThan',
  validate: isLessThan,
  message: (value, { constraints: max }) => {
    if (max !== undefined) {
      return `Must be less than ${max}.`;
    }
    throw new RulesError('The constraint settings are incorrect.');
  },
  constraints: Infinity,
});
