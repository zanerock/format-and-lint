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

/**
 * A helper function used to sanely build 'blankline' entries in the '@stylistic/padding-line-between-statements' rule.
 * Basically, what we often want is to say "we want a blank line between expression type A and all other expression
 * except for B, C, and D." This is useful because the '@stylistic/padding-line-between-statements' rule requires you
 * specify each type where a blank line is required, but it's generally easier to specify a set of expression types for
 * which a blank line is _NOT_ required.E.g.:
 *
 * ```javascript
 * '@stylistic/padding-line-between-statements' : [
 *   'error',
 *   { blankLine : 'always', prev : '*', next : 'class' },
 *   {
 *     blankLine : 'always',
 *     prev      : linebreakTypesExcept('cjs-export', 'export'),
 *     next      : 'export',
 *   },
 * ]
 * ```
 *
 * Would require (and/or add) a blank line between a class declaration and anything else, and a blank line between
 * `import` statements and all other statements except `import` or `cjs-import` statements. That way, all your `import`
 * statements would be grouped together, but would have a blank line between the last `import` and whatever the next
 * non-import statement is.
 * @param {...string} types - A list of the types to exclude from the rule (meaning all other known types are included).
 * @returns {string[]} - An array of the non-excluded types.
 */
const linebreakTypesExcept = (...types) => {
  const result = [...linebreakTypes]
  for (const type of types) {
    result.splice(result.indexOf(type), 1)
  }

  return result
}

export { linebreakTypesExcept }
