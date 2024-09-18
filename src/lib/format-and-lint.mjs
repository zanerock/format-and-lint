import { readFile, writeFile } from 'node:fs/promises'

import { format as prettierFormat } from 'prettier'

import { eslintConfig as defaultEslintConfig } from './eslint.config'
import { prettierConfig as defaultPrettierConfig } from './prettier.config'

const formatAndLint = async ({ eslintConfig = defaultEslintConfig, files, prettierConfig = defaultPrettierConfig }) => {
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
    const prettierSource = await prettierFormat(inputSource, prettierConfig)
    const lintResults = await eslint.lintText(prettierSource)
    const formattedText = lintResults[0].output || prettierSource

    if (inputSource !== formattedText) {
      await writeFile(file, formattedText, { encoding: 'utf8' })
    }

    return lintResults
  }

  const results = await Promise.all(files.map(processSource))

  return results
}

export { formatAndLint }