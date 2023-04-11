import { describe, it, expect } from 'vitest';
import { TestI18nSpace, Generic } from './data';

// @NOTE
// Because the Intl formatting implementation depends on the JavaScript runtime implementation, the test results of this file may fail in some execution environments.
// This test is guaranteed to work on Node v16.
describe('フォーマッタの動作の確認', () => {
  describe('フォーマットオプションオブジェクトの取得確認', () => {
    const space = TestI18nSpace.create({
      components: { generic: Generic },
    });

    it('選択中のロケールに対応するフォーマットオプションオブジェクトを取得できること', async () => {
      await space.init();

      const { generic } = space.at;

      expect(generic.dateTime.settings()).toStrictEqual({
        year: { year: '2-digit' },
        long: { year: 'numeric', month: 'long', day: 'numeric' },
      });

      expect(generic.number.settings()).toStrictEqual({
        jpyCurrency: { style: 'currency', currency: 'JPY' },
        maxSig: { maximumSignificantDigits: 3 },
      });

      expect(generic.list.settings()).toStrictEqual({
        piyo: { style: 'long' },
      });

      await space.setLocale('en');

      expect(generic.dateTime.settings()).toStrictEqual({
        year: { year: 'numeric' },
        long: { year: 'numeric', month: 'long', day: 'numeric' },
      });

      expect(generic.number.settings()).toStrictEqual({
        jpyCurrency: { style: 'currency', currency: 'JPY' },
        maxSig: { maximumSignificantDigits: 3 },
      });

      expect(generic.list.settings()).toStrictEqual({
        piyo: { style: 'long', type: 'conjunction' },
      });

      await space.setLocale('zh-cn');

      expect(generic.dateTime.settings()).toStrictEqual({
        year: { year: 'numeric' },
        long: { year: 'numeric', month: 'long', day: 'numeric' },
      });

      expect(generic.number.settings()).toStrictEqual({
        jpyCurrency: { style: 'currency', currency: 'JPY' },
        maxSig: { maximumSignificantDigits: 3 },
      });

      expect(generic.list.settings()).toStrictEqual({
        piyo: { style: 'long' },
      });
    });

    it('指定のロケールに対応するフォーマットオプションオブジェクトを取得できること', async () => {
      await space.setLocale('zh-cn');

      const { generic } = space.at;

      expect(generic.dateTime.settings()).toStrictEqual({
        year: { year: 'numeric' },
        long: { year: 'numeric', month: 'long', day: 'numeric' },
      });

      expect(generic.dateTime.settings('ja')).toStrictEqual({
        year: { year: '2-digit' },
        long: { year: 'numeric', month: 'long', day: 'numeric' },
      });
    });

    it('選択されているロケールでフォーマットできること', async () => {
      await space.setLocale('ja');

      const { generic } = space.at;

      const dt = new Date(0);

      expect(generic.dateTime.format(dt)).toBe('1970/1/1');
      expect(generic.dateTime.format(dt, 'long')).toBe('1970年1月1日');
      expect(generic.dateTime.format(dt, 'year')).toBe('70年');
      expect(generic.relativeTime.format(-1, 'day')).toBe('1 日前');
      expect(generic.relativeTime.format(-1, 'day', 'narrow')).toBe('1日前');
      expect(generic.number.format(1000.123)).toBe('1,000.123');
      expect(generic.number.format(1000.123, 'jpyCurrency')).toBe('￥1,000');
      expect(generic.number.format(1000.123, 'maxSig')).toBe('1,000');
      expect(generic.list.format(['apple', '1', 'abc'])).toBe('apple、1、abc');
      expect(generic.list.format(['apple', '1', 'abc'], 'piyo')).toBe(
        'apple、1、abc',
      );

      await space.setLocale('en');

      expect(generic.dateTime.format(dt)).toBe('1/1/1970');
      expect(generic.dateTime.format(dt, 'long')).toBe('January 1, 1970');
      expect(generic.dateTime.format(dt, 'year')).toBe('1970');
      expect(generic.relativeTime.format(-1, 'day')).toBe('1 day ago');
      expect(generic.relativeTime.format(-1, 'day', 'narrow')).toBe('1d ago');
      expect(generic.number.format(1000.123)).toBe('1,000.123');
      expect(generic.number.format(1000.123, 'jpyCurrency')).toBe('¥1,000');
      expect(generic.number.format(1000.123, 'maxSig')).toBe('1,000');
      expect(generic.list.format(['apple', '1', 'abc'])).toBe(
        'apple, 1, and abc',
      );
      expect(generic.list.format(['apple', '1', 'abc'], 'piyo')).toBe(
        'apple, 1, and abc',
      );

      await space.setLocale('zh-cn');
      expect(generic.dateTime.format(dt)).toBe('1970/1/1');
      expect(generic.dateTime.format(dt, 'long')).toBe('1970年1月1日');
      expect(generic.dateTime.format(dt, 'year')).toBe('1970年');
      expect(generic.relativeTime.format(-1, 'day')).toBe('1天前');
      expect(generic.relativeTime.format(-1, 'day', 'narrow')).toBe('1天前');
      expect(generic.number.format(1000.123)).toBe('1,000.123');
      expect(generic.number.format(1000.123, 'jpyCurrency')).toBe('JP¥1,000');
      expect(generic.number.format(1000.123, 'maxSig')).toBe('1,000');
      expect(generic.list.format(['apple', '1', 'abc'])).toBe('apple、1和abc');
      expect(generic.list.format(['apple', '1', 'abc'], 'piyo')).toBe(
        'apple、1和abc',
      );
    });

    it('ロケールを指定してフォーマットできること', async () => {
      await space.setLocale('ja');

      const { generic } = space.at;

      const dt = new Date(0);

      expect(generic.dateTime.format(dt, 'long', 'en')).toBe('January 1, 1970');
      expect(generic.dateTime.format(dt, 'year', 'en')).toBe('1970');
      expect(generic.number.format(1000.123, 'jpyCurrency', 'en')).toBe(
        '¥1,000',
      );
      expect(generic.list.format(['apple', '1', 'abc'], 'piyo', 'en')).toBe(
        'apple, 1, and abc',
      );
      expect(generic.list.format(['apple', '1', 'abc'], 'piyo', 'zh-cn')).toBe(
        'apple、1和abc',
      );
    });

    it('選択されているロケールでフォーマットパーツを取得できること', async () => {
      await space.setLocale('ja');

      const { generic } = space.at;

      const dt = new Date(0);

      expect(generic.dateTime.parts(dt)).toStrictEqual([
        { type: 'year', value: '1970' },
        { type: 'literal', value: '/' },
        { type: 'month', value: '1' },
        { type: 'literal', value: '/' },
        { type: 'day', value: '1' },
      ]);
      expect(generic.dateTime.parts(dt, 'year')).toStrictEqual([
        { type: 'year', value: '70' },
        { type: 'literal', value: '年' },
      ]);
      expect(generic.relativeTime.parts(-1, 'day')).toStrictEqual([
        { type: 'integer', value: '1', unit: 'day' },
        { type: 'literal', value: ' 日前' },
      ]);
      expect(generic.relativeTime.parts(-1, 'day', 'narrow')).toStrictEqual([
        { type: 'integer', value: '1', unit: 'day' },
        { type: 'literal', value: '日前' },
      ]);
      expect(generic.number.parts(1000.123)).toStrictEqual([
        { type: 'integer', value: '1' },
        { type: 'group', value: ',' },
        { type: 'integer', value: '000' },
        { type: 'decimal', value: '.' },
        { type: 'fraction', value: '123' },
      ]);
      expect(generic.number.parts(1000.123, 'jpyCurrency')).toStrictEqual([
        { type: 'currency', value: '￥' },
        { type: 'integer', value: '1' },
        { type: 'group', value: ',' },
        { type: 'integer', value: '000' },
      ]);
      expect(generic.list.parts(['apple', '1', 'abc'])).toStrictEqual([
        { type: 'element', value: 'apple' },
        { type: 'literal', value: '、' },
        { type: 'element', value: '1' },
        { type: 'literal', value: '、' },
        { type: 'element', value: 'abc' },
      ]);

      await space.setLocale('en');
      expect(generic.list.parts(['apple', '1', 'abc'], 'piyo')).toStrictEqual([
        { type: 'element', value: 'apple' },
        { type: 'literal', value: ', ' },
        { type: 'element', value: '1' },
        { type: 'literal', value: ', and ' },
        { type: 'element', value: 'abc' },
      ]);
    });

    it('選択されているロケールで範囲系フォーマットを処理できること', async () => {
      await space.setLocale('ja');

      const { generic } = space.at;

      const MINUTE = 1000 * 60;
      const HOUR = MINUTE * 60;
      const DAY = HOUR * 24;
      const start = new Date(0);
      const end = new Date(DAY * 2);

      expect(generic.dateTime.range(start, end, 'long')).toBe(
        '1970/01/01～1970/01/03',
      );
      expect(generic.dateTime.rangeParts(start, end, 'long')).toStrictEqual([
        { type: 'year', value: '1970', source: 'startRange' },
        { type: 'literal', value: '/', source: 'startRange' },
        { type: 'month', value: '01', source: 'startRange' },
        { type: 'literal', value: '/', source: 'startRange' },
        { type: 'day', value: '01', source: 'startRange' },
        { type: 'literal', value: '～', source: 'shared' },
        { type: 'year', value: '1970', source: 'endRange' },
        { type: 'literal', value: '/', source: 'endRange' },
        { type: 'month', value: '01', source: 'endRange' },
        { type: 'literal', value: '/', source: 'endRange' },
        { type: 'day', value: '03', source: 'endRange' },
      ]);

      await space.setLocale('en');

      expect(generic.dateTime.range(start, end, 'long')).toBe(
        'January 1 – 3, 1970',
      );
      expect(generic.dateTime.rangeParts(start, end, 'long')).toStrictEqual([
        { type: 'month', value: 'January', source: 'shared' },
        { type: 'literal', value: ' ', source: 'shared' },
        { type: 'day', value: '1', source: 'startRange' },
        { type: 'literal', value: ' – ', source: 'shared' },
        { type: 'day', value: '3', source: 'endRange' },
        { type: 'literal', value: ', ', source: 'shared' },
        { type: 'year', value: '1970', source: 'shared' },
      ]);
    });
  });
});
