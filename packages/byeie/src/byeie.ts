import { docReady, $ } from './utils';
import { getBrowserLanguageDict } from './dict';
import * as gotItStore from './store';

interface RecommendedBrowser {
  name: string;
  href: string;
}

const recommendedBrowsers: RecommendedBrowser[] = [
  {
    name: 'Microsoft Edge',
    href: 'https://www.microsoft.com/ja-jp/edge',
  },
  {
    name: 'Google Chrome',
    href: 'https://www.google.com/intl/ja_jp/chrome/',
  },
  {
    name: 'Mozilla Firefox',
    href: 'https://www.mozilla.org/firefox/',
  },
];

export function byeie() {
  if (!__BROWSER__) return;
  if (gotItStore.get()) return;

  function main() {
    const dict = getBrowserLanguageDict();

    const $el = $(
      'div',
      {
        className: 'fk-bw',
      },
      [
        $('div', {
          className: 'fk-bw__backdrop',
          on: {
            click: close,
          },
        }),
        $(
          'div',
          {
            className: 'fk-bw__body',
          },
          [
            $(
              'h2',
              {
                className: 'fk-bw__title',
              },
              dict.title,
            ),
            $(
              'p',
              {
                className: 'fk-bw__lead',
              },
              dict.lead,
            ),
            $(
              'small',
              {
                className: 'fk-bw__note',
              },
              dict.note,
            ),
            $(
              'div',
              {
                className: 'fk-bw__installation',
              },
              [
                $(
                  'h3',
                  {
                    className: 'fk-bw__installation__title',
                  },
                  dict.installation.title,
                ),
                $(
                  'ul',
                  {
                    className: 'fk-bw__installation__list',
                  },
                  recommendedBrowsers.map((browser) => {
                    return $(
                      'li',
                      {
                        className: 'fk-bw__installation__item',
                      },
                      $('a', {
                        className: 'fk-bw__installation__item__link',
                        attrs: {
                          href: browser.href,
                          target: '_blank',
                        },
                      }),
                    );
                  }),
                ),
              ],
            ),
            $('button', {
              className: 'fk-bw__close',
              attrs: {
                type: 'button',
              },
              on: {
                click: gotIt,
              },
            }),
          ],
        ),
      ],
    );

    document.body.appendChild($el);

    function close() {
      document.body.removeChild($el);
    }

    function gotIt() {
      close();
      gotItStore.set();
    }
  }

  docReady(main);
}
