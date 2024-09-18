import { readFile, writeFile } from 'node:fs/promises'

import { ESLint } from 'eslint'
import { format as prettierFormat } from 'prettier'

import { eslintConfig as defaultEslintConfig } from './default-config/eslint.config'
import { prettierConfig as defaultPrettierConfig } from './default-config/prettier.config'

const formatAndLint = async ({ eslintConfig = defaultEslintConfig, files, prettierConfig = defaultPrettierConfig, write = false }) => {
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