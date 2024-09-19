import { readFile, writeFile } from 'node:fs/promises'

import { ESLint } from 'eslint'
import { format as prettierFormat } from 'prettier'
import { ArgumentInvalidError } from 'standard-error-set'

import { getEslintConfig } from './default-config/eslint.config'
import { prettierConfig as defaultPrettierConfig } from './default-config/prettier.config'

const formatAndLint = async ({ 
  eslintConfig,
  eslintAdditionalConfig,
  eslintBaseConfig,
  eslintJsdocConfig,
  eslintJsxConfig,
  eslintTestConfig,
  files, 
  prettierConfig = defaultPrettierConfig, 
  write = false 
}) => {
  if (eslintConfig !== undefined && (eslintAdditionalConfig !== undefined || eslintBaseConfig !== undefined || eslintJsdocConfig !== undefined || eslintJsxConfig !== undefined || eslintTestConfig !== undefined)) {
    throw new ArgumentInvalidError({ 
      message: "You cannot define 'eslintConfig' and sub-type configurations.", 
      hint: "Either define complete, standalone 'eslintConfig' or supply sub-component definitions." 
    })
  }

  if (eslintConfig === undefined) {
    eslintConfig = getEslintConfig({
      additionalConfig: eslintAdditionalConfig,
      baseConfig: eslintBaseConfig,
      jsdocConfig: eslintJsdocConfig,
      jsxConfig: eslintJsxConfig,
      testConfig: eslintTestConfig
    })
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
    const prettierSource = await prettierFormat(inputSource, prettierParseConfig)
    const lintResults = await eslint.lintText(prettierSource, { filePath: file })

    const formattedText = lintResults[0].output || prettierSource

    if (write === true && inputSource !== formattedText) {
      await writeFile(file, formattedText, { encoding: 'utf8' })
    }

    return lintResults
  }

  const results = (await Promise.all(files.map(processSource))).flat()

  return results
}

export { formatAndLint }