import { isUrl } from '../validators';
import { createRule } from '../factories';

export const url = createRule({
  name: 'url',
  validate: isUrl,
  message: 'The url format is incorrect.',
});
