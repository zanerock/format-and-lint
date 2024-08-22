/**
 * @file Tests the config works as expected based on a sampling of rules.
 */
const { resolve } = require('node:path')

const { FlatESLint } = require('eslint/use-at-your-own-risk') /* eslint-disable-line node/no-missing-require */

describe('eslint.config.cjs', () => {
  beforeAll(() => {
    process.env.SDLC_LINT_SKIP_GITIGNORE = 'true'
    process.env.SDLC_LINT_SKIP_PACKAGE_IGNORES = 'true'
  })
  afterAll(() => {
    delete process.env.SDLC_LINT_SKIP_GITIGNORE
    delete process.env.SDLC_LINT_SKIP_PACKAGE_IGNORES
  })

  test('detects non-literal regex', async () => {
    const eslint = new FlatESLint({ // TODO: just use Linter and embed the code here rather than require separate files
      overrideConfigFile : resolve(__dirname, '..', '..', 'dist', 'eslint.config.cjs'),
    })

    const results = await eslint.lintFiles('src/test/data/non-literal-regex/**/*')

    expect(results).toHaveLength(1)
    expect(results[0].errorCount).toBe(1)
    expect(results[0].messages).toHaveLength(1)
    expect(results[0].messages[0].messageId).toBe('unexpectedRegExp')
  })
})
