# @fastkit/eslint-config

🌐 English | [日本語](https://github.com/dadajam4/fastkit/blob/main/packages/eslint-config/README-ja.md)

fastkit's shared [flat](https://eslint.org/docs/latest/use/configure/configuration-files) ESLint configuration for TypeScript projects. It focuses on code quality and **turns off ESLint's formatting rules** (via [`eslint-config-prettier`](https://github.com/prettier/eslint-config-prettier)), so it never conflicts with a formatter.

Because those rules are off, ESLint neither reports nor fixes formatting — and this config does not run a formatter itself. Bring your own on your side: Prettier (CLI or editor), dprint, Biome, or `eslint-plugin-prettier` if you want to format through ESLint.

> [!NOTE]
> `eslint-config-prettier` is used as the de-facto way to switch off ESLint's formatting rules — despite the name it is formatter-agnostic. ESLint ships no official "disable all formatting rules" preset, its built-in formatting rules are deprecated, and (unlike `@stylistic`'s disable-legacy) it also covers plugin rules such as `eslint-plugin-vue`'s. This is the current implementation choice and may change.

## Installation

```bash
npm install -D @fastkit/eslint-config eslint
# or
pnpm add -D @fastkit/eslint-config eslint
```

## Usage

Add an `eslint.config.mjs` (flat config) and spread the default export:

```js
import config from '@fastkit/eslint-config';

export default [
  ...config,
  // your project-specific overrides…
];
```

> [!NOTE]
> This config disables formatting rules at its end, so rules you add afterwards take effect — usually what you want. Only if you spread *another* preset that re-enables formatting rules after this config should you append a formatter-disable (e.g. `eslint-config-prettier`) last.

The TypeScript ESLint helper is re-exported as `tseslint` for convenience:

```js
import config, { tseslint } from '@fastkit/eslint-config';
```

### Formatting (optional)

The config only disables the rules that conflict with a formatter — it does not run one. Choose whichever workflow you like:

- **Prettier via its CLI / editor**, dprint, Biome, … — just run it; ESLint won't fight it.
- **Prettier through ESLint** — add [`eslint-plugin-prettier`](https://github.com/prettier/eslint-plugin-prettier) yourself:

  ```js
  import config from '@fastkit/eslint-config';
  import prettier from 'eslint-plugin-prettier/recommended';

  export default [...config, prettier];
  ```

## Documentation

https://dadajam4.github.io/fastkit/eslint-config/

## License

[MIT](https://github.com/dadajam4/fastkit/blob/main/LICENSE)
