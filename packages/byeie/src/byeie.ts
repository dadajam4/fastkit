import { docReady, $, dynamicStyle, currentScript, isIE } from './utils';
import { getBrowserLanguageDict } from './dict';
import * as gotItStore from './store';
import styles from './styles.scss!raw';

const recommendedBrowsers = ['edge', 'chrome', 'firefox'] as const;

export interface ByeieOptions {
  deadline?: string | Date;
}

function getOptions(opts: ByeieOptions = {}): ByeieOptions {
  let { deadline } = opts;
  if (!deadline) {
    const script = currentScript();
    if (script) {
      const query = script.src.split('?')[1];
      const tmp = query.split('&');
      for (const i in tmp) {
        const row = tmp[i].split('=');
        const key = row[0];
        const value = row[1];
        if (key === 'deadline' && value) {
          deadline = value;
        }
      }
    }
  }

  if (deadline === 'recommended') {
    // Microsoft Teams以外の Microsoft 365 アプリおよびサービスにおける IE 11 のサポート終了日
    // {@link: https://blogs.windows.com/japan/2020/08/18/microsoft-365-apps-say-farewell-to-internet-explorer-11/}
    deadline = '2021/08/17';
  }

  return { deadline };
}

export function byeie(opts?: ByeieOptions) {
  if (!__BROWSER__) return;

  if (!isIE()) return;

  const { deadline } = getOptions(opts);
  if (!deadline) {
    return;
  }
  const dt = deadline instanceof Date ? deadline : new Date(deadline);
  const expired = Date.now() >= dt.getTime();
  if (!expired && gotItStore.get()) return;

  function main() {
    dynamicStyle(styles);

    const dict = getBrowserLanguageDict();

    const formatedDeadline = dt.toLocaleDateString(dict.$lang, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    const headerDict = expired ? dict.expired : dict;

    const $el = $(
      'div',
      {
        className: 'byeie',
      },
      [
        $('div', {
          className: 'byeie__backdrop',
          on: expired
            ? {}
            : {
                click: close,
              },
        }),
        $(
          'div',
          {
            className: 'byeie__body',
          },
          [
            $(
              'h2',
              {
                className: 'byeie__title',
              },
              headerDict.title.replace('<%- deadline %>', formatedDeadline),
            ),
            $(
              'p',
              {
                className: 'byeie__lead',
              },
              headerDict.lead,
            ),
            $(
              'small',
              {
                className: 'byeie__note',
              },
              dict.note,
            ),
            $(
              'div',
              {
                className: 'byeie__installation',
              },
              [
                $(
                  'h3',
                  {
                    className: 'byeie__installation__title',
                  },
                  dict.installation.title,
                ),
                $(
                  'ul',
                  {
                    className: 'byeie__installation__list',
                  },
                  recommendedBrowsers.map((browser) => {
                    const _dict = dict.browser[browser];
                    return $(
                      'li',
                      {
                        className: 'byeie__installation__item',
                      },
                      $(
                        'a',
                        {
                          className: 'byeie__installation__item__link',
                          attrs: {
                            href: _dict.href,
                            target: '_blank',
                          },
                        },
                        _dict.name,
                      ),
                    );
                  }),
                ),
              ],
            ),
            expired
              ? null
              : $('button', {
                  className: 'byeie__close',
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
