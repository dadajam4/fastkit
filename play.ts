import { generate } from './packages/icon-font/src/tool';
import path from 'path';

const SRC = path.resolve('packages/playground/src/config/icon-font/svg');
const DEST = path.resolve('test');

generate({
  name: 'hoge',
  inputDir: SRC,
  outputDir: DEST,
});
