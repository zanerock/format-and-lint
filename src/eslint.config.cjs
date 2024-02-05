/*
import { join } from 'node:path'

import babelParser from '@babel/eslint-parser'
import importPlugin from 'eslint-plugin-import'
import react from 'eslint-plugin-react'
import js from '@eslint/js'
*/
const { join } = require('node:path')

const babelParser = require('@babel/eslint-parser')
const importPlugin = require('eslint-plugin-import')
const react = require('eslint-plugin-react')
const js = require('@eslint/js')

const eslintConfig = [
  {
    files: ['**/*.js', '*/*.mjs', '**/*.cjs', '**/*.jsx'],
    languageOptions: {
      parser: babelParser,
      parserOptions : {
        sourceType        : 'module',
        requireConfigFile : true,
        babelOptions      : {
          configFile : join(__dirname, 'babel', 'babel.config.cjs')
        },
        ecmaFeatures: {
          jsx: true
        },
      },
      ecmaVersion: 6
    },
    plugins: { 
      import: importPlugin,
      react
    },
    rules : Object.assign({
        'import/export'     : 'off', // TODO: this rule is incompatible with 'export * from 'XXX'
        'import/extensions' : ['error', 'never', { json : ['error', 'always'] }],
      },
      react.configs.recommended.rules
    )
  },
  js.configs.recommended,
  // importPlugin.configs.recommended,
  // react.configs.recommended, // see Object.assign above
  {
    rules   : {
      'brace-style'       : [2, 'stroustrup', { allowSingleLine : true }],
      curly               : [2, 'multi-line'],
      indent              : [2, 2, {
        FunctionDeclaration : { body : 1, parameters : 2 },
        ignoredNodes        : ['JSXElement', 'JSXElement > *', 'JSXAttribute', 'JSXIdentifier', 'JSXNamespacedName', 'JSXMemberExpression', 'JSXSpreadAttribute', 'JSXExpressionContainer', 'JSXOpeningElement', 'JSXClosingElement', 'JSXText', 'JSXEmptyExpression', 'JSXSpreadChild']
      }],
      'key-spacing' : [2, {
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
      'operator-linebreak'          : [2, 'before', { overrides : { '=' : 'after' } }],
      'prefer-const'                : 2,
      'prefer-spread'               : 2,
      semi                          : ['error', 'never'],
      'space-before-function-paren' : [2, 'never'],
      'array-callback-return'   : 2,
      'guard-for-in'            : 2,
      'no-caller'               : 2,
      'no-extra-bind'           : 2,
      'no-multi-spaces'         : 2,
      'no-new-wrappers'         : 2,
      'no-throw-literal'        : 2,
      'no-unexpected-multiline' : 2,
      'no-with'                 : 2,
      'prefer-regex-literals'   : 'error',
      yoda                      : 2
    }
  }
]

/*
if (pkglib.target.isReactish) {
  eslintConfig.extends.push('standard-react')
  eslintConfig.plugins.push('react')
  Object.assign(eslintConfig.rules, {
    'react/jsx-boolean-value' : [2, 'never'],
    'react/jsx-indent-props'  : [2, 4]
  })
}
*/

module.exports = eslintConfig
