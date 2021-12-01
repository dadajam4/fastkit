import { isGreaterThan } from '../validators';
import { createRule } from '../factories';
import { RulesError } from '../logger';

/**
 * 値が一定を超える値であるか
 * value &gt; min
 */
export const greaterThan = createRule<number>({
  name: 'greaterThan',
  validate: isGreaterThan,
  message: (value, { constraints: min }) => {
    if (min !== undefined) {
      return `Must be greater than ${min}.`;
    }
    throw new RulesError('The constraint settings are incorrect.');
  },
  constraints: 0,
});
