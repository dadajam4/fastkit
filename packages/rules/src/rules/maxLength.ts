import { isMaxLength } from '../validators';
import { createRule } from '../factories';
import { RulesError } from '../logger';

export const maxLength = createRule<number>({
  name: 'maxLength',
  validate: isMaxLength,
  message: (value, { constraints: max }) => {
    const type = Array.isArray(value) ? 'items' : 'characters';
    if (max !== undefined) {
      return `Please enter ${max} ${type} or less.`;
    }
    throw new RulesError('The constraint settings are incorrect.');
  },
  constraints: Infinity,
});
