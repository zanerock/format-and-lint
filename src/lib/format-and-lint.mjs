import { readFile, writeFile } from 'node:fs/promises'
import * as path from 'node:path'

import { format as prettierFormat } from 'prettier'
import { ArgumentInvalidError } from 'standard-error-set'

import { getEslint } from './lib/get-eslint'
import { prettierConfig as defaultPrettierConfig } from './default-config/prettier.config'

const formatAndLint = async ({
  check = false,
  eslint,
  eslintConfig,
  eslintConfigComponents,
  files, 
  noWrite = false,
  outputDir,
  prettierConfig = defaultPrettierConfig,
  relativeStem = process.cwd(),
}) => {
  if (eslint === undefined) {
    eslint = getEslint({ eslintConfig, eslintConfigComponents })
  }

  const prettierParseConfig = structuredClone(prettierConfig)
  prettierParseConfig.parser = 'babel'

  const processSource = async (file) => {
    const readPromise = readFile(file, { encoding: 'utf8' })
    const inputSource = await readPromise
    const prettierSource = check === true 
      ? inputSource
      : await prettierFormat(inputSource, prettierParseConfig)
    // leave off the 'filePath' or else 'results[0].output' is undefined; we want to handle rewriting the files 
    // ourselves
    const lintResults = await eslint.lintText(prettierSource/*, { filePath: file }*/)
    // add 'filePath' back on so that the lint results can be formatted with proper reference to the file
    const filePath = file.startsWith(relativeStem)
      ? file.slice(relativeStem.length + 1)
      : file
    lintResults[0].filePath = filePath

    // the output is undefined if there are no changes due to the linting, but there may be changes due to prettier, so 
    // to keep the ultimate result consistent, we have to update output if prettier did something
    if (lintResults[0].output === undefined && prettierSource !== inputSource) {
      lintResults[0].output = prettierSource
    }
    const formattedText = lintResults[0].output

    if (check !== true && noWrite !== true && (formattedText !== undefined || outputDir !== undefined)) {
      let outputPath = file
      if (outputDir !== undefined) {
        if (!file.startsWith(outputPath)) {
          throw new ArgumentInvalidError({ 
            message: `Resolved input file path '${file}' does not start with effective source stem '${relativeStem}'.`,
            hint: "Check input file paths/selection patterns and set or harmonize '--relative-stem' option if necessary.",
          })
        }

        let relPath = file.slice(relativeStem.length)
        if (relPath.startsWith(path.sep)) {
          relPath = relPath.slice(1)
        }
        outputPath = path.join(outputDir, relPath)
      }
      
      const outputText = formattedText || prettierSource
      await writeFile(outputPath, outputText, { encoding: 'utf8' })
    }

    return lintResults
  }

  const results = (await Promise.all(files.map(processSource))).flat()

  return results
}

export { formatAndLint }