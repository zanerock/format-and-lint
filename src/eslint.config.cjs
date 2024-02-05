/**
 * @file ESLint configuration file implementing (almost) [Standard JS style]{@link https://standardjs.com/},
 * [ESLint recommended js rules]{@link https://eslint.org/docs/latest/rules/},
 * [jsdoc rules]{@link https://www.npmjs.com/package/eslint-plugin-jsdoc} and, when appropriate,
 * [recommended node]{@link https://www.npmjs.com/package/eslint-plugin-node} and
 * [react]{@link https://www.npmjs.com/package/eslint-plugin-react} rules as well.
 *
 * Our one exception to the standard style is implementing aligned colons on multiline
 * 'key-spacing'. We think it makes things more readable. We also add a preference for regex literals where possible.
 */

const { readFileSync } = require('node:fs')
const { join } = require('node:path')

const babelParser = require('@babel/eslint-parser')
const globalsPkg = require('globals')
const importPlugin = require('eslint-plugin-import')
const jsdocPlugin = require('eslint-plugin-jsdoc')
const nodePlugin = require('eslint-plugin-node')
const promisePlugin = require('eslint-plugin-promise')
const nPlugin = require('eslint-plugin-n')
const standardPlugin = require('eslint-config-standard')
const reactPlugin = require('eslint-plugin-react')
const js = require('@eslint/js')

const packageContents = readFileSync('./package.json', { encoding : 'utf8' })
const packageJSON = JSON.parse(packageContents)
const { engines = { node : true } } = packageJSON

const commonIgnores = ['dist/**', 'test-staging/**', 'doc/**', '.yalc/**']

const eslintConfig = [
  { ignores : commonIgnores },
  {
    files           : ['**/*.{cjs,js,jsx,mjs}'],
    languageOptions : {
      parser        : babelParser,
      parserOptions : {
        sourceType        : 'module',
        requireConfigFile : true,
        babelOptions      : {
          configFile : join(__dirname, 'babel', 'babel.config.cjs')
        },
        ecmaFeatures : {
          jsx : true
        }
      },
      ecmaVersion : 'latest'
    },
    plugins : {
      standard : standardPlugin,
      import   : importPlugin,
      promise  : promisePlugin,
      n        : nPlugin
    },
    rules : {
      ...js.configs.recommended.rules,
      ...standardPlugin.rules,
      // TODO; looks like it's failing on the `export * from './foo'` statements; even though we have the babel pluggin`
      'import/export' : 'off',
      // this is our one modification to JS Standard style
      'key-spacing'   : ['error', {
        singleLine : {
          beforeColon : true,
          afterColon  : true,
          mode        : 'strict'
        },
        multiLine : {
          beforeColon : true,
          afterColon  : true,
          align       : 'colon'
        }
      }],
      'prefer-regex-literals' : 'error'
    }
  },
  {
    files   : ['**/*.{cjs,js,jsx,mjs}'],
    ignores : ['**/index.{js,cjs,mjs}', '**/__tests__/**/*', '**/*.test.*'],
    plugins : { jsdoc : jsdocPlugin },
    rules   : {
      ...jsdocPlugin.configs['flat/recommended-error'].rules,
      'jsdoc/require-file-overview' : ['error'],
      'jsdoc/require-description'   : 'error'
    }
  },
  {
    files           : ['**/*.jsx'],
    languageOptions : {
      parserOptions : {
        ecmaFeatures : {
          jsx : true
        }
      }
    },
    settings : {
      react : {
        version : 'detect'
      }
    },
    rules : {
      // can't use 'react.config.recommended directly because as of writing it's still usin the old eslint.rc style
      ...reactPlugin.configs.recommended.rules
    },
    plugins : { react : reactPlugin }
  },
  {
    files           : ['**/_tests_/**', '**/*.test.{cjs,js,jsx,mjs}'],
    languageOptions : {
      globals : {
        ...globalsPkg.jest
      }
    }
  },
  {
    files           : ['**/*.jsx'],
    languageOptions : {
      globals : {
        Event  : true,
        window : true
      }
    }
  }
]

if (engines?.node !== undefined) {
  eslintConfig.push({
    plugins         : { node : nodePlugin },
    languageOptions : {
      globals : globalsPkg.node
    },
    rules : {
      ...nodePlugin.configs.recommended.rules,
      'node/no-unsupported-features/es-syntax' : 'off', // we expect teh code to run through Babel, so it's fine
      'node/prefer-promises/dns'               : 'error',
      'node/prefer-promises/fs'                : 'error'
    }
  })
}

module.exports = eslintConfig
