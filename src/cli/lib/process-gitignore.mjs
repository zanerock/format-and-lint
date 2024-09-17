import { readFile } from 'node:fs/promises'

const processGitignore = async () => {
  try {
    const gitignoreContents = await readFile('.gitignore', { encoding: 'utf8' })

    const ignorePatterns = []
    const gitignoreLines = gitignoreContents.split(/\r?\n/)
    for (const gitIgnore of gitignoreLines) {
      if (gitIgnore.trim() === '') continue

      let newIgnore
      if (gitIgnore.startsWith('/')) {
        newIgnore = gitIgnore.slice(1)
      }
      else {
        newIgnore = '**/' + gitIgnore
      }
      if (!newIgnore.endsWith('/')) {
        newIgnore += '/'
      }
      newIgnore += '**'

      ignorePatterns.push(newIgnore)
    }

    return ignorePatterns
  }
  catch (e) {
    if (e.code !== 'NOENT') {
      throw e
    }
  }
}

export { processGitignore }