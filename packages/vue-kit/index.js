'use strict';
if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/vue-kit.cjs.prod.js');
} else {
  module.exports = require('./dist/vue-kit.cjs.js');
}
