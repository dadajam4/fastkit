const serve = require('./serve-fn');
const [, , ...args] = process.argv;

serve({
  memwatch: args.includes('--memwatch'),
});
