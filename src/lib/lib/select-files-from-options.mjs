import { existsSync } from 'node:fs'
import { join, resolve } from 'node:path'

import { find } from 'find-plus'

import { allExtsStr } from '../default-config/js-extensions'
import { processFilePatterns } from './process-file-patterns'
import { processGitignore } from './process-gitignore'
import { processPackageIgnores } from './process-package-ignores'

const standardIgnores = ['**/test/data/**/*', 'doc/**', 'dist/**']

const selectFilesFromOptions = async ({ 
  files, 
  filesPaths, 
  ignoreFiles, 
  ignoreFilesPaths, 
  ignorePackageSettings, 
  noStandardIgnores,
  // root = '.', //process.cwd(),
  root = process.cwd(),
}) => {
  const targetPatterns = await processFilePatterns(files, filesPaths)
  if (targetPatterns.length === 0) {
    const rootSrcIndicatorFiles = ['index.js', 'index.mjs', 'index.cjs']
    if (rootSrcIndicatorFiles.some((f) => existsSync(join('.', f)))) {
      targetPatterns.push(`**/*${allExtsStr}`)
    }
    else if (existsSync(join('.', 'src'))) {
      targetPatterns.push(`src/**/*${allExtsStr}`)
    }
    else {
      throw new ArgumentInvalidError({
        message: "Did not find root index nor src directory; specify '--files' or '--files-paths'."
      })
    }
  }

  const ignorePatterns = await processFilePatterns(ignoreFiles, ignoreFilesPaths)
  if (noStandardIgnores !== true) {
    ignorePatterns.push(...standardIgnores)
    ignorePatterns.push(...(await processGitignore({ warnOnNotIgnore: true })))
  }
  if (ignorePackageSettings !== true) {
    ignorePatterns.push(...(await processPackageIgnores()))
  }

  return await find({ 
    onlyFiles: true, 
    root,
    paths: targetPatterns,
    excludePaths: ignorePatterns
  })
}

export { selectFilesFromOptions }