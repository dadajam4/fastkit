import {
  globalLayer,
  globalStyle,
} from '@vanilla-extract/css';
import { DISABLED_REASON_CSS_LAYER_NAME, DISABLED_REASON_ACTIVATED_ATTR } from './constants';

globalLayer(DISABLED_REASON_CSS_LAYER_NAME);

globalStyle(`[${DISABLED_REASON_ACTIVATED_ATTR}]`, {
  '@layer': {
    [DISABLED_REASON_CSS_LAYER_NAME]: {
      position: 'relative',
    }
  }
});
