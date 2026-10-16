// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { Scroller } from '../scroller';

describe('Scroller without an element', () => {
  it.each([
    ['by', (s: Scroller) => s.by(0, 100)],
    ['to', (s: Scroller) => s.to({ y: 100 })],
    ['toElement', (s: Scroller) => s.toElement(document.createElement('div'))],
    ['toSide', (s: Scroller) => s.toSide('bottom')],
    ['toTop', (s: Scroller) => s.toTop()],
    ['toRight', (s: Scroller) => s.toRight()],
    ['toBottom', (s: Scroller) => s.toBottom()],
    ['toLeft', (s: Scroller) => s.toLeft()],
    ['toLeftTop', (s: Scroller) => s.toLeftTop()],
    ['toLeftBottom', (s: Scroller) => s.toLeftBottom()],
    ['toRightTop', (s: Scroller) => s.toRightTop()],
    ['toRightBottom', (s: Scroller) => s.toRightBottom()],
  ])('%s does nothing and does not throw', async (_name, run) => {
    const scroller = new Scroller({ el: null });
    const result = run(scroller);
    await expect(result.promise).resolves.toBeUndefined();
    expect(result.plans).toEqual({ x: 0, y: 0 });
    scroller.destroy();
  });

  it('applies a scroll stopper pushed before the element is set', () => {
    const scroller = new Scroller({ el: null });
    const stopper = {};
    expect(() => scroller.pushScrollStopper(stopper)).not.toThrow();

    const el = document.createElement('div');
    document.body.appendChild(el);
    scroller.setElement(el);
    expect((el as any).__ps_ctx__).toBeDefined();

    expect(() => scroller.removeScrollStopper(stopper)).not.toThrow();
    expect((el as any).__ps_ctx__).toBeUndefined();

    scroller.destroy();
    el.remove();
  });

  it('does nothing after destroy()', async () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    const scroller = new Scroller({ el });
    scroller.destroy();

    const result = scroller.to({ y: 100 });
    await expect(result.promise).resolves.toBeUndefined();
    expect(result.plans).toEqual({ x: 0, y: 0 });

    el.remove();
  });

  it('ignores scroll stoppers after destroy()', () => {
    const el = document.createElement('div');
    document.body.appendChild(el);
    const scroller = new Scroller({ el });
    scroller.destroy();

    scroller.pushScrollStopper({});
    expect(scroller.scrollEnabled).toBe(true);

    el.remove();
  });
});
