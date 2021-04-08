'use strict';
if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/playground.cjs.prod.js');
} else {
  module.exports = require('./dist/playground.cjs.js');
}
