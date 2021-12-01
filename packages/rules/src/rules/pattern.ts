import { isPattern } from '../validators';
import { createRule } from '../factories';

export const pattern = createRule<string | RegExp>({
  name: 'pattern',
  validate: isPattern,
  message: 'The input pattern is incorrect.',
  constraints: '',
});
