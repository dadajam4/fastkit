---
'@fastkit/cookies': patch
---

Fix the README's `maxAge` examples, which were in milliseconds.

`maxAge` is in **seconds** — `cookie@2` types it as "the `number` (in seconds)", per RFC 6265 §5.2.2 — and four examples multiplied by 1,000:

| written | read as | meant |
| --- | --- | --- |
| `maxAge: 24 * 60 * 60 * 1000 // 24 hours` | ~2.7 years | 24 hours |
| `maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days` | ~19.2 years | 7 days |

Three of the four are session and auth-token examples, which is the worst place for it: copying the login handler out of this README shipped a session cookie that never expires in any practical sense, with a comment on the line saying it lasts a day.

The `SerializeOptions` reference now says which unit it is, since that is what would have made this visible. `expires` was and remains correct: it takes a `Date`, so the millisecond arithmetic around it is right.

Documentation only.
