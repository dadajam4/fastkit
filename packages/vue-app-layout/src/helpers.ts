import { objectFromArray } from '@fastkit/helpers';
import {
  VAL_Y_POSITIONS,
  VAL_X_POSITIONS,
  VAL_STICK_X_POSITIONS,
  VAL_STICK_Y_POSITIONS,
  VAL_BAR_TYPES,
} from './schemes';

export const verticals = objectFromArray.build(VAL_Y_POSITIONS);

export const horizontals = objectFromArray.build(VAL_X_POSITIONS);

export const bars = objectFromArray.build(VAL_BAR_TYPES);

export const sticks = {
  x: objectFromArray.build(VAL_STICK_X_POSITIONS),
  y: objectFromArray.build(VAL_STICK_Y_POSITIONS),
};
