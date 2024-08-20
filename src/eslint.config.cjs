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
const stylistic = require('@stylistic/eslint-plugin')
const globalsPkg = require('globals')
const importPlugin = require('eslint-plugin-import')
const jsdocPlugin = require('eslint-plugin-jsdoc')
const nodePlugin = require('eslint-plugin-node')
const promisePlugin = require('eslint-plugin-promise')
const nPlugin = require('eslint-plugin-n')
const standardPlugin = require('eslint-config-standard')

const packageContents = readFileSync('./package.json', { encoding : 'utf8' })
const packageJSON = JSON.parse(packageContents)
const { _sdlc, dependencies = {}, devDependencies = {}, engines = { node : true } } = packageJSON

let gitignoreContents
try {
  gitignoreContents = readFileSync('./.gitignore', { encoding : 'utf8' })
}
catch (e) {
  if (e.code !== 'ENOENT') { throw e }
  // else, it's fine there is just no .gitignore
}

const usesReact = dependencies.react !== undefined || devDependencies.react !== undefined
const reactSettings = usesReact
  ? { version : 'detect' }
  : {}

// first we set up the files to ignore by reading out '.gitignore'
const commonIgnores = ['doc/**']
if (gitignoreContents !== undefined && process.env.SDLC_LINT_SKIP_GITIGNORE !== 'true') {
  const gitignoreLines = gitignoreContents.split(/\r?\n/)
  for (const gitIgnore of gitignoreLines) {
    if (gitIgnore.trim() === '') continue

    let newIgnore
    if (gitIgnore.startsWith('/')) {
      newIgnore = gitIgnore.slice(1)
    }
    else {
      newIgnore = '**/' + gitIgnore
    }
    if (!newIgnore.endsWith('/')) {
      newIgnore += '/'
    }
    newIgnore += '**'

    commonIgnores.push(newIgnore)
  }
}

// we also include any ignores from the package.json
if (_sdlc !== undefined && _sdlc.linting !== undefined && process.env.SDLC_LINT_SKIP_PACKAGE_IGNORES !== 'true') {
  const { ignores } = _sdlc.linting
  commonIgnores.push(...ignores)
}

const stylisticConfig = stylistic.configs['recommended-flat']

const plugins = Object.assign({
  // the 'standard' rules plugins
  standard : standardPlugin,
  import   : importPlugin,
  promise  : promisePlugin,
  n        : nPlugin,
},
stylisticConfig.plugins) // this names the plugin '@stylistic'

const rules = {
  ...standardPlugin.rules,
  ...stylisticConfig.rules,
  // override key spacing to get things aligned
  '@stylistic/key-spacing'                     : ['error', { align : 'colon', afterColon : true, beforeColon : true }],
  // override to allow avoiding escapes
  '@stylistic/quotes'                          : ['error', 'single', { allowTemplateLiterals : true, avoidEscape : true }],
  // additional rules
  '@stylistic/arrow-parens'                    : ['error', 'always'],
  '@stylistic/array-bracket-newline'           : ['error', 'consistent'],
  '@stylistic/array-element-newline'           : ['error', 'consistent'],
  '@stylistic/function-call-argument-newline'  : ['error', 'consistent'],
  '@stylistic/function-call-spacing'           : ['error', 'never'],
  '@stylistic/function-paren-newline'          : ['error', 'consistent'],
  '@stylistic/max-statements-per-line'         : ['error', { max : 2 }], // allow for short one-liners
  '@stylistic/padding-line-between-statements' : ['error',
    { blankLine : 'always', prev : '*', next : 'export' },
    { blankLine : 'always', prev : '*', next : 'cjs-export' },
    // What I really want is 'next except self'...
    // { blankLine: 'always', prev: 'import', next: '*' },
    // { blankLine: 'always', prev: 'cjs-import', next: '*' },
    { blankLine : 'always', prev : '*', next : 'return' }],
  '@stylistic/semi-style'           : ['error', 'last'],
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
  'key-spacing'                     : ['error', {
    singleLine : {
      beforeColon : true,
      afterColon  : true,
      mode        : 'strict',
    },
    multiLine : {
      beforeColon : true,
      afterColon  : true,
      align       : 'colon',
    },
  }],
  'prefer-regex-literals' : 'error',
}

// OK, so the standard plugin provides lots of nice rules, but there are some conflicts, so we delete them (and let the
// @stylistic rules control).
delete rules['brace-style'] // they want 1tbs, we want stroustrup
delete rules['comma-dangle'] // they so no, we say multiline
delete rules['operator-linebreak'] // they say after, we say before
delete rules[' no-trailing-spaces'] // doesn't conflict, but it's redundant with @stylistic

/* // react now covered by stylistic
if (usesReact === true) {
  plugins.react = reactPlugin
  Object.assign(rules, reactPlugin.configs.recommended.rules)
} */

const eslintConfig = [
  // setting 'ignores' like this excludes the matching files from any processing; setting 'ignores' with 'files' in the
  // same object only excludes the ignored files from those rules but not from being processed alltogether
  { ignores : commonIgnores },
  // general standard rules; the react rules have to go here to or else ESLint thinks components aren't used and
  // triggers the 'no-unused-vars' rule
  {
    files           : ['**/*.{cjs,js,jsx,mjs}'],
    languageOptions : {
      parser        : babelParser,
      parserOptions : {
        sourceType        : 'module',
        requireConfigFile : true,
        babelOptions      : { configFile : join(__dirname, 'babel', 'babel.config.cjs') },
        ecmaFeatures      : { jsx : true },
      },
      ecmaVersion : 'latest',
    },
    settings : { react : reactSettings },
    plugins,
    rules,
  },
  // jsdoc rules
  {
    files   : ['**/*.{cjs,js,jsx,mjs}'],
    ignores : ['**/index.{js,cjs,mjs}', '**/__tests__/**/*', '**/*.test.*'],
    plugins : { jsdoc : jsdocPlugin },
    rules   : {
      ...jsdocPlugin.configs['flat/recommended-error'].rules,
      'jsdoc/require-description' : 'error',
      // there is some indication that jsdoc should be able to divine default from ES6 default parameter settings (
      // e.g., func(foo = true)), but if this is possible, it's not working for us.
      'jsdoc/no-defaults'         : 'off',
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
    plugins         : { node : nodePlugin },
    languageOptions : {
      // globals used to define structuredClone (I'm pretty sure), but now doesn't for some reason...
      globals : { structuredClone : false, ...globalsPkg.node },
    },
    rules : {
      ...nodePlugin.configs.recommended.rules,
      'node/no-unsupported-features/es-syntax' : 'off', // we expect teh code to run through Babel, so it's fine
      'node/prefer-promises/dns'               : 'error',
      'node/prefer-promises/fs'                : 'error',
      'node/no-missing-import'                 : ['error', {
        tryExtensions : ['.js', '.cjs', '.mjs', '.jsx'],
      }],
    },
  })
}

module.exports = eslintConfig
