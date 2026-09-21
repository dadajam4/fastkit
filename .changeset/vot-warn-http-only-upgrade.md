---
'@fastkit/vot': patch
---

Say something when a WebSocket upgrade arrives for a proxy rule that forwards
HTTP only.

A rule written as a bare string forwards HTTP and not upgrades. That is
deliberate and matches Vite, so one configuration behaves the same under
`vot dev` and `vot serve`. What was missing is any signal when the omission is a
mistake:

```ts
export default defineVotServer({
  proxy: {
    // Forwards HTTP. Not upgrades.
    '/socket.io': 'http://127.0.0.1:3001',
  },
});
```

Nothing breaks, which is the whole problem. socket.io defaults to
`transports: ['polling', 'websocket']`, so a client connects over long-polling,
tries to upgrade, gets nowhere, and stays on polling. The application works and
simply pays for it — in one consumer that ran unnoticed in production for
months, and was found by reading the proxy implementation rather than by
observing anything.

`vot serve` now warns, once per rule, the first time an upgrade arrives
somewhere that cannot carry it:

```
[vot] an upgrade request arrived for proxy rule "/socket.io", which forwards HTTP only.
      Add `ws: true` to the rule (or use a ws:/wss: target) to forward WebSocket upgrades.
```

Once per rule rather than once per request, because a client that keeps retrying
should not fill the log. Startup is the wrong moment to say it: most rules are
HTTP-only on purpose, so a startup check would warn about nearly all of them. An
upgrade actually arriving is what turns the omission into a mistake.

## An upgrade that goes nowhere is now closed rather than left open

Finding this turned up a second, quieter problem. The node adapter installed its
`upgrade` listener only when at least one rule opted into WebSockets, and that
listener returned without touching the socket when no ws-forwarding rule
matched. Node closes an upgrade itself when nothing is listening for one — but
once a listener exists, returning from it leaves the socket **accepted and
open**, so the client waits out its own timeout for a 101 that is never coming.

Measured against a configuration with one `ws: true` rule and one HTTP-only
rule, an upgrade to the HTTP-only rule held the socket until the client gave up.
It is now closed immediately, which is what an application without any ws rule
already got from Node.

So the listener is installed whenever there are any proxy rules, and matches
against all of them. What a client sees is otherwise unchanged.

## `vot dev` cannot do this

Under `vot dev` the rules are merged into Vite's own `server.proxy` and Vite
owns the socket, so vot never sees the upgrade. Vite does not warn either. The
half that is covered is the half where the cost accrues unseen: production.

Closes #290.
