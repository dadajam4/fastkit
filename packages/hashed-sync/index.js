'use strict';
if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/hashed-sync.cjs.prod.js');
} else {
  module.exports = require('./dist/hashed-sync.cjs.js');
}
