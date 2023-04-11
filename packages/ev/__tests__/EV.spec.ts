/* eslint-disable @typescript-eslint/no-empty-function */
import { describe, it, expect } from 'vitest';
import { EV } from '../src';
import { EVListener } from '../src/EVListener';

function getListeners(ev: EV): EVListener[] {
  return (ev as any).__ev_listeners__;
}

describe('constract', () => {
  it('should can constract', () => {
    const ev = new EV();
    if (!(ev instanceof EV)) {
      throw new Error('Initialization failed.');
    }
  });

  it('should can extend', () => {
    class TestClass extends EV {
      constructor() {
        super();
      }
    }
    const DDEVKeys = Object.keys(EV.prototype);
    for (const key of DDEVKeys) {
      expect((TestClass as any).prototype[key]).toStrictEqual(
        (EV as any).prototype[key],
      );
    }
  });
});

describe('on', () => {
  it('should can on', () => {
    const ev = new EV();
    const listeners = getListeners(ev);
    const listener = ev.on('test', () => {});
    expect(listeners.length).toStrictEqual(1);
    expect(listeners[0]).toStrictEqual(listener);
  });

  it('should can multiple on', () => {
    const ev = new EV();
    const listeners = getListeners(ev);
    const listenr1 = ev.on('test', () => {});
    const listenr2 = ev.on({ type: 'test3', handler: () => {} });
    const listenr3 = ev.on('test4', () => {}, { tag: 'fuga' });
    expect(listeners.length).toStrictEqual(3);
    expect(listeners[0]).toStrictEqual(listenr1);
    expect(listeners[1]).toStrictEqual(listenr2);
    expect(listeners[2]).toStrictEqual(listenr3);
    expect(listenr1.type).toStrictEqual('test');
    expect(listenr3.type).toStrictEqual('test4');
    expect(listenr3.tag).toStrictEqual('fuga');
  });

  it('should can emit', () => {
    expect.assertions(1);
    const ev = new EV();
    ev.on('test', (payload) => {
      expect(payload).toStrictEqual(true);
    });
    ev.emit('test', true);
  });

  it('should can recieve correctly payload', () => {
    expect.assertions(5);

    const ev = new EV<{
      e1?: void;
      e2: string;
      e3: boolean;
    }>();

    ev.on('e1', (p) => expect(p).toBeUndefined());
    ev.on('e1', (p) => expect(p).toBeUndefined(), { tag: 'tag1' });
    ev.on('e2', { handler: (p) => expect(p).toStrictEqual('str') });
    ev.on('e3', (p) => expect(p).toStrictEqual(true));
    ev.on('e3', {
      handler: (p) => expect(p).toStrictEqual(true),
      tag: 'tag2',
    });

    ev.emit('e1', void 0);
    ev.emit('e2', 'str');
    ev.emit('e3', true);
  });
});

describe('immediate', () => {
  it('should can immediate - basic', () => {
    const ev = new EV<{ test: number }>();
    let immediateCheckValue = 0;
    const listeners = getListeners(ev);
    const listener1 = ev.immediate('test', () => {
      immediateCheckValue++;
    });
    const listener2 = ev.on('test', (a) => {
      immediateCheckValue++;
    });
    expect(immediateCheckValue).toStrictEqual(1);
    expect(listeners.length).toStrictEqual(2);
    expect(listeners[0]).toStrictEqual(listener1);
    expect(listeners[1]).toStrictEqual(listener2);
  });

  it('should can immediate - valiations', () => {
    const ev = new EV<{ test: number; fuga: boolean }>();
    let immediateCheckValue = 0;
    const listeners = getListeners(ev);
    const listener1 = ev.immediate('test', () => {
      immediateCheckValue++;
    });
    const listener2 = ev.on('test', (a) => {
      immediateCheckValue++;
    });
    const listener3 = ev.once('test', (a) => {
      immediateCheckValue++;
    });
    expect(immediateCheckValue).toStrictEqual(1);
    expect(listeners.length).toStrictEqual(3);
    expect(listeners[0]).toStrictEqual(listener1);
    expect(listeners[1]).toStrictEqual(listener2);
    expect(listeners[2]).toStrictEqual(listener3);
    ev.emit('fuga', true);
    expect(immediateCheckValue).toStrictEqual(1);
    expect(listeners.length).toStrictEqual(3);
    ev.emit('test', 5);
    expect(immediateCheckValue).toStrictEqual(4);
    expect(listeners.length).toStrictEqual(2);
  });
});

