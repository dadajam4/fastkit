'use strict';
if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/byeie.cjs.prod.js');
} else {
  module.exports = require('./dist/byeie.cjs.js');
}
