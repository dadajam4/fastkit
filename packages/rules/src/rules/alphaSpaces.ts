import { isAlphaSpaces } from '../validators';
import { createRule } from '../factories';

/**
 * 半角英字＆スペース
 */
export const alphaSpaces = createRule({
  name: 'alphaSpaces',
  validate: isAlphaSpaces,
  message: 'カナ文字以外は入力できません。',
});
