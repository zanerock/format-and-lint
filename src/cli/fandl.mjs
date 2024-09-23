#!/usr/bin/env node
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import commandLineArgs from 'command-line-args'
import { find } from 'find-plus'
import { format as prettierFormat } from 'prettier'

import { cliSpec } from './cli-spec'
import { extractPatternsFromFile } from './lib/extract-patterns-from-file'
import { allExtsStr } from '../lib/default-config/js-extensions'
import { formatAndLint } from '../lib/format-and-lint'
import { processConfigFile } from './lib/process-config-file'
import { processGitignore } from './lib/process-gitignore'
import { processPackageIgnores } from './lib/process-package-ignores'

const standardIgnores = ['**/test/data/**/*', 'doc/**', 'dist/**']

const prettierBin = 'npx prettier'
const eslintBin = 'npx eslint'

const fandl = async ({ argv = process.argv }) => {
  const options = commandLineArgs(cliSpec, { aprv, camelCase: true, partial: true })
  const command = options.command || 'format-and-lint'

  if (command === 'format-and-lint' || command === 'lint') {
    const { 
      files, 
      filesPaths, 
      eslintConfigPath, 
      eslintConfigComponentsPath, 
      ignoreFiles, 
      ignoreFilesPaths, 
      noStandardIgnores, 
      prettierConfigPath,
      ...remainderOptions
    } = options

    if (eslintConfigPath !== undefined && eslintConfigComponentsPath !== undefined) {
      throw new ArgumentInvalidError({ 
        message: "Specifying both '--eslint-config-path' and '--eslint-config-components-path' is invalid. Please specify one or the other."
      })
    }

    const filePaths = selectFilesFromArgs(options)

    const eslintConfig = eslintConfigPath === undefined
      ? undefined
      : await processConfigFile(eslintConfigPath)
  
    const eslintComfigComponents = eslintConfigComponentsPath === undefined
      ? undefined
      : await processConfigFile(eslintConfigComponentsPath)

    const prettierConfig = prettierConfigPath === undefined
      ? undefined
      : await processConfigFile(prettierConfigPath)

    formatAndLint({
      check : command === 'lint',
      eslintConfig, 
      eslintComfigComponents, 
      files : filePaths, 
      prettierConfig, 
      ...remainderOptions
    })
  }
}

export { fandl }