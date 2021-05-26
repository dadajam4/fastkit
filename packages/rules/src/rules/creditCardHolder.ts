import { isCreditCardHolder } from '../validators';
import { createRule } from '../';

export const creditCardHolder = createRule<void>({
  name: 'creditCardHolder',
  validate: isCreditCardHolder,
  message:
    '半角英数、半角記号（スペース、コンマ、ハイフン、ピリオド、スラッシュ）のみ入力可能です。',
});
