/**
 * @file Tests the config works as expected based on a sampling of rules.
 */
const { resolve } = require('node:path')
const { FlatESLint } = require('eslint/use-at-your-own-risk') /* eslint-disable-line node/no-missing-require */

// erroneously comaplains that '.config' is the extension
const config = require('../../dist/eslint.config') /* eslint-disable-line import/extensions,node/no-missing-require */

describe('eslint.config.cjs', () => {
  test('detects non-literal regex', async () => {
    const eslint = new FlatESLint({ // TODO: just use Linter and embed the code here rather than require separate files
      overrideConfig     : config,
      overrideConfigFile : resolve(__dirname, '..', '..', 'dist', 'eslint.config.cjs')
    })

    const results = await eslint.lintFiles('src/test/data/non-literal-regex/**/*')

    expect(results).toHaveLength(1)
    expect(results[0].errorCount).toBe(1)
    expect(results[0].messages).toHaveLength(1)
    expect(results[0].messages[0].messageId).toBe('unexpectedRegExp')
  })
})
