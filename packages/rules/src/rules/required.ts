import { isRequired } from '../validators';
import { rule } from '../';

export const REQUIRED_SYMBOL = 'required';

export const required = rule<void>({
  name: REQUIRED_SYMBOL,
  validate: isRequired,
  message: 'This item is required.',
});
