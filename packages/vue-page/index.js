'use strict';
if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/vue-page.cjs.prod.js');
} else {
  module.exports = require('./dist/vue-page.cjs.js');
}
