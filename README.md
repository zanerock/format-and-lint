# @pkgdev/format-and-lint
[![coverage: 97%](./.readme-assets/coverage.svg)](https://github.com/liquid-labs/format-and-lint/pulls?q=is%3Apr+is%3Aclosed)

Pre-configured formatting and lint tool combining the best of prettier and eslint. Aka, fandl.

- [Install](#instal)
- [Usage](#usage)
  - [CLI](#cli)
  - [API](#api)
- [API reference](#api-reference)
- [Customizing lint and style](#customizing-lint-and-style)
  - [Overriding lint and style rules](#overriding-lint-and-style-rules)
  - [Specifying source type](#specifying-source-type)
- [Formatting overview](#formatting-overview)

## Install

```bash
npm i @pkgdev/format-and-lint
```

## Usage

### CLI

```bash
npx fandl lint # runs lint checks only with no changes to files
npx fandl # fixes what it can and reports on the rest
npx fandl --files '**/weird-src/**/*.{js,mjs,cjs,jsx}' # specify files pattern
```

### API

```javascript
import { formatAndLint } from '@pkgdev/format-and-lint'

// in the API, we provide actual file paths, which may be relative or absolute
const files = ['index.js', 'src/foo.js', 'src/bar.js']
const { eslint, lintResults } = formatAndLint({ files })
// process the results; the following is essentially what the fandl CLI does
const formatter = await eslint.loadFormatter('stylish')
const resultText = formatter.format(lintResults)

stdout.write(resultText)
// if we had something to say, then that indicates an error/warning in the source
if (resultText !== '') {
  process.exit(1)
}
```


##  API reference
_API generated with [dmd-readme-api](https://www.npmjs.com/package/dmd-readme-api)._

<span id="global-function-index"></span>
- Functions:
  - [`formatAndLint()`](#formatAndLint): Parses, lints, and (when `check` is false) reformats the `files` text.
  - [`getEslintConfigEntry()`](#getEslintConfigEntry): Generates an ESlint flat style configuration entry using the fandl parser defaults and supplied settings.
  - [`linebreakTypesExcept()`](#linebreakTypesExcept): A helper function used to sanely build 'blankline' entries in the '@stylistic/padding-line-between-statements' rule.

<a id="formatAndLint"></a>
### `formatAndLint(options)` ⇒ `Promise.<{eslint: object, lintResults: Array.<object>}>` <sup>↱<sup>[source code](./src/lib/format-and-lint.mjs#L42)</sup></sup> <sup>⇧<sup>[global index](#global-function-index)</sup></sup>

Parses, lints, and (when `check` is false) reformats the `files` text. By default, this function will update the
`files` in-place.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| `options` | `object` |  | The input options. |
| [`options.check`] | `boolean` | `false` | If `true` then the files are linted, but not reformatted. |
| [`options.noWrite`] | `boolean` | `false` | If `true`, then the files are not updated in placed. Has no effect when   `check = false`, but when combined with `check = true`, means that the text is reformatted and attached to the   `LintResult`s, but the files themselves are not updated. You can access reformatted text as part of the   `result.lintResults[0].output`. Unlike results directly from `ESLint`, `output` is   always present on the `LintResult` object (rather than only being set if the text is changed. |
| [`options.eslintConfig`] | `object` | `<default eslint config>` | A flat (9.x) style array of [eslint configuration   object](https://eslint.org/docs/latest/use/configure/configuration-files#configuration-objects) to be used in   place of the default, out of the box configuration. This may not be specified along with `ruleSets`. |
| [`options.ruleSets`] | `object` |  | An object with zero or more keys whose values are a valid ESlint   "flat" configuration. Keys corresponding to the [standard fandl rule sets](#rule-sets) will override the named   rule set. Any additional rule will be appended to the configuration array. |
| [`options.prettierConfig`] | `object` | `<default prettier config>` | A prettier [options   object](https://prettier.io/docs/en/options). |
| [`options.eslint`] | `object` |  | A pre-configured   [`ESLint`](https://eslint.org/docs/latest/integrate/nodejs-api#eslint-class) instance. If this is defined, then   `eslintConfig` and `ruleSets` will be ignored. |
| [`options.outputDir`] | `string` |  | If provided, then output files (whether reformatted or not) will be   written to the specified directory relative to their location in the source. With `src/index.mjs` =>   `<outputDir>/src/index.mjs`, `src/foo/bar.mjs` => `<outputDir>/src/foo/bar.mjs`. This option has no effect if   `check = true` or `noWrite = true`. The relative starting point is controlled with the `relativeStem` option. |
| [`options.relativeStem`] | `string` | process.cwd() | Controls the starting point for determining the relative   position of files when emitting to `outputDir` rather than updating in place. Impossible stems will result in an   error. E.g., given file `src/index.mjs`, `relativeStem = 'src/foo'` is invalid. |

**Returns**: `Promise.<{eslint: object, lintResults: Array.<object>}>` - Resolves to an object with two fields. `eslint` points
to the an instance of [`ESLint`](https://eslint.org/docs/latest/integrate/nodejs-api#eslint-class). `lintResults`
points to an array of [`LintResult`](https://eslint.org/docs/latest/integrate/nodejs-api#-lintresult-type)s.

<a id="getEslintConfigEntry"></a>
### `getEslintConfigEntry(options)` ⇒ `object` <sup>↱<sup>[source code](./src/lib/default-config/lib/get-eslint-config-entry.mjs#L40)</sup></sup> <sup>⇧<sup>[global index](#global-function-index)</sup></sup>

Generates an ESlint flat style configuration entry using the fandl parser defaults and supplied settings. This will
set default 'files' (unless overridden), 'languageOptions', and 'settings'. The most common usage is to add a set of
'rules' (and any necessary 'plugins'). File targets can be specified with 'files' and 'ignores'.


| Param | Type | Default | Description |
| --- | --- | --- | --- |
| `options` | `object` |  | The input options. |
| [`options.files`] | `Array.<string>` | `<all js/x files>` | An array of file patterns to match for this configuration.    Note that when used with [`formatAndLint()`](#formatAndLint), `formatAndLint()` actually selects tho files for    processing. This pattern is then used to determine whether to apply the configuration to a given file.   Will default to match all '.js', '.cjs', '.mjs', and '.jsx'. |
| ...`options.configOptions` | `object` |  | Additional options to apply to the configuration. The most common entries   will be 'ignores', rules', and 'plugin'. |

**Returns**: `object` - A ESLint flat configuration entry.

<a id="linebreakTypesExcept"></a>
### `linebreakTypesExcept(...types)` ⇒ `Array.<string>` <sup>↱<sup>[source code](./src/lib/default-config/lib/linebreak-types-except.mjs#L67)</sup></sup> <sup>⇧<sup>[global index](#global-function-index)</sup></sup>

A helper function used to sanely build 'blankline' entries in the '@stylistic/padding-line-between-statements' rule.
Basically, what we often want is to say "we want a blank line between expression type A and all other expression
except for B, C, and D." This is useful because the '@stylistic/padding-line-between-statements' rule requires you
specify each type where a blank line is required, but it's generally easier to specify a set of expression types for
which a blank line is _NOT_ required.E.g.:

```javascript
'@stylistic/padding-line-between-statements' : [
  'error',
  { blankLine : 'always', prev : '*', next : 'class' },
  {
    blankLine : 'always',
    prev      : linebreakTypesExcept('cjs-export', 'export'),
    next      : 'export',
  },
]
```

Would require (and/or add) a blank line between a class declaration and anything else, and a blank line between
`import` statements and all other statements except `import` or `cjs-import` statements. That way, all your `import`
statements would be grouped together, but would have a blank line between the last `import` and whatever the next
non-import statement is.


| Param | Type | Description |
| --- | --- | --- |
| ...`types` | `string` | A list of the types to exclude from the rule (meaning all other known types are included). |

**Returns**: `Array.<string>` - - An array of the non-excluded types.

## Customizing lint and style

You can override the prettier and enlint rules using the `--prettier-config-path` and `--eslint-config-path` options when using the `fandl` command, or `prettierConfig` and `eslintConfig` options when using the [`formatAndLint()`](#formatAndLint) function. When the ESlint configuration is specified in this manner, then the 

### Rule sets

In addition, fandl breaks up the eslint style and lint rules into various rule sets. All rule sets are included by default. The rule sets are:

- 'base-recommended': ESlint's recommended [base rule set](https://www.npmjs.com/package/@eslint/js)
- 'stylistic': ESlint's recommended [stylistic rule set](https://eslint.style/rules)
- 'standard-js': the [Standard JS rules](https://standardjs.com/rules) (which are partially modified by the 'style' rules; see [formatting overview](#formatting-overview) for details)
- 'style': additional and superseding style specific rules; refer to the [formatting overview](#formatting-overview) section for details on the default fandl style
- 'smells': rules that may be indicative of possible logical errors or incomplete changes such as unused variables, use of the '===' operator in comparisons, consistent `return` values in a statement (naked or valued), etc.
- 'complexity': rules that check code complexity and encourage decomposing large functions and files into more manageable chunks
- 'jsdoc': rules regarding JSDoc documentation
- 'jsx': JSX specific rules
- 'test': rules specific to to unit tests

Rule sets can be individually overridden with the `--rule-sets-path` CLI option or the `ruleSets` option when using [`formatAndLint()`](#format-and-lint). Configurations associated with a novel key (not defined above) will be appended to the configuration array and augment the configuration. Rules sets may also be disabled with the `--disable-rule-sets` and `disableRuleSets` options respectively.

Because there are some redundancies and conflicts in some of the stock rule sets, certain rules may be deleted or left in place depending on which rule sets are included. E.g., both 'standard-js' and 'stylistic' enforce a blank line at the end of a file so the 'standard-js' rule is deleted to avoid double reporting and 'style' aligns colons in multi-line object definitions so the corresponding 'standard-js' rule (which does not) is deleted. So, if you prefer Standard JS to our own default fandl style, you can simply disable 'style', and the would-be conflicting/redundant 'standard-js' rules will be left in place.

### Specifying source type

By default, fandl assumes that the input source files use ES6 module format. You can override this in two ways. First, in your `package.json`, you can set `pkgdev['format-and-lint'].sourceType`, which if present, determines the source file format. If the `pkgdev` setting is not present, then fandl examines the `type` field in `package.json` and uses that value. Note that if the distributed format is "commonjs", and this is specified as `"type": "commonjs"` `package.json`, but the source files use "module" format (and then are transpiled by Babel or similar), you _must_ set the `pkgdev['format-and-lint'].sourceType` field to "module".

## Formatting overview

The code is run through prettier first mainly because it does a much better job properly indenting code and fitting it within a target width (80 chars).[^1] The partially reformatted code is then formatted by eslint because prettier (purposely) has very few options and we don't agree with all of them. The eslint rules have been harmonized such that the final formatted code will pass a lint check.

Our formatting differs from prettier and/or JS standard on the following points:
- fandl places operators at the beginning of the next line rather than the end of the previous line in multi-line expressions (contrary to prettier); this improves readability; e.g.:
  ```js
  const foo = bar // fandl style
    && baz
  // vs
  const foo = bar && // prettier style
    baz
  ```
- fandl places `else if`/`else`/`catch`, etc. on a newline, aka Stroustrup style (contrary to Standard JS and prettier); 1tbs can be harder to read (IMO) and Stroustrup allows for comments at the end of the block; e.g.:
  ```js
  if (a === 1) { // fandl style (Stroustrup)
    ...
  } // here we can say something about what the preceding block did
  else if (a === 2 && b === 3) { // here we can say something about this block
    ...
  }
  // vs
  if (a === 1) { // Standard JS, prettier style ("one true brace style")
    return 'visually, I find this harder to read when the else-if abuts'
  } else if (a === 2 && b === 3) {
    ...
  }
  ```
- fandl aligns the colons in object declarations, making name/values easier to read (like a table); e.g.:
  ```js
  const foo = { // fandl style
    foo           : 'hey',
    longFieldName : 'how are you?',
  }
  // vs
  const bar = { // Standard JS, prettier style
    foo : 'hey',
    longFieldName : 'how are you?'
  }
  ```
- fandl requires a dangling comma in multi-line array and object definitions as well as multi-line import and export statements[^2]; this makes diffs cleaner and it's easier/less error prone when making changes (contrary to Standard JS and prettier); e.g.:
  ```js
  // everyone agrees, no comma in single line
  const foo = [ 'item one', 'item 2' ]
  const bar = [ // fandl style
    'item one',
    'item two',
  ]
  // vs
  const baz = [ // Standard JS, prettier style
    'item one',
    'item two'
  ]
  ```
- fandl requires operators come at the start of a newline in multi-line expressions (aka, 'before' style) ; this is easier to read and is consistent with the ternary operator formatting which we all agree is 'before'; e.g.:
  ```js
  const foo = bar //fandl style
    & baz
  // vs
  const bar = bing & // Standard JS, prettier style
    bong
  ```

[^1]: I perhaps falsely remember eslint actually doing a better re indenting code, but in any case there are two issue with the latest eslint based reformatting. First, it miscounts the correct indention level where '('s were involved in boolean expressions. Second, eslint failed automatically break up long lines. (As of @stylistic/eslint-plugin: 2.6.4, eslint: 8.50.0; have since upgraded but not retested since it's working as is.)
[^2]: Dangling commas are disallowed in function definition and calls, however. The reasoning here is that function calls need to be precise and the presence of a dangling ',' might in