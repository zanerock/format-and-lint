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
    [
      'detects Windows style newlines',
      'windows-style-newline',
      ['@stylistic/linebreak-style', '@stylistic/linebreak-style'],
    ],
  ]

  const formatTests = [
    ['correctly formats boolean operators in if statement', 'boolean-ops'],
    ['correctly places required semicolon', 'necessary-semicolon'],
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
      join('src', 'test', 'data', 'formatting', testDir))

    tryExec(`git checkout '${formatFiles.join("' '")}'`)
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
    // do this first so we get info about the failed rules
    const failedRules = results[0].messages.map((m) => m.ruleId)
    expect(failedRules).toEqual(ruleIds)
  })

  test.each(formatTests)('%s', (description, testDir) => {
    testDir = resolve(__dirname, 'data', 'formatting', testDir)
    const file = resolve(testDir, 'index.mjs')
    const formattedFile = resolve(testDir, 'formatted.txt')

    tryExec(`./dist/fandl.sh ${file}`)

    const fileContents = readFileSync(file, { encoding : 'utf8' })
    const formattedFileConents = readFileSync(formattedFile, {
      encoding : 'utf8',
    })

    expect(fileContents).toBe(formattedFileConents)
  })
})
