import { describe, test, expect } from 'vitest';
import { Path } from '@fastkit/plugboy';
import nodePath from 'node:path';

describe('hoge', () => {
  test('fuga', () => {
    const path = new Path(__dirname);
    expect(path).toBeInstanceOf(Path);
    expect(path.value).toBe(__dirname);
  });
  test('fuga', () => {
    const path = new Path(__dirname);
    expect(path.join('hoge').value).toBe(nodePath.join(__dirname, 'hoge'));
  });
});
