#!/usr/bin/env node
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import commandLineArgs from 'command-line-args'
import { find } from 'find-plus'
import { format as prettierFormat } from 'prettier'

import { cliSpec } from './cli-spec'
import { extractPatternFromFile } from './lib/extract-patterns-from-file'
import { allExtsStr } from '../lib/default-config/js-extensions'
import { formatAndLint } from '../lib/format-and-lint'
import { processConfigFile } from './lib/process-config-file'
import { processFilePatternsFile } from './lib/process-file-patterns-file'
import { processGitignore } from './lib/process-gitignore'
import { processPackageIgnores } from './lib/process-package-ignores'

const standardIgnores = ['**/test/data/**/*', 'doc/**', 'dist/**']

const prettierBin = 'npx prettier'
const eslintBin = 'npx eslint'

const fandl = async () => {
  const options = commandLineArgs(cliSpec, { camelCase: true, partial: true })
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

    // process files
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
      ignorePatterns.push(...(await processGitignore()))
    }
    if (options.ignorePackageSettings !== true) {
      ignorePatterns.push(...(await processPackageIgnores()))
    }

    const filePatterns = await find({ 
      onlyFiles: true, 
      root: '.',
      paths: targetPatterns,
      excludePaths: ignorePatterns
    })

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
      files : filePatterns, 
      prettierConfig, 
      ...remainderOptions
    })
  }
}

