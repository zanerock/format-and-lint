import { jest } from '@jest/globals'

jest.unstable_mockModule('node:fs/promises', () => ({
  readFile: async () =>
`src2/*.mjs
# foo
  
src/**/*.mjs

`
}))

describe('extractPatternsFromFile', () => {
  let extractPatternsFromFile
  beforeEach(async () => {
    ({ extractPatternsFromFile } = await import('../extract-patterns-from-file'))
  })

  test('excludes comment and blank lines', async () => {
    const results = await extractPatternsFromFile('blah')
    expect(results).toEqual(['src2/*.mjs', 'src/**/*.mjs'])
  })
})