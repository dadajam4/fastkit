import { isKana, isKanaAlphaNumeric } from '../validators';
import { createRule } from '../factories';

export const kana = createRule<void>({
  name: 'kana',
  validate: isKana,
  message: 'カナ文字以外は入力できません。',
});

export const kanaAlphaNumeric = createRule<void>({
  name: 'kanaAlphaNumeric',
  validate: isKanaAlphaNumeric,
  message: 'カナ、英数字以外は入力できません。',
});
