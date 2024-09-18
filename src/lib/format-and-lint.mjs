import { readFile, writeFile } from 'node:fs/promises'

import { ESLint } from 'eslint'
import { format as prettierFormat } from 'prettier'

import { eslintConfig as defaultEslintConfig } from './eslint.config'
import { prettierConfig as defaultPrettierConfig } from './prettier.config'

const formatAndLint = async ({ eslintConfig = defaultEslintConfig, files, prettierConfig = defaultPrettierConfig, write = false }) => {
  const prettierParseConfig = structuredClone(prettierConfig)
  prettierParseConfig.parser = 'babel'

  const eslint = new ESLint({
    fix : true,
    overrideConfigFile : true,
    overrideConfig : eslintConfig,
  })

  const processSource = async (file) => {
    const readPromise = readFile(file, { encoding: 'utf8' })
    const inputSource = await readPromise
    const prettierSource = await prettierFormat(inputSource, prettierParseConfig)
    const lintResults = await eslint.lintText(prettierSource)
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