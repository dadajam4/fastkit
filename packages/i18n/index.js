'use strict';
if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/i18n.cjs.prod.js');
} else {
  module.exports = require('./dist/i18n.cjs.js');
}