describe('once', () => {
  it('should can once', () =>
    new Promise<void>((done) => {
      let count = 3;
      function check() {
        count--;
        if (count === 0) {
          expect(listeners.length).toStrictEqual(0);
          done();
        }
      }

      const ev = new EV();
      const listeners = getListeners(ev);
      const listener1 = ev.once('test', (payload) => {
        expect(payload).toBe('fuga');
        setTimeout(() => {
          expect(listener1.context).toBeUndefined();
          expect((listener1 as any)._remover).toBeUndefined();
          expect(listener1.handler).toBeUndefined();
          check();
        }, 0);
      });
      const listener2 = ev.once('test', {
        handler: (payload) => {
          expect(payload).toBe('fuga');
          setTimeout(() => {
            expect(listener2.context).toBeUndefined();
            expect((listener2 as any)._remover).toBeUndefined();
            expect(listener2.handler).toBeUndefined();
            check();
          }, 0);
        },
      });

      const listener3 = ev.once({
        type: 'test',
        handler: (payload) => {
          expect(payload).toBe('fuga');
          setTimeout(() => {
            expect(listener3.context).toBeUndefined();
            expect((listener3 as any)._remover).toBeUndefined();
            expect(listener3.handler).toBeUndefined();
            check();
          }, 0);
        },
      });

      expect(listeners.length).toStrictEqual(3);
      ev.emit('test', 'fuga');
    }));
});

describe('off', () => {
  it('should can off by type', () => {
    const ev = new EV();
    const listeners = getListeners(ev);
    const listener = ev.on('test1', () => {});
    ev.on('test2', () => {});
    ev.on('test3', { handler: () => {}, tag: 'tag1' });

    expect(listeners.length).toStrictEqual(3);
    ev.off('test4');
    expect(listeners.length).toStrictEqual(3);
    ev.off('test1');
    expect(listener.context).toBeUndefined();
    expect((listener as any)._remover).toBeUndefined();
    expect(listener.handler).toBeUndefined();
    expect(listeners.length).toStrictEqual(2);
    ev.off({ type: 'test3' });
    expect(listeners.length).toStrictEqual(1);
    ev.off({ type: 'test2', tag: '222' });
    expect(listeners.length).toStrictEqual(1);
    ev.off({ type: 'test2' });
    expect(listeners.length).toStrictEqual(0);
  });

  it('should can off by callback', () => {
    const ev = new EV();
    const listeners = getListeners(ev);
    const cb1 = () => {};
    const cb2 = () => {};
    const cb3 = () => {};
    const listener = ev.on('test1', cb1);
    ev.on('test2', cb2);
    ev.on('test3', { handler: cb3, tag: 'tag1' });
    ev.off(() => {});
    expect(listeners.length).toStrictEqual(3);
    ev.off('test1', () => {});
    expect(listeners.length).toStrictEqual(3);
    ev.off('test1', cb1);
    expect(listeners.length).toStrictEqual(2);
    expect(listener.context).toBeUndefined();
    expect((listener as any)._remover).toBeUndefined();
    expect(listener.handler).toBeUndefined();
    ev.off({ handler: cb2, tag: 'fuga' });
    expect(listeners.length).toStrictEqual(2);
    ev.off({ handler: cb2 });
    expect(listeners.length).toStrictEqual(1);
    ev.off(cb2);
    expect(listeners.length).toStrictEqual(1);
    ev.off(cb3);
    expect(listeners.length).toStrictEqual(0);
  });

  it('should can off by tag', () => {
    const ev = new EV();
    const listeners = getListeners(ev);

    const tag1 = 'tag1';
    const tag2 = {};
    const tag3 = class Tag3 {};

    const listener = ev.on('test1', () => {}, { tag: tag1 });
    ev.on('test2', () => {}, { tag: tag1 });
    ev.on('test2', () => {});
    ev.on('test3', () => {}, { tag: tag2 });
    ev.on('test4', () => {}, { tag: tag2 });
    ev.on('test5', () => {}, { tag: tag2 });

    expect(listeners.length).toStrictEqual(6);
    ev.off({ tag: tag3 });
    expect(listeners.length).toStrictEqual(6);
    ev.off('test3', { tag: tag1 });
    expect(listeners.length).toStrictEqual(6);
    ev.off({ tag: tag1 });
    expect(listeners.length).toStrictEqual(4);
    expect(listener.context).toBeUndefined();
    expect((listener as any)._remover).toBeUndefined();
    expect(listener.handler).toBeUndefined();
    ev.off('test3', { tag: tag2 });
    expect(listeners.length).toStrictEqual(3);
    ev.off({ tag: tag2 });
    expect(listeners.length).toStrictEqual(1);
    ev.off('test2');
    expect(listeners.length).toStrictEqual(0);
  });
});

describe('offAll', () => {
  it('should can off All', () => {
    const ev = new EV();
    const listeners = getListeners(ev);
    const listener = ev.on('test1', () => {}, { tag: 'tag1' });
    ev.on('test2', () => {}, { tag: 'tag1' });
    ev.on('test2', () => {});
    ev.on('test3', () => {}, { tag: 'tag2' });
    ev.on('test4', () => {}, { tag: 'tag2' });
    ev.on('test5', () => {}, { tag: 'tag2' });

    expect(listeners.length).toStrictEqual(6);
    ev.offAll();
    expect(listeners.length).toStrictEqual(0);
    expect(listener.context).toBeUndefined();
    expect((listener as any)._remover).toBeUndefined();
    expect(listener.handler).toBeUndefined();
  });
});
