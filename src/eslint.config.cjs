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
const { _sdlc, engines = { node : true } } = packageJSON

let gitignoreContents
try {
  gitignoreContents = readFileSync('./.gitignore', { encoding : 'utf8' })
} catch (e) {
  if (e.code !== 'ENOENT') { throw e }
  // else, it's fine there is just no .gitignore
}

// first we set up the files to ignore by reading out '.gitignore'
const commonIgnores = ['doc/**']
if (gitignoreContents !== undefined && process.env.SDLC_LINT_SKIP_GITIGNORE !== 'true') {
  const gitignoreLines = gitignoreContents.split(/\r?\n/)
  for (const gitIgnore of gitignoreLines) {
    if (gitIgnore.trim() === '') continue

    let newIgnore
    if (gitIgnore.startsWith('/')) {
      newIgnore = gitIgnore.slice(1)
    } else {
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
if (_sdlc !== null && _sdlc.linting !== undefined && process.env.SDLC_LINT_SKIP_PACKAGE_IGNORES !== 'true') {
  const { ignores } = _sdlc.linting
  commonIgnores.push(...ignores)
}

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
        babelOptions      : {
          configFile : join(__dirname, 'babel', 'babel.config.cjs')
        },
        ecmaFeatures : {
          jsx : true
        }
      },
      ecmaVersion : 'latest'
    },
    settings : {
      react : {
        version : 'detect'
      }
    },
    plugins : {
      // the 'standard' rules plugins
      standard : standardPlugin,
      import   : importPlugin,
      promise  : promisePlugin,
      n        : nPlugin,
      // so ESLint understands JSX
      react    : reactPlugin
    },
    rules : {
      ...js.configs.recommended.rules,
      ...standardPlugin.rules,
      ...reactPlugin.configs.recommended.rules,
      // TODO; looks like it's failing on the `export * from './foo'` statements; even though we have the babel pluggin`
      'import/export'  : 'off',
      // the standard 'no-unused-vars ignores unused args, which we'd rather catch. We also want to exclude 'React',
      // which we need to import for react to work, even when not used
      'no-unused-vars' : ['error', { varsIgnorePattern : 'React' }],
      // this is our one modification to JS Standard style
      'key-spacing'    : ['error', {
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
  // jsdoc rules
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
  // add necessary globals and react settinsg when processing JSX files
  {
    files           : ['**/*.jsx'],
    languageOptions : {
      globals : {
        ...globalsPkg.browser
      }
    }
  },
  // adds correct globals when processing jest tests
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
      ...nodePlugin.configs.recommended.rules,
      'node/no-unsupported-features/es-syntax' : 'off', // we expect teh code to run through Babel, so it's fine
      'node/prefer-promises/dns'               : 'error',
      'node/prefer-promises/fs'                : 'error'
    }
  })
}

module.exports = eslintConfig
