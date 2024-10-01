import { ESLint } from 'eslint'
import { ArgumentInvalidError } from 'standard-error-set'

import { getEslintConfig } from '../default-config/eslint.config'

const getEslint = ({ eslintConfig, eslintConfigComponents }) => {
  if (eslintConfig !== undefined && eslintConfigComponents !== undefined) {
    throw new ArgumentInvalidError({
      message :
        "You cannot define 'eslintConfig' and 'eslintConfigComponents' simultaneously.",
    })
  }

  if (eslintConfig === undefined) {
    eslintConfig = getEslintConfig(eslintConfigComponents)
  }

  return new ESLint({
    fix                : true,
    // this keeps eslint from insisting on an eslint config file
    overrideConfigFile : true,
    baseConfig         : eslintConfig,
  })
}

export { getEslint }
