import { ComputedRef } from 'vue';
import { ScopeName } from '@fastkit/color-scheme';

export type { VuiService } from '../service';

export interface VuiColorProvider {
  primary: ComputedRef<ScopeName>;
  warning: ComputedRef<ScopeName>;
  error: ComputedRef<ScopeName>;
  className: (type: 'primary' | 'warning' | 'error') => string;
}
