import { GlobalStyleRule } from '@vanilla-extract/css';
import { component } from './layers.css';

type VueTransitionHook = `${'enter' | 'leave'}-${'from' | 'active' | 'to'}`;

type CreateVueTransitionRow = [
  VueTransitionHook | VueTransitionHook[],
  GlobalStyleRule,
];
export function createVueTransition(
  rows: CreateVueTransitionRow[],
  selector = component.style({}),
): string {
  rows.forEach(([hooks, rule]) => {
    if (!Array.isArray(hooks)) {
      hooks = [hooks];
    }
    const hooksSelector = hooks.map((hook) => `${selector}-${hook}`).join(', ');
    component.global(hooksSelector, rule);
  });
  return selector;
}

const SIMPLE_TRANSITION_KEYS = ['in', 'out'] as const;

type SimpleTransitionKey = (typeof SIMPLE_TRANSITION_KEYS)[number];

export function createSimpleVueTransition(
  settings: Record<SimpleTransitionKey, GlobalStyleRule>,
  selector?: string,
): string {
  const rows: CreateVueTransitionRow[] = SIMPLE_TRANSITION_KEYS.map((key) => {
    const hooks =
      key === 'in'
        ? (['enter-active', 'leave-active'] as const)
        : (['enter-from', 'leave-to'] as const);
    return [[...hooks], settings[key]];
  });
  return createVueTransition(rows, selector);
}
