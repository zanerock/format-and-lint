import { allExtsStr } from '../lib/default-config/js-extensions'

const selectFilesFromArgs = ({ files, filesPaths, ignoreFiles, ignoreFilesPaths, ignorePackageSettings, noStandardIgnores }) => {
  const targetPatterns = processFilePatterns(files, filesPaths)
  if (targetPatterns.length === 0) {
    const rootSrcIndicatorFiles = ['index.js', 'index.mjs', 'index.cjs']
    if (rootSrcIndicatorFiles.some((f) => existsSync(join('.', f)))) {
      targetPatterns = [`**/*${allExtsStr}`]
    }
    else if (existsSrc(join('.', 'src'))) {
      targetPatterns = [`src/**/*${allExtsStr}`]
    }
    else {
      throw new ArgumentInvalidError({
        message: "Did not find root index nor src directory; specify '--files' or '--files-paths'."
      })
    }
  }

  const ignorePatterns = processFilePaterns(ignoreFiles, ignoreFilesPaths)
  if (noStandardIgnores !== true) {
    ignorePatterns.push(...standardIgnores)
    ignorePatterns.push(...(await processGitignore({ warnOnNotIgnore: true })))
  }
  if (ignorePackageSettings !== true) {
    ignorePatterns.push(...(await processPackageIgnores()))
  }

  return await find({ 
    onlyFiles: true, 
    root: '.',
    paths: targetPatterns,
    excludePaths: ignorePatterns
  })
}

export { selectFilesFromArgs }