const { ESLint } = require('eslint');

const removeIgnoredFiles = async (files) => {
  const eslint = new ESLint()
  const isIgnored = await Promise.all(
    files.map((file) => {
      return eslint.isPathIgnored(file)
    })
  )
  const filteredFiles = files.filter((_, i) => !isIgnored[i])
  return filteredFiles.join(' ')
}

module.exports = {
  "*.{css,scss,vue,html}":  async (files) => {
    const filesToLint = files.filter((file) => !/\/docs\//.test(file)).join(' ');
    return filesToLint.length ? `stylelint --fix ${filesToLint}` : 'echo';
  },
  '*.{ts,tsx,js,vue,html,yaml}': async (files) => {
    const filesToLint = await removeIgnoredFiles(files)
    return filesToLint.length ? `eslint --fix --max-warnings=0 ${filesToLint}` : 'echo';
  },
}
