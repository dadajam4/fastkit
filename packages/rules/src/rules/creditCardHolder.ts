import { isCreditCardHolder } from '../validators';
import { createRule } from '../factories';

export const creditCardHolder = createRule({
  name: 'creditCardHolder',
  validate: isCreditCardHolder,
  message:
    'You can only input alphanumeric characters and half-width symbols (hyphen, apostrophe, period, underscore, comma, slash, space).',
});
