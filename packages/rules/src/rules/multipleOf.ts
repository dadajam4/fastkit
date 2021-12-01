import { isMultipleOf } from '../validators';
import { createRule } from '../factories';
import { RulesError } from '../logger';

export const multipleOf = createRule<number>({
  name: 'multipleOf',
  validate: isMultipleOf,
  message: (value, { constraints: step }) => {
    if (step > 0) {
      return `It must be a multiple of ${step}.`;
    }
    throw new RulesError('The constraint settings are incorrect.');
  },
  constraints: 0,
});
