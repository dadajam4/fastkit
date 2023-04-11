# Release Workflow

The workflow for Fastkit releases is done by [changesets](https://github.com/changesets/changesets).

## pull-request based release

Fastkit typically performs pull-request based releases. This is performed by the following cycle

1. When the fix is complete in the topic branch and all commits have been tracked, run `pnpm changeset` to create a detailed description of the changes. This will be used to generate a changelog when the update is published.

1. When a PR with a changeset changelog is merged, the package is released by Github Actions.

## Manual Release

**This is an explanation for the maintainer**

1. Run type check, lint, and test to make sure there are no problems with the contents to be released.
    - Run `pnpm typecheck`
    - Run `pnpm lint`
    - Run `pnpm test`

1. As with PR-based work, run `pnpm changeset` to create a change log.

1. Run `pnpm changeset version` to update all package.json versions and generate CHANGELOG.

    > Do not commit the source code yet at this point. This is so that you can undo everything if the build or release fails.

1. Run `pnpm build` to build the package.

    > If there is a cache of turborepo, this build will only build packages with changes.

1. Run `pnpm changeset publish` to release all updated packages.

1. Commit the changes with the appropriate message.

    e.g. `release/some-feature`

## Prereleases

**This is an explanation for the maintainer**

Pre-releases are complex. Please read the [changesets documentation](https://github.com/changesets/changesets/blob/main/docs/prereleases.md) first to fully understand how it works.

1. Run `pnpm changeset pre enter next` to enter pre-release mode.

1. While in pre-release mode, all releases, whether PR-based or manual, are treated as pre-releases.

1. When you are ready to officially release the package, run `pnpm changeset pre exit` to exit pre-release mode.

1. Release the official version.
    1. Run `pnpm changeset version`
    1. Run `pnpm changeset publish`

1. Commit the changes
