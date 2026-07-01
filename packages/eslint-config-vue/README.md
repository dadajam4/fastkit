# @fastkit/eslint-config-vue

🌐 English | [日本語](https://github.com/dadajam4/fastkit/blob/main/packages/eslint-config-vue/README-ja.md)

fastkit's shared [flat](https://eslint.org/docs/latest/use/configure/configuration-files) ESLint configuration for Vue + TypeScript projects. It extends [`@fastkit/eslint-config`](https://github.com/dadajam4/fastkit/blob/main/packages/eslint-config/README.md) with `eslint-plugin-vue`'s recommended rules and, like the base config, **turns off formatting rules** (via [`eslint-config-prettier`](https://github.com/prettier/eslint-config-prettier)) so it never conflicts with a formatter.

Because those rules are off, ESLint neither reports nor fixes formatting — and this config does not run a formatter itself. Bring your own on your side: Prettier (CLI or editor), dprint, Biome, or `eslint-plugin-prettier` if you want to format through ESLint.

> [!NOTE]
> `eslint-config-prettier` is used as the de-facto way to switch off ESLint's formatting rules — despite the name it is formatter-agnostic. ESLint ships no official "disable all formatting rules" preset, its built-in formatting rules are deprecated, and (unlike `@stylistic`'s disable-legacy) it also covers plugin rules such as `eslint-plugin-vue`'s. This is the current implementation choice and may change.

## Installation

```bash
npm install -D @fastkit/eslint-config-vue eslint
# or
pnpm add -D @fastkit/eslint-config-vue eslint
```

## Usage

Add an `eslint.config.mjs` (flat config) and spread the default export:

```js
import config from '@fastkit/eslint-config-vue';

export default [
  ...config,
  // your project-specific overrides…
];
```

> [!NOTE]
> This config disables formatting rules at its end, so rules you add afterwards take effect — usually what you want. Only if you spread *another* preset that re-enables formatting rules after this config should you append a formatter-disable (e.g. `eslint-config-prettier`) last.

### Formatting (optional)

The config only disables the rules that conflict with a formatter — it does not run one. Choose whichever workflow you like:

- **Prettier via its CLI / editor**, dprint, Biome, … — just run it; ESLint won't fight it.
- **Prettier through ESLint** — add [`eslint-plugin-prettier`](https://github.com/prettier/eslint-plugin-prettier) yourself:

  ```js
  import config from '@fastkit/eslint-config-vue';
  import prettier from 'eslint-plugin-prettier/recommended';

  export default [...config, prettier];
  ```

## Documentation

https://dadajam4.github.io/fastkit/eslint-config-vue/

## License

[MIT](https://github.com/dadajam4/fastkit/blob/main/LICENSE)
