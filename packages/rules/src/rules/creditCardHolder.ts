import { isCreditCardHolder } from '../validators';
import { createRule } from '../factories';

export const creditCardHolder = createRule({
  name: 'creditCardHolder',
  validate: isCreditCardHolder,
  message:
    '半角英数、半角記号（スペース、コンマ、ハイフン、ピリオド、スラッシュ）のみ入力可能です。',
});
