/**
 * @file ESLint configuration file implementing (almost) [Standard JS style]{@link https://standardjs.com/},
 * recommended ESLint js rules,jsdoc rules and, when appropriate, recommended node and react rules as well. Our one
 * exception to the standard style is implementing aligned colons on multiline 'key-spacing'. We think it makes things
 * more readable. We also add a preference for regex literals where possible.
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
const { engines } = packageJSON

const eslintConfig = [
  js.configs.recommended,
  {
    files           : ['**/*.js', '*/*.mjs', '**/*.cjs', '**/*.jsx'],
    languageOptions : {
      parser        : babelParser,
      parserOptions : {
        sourceType        : 'module',
        requireConfigFile : true,
        babelOptions      : {
          configFile : join(__dirname, 'babel', 'babel.config.cjs')
        }
      },
      ecmaVersion : 'latest'
    },
    plugins : {
      standard : standardPlugin,
      jsdoc    : jsdocPlugin,
      import   : importPlugin,
      promise  : promisePlugin,
      n        : nPlugin
    },
    rules : {
      ...standardPlugin.rules,
      ...jsdocPlugin.configs['flat/recommended-error'].rules,
      'jsdoc/require-file-overview' : 'error',
      'key-spacing'                 : ['error', {
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
  }
]

if (engines?.node !== undefined) {
  eslintConfig.push({
    plugins         : { node : nodePlugin },
    languageOptions : {
      globals : globalsPkg.node
    },
    rules : {
      ...nodePlugin.configs.recommended.rules
    }
  })
}

module.exports = eslintConfig
