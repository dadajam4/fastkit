'use strict';
if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/color-scheme-gen.cjs.prod.js');
} else {
  module.exports = require('./dist/color-scheme-gen.cjs.js');
}
