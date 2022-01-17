import { isFilled } from '../validators';
import { rule } from '../factories';

export const filled = rule({
  name: 'filled',
  validate: isFilled,
  message: 'Some items have not been entered.',
});
