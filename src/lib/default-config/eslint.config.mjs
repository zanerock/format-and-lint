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
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import globalsPkg from 'globals'
import importPlugin from 'eslint-plugin-import'
import jsdocPlugin from 'eslint-plugin-jsdoc'
import nodePlugin from 'eslint-plugin-node'
import promisePlugin from 'eslint-plugin-promise'
import nPlugin from 'eslint-plugin-n'
import babelParser from '@babel/eslint-parser'
import { fixupPluginRules } from "@eslint/compat"
import stylistic from '@stylistic/eslint-plugin'
import standardPlugin from 'eslint-config-standard'

const __dirname = dirname(fileURLToPath(import.meta.url))

const babelConfigPathInstalled = join(__dirname, 'babel', 'babel.config.cjs')
const babelConfigPathTest = join('dist', 'babel', 'babel.config.cjs')

const babelConfigPath = existsSync(babelConfigPathInstalled) === true
  ? babelConfigPathInstalled
  : existsSync(babelConfigPathTest)
    ? babelConfigPathTest
    : undefined
if (babelConfigPath === undefined) {
  throw new Error('Could not find babel config file.')
}

const packageContents = readFileSync('./package.json', { encoding : 'utf8' })
const packageJSON = JSON.parse(packageContents)
const {
  dependencies = {},
  devDependencies = {},
  engines = { node : true },
} = packageJSON

let gitignoreContents
try {
  gitignoreContents = readFileSync('./.gitignore', { encoding : 'utf8' })
}
catch (e) {
  if (e.code !== 'ENOENT') {
    throw e
  }
  // else, it's fine there is just no .gitignore
}

const usesReact =
  dependencies.react !== undefined || devDependencies.react !== undefined
const reactSettings = usesReact ? { version : 'detect' } : {}

const stylisticConfig = stylistic.configs['recommended-flat']

const plugins = Object.assign(
  {
    // the 'standard' rules plugins
    standard : standardPlugin,
    import   : importPlugin,
    promise  : promisePlugin,
    n        : nPlugin,
  },
  stylisticConfig.plugins
) // this names the plugin '@stylistic'

const linebreakTypes = [
  'block',
  'block-like',
  'break',
  'case',
  'cjs-export',
  'cjs-import',
  'class',
  'const',
  'continue',
  'debugger',
  'default',
  'directive',
  'do',
  'empty',
  'export',
  'expression',
  'for',
  'function',
  'if',
  'iife',
  'import',
  'let',
  'multiline-block-like',
  'multiline-const',
  'multiline-expression',
  'multiline-let',
  'multiline-var',
  'return',
  'singleline-const',
  'singleline-let',
  'singleline-var',
  'switch',
  'throw',
  'try',
  'var',
  'while',
  'with',
]

const linbreakTypesExcept = (...types) => {
  const result = [...linebreakTypes]
  for (const type of types) {
    result.splice(result.indexOf(type), 1)
  }

  return result
}

