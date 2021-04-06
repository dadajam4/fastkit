'use strict';
if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/visibility.cjs.prod.js');
} else {
  module.exports = require('./dist/visibility.cjs.js');
}
