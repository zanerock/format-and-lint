#!/usr/bin/env node
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import commandLineArgs from 'command-line-args'
import { find } from 'find-plus'
import { format as prettierFormat } from 'prettier'

import { cliSpec } from './cli-spec'
import { extractPatternFromFile } rom './lib/extract-patterns-from-file'
import { processFilePatternsFile } from './lib/process-file-patterns-file'
import { processGitignore } from './lib/process-gitignore'
import { processPackageIgnores } from './lib/process-package-ignores'

const standardIgnores = ['**/test/data/**/*', 'doc/**', 'dist/**']

const prettierBin = 'npx prettier'
const eslintBin = 'npx eslint'

const fandl = async () => {
  const options = commandLineArgs(cliSpec, { partial: true })

  const targetPatterns = processFilePaterns(options.files, options['files-paths'])
  if (targetPatterns.length === 0) {
    const rootSrcIndicatorFiles = ['index.js', 'index.mjs', 'index.cjs']
    if (rootSrcIndicatorFiles.some((f) => existsSync(join('.', f)))) {
      targetPatterns = ['**/*']
    }
    else if (existsSrc(join('.', 'src'))) {
      targetPatterns = ['src/**/*']
    }
    else {
      throw new ArgumentInvalidError({
        message: "Did not find root index nor src directory; specify '--files' or '--files-paths'."
      })
    }
  }

  const ignorePatterns = processFilePaterns(options['ignore-files'], options['ignore-files-paths'])
  if (options['no-standard-ignores'] !== true) {
    ignorePatterns.push(...standardIgnores)
    ignorePatterns.push(...(await processGitignore()))
  }
  if (options['ignore-package-settings'] !== true) {
    ignorePatterns.push(...(await processPackageIgnores()))
  }

  const files = await find({ 
    onlyFiles: true, 
    root: '.',
    paths: targetPatterns,
    excludePaths: ignorePatterns
  })

  const command = options.command || 'format-and-lint'

  if (command === 'format-and-lint') {
    const filesStr = `'${files.join("', '")}'`
    const prettierCmd =
      `${prettierBin} --config ${prettierConfigPath} --write ${filesStr}`
    const eslintCmd =
      `ESLINT_USE_FLAT_CONFIG=true ${eslintBin} --config ${eslintConfigPath} --fix ${filesStr}`

    tryExec(`${prettierCmd}; ${eslintCmd}`)
  }
  else if (command === 'lint') {

  }
}

