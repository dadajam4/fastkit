import { serve } from './serve-fn.mjs';

const [, , ...args] = process.argv;

serve({
  memwatch: args.includes('--memwatch'),
});
