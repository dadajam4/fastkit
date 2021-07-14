'use strict';
if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/create-fastkit-app.cjs.prod.js');
} else {
  module.exports = require('./dist/create-fastkit-app.cjs.js');
}
