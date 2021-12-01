import { isLength, LengthCondition } from '../validators';
import { createRule } from '../factories';

export const betweenLength = createRule<LengthCondition>({
  name: 'betweenLength',
  validate: isLength,
  message: (value, { constraints }) => {
    const type = Array.isArray(value) ? 'items' : 'characters';
    const { min, max } = constraints;
    return `Please enter ${min}-${max} ${type}.`;
  },
  constraints: { min: 0, max: 0 },
});
