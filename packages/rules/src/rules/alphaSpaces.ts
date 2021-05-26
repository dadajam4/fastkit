import { isAlphaSpaces } from '../validators';
import { createRule } from '../';

/**
 * 半角英字＆スペース
 */
export const alphaSpaces = createRule<void>({
  name: 'alphaSpaces',
  validate: isAlphaSpaces,
  message: 'カナ文字以外は入力できません。',
});
