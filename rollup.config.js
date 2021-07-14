const path = require('path');
const { register } = require('esbuild-register/dist/node');

register();

module.exports = require(path.resolve(__dirname, 'core/rollup.config.ts'));
