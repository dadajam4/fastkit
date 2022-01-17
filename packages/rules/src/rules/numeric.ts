import { isNumeric } from '../validators';
import { rule } from '../factories';

export const numeric = rule({
  name: 'numeric',
  validate: isNumeric,
  message: 'Must be a number.',
});
