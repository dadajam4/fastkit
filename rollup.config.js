const path = require('path');

require('ts-node').register({
  project: path.resolve(__dirname, 'tsconfig.node.json'),
});

module.exports = require(path.resolve(__dirname, 'core/rollup.config.ts'));
