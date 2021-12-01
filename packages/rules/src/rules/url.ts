import { isUrl } from '../validators';
import { createRule } from '../factories';

export const url = createRule<void>({
  name: 'url',
  validate: isUrl,
  message: 'The url format is incorrect.',
});
