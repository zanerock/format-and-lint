/* global describe expect test */
const { ESLint } = require('eslint')

const config = require('../../dist/eslint.config')

describe('eslint.config.js', () => {
  test('detects non-literal regex', async() => {
    const eslint = new ESLint({
      useEslintrc    : false,
      overrideConfig : config
    })

    const results = await eslint.lintFiles('src/test/data/non-literal-regex/**/*')

    expect(results).toHaveLength(1)
    expect(results[0].errorCount).toBe(1)
    expect(results[0].messages).toHaveLength(1)
    expect(results[0].messages[0].messageId).toBe('unexpectedRegExp')
  })
})
