import { isFilled } from '../validators';
import { rule } from '../';

export const filled = rule<void>({
  name: 'filled',
  validate: isFilled,
  message: 'Some items have not been entered.',
});
