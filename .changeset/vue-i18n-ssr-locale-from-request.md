---
'@fastkit/vue-i18n': patch
---

Negotiate the SSR locale from the request, not from the server's own `LANG`.

`getClientLanguage` asked `typeof navigator !== 'undefined'` to decide whether it was in a browser. That stopped being the right question when **Node 21 added a global `navigator`**: since then the browser branch has been taken during SSR as well, and the `getClientLanguage` a host supplies — `@fastkit/vot-i18n` builds one from the request's `Accept-Language` — has never been called.

What it answered with instead is the server process's own locale:

```
LANG=en_US.UTF-8 -> ["en-US"]
LANG=ja_JP.UTF-8 -> ["ja-JP"]
LANG=de_DE.UTF-8 -> ["de-DE"]
```

That is worse than not working, because `extractClientLocale()` decides redirects:

| server `LANG` | what every visitor got |
| --- | --- |
| `en_US` | treated as `en` — a reader asking for `ja` stayed on the English page and no redirect ever fired |
| `ja_JP` | treated as `ja` — **every** visitor was redirected to `/ja/`, English ones included |

So the same build behaved differently depending on which machine served it, and one of those behaviours was a wrong redirect for everybody rather than a missing one. This is the "sometimes it works" that path-prefix locale routing has had since Node 21.

The check is now `IN_WINDOW`, which is what the same file already uses two methods down. Browser behaviour is unchanged: there, `navigator.languages` is still what answers, and a supplied `getClientLanguage` is still ignored.
