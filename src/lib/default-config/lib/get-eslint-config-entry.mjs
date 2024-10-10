import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import babelParser from '@babel/eslint-parser'

import { allExtsStr } from './js-extensions'
import { reactSettings, sourceType } from './package-settings'

const __dirname = dirname(fileURLToPath(import.meta.url))

const babelConfigPathInstalled = join(__dirname, 'babel', 'babel.config.cjs')
const babelConfigPathTest = join('dist', 'babel', 'babel.config.cjs')

const babelConfigPath =
  existsSync(babelConfigPathInstalled) === true
    ? babelConfigPathInstalled
    : existsSync(babelConfigPathTest)
      ? babelConfigPathTest
      : undefined
if (babelConfigPath === undefined) {
  throw new Error('Could not find babel config file.')
}

const allFiles = [`**/*{${allExtsStr}}`]

/**
 * Generates an ESlint flat style configuration entry using the fandl parser defaults and supplied settings. This will
 * set default 'files' (unless overridden), 'languageOptions', and 'settings'. The most common usage is to add a set of
 * 'rules' (and any necessary 'plugins'). File targets can be specified with 'files' and 'ignores'.
 * @param {object} options - The input options.
 * @param {string[]} [options.files = <all js/x files>] - An array of file patterns to match for this configuration. 
 *   Note that when used with [`formatAndLint()`](#formatAndLint), `formatAndLint()` actually selects tho files for 
 *   processing. This pattern is then used to determine whether to apply the configuration to a given file.
 *   Will default to match all '.js', '.cjs', '.mjs', and '.jsx'.
 * @param {...object} options.configOptions - Additional options to apply to the configuration. The most common entries
 *   will be 'ignores', rules', and 'plugin'.
 * @returns {object} A ESLint flat configuration entry.
 */
const getEslintConfigEntry = ({ files = allFiles, ...configOptions }) => ({
  files,
  languageOptions : {
    sourceType,
    globals       : {}, // make it easy for users to add using Object.assign()
    parser        : babelParser,
    parserOptions : {
      // yes, sourceType appears at both the languageOptions and parserOptinos level
      sourceType,
      requireConfigFile : true,
      babelOptions      : { configFile : babelConfigPath },
      ecmaFeatures      : { jsx : true },
    },
    ecmaVersion : 'latest',
  },
  settings : { react : reactSettings },
  ...configOptions,
})

export { getEslintConfigEntry }
