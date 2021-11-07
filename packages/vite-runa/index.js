'use strict';
if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/vite-runa.cjs.prod.js');
} else {
  module.exports = require('./dist/vite-runa.cjs.js');
}
