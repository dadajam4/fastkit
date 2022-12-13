'use strict';
if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/cookies.cjs.prod.js');
} else {
  module.exports = require('./dist/cookies.cjs.js');
}
