import { serve } from '../dist/internal/serve.mjs';

const [, , ...args] = process.argv;

serve({
  memwatch: args.includes('--memwatch'),
});
