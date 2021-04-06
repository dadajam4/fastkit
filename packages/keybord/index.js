'use strict';
if (process.env.NODE_ENV === 'production') {
  module.exports = require('./dist/keybord.cjs.prod.js');
} else {
  module.exports = require('./dist/keybord.cjs.js');
}
