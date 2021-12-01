import { isRequired } from '../validators';
import { rule } from '../factories';

export const REQUIRED_SYMBOL = 'required';

export const required = rule<void>({
  name: REQUIRED_SYMBOL,
  validate: isRequired,
  message: 'This item is required.',
});
