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

const linebreakTypesExcept = (...types) => {
  const result = [...linebreakTypes]
  for (const type of types) {
    result.splice(result.indexOf(type), 1)
  }

  return result
}

export { linebreakTypesExcept }
