const gc =
  typeof global.gc === 'function'
    ? global.gc
    : (() => {
        const v8 = require('v8');
        const vm = require('vm');

        v8.setFlagsFromString('--expose_gc');
        const gc = vm.runInNewContext('gc');
        return gc;
      })();

module.exports = gc;
