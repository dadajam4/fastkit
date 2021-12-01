import { isMinLength } from '../validators';
import { createRule } from '../factories';
import { RulesError } from '../logger';

export const minLength = createRule<number>({
  name: 'minLength',
  validate: isMinLength,
  message: (value, { constraints: min }) => {
    const type = Array.isArray(value) ? 'items' : 'characters';
    if (min !== undefined && min > 0) {
      return `Please enter at least ${min} ${type}.`;
    }
    throw new RulesError('The constraint settings are incorrect.');
  },
  constraints: 0,
});
