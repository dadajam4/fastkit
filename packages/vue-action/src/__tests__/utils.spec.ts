import { describe, it, expect } from 'vitest';
import { createRouter, createMemoryHistory } from 'vue-router';
import { resolveRelativeLocationRaw, isExternalLocation } from '../utils';

async function createTestRouter() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/:path(.*)*', component: { render: () => null } }],
  });
  await router.push('/en/foo/');
  return router;
}

describe('resolveRelativeLocationRaw', () => {
  it.each([
    ['/a/#b', '/a/#b'],
    ['#map', '/en/foo/#map'],
    ['/a/?q=a%20b&r=x=y&k=1&k=2', '/a/?q=a+b&r=x=y&k=1&k=2'],
    ['/a/?q=1#h', '/a/?q=1#h'],
    ['bar?q=1', '/en/foo/bar?q=1'],
    ['../bar', '/en/bar'],
  ])('resolves %s to %s', async (to, expected) => {
    const router = await createTestRouter();
    const raw = resolveRelativeLocationRaw(to, '/en/foo/');

    expect(router.resolve(raw).fullPath).toBe(expected);
  });

  it('keeps the leading `#` of the hash', () => {
    expect(resolveRelativeLocationRaw('/a/#b', '/')).toEqual({
      path: '/a/',
      hash: '#b',
    });
  });

  it('decodes the query and keeps repeated keys', () => {
    expect(
      resolveRelativeLocationRaw('/a/?q=a%20b&r=x=y&k=1&k=2', '/'),
    ).toEqual({
      path: '/a/',
      query: { q: 'a b', r: 'x=y', k: ['1', '2'] },
    });
  });

  it.each(['https://example.com/a', 'tel:0123', 'mailto:a@example.com'])(
    'does not join %s to the current path',
    (path) => {
      expect(resolveRelativeLocationRaw({ path }, '/en/foo/')).toEqual({
        path,
      });
    },
  );
});

describe('isExternalLocation', () => {
  it.each([
    ['https://example.com/a', true],
    ['tel:0123', true],
    ['mailto:a@example.com', true],
    ['//example.com/a', true],
    ['/a', false],
    ['a', false],
    ['./a', false],
    ['#a', false],
    ['?a=1', false],
  ])('%s → %s', (location, expected) => {
    expect(isExternalLocation(location)).toBe(expected);
  });
});
