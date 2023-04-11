import { isLength, LengthCondition } from '../validators';
import { createRule } from '../factories';

export const length = createRule<number | LengthCondition>({
  name: 'length',
  validate: isLength,
  message: (value, { constraints }) => {
    const type = Array.isArray(value) ? 'items' : 'characters';
    if (typeof constraints === 'object') {
      const { min, max } = constraints;
      return `Please enter ${min}-${max} ${type}.`;
    } else {
      return `Please enter ${constraints} ${type}.`;
    }
  },
  constraints: { min: 0, max: 0 },
});
