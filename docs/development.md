# How to start development

I am glad you are considering developing Fastkit! You can follow the steps below to develop it.

## Set Up Your Local Development Environment

To contribute to Fastkit, you need to set up a local environment.

### Dependency Installation

1. [Fork](https://help.github.com/articles/fork-a-repo/) the [@dadajam4/fastkit repository](https://github.com/dadajam4/fastkit) to your own GitHub account and then [clone](https://help.github.com/articles/cloning-a-repository/) it to your local device.

1. Ensure using the latest Node.js (18.x)

1. Enable [Corepack](https://github.com/nodejs/corepack) using `corepack enable` to have `pnpm`

1. Run `pnpm install` to install the dependencies.

    > If you are adding a dependency, please use `pnpm add`. The `pnpm-lock.yaml` file is the source of truth for all Fastkit dependencies.

### When developing UI components, etc.

Follow the steps below to develop the package while actually running it on a web page.

1. Run `pnpm build` to pre-build all packages

1. Run `pnpm dev:docs` to start the Vite server for documentation page development

    > If the package does not affect the Vite startup configuration, such as the UI package `@fastkit/vui`, it is possible to develop passively while the source code is subject to Vite's development server watcher. Before starting the development server, enter the directory of the target package and run the `pnpm stub` command before starting the development server.

* You can also run `pnpm dev` to run a series of `pnpm build` and `pnpm dev:docs` at once. All package builds are cached by [turborepo](https://turbo.build/repo), so the next build of a package with no source code changes will be completed in an instant.

> Before I fix a bug or add a feature, I want to make sure there is a problem that explains it. I believe that clarifying the issue will save both you and me, the maintainer, time.

For more information on commit conventions and creating pull requests, please click here.

[Creating a pull request](./pull-request.md)
