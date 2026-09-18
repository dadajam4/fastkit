import fs from 'node:fs';
import path from 'node:path';
import { describe, test, expect } from 'vitest';
import type { AxiosError, AxiosRequestConfig } from 'axios';
import {
  toAxiosErrorInfo,
  type AxiosErrorLike,
  type SerializableAxiosRequestConfig,
} from '../axios';

const SRC = path.resolve(__dirname, '../..');

/**
 * The types in `../axios` mirror axios' by hand, so that the published
 * declarations never name the module (issue #233). The cost of mirroring is
 * silent drift when axios changes, and these assertions are what prevent it:
 * they are checked by `pnpm typecheck`, and axios is a devDependency here, so
 * an incompatible change upstream stops this file from compiling.
 */
type Expect<T extends true> = T;
/** Tuple-wrapped so a union is compared as a whole rather than distributed. */
type MutuallyAssignable<A, B> = [A] extends [B]
  ? [B] extends [A]
    ? true
    : false
  : false;
type AssignableTo<To, From> = [From] extends [To] ? true : false;

// A real axios error must satisfy the structural input we accept.
export type _AxiosErrorIsAccepted = Expect<
  AssignableTo<AxiosErrorLike, AxiosError>
>;

// Field by field, our request config must agree with axios'.
type AxiosField<K extends keyof AxiosRequestConfig> = NonNullable<
  AxiosRequestConfig[K]
>;
type OurField<K extends keyof SerializableAxiosRequestConfig> = NonNullable<
  SerializableAxiosRequestConfig[K]
>;

export type _MethodMatches = Expect<
  MutuallyAssignable<AxiosField<'method'>, OurField<'method'>>
>;
export type _ResponseTypeMatches = Expect<
  MutuallyAssignable<AxiosField<'responseType'>, OurField<'responseType'>>
>;
export type _ProxyMatches = Expect<
  MutuallyAssignable<AxiosField<'proxy'>, OurField<'proxy'>>
>;
export type _TimeoutMatches = Expect<
  MutuallyAssignable<AxiosField<'timeout'>, OurField<'timeout'>>
>;
export type _SocketPathMatches = Expect<
  MutuallyAssignable<AxiosField<'socketPath'>, OurField<'socketPath'>>
>;

describe('axios resolver', () => {
  // `axios` used to be named in the published declarations, which a consumer's
  // type checker must resolve whether or not they installed it -- there is no
  // such thing as an optional import in a `.d.ts` (issue #233). The types here
  // are structural instead, and the runtime recognises an axios error by its
  // own marker, so nothing in this package may name the module at all.
  test('no published source file imports axios', () => {
    const offenders: string[] = [];
    const walk = (dir: string) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          // Tests are not published, and this one imports axios' types on
          // purpose to assert the mirrored shapes still match.
          if (entry.name !== '__tests__') walk(full);
        } else if (/\.tsx?$/.test(entry.name)) {
          if (
            /from\s+['"]axios['"]|import\(['"]axios['"]\)/.test(
              fs.readFileSync(full, 'utf8'),
            )
          ) {
            offenders.push(path.relative(SRC, full));
          }
        }
      }
    };
    walk(SRC);
    expect(offenders).toEqual([]);
  });

  test('copies the picked config fields and drops the rest', () => {
    const info = toAxiosErrorInfo({
      isAxiosError: true,
      name: 'AxiosError',
      message: 'Request failed with status code 404',
      stack: 'stack',
      code: 'ERR_BAD_REQUEST',
      config: {
        url: '/items',
        method: 'get',
        timeout: 1000,
        // Not in ConfigPicks: a function, and not serializable.
        transformRequest: () => undefined,
        adapter: 'xhr',
      },
      response: {
        data: { message: 'not found' },
        status: 404,
        statusText: 'Not Found',
        headers: { 'content-type': 'application/json' },
      },
    });

    expect(info.config).toEqual({
      url: '/items',
      method: 'get',
      timeout: 1000,
    });
    expect(info.config).not.toHaveProperty('transformRequest');
    expect(info.config).not.toHaveProperty('adapter');
    expect(info.response?.status).toBe(404);
    expect(info.code).toBe('ERR_BAD_REQUEST');
  });

  test('survives an error with no config or response', () => {
    const info = toAxiosErrorInfo({
      isAxiosError: true,
      name: 'AxiosError',
      message: 'Network Error',
    });
    expect(info.config).toEqual({});
    expect(info.response).toBeUndefined();
  });
});
