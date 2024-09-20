import { readFile, writeFile } from 'node:fs/promises'

import { ESLint } from 'eslint'
import { format as prettierFormat } from 'prettier'
import { ArgumentInvalidError } from 'standard-error-set'

import { getEslintConfig } from './default-config/eslint.config'
import { prettierConfig as defaultPrettierConfig } from './default-config/prettier.config'

const formatAndLint = async ({
  check = false,
  eslintConfig,
  eslintConfigComponents,
  files, 
  prettierConfig = defaultPrettierConfig,
  noWrite = false,
}) => {
  if (eslintConfig !== undefined && eslintConfigComponents !== undefined) {
    throw new ArgumentInvalidError({ 
      message: "You cannot define 'eslintConfig' and 'eslintConfigComponents' simultaneously.",
    })
  }

  if (eslintConfig === undefined) {
    eslintConfig = getEslintConfig(eslintConfigComponents)
  }

  const prettierParseConfig = structuredClone(prettierConfig)
  prettierParseConfig.parser = 'babel'

  const eslint = new ESLint({
    fix : true,
    // this keeps eslint from insisting on an eslint config file
    overrideConfigFile : true,
    baseConfig: eslintConfig,
  })

  const processSource = async (file) => {
    const readPromise = readFile(file, { encoding: 'utf8' })
    const inputSource = await readPromise
    const prettierSource = check === true 
      ? inputSource
      : await prettierFormat(inputSource, prettierParseConfig)
    // leave off the 'filePath' or else 'results[0].output' is undefined
    const lintResults = await eslint.lintText(prettierSource/*, { filePath: file }*/)

    // the output is undefined if there are no changes due to the linting, but there may be changes due to prettier, so 
    // to keep the ultimate result consistent, we have to update output if prettier did something
    if (lintResults[0].output === undefined && prettierSource !== inputSource) {
      lintResults[0].output = prettierSource
    }
    const formattedText = lintResults[0].output

    if (check !== true && noWrite !== true && formattedText !== undefined) {
      await writeFile(file, formattedText, { encoding: 'utf8' })
    }

    return lintResults
  }

  const results = (await Promise.all(files.map(processSource))).flat()

  return results
}

export { formatAndLint }