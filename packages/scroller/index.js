'use strict';
if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/scroller.cjs.prod.js');
} else {
  module.exports = require('./dist/scroller.cjs.js');
}