const rules = {
  ...standardPlugin.rules,
  ...stylisticConfig.rules,
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
  '@stylistic/arrow-parens'          : ['error', 'always'], // I like this to be consistent
  '@stylistic/array-bracket-newline' : ['error', 'consistent'],
  '@stylistic/array-element-newline' : ['error', 'consistent'],
  '@stylistic/comma-dangle'          : [
    'error',
    {
      arrays    : 'always-multiline',
      objects   : 'always-multiline',
      imports   : 'never',
      exports   : 'never',
      functions : 'never',
    },
  ],
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
      prev      : linbreakTypesExcept('cjs-export', 'export'),
      next      : 'export',
    },
    {
      blankLine : 'always',
      prev      : linbreakTypesExcept('cjs-export', 'export'),
      next      : 'cjs-export',
    },
    {
      blankLine : 'always',
      prev      : 'import',
      next      : linbreakTypesExcept('import'),
    },
    // { blankLine : 'always', prev : 'cjs-import', next : linbreakTypesExcept('cjs-import') },
    {
      blankLine : 'always',
      prev      : 'cjs-import',
      // Because a cjs-import is actually many different things...
      next      : linbreakTypesExcept(
        'cjs-import',
        'const',
        'let',
        'singleline-const',
        'singleline-let',
        'singleline-var',
        'var'
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
  // one-true-brace-style /is/ the more common, but i just don't like it. I think Stroustrup is easier to read *and*,
  // most important, with 1tbs, you can't do these kind of comments:
  //
  // if { ...
  // } // I really like to be able to put comments here
  // else if (some really conditional that means we'd have to put our comment inside the else-if!) {...}
  //
  // and I do those kind of comments sometime.
  // 'standard/brace-style'    : ['errer', 'stroustrup', { allowSingleLine: true }],
  // TODO; looks like it's failing on the `export * from './foo'` statements; even though we have the babel pluggin`
  'import/export'                   : 'off',
  // the standard 'no-unused-vars ignores unused args, which we'd rather catch. We also want to exclude 'React',
  // which we need to import for react to work, even when not used
  'no-unused-vars'                  : ['error', { varsIgnorePattern : 'React' }],
  // this is our one modification to JS Standard style
  'prefer-regex-literals'           : 'error',
}

// OK, so the standard plugin provides lots of nice rules, but there are some conflicts, so we delete them (and let the
// @stylistic rules control).
delete rules['block-spacing'] // redundant with @stylistic
delete rules['brace-style'] // they want 1tbs, we want stroustrup
delete rules['comma-dangle'] // they so no, we say multiline
delete rules['eol-last'] // redundant with @stylistic
delete rules.indent
delete rules['indent-binary-ops']
delete rules['key-spacing'] // redundant with @stylistic
delete rules['operator-linebreak'] // they say after, we say before
delete rules['no-trailing-spaces'] // doesn't conflict, but it's redundant with @stylistic
delete rules['space-before-function-paren'] // we override default and redundant anyway
// delete rules['@stylistic/indent']
delete rules['@stylistic/indent-binary-ops']

/* // react now covered by stylistic
if (usesReact === true) {
  plugins.react = reactPlugin
  Object.assign(rules, reactPlugin.configs.recommended.rules)
} */

const files =
  process.env.FORMAT_FILES === undefined
    ? ['**/*.{cjs,js,jsx,mjs}']
    : [process.env.FORMAT_FILES]

const eslintConfig = [
  // general standard rules; the react rules have to go here to or else ESLint thinks components aren't used and
  // triggers the 'no-unused-vars' rule
  {
    files,
    languageOptions : {
      parser        : babelParser,
      parserOptions : {
        sourceType        : 'module',
        requireConfigFile : true,
        babelOptions      : {
          configFile : babelConfigPath,
        },
        ecmaFeatures : { jsx : true },
      },
      ecmaVersion : 'latest',
    },
    settings : { react : reactSettings },
    plugins,
    rules,
  },
  // jsdoc rules
  {
    files,
    ignores : ['**/index.{js,cjs,mjs}', '**/__tests__/**/*', '**/*.test.*'],
    plugins : { jsdoc : jsdocPlugin },
    rules   : {
      ...jsdocPlugin.configs['flat/recommended-error'].rules,
      'jsdoc/require-description' : 'error',
      // there is some indication that jsdoc should be able to divine default from ES6 default parameter settings (
      // e.g., func(foo = true)), but if this is possible, it's not working for us.
      'jsdoc/no-defaults'         : 'off',
      'jsdoc/check-tag-names'     : ['error', { definedTags : ['category'] }],
    },
  },
  // add necessary globals and react settinsg when processing JSX files
  {
    files           : ['**/*.jsx'],
    languageOptions : { globals : globalsPkg.browser },
  },
  // adds correct globals when processing jest tests
  {
    files           : ['**/_tests_/**', '**/*.test.{cjs,js,jsx,mjs}'],
    languageOptions : { globals : globalsPkg.jest },
  },
]

if (engines?.node !== undefined) {
  eslintConfig.push({
    files           : ['**/*.{cjs,js,jsx,mjs}'],
    plugins         : { node : fixupPluginRules(nodePlugin) },
    languageOptions : {
      globals : globalsPkg.node, // TODO: actually, we don't want this for MJS files... but I'm not sure what we do want
    },
    rules : {
      ...nodePlugin.configs.recommended.rules,
      'node/no-unsupported-features/es-syntax' : 'off', // we expect teh code to run through Babel, so it's fine
      'node/prefer-promises/dns'               : 'error',
      'node/prefer-promises/fs'                : 'error',
      'node/no-missing-import'                 : [
        'error',
        {
          tryExtensions : ['.js', '.cjs', '.mjs', '.jsx'],
        },
      ],
    },
  })
}

export { eslintConfig }
