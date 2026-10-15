// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { Scroller } from '../scroller';

describe('Scroller.destroy', () => {
  it('does not throw when no element has been set', () => {
    const scroller = new Scroller({ el: null });
    expect(() => scroller.destroy()).not.toThrow();
    expect(scroller.isDestroyed).toBe(true);
  });

  it('does not start listening when destroyed right after setup', async () => {
    const rejections: unknown[] = [];
    const onRejection = (reason: unknown) => rejections.push(reason);
    process.on('unhandledRejection', onRejection);
    try {
      const scroller = new Scroller(document.createElement('div'));
      scroller.destroy();
      // Let the `start()` kicked off by the element setup resume.
      await new Promise((resolve) => setTimeout(resolve));
      expect(scroller.isDestroyed).toBe(true);
      expect(rejections).toEqual([]);
    } finally {
      process.off('unhandledRejection', onRejection);
    }
  });
});
