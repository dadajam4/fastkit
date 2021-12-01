import { isEmail, isMultipleEmail } from '../validators';
import { createRule } from '../factories';

export const email = createRule<void>({
  name: 'email',
  validate: isEmail,
  message: 'The email format is incorrect.',
});

export const multipleEmail = createRule<void>({
  name: 'multipleEmail',
  validate: isMultipleEmail,
  message: 'The email format is incorrect.',
});
