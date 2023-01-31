import { objectFromArray } from '@fastkit/helpers';
import {
  VAL_Y_POSITIONS,
  VAL_X_POSITIONS,
  VAL_STICK_X_POSITIONS,
  VAL_STICK_Y_POSITIONS,
  VAL_BAR_TYPES,
} from '../schemes';
import { style, globalStyle, GlobalStyleRule } from '@vanilla-extract/css';

export const verticals = objectFromArray.build(VAL_Y_POSITIONS);

export const horizontals = objectFromArray.build(VAL_X_POSITIONS);

export const bars = objectFromArray.build(VAL_BAR_TYPES);

export const sticks = {
  x: objectFromArray.build(VAL_STICK_X_POSITIONS),
  y: objectFromArray.build(VAL_STICK_Y_POSITIONS),
};

const TOKEN_NAME_MATCH_RE = /^var\((.+)\)$/;

export function extractTokenName(tokenValue: string) {
  const matched = tokenValue.match(TOKEN_NAME_MATCH_RE);
  return matched ? matched[1] : tokenValue;
}

type VueTransitionHook = `${'enter' | 'leave'}-${'from' | 'active' | 'to'}`;

type CreateVueTransitionRow = [
  VueTransitionHook | VueTransitionHook[],
  GlobalStyleRule,
];
export function createVueTransition(
  rows: CreateVueTransitionRow[],
  selector = style({}),
): string {
  rows.forEach(([hooks, rule]) => {
    if (!Array.isArray(hooks)) {
      hooks = [hooks];
    }
    const hooksSelector = hooks.map((hook) => `${selector}-${hook}`).join(', ');
    globalStyle(hooksSelector, rule);
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
