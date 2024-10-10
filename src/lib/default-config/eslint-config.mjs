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
import globalsPkg from 'globals'
import importPlugin from 'eslint-plugin-import'
import jsdocPlugin from 'eslint-plugin-jsdoc'
import nodePlugin from 'eslint-plugin-node'
import promisePlugin from 'eslint-plugin-promise'
import nPlugin from 'eslint-plugin-n'
import { fixupPluginRules } from '@eslint/compat'
import js from '@eslint/js'
import stylisticPlugin from '@stylistic/eslint-plugin'
import standardPlugin from 'eslint-config-standard'

import { getEslintConfigEntry } from './lib/get-eslint-config-entry'
import { linebreakTypesExcept } from './lib/linebreak-types-except'
import { allExts, allExtsStr, jsxExtsStr } from './lib/js-extensions'
import { engines, reactSettings } from './lib/package-settings'

const stylisticConfig = stylisticPlugin.configs['recommended-flat']

const plugins = Object.assign({
  import   : importPlugin,
  promise  : promisePlugin,
  n        : nPlugin,
})

const rules = {
  // TODO; looks like it's failing on the `export * from './foo'` statements; even though we have the babel pluggin`
  'import/export'         : 'off',
  // style/consistency rules
  // this modifies Standard JS style
  // 'prefer-regex-literals' : 'error', uhh... no it doesn't
}

const allFiles = [`**/*{${allExtsStr}}`]

const defaultBaseRecommended = getEslintConfigEntry({
  rules : js.configs.recommended.rules,
})

const stylisticRules = Object.assign({}, stylisticConfig.rules)
// binary ops indentation is better handled by prettier
delete stylisticRules['@stylistic/indent-binary-ops']

const defaultStylistic = getEslintConfigEntry({
  plugins : stylisticConfig.plugins, // names plugin '@stylistic'
  rules   : stylisticRules, // includes React rules
})

const standardRules = standardPlugin.rules
delete standardRules.indent // handled by prettier
delete standardRules['indent-binary-ops'] // handled by prettier
delete standardRules['quote-props'] // deprecated
// the following two rules are present, but 'warn'
standardRules['no-var'] = 'error'
standardRules['object-shorthand'] = ['warn', 'properties']

const defaultStandardJs = getEslintConfigEntry({
  plugins : { standard : standardPlugin },
  rules   : standardRules,
})

