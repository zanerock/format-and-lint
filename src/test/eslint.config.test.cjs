/**
 * @file Tests the config works as expected based on a sampling of rules.
 */
const { readFileSync } = require('node:fs')
const { join, resolve } = require('node:path')

const {
  FlatESLint,
} = require('eslint/use-at-your-own-risk') /* eslint-disable-line node/no-missing-require */

const { tryExec } = require('@liquid-labs/shell-toolkit')

describe('eslint.config.cjs', () => {
  const lintTests = [
    [
      'detects non-literal regex',
      'non-literal-regex',
      ['prefer-regex-literals'],
    ],
    [
      'detects missing dangling commas',
      'dangling-commas',
      ['@stylistic/comma-dangle', '@stylistic/comma-dangle'],
    ],
  ]

  const formatTests = [
    ['correctly formats boolean operators in if statement', 'boolean-ops'],
  ]

  beforeAll(() => {
    process.env.SDLC_LINT_SKIP_GITIGNORE = 'true'
    process.env.SDLC_LINT_SKIP_PACKAGE_IGNORES = 'true'
    process.env.CHECK_DATA_FILES = 'true'
  })
  afterAll(() => {
    delete process.env.SDLC_LINT_SKIP_GITIGNORE
    delete process.env.SDLC_LINT_SKIP_PACKAGE_IGNORES
    delete process.env.CHECK_DATA_FILES

    const formatFiles = formatTests.map(([, testDir]) =>
      join('src', 'test', 'data', 'formatting', testDir)
    )

    tryExec(`git checkout '${formatFiles.join("' '")}'`)
  })
  afterEach(() => {
    delete process.env.FORMAT_FILES
  })

  test.each(lintTests)('%s', async (description, testDir, ruleIds) => {
    const eslint = new FlatESLint({
      // TODO: just use Linter and embed the code here rather than require separate files
      overrideConfigFile : resolve(
        __dirname,
        '..',
        '..',
        'dist',
        'eslint.config.cjs'
      ),
    })

    const results = await eslint.lintFiles(`src/test/data/${testDir}/**/*`)

    // console.log(JSON.stringify(results, null, '  ')) // DEBUG

    expect(results).toHaveLength(1)
    expect(results[0].errorCount).toBe(ruleIds.length)
    expect(results[0].messages).toHaveLength(ruleIds.length)
    ruleIds.forEach((ruleId, i) => {
      expect(results[0].messages[i].ruleId).toBe(ruleId)
    })
  })

  test.each([
    
  ])('%s', (description, testDir) => {
    testDir = resolve(__dirname, 'data', 'formatting', testDir)
    const file = resolve(testDir, 'index.mjs')
    const formattedFile = resolve(testDir, 'formatted.txt')

    process.env.FORMAT_FILES = file
    tryExec('./dist/fandl.sh')

    const fileContents = readFileSync(file, { encoding : 'utf8' })
    const formattedFileConents = readFileSync(formattedFile, {
      encoding : 'utf8',
    })

    expect(fileContents).toBe(formattedFileConents)
  })
})
