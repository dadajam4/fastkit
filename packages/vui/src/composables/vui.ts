import { ComputedRef } from 'vue';
import { ScopeName } from '@fastkit/color-scheme';

export type { VuiService } from '../service';

export interface VuiColorProvider {
  primary: ComputedRef<ScopeName>;
  error: ComputedRef<ScopeName>;
  className: (type: 'primary' | 'error') => string;
}
