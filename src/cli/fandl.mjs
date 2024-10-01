import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import commandLineArgs from 'command-line-args'
import { format as prettierFormat } from 'prettier'
import { ArgumentInvalidError } from 'standard-error-set'

import { cliSpec } from './cli-spec'
import { formatAndLint } from '../lib/format-and-lint'
import { getEslint } from '../lib/lib/get-eslint'
import { processConfigFile } from './lib/process-config-file'
import { selectFilesFromOptions } from '../lib/lib/select-files-from-options'

const prettierBin = 'npx prettier'
const eslintBin = 'npx eslint'

const fandl = async ({ argv = process.argv, stdout = process.stdout } = {}) => {
  const mainOpts = commandLineArgs(cliSpec.arguments, { argv, camelCase: true, partial: true })
  const command = mainOpts.command || 'format-and-lint'

  if (command === 'format-and-lint' || command === 'lint') {
    const options = mainOpts._unknown === undefined
      ? mainOpts
      : Object.assign(
        {}, 
        mainOpts, 
        commandLineArgs(
          cliSpec.commands.find((c) => c.name === command).arguments, 
          { argv: mainOpts._unknown, camelCase: true }
        ))

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

    const filePaths = await selectFilesFromOptions(options)

    const eslintConfig = eslintConfigPath === undefined
      ? undefined
      : await processConfigFile(eslintConfigPath)
  
    const eslintComfigComponents = eslintConfigComponentsPath === undefined
      ? undefined
      : await processConfigFile(eslintConfigComponentsPath)

    const prettierConfig = prettierConfigPath === undefined
      ? undefined
      : await processConfigFile(prettierConfigPath)

    const eslint = getEslint({ eslintConfig, eslintComfigComponents })

    const results = await formatAndLint({
      check : command === 'lint',
      eslint,
      files : filePaths, 
      prettierConfig, 
      ...remainderOptions
    })

    const formatter = await eslint.loadFormatter("stylish")
    const resultText = formatter.format(results)
    
    stdout.write(resultText)
  }
}

export { fandl }