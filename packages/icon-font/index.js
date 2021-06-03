'use strict';
if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/icon-font.cjs.prod.js');
} else {
  module.exports = require('./dist/icon-font.cjs.js');
}
