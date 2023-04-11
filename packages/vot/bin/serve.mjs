import { serve } from '../dist/server';

const [, , ...args] = process.argv;

serve({
  memwatch: args.includes('--memwatch'),
});
