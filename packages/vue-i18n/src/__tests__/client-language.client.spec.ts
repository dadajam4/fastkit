// @vitest-environment jsdom
import { describe, it, expect, vi, afterEach } from 'vitest';
import { createClient } from './client-language.helpers';

describe('getClientLanguage, in a browser', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('reads the browser and ignores the setting', () => {
    // In a browser the navigator *is* the client, so a caller-supplied
    // language would be answering a question the runtime already knows.
    const getClientLanguage = vi.fn(() => ['de-DE']);
    vi.stubGlobal('navigator', { languages: ['ja-JP', 'en-US'] });
    const client = createClient({ getClientLanguage });

    expect(client.getClientLanguage()).toEqual(['ja-JP', 'en-US']);
    expect(getClientLanguage).not.toHaveBeenCalled();
  });

  it('resolves the browser locale through the space', () => {
    vi.stubGlobal('navigator', { languages: ['ja-JP', 'en-US'] });
    const client = createClient();

    expect(client.extractClientLocale()).toBe('ja');
  });
});
