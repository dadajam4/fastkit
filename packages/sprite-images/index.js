'use strict';
if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/sprite-images.cjs.prod.js');
} else {
  module.exports = require('./dist/sprite-images.cjs.js');
}
