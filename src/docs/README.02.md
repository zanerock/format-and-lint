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