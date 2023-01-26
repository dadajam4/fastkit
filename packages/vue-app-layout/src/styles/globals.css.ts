import { tokens } from './tokens.css';
import { createSimpleVueTransition } from './utils';

export const fadeTransition = createSimpleVueTransition({
  in: {
    transition: `opacity ${tokens.transition.duration}`,
  },
  out: {
    opacity: 0,
  },
});
