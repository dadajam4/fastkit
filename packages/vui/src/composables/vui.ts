import { ComputedRef } from 'vue';
export type { VuiService } from '../service';
import { ScopeName } from '@fastkit/color-scheme';

export interface VuiColorProvider {
  primary: ComputedRef<ScopeName>;
  error: ComputedRef<ScopeName>;
  className: (type: 'primary' | 'error') => string;
}
