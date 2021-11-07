#!/usr/bin/env node
const path = require('path');
const { cli } = require(path.resolve(__dirname, '../dist/icon-font-gen.cjs'));
cli();
