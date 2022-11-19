declare namespace Intl {
  interface DateTimeRangeFormatPart extends Intl.DateTimeFormatPart {
    source: 'startRange' | 'endRange' | 'shared';
  }

  type ListFormatType = 'conjunction' | 'disjunction';

  interface ListFormatOptions {
    localeMatcher?: 'lookup' | 'best fit';
    type?: ListFormatType;
    style?: 'long' | 'short' | 'narrow';
  }

  interface ListFormatPart {
    type: 'element' | 'literal';
    value: string;
  }

  class ListFormat {
    constructor(locales?: string | string[], options?: ListFormatOptions);
    format(values: any[]): string;
    formatToParts(values: any[]): ListFormatPart[];
    supportedLocalesOf(
      locales: string | string[],
      options?: ListFormatOptions,
    ): string[];
  }
}
