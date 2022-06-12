/* eslint-disable @typescript-eslint/no-empty-function */
import 'jest';
import { MemoryCacheStorage } from '../memory';

describe('constract', () => {
  it('should can constract', () => {
    const storage = new MemoryCacheStorage();
    if (!(storage instanceof MemoryCacheStorage)) {
      throw new Error('Initialization failed.');
    }
  });
});