const styleRules = {
  // this is actually the default in the code, but the docs say '1tbs' is the default, so we define it here for future
  // safety
  '@stylistic/brace-style' : ['error', 'stroustrup', { allowSingleLine : true }],
  // override key spacing to get things aligned
  '@stylistic/key-spacing' : [
    'error',
    { align : 'colon', afterColon : true, beforeColon : true },
  ],
  // override to allow avoiding escapes
  '@stylistic/quotes' : [
    'error',
    'single',
    { allowTemplateLiterals : true, avoidEscape : true },
  ],
  // additional rules
  '@stylistic/arrow-parens'                   : ['error', 'always'], // I like this to be consistent
  '@stylistic/array-bracket-newline'          : ['error', 'consistent'],
  '@stylistic/array-element-newline'          : ['error', 'consistent'],
  '@stylistic/comma-dangle'                   : ['error', 'always-multiline'],
  '@stylistic/function-call-argument-newline' : ['error', 'consistent'],
  '@stylistic/function-call-spacing'          : ['error', 'never'],
  '@stylistic/function-paren-newline'         : ['error', 'consistent'],
  '@stylistic/indent'                         : [
    'error',
    2,
    {
      ArrayExpression        : 1,
      CallExpression         : { arguments : 1 },
      flatTernaryExpressions : false,
      FunctionDeclaration    : { body : 1, parameters : 1 },
      FunctionExpression     : { body : 1, parameters : 1 },
      ignoreComments         : false,
      ignoredNodes           : [
        'TSUnionType',
        'TSIntersectionType',
        'TSTypeParameterInstantiation',
        'FunctionExpression > .params[decorators.length > 0]',
        'FunctionExpression > .params > :matches(Decorator, :not(:first-child))',
      ],
      ImportDeclaration        : 1,
      MemberExpression         : 1,
      ObjectExpression         : 1,
      offsetTernaryExpressions : true,
      outerIIFEBody            : 1,
      SwitchCase               : 1,
      VariableDeclarator       : 4,
    },
  ],
  '@stylistic/linebreak-style'         : ['error', 'unix'],
  // '@stylistic/indent-binary-ops': ['error', 4], // same as default, but since we define indent, these two go together
  '@stylistic/max-statements-per-line' : ['error', { max : 2 }], // allow for short one-liners
  // The default is just 'before'; but equals are special. IMO.
  '@stylistic/operator-linebreak'      : [
    'error',
    'before',
    { overrides : { '=' : 'after', '-=' : 'after', '+=' : 'after' } },
  ],
  '@stylistic/padding-line-between-statements' : [
    'error',
    { blankLine : 'always', prev : '*', next : 'class' },
    {
      blankLine : 'always',
      prev      : linebreakTypesExcept('cjs-export', 'export'),
      next      : 'export',
    },
    {
      blankLine : 'always',
      prev      : linebreakTypesExcept('cjs-export', 'export'),
      next      : 'cjs-export',
    },
    {
      blankLine : 'always',
      prev      : 'import',
      next      : linebreakTypesExcept('import'),
    },
    {
      blankLine : 'always',
      prev      : 'cjs-import',
      // Because a cjs-import is actually many different things...
      next      : linebreakTypesExcept(
        'cjs-import',
        'const',
        'let',
        'singleline-const',
        'singleline-let',
        'singleline-var',
        'var',
      ),
    },
    { blankLine : 'always', prev : '*', next : 'return' },
  ],
  // prettier insists on putting required semi-colons first, which is probably the better answer since it's more
  // resilient to code changes
  '@stylistic/semi-style'                  : ['error', 'first'],
  // The @stylistic default of 'always' for all seems at odd with general standards, which don't have space before
  // named functions. I like that because when we invoke a function, you never see a space, and I see no reason to
  // write the declaration different.
  '@stylistic/space-before-function-paren' : [
    'error',
    { anonymous : 'always', asyncArrow : 'always', named : 'never' },
  ],
  '@stylistic/switch-colon-spacing' : ['error', { after : true, before : false }],
  'yoda'                            : ['error', 'never'],
}
const defaultStyle = getEslintConfigEntry({
  plugins : stylisticConfig.plugins, // names plugin '@stylistic'
  rules: styleRules,
})

const smellsRules = {
  'no-lonely-if'          : 'error',
  'no-return-assign'      : 'error',
  'no-shadow'             : 'error',
  'no-extra-label'        : 'error',
  'no-label-var'          : 'error',
  'no-invalid-this'       : 'error',
  'no-unreachable-loop'   : 'error',
  'no-extra-bind'         : 'error',
  'consistent-return'     : 'error',
  'default-case-last'     : 'error',
  'eqeqeq'                : 'error',
}
const defaultSmells = getEslintConfigEntry({ rules: smellsRules })

const complexityRules = {
  'complexity'            : ['error', 20], // default val
  'max-depth'             : ['error', 4], // default val
  'max-lines'             : [
    'error',
    { max : 300, skipBlankLines : true, skipComments : true },
  ], // default val,
  'max-lines-per-function' : [
    'error',
    { max : 50, skipBlankLines : true, skipComments : true },
  ],
}
const defaultComplexity = getEslintConfigEntry({ rules : complexityRules })

const efficiencyRules = {
  'no-await-in-loop'      : 'error',
  'require-await'         : 'error',
}
const defaultEfficiency = getEslintConfigEntry({ rules : efficiencyRules })

const debugRules = {
  'no-debugger' : 'error',
  // use 'process.stdout'/'process.stderr' when you really want to communicate to the user
  'no-console'  : 'error',
  'no-alert'    : 'error',
}
const defaultDebug = getEslintConfigEntry({ rules : debugRules })

const defaultBaseConfig = getEslintConfigEntry({ plugins, rules })

