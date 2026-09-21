---
'@fastkit/catcher': minor
---

Add `defaultMessage`, so an application can guarantee that every catcher has a message.

For a package whose pitch is "throw anything at it and read the result", "whatever you throw, the result has a message" ought to hold. It did not, and the failure was quiet rather than loud:

```ts
const AppError = build({ normalizer: () => () => ({ code: 'APP_ERROR' }) });

const err = AppError.from('just a string'); // nothing recognised it
err.message; // ''
err.toJSONString(); // {"code":"APP_ERROR","message":"", ...}
```

An instance is a real `Error`, and an `Error` is born with an empty message. So a normalizer that returned no `message` for an exception it did not recognise did not leave the field out — it left an empty one, which reads like a message rather than the absence of one. Nothing flagged it.

`defaultMessage` is the last word, applied after the normalizer and after the exception's own message, and only when what is left is empty:

```ts
const AppError = build({
  defaultName: 'AppError',
  defaultMessage: 'Something went wrong',
  normalizer: () => () => ({ code: 'APP_ERROR' }),
});

AppError.from('just a string').message; // 'Something went wrong'
AppError.from(new Error('real')).message; // 'real' — never displaced
```

There is no default value: the string is what a user may end up reading, so it belongs to the application rather than to this package. Development warns once per catcher when an instance is built with no message and `defaultMessage` is unset.

`CatcherData` now also carries `name`, `message` and `stack` as optional members, which is what the catcher has always written into it regardless of the normalizer. A normalizer that declares them narrows them back to required.
