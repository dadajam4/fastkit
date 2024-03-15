import { isAlphaSpaces } from '../validators';
import { createRule } from '../factories';

/**
 * 半角英字＆スペース
 */
export const alphaSpaces = createRule({
  name: 'alphaSpaces',
  validate: isAlphaSpaces,
  message: 'Only half-width English letters and half-width spaces are allowed.',
});