let defaultNode = {}
if (engines?.node !== undefined) {
  const nodeRules = {
    ...nodePlugin.configs.recommended.rules,
    'node/no-unsupported-features/es-syntax' : 'off', // we expect teh code to run through Babel, so it's fine
    'node/prefer-promises/dns'               : 'error',
    'node/prefer-promises/fs'                : 'error',
    'node/no-missing-import'                 : [
      'error',
      {
        tryExtensions : allExts,
      },
    ]
  }
  defaultNode = getEslintConfigEntry({ 
    plugins : { node : fixupPluginRules(nodePlugin) },
    rules   : nodeRules
  })
  Object.assign(defaultNode.languageOptions.globals, globalsPkg.node)
}

const jsdocRules = {
  ...jsdocPlugin.configs['flat/recommended-error'].rules,
  'jsdoc/require-description' : 'error',
  // there is some indication that jsdoc should be able to divine default from ES6 default parameter settings (
  // e.g., func(foo = true)), but if this is possible, it's not working for us.
  'jsdoc/no-defaults'         : 'off',
  'jsdoc/check-tag-names'     : ['error', { definedTags : ['category'] }],
}
const defaultJsdocConfig = getEslintConfigEntry({
  ignores : [`**/index{${allExtsStr}}`, '**/__tests__/**/*', '**/*.test.*'],
  plugins : { jsdoc : jsdocPlugin },
  rules   : jsdocRules,
})

const defaultJsxConfig = {
  files           : [`**/*{${jsxExtsStr}}`],
  // add necessary globals when processing JSX files
  languageOptions : { globals : globalsPkg.browser },
  settings        : { react : reactSettings },
}

const defaultTestsConfig = {
  files           : ['**/_tests_/**', `**/*.test{${allExtsStr}}`],
  // adds correct globals when processing jest tests
  languageOptions : { globals : globalsPkg.jest },
  rules           : {
    // override default check for tests; Jest 'describe' functions can get very long, nad that's OK
    'max-lines-per-function' : 'off',
  },
}

const getEslintConfig = ({ disable = [], ruleSets = {} } = {}) => {
  const {
    'base-recommended': baseRecommended = 
      disable.includes('base-recommended')
      ? undefined
      : defaultBaseRecommended,
    stylistic = disable.includes('stylistic') ? undefined : defaultStylistic,
    'standard-js' : standardJs =
      disable.includes('standardjs') ? undefined : defaultStandardJs,
    style = disable.includes('style') ? undefined : defaultStyle,
    smells = disable.includes('smells') ? undefined : defaultSmells,
    complexity = 
      disable.includes('complexity') ? undefined : defaultComplexity,
    efficiency = 
      disable.includes('efficiency') ? undefined : defaultEfficiency,
    debug = disable.includes('debug') ? undefined : defaultDebug,
    node = disable.includes('node') ? undefined : defaultNode,
    jsdoc = disable.includes('jsdoc') ? undefined : defaultJsdocConfig,
    additional = {},
    base = defaultBaseConfig,
    jsx = defaultJsxConfig,
    test = defaultTestsConfig,
  } = ruleSets

  if (standardJs !== undefined) {
    if (stylistic !== undefined) {
      // then we delete redundant rules that also appear in stylistic
      delete standardRules['block-spacing']
      delete standardRules['eol-last']
      delete standardRules['no-trailing-spaces']
    }
    if (style !== undefined) {
      // overrides
      // 'React' must be imported even if not directly used; also, our no-unused-vars config is stricter
      standardRules['no-unused-vars'] = 
        ['error', { varsIgnorePattern : 'React' }]
      // delete conflicts
      delete standardRules['brace-style'] // they say '1tbs', we say 'stroustrup'
      delete standardRules['comma-dangle'] // they so no, we say multiline
      delete standardRules['key-spacing'] // we say align to colon, they do not
      delete standardRules['operator-linebreak'] // they say after, we say before
      // redundant
      delete standardRules['space-before-function-paren']
    }  
  }

  const eslintConfig = [
    baseRecommended || {},
    stylistic || {},
    standardJs || {},
    style || {},
    smells || {},
    complexity || {},
    efficiency || {},
    debug || {},
    node || {},
    jsdoc || {},
    base,
    jsx,
    test,
    additional,
  ]

  return eslintConfig
}

export { getEslintConfig }
