import { serve } from '../dist/server.mjs';

const [, , ...args] = process.argv;

serve({
  memwatch: args.includes('--memwatch'),
});
