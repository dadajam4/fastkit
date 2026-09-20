// Runs in vitest's default node environment: no `window`, so `@fastkit/helpers`
// reports `IN_WINDOW === false` -- the SSR case.
import { describe, it, expect, vi } from 'vitest';
import { createClient } from './client-language.helpers';

describe('getClientLanguage, on the server', () => {
  it('asks the caller rather than the process it is running in', () => {
    // Node has had a global `navigator` since v21, and it reports the server's
    // own locale. Reading it here answered every request with whatever `LANG`
    // the server was started with, and never called this.
    const getClientLanguage = vi.fn(() => ['ja-JP']);
    const client = createClient({ getClientLanguage });

    expect(client.getClientLanguage()).toEqual(['ja-JP']);
    expect(getClientLanguage).toHaveBeenCalledOnce();
  });

  it('hands the available locales to the caller', () => {
    const getClientLanguage = vi.fn(() => undefined);
    const client = createClient({ getClientLanguage });

    client.getClientLanguage();

    expect(getClientLanguage).toHaveBeenCalledWith(['en', 'ja', 'de']);
  });

  it('never answers with the server process locale', () => {
    // The failure this replaces looked like a working answer, so assert the
    // wrong one specifically: whatever this machine's `navigator` says must
    // not come back when the caller said something else.
    expect(typeof navigator).toBe('object');
    const client = createClient({ getClientLanguage: () => ['de-DE'] });

    expect(client.getClientLanguage()).not.toEqual(navigator.languages);
    expect(client.getClientLanguage()).toEqual(['de-DE']);
  });

  it('resolves the negotiated locale through the space', () => {
    const client = createClient({ getClientLanguage: () => ['ja-JP', 'en'] });

    expect(client.extractClientLocale()).toBe('ja');
  });

  it('has nothing to say when no caller supplied a language', () => {
    const client = createClient();

    expect(client.getClientLanguage()).toBeUndefined();
    expect(client.extractClientLocale()).toBeUndefined();
  });
});
