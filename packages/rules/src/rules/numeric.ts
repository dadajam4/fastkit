import { isNumeric } from '../validators';
import { rule } from '../';

export const numeric = rule<void>({
  name: 'numeric',
  validate: isNumeric,
  message: 'Must be a number.',
});
