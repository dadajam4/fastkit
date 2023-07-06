import { ChangelogFunctions } from "@changesets/types";
import changelogGithub from '@changesets/changelog-github';

function escapeAtMark(str: string) {
  return str.replace(/([a-z])@/ig, '$1 v');
}

const functions: ChangelogFunctions = {
  async getDependencyReleaseLine(changesets, dependenciesUpdated, options) {
    const processed = await changelogGithub.getDependencyReleaseLine(changesets, dependenciesUpdated, options);
    return escapeAtMark(processed);
  },
  async getReleaseLine(changeset, type, changelogOpts) {
    const processed = await changelogGithub.getReleaseLine(changeset, type, changelogOpts);
    return escapeAtMark(processed);
  },
};


export default functions;
