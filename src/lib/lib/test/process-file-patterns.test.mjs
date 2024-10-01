import './mock-read-file'

describe('process-file-patterns', () => {
  let processFilePatterns
  beforeAll(async () => {
    ;({ processFilePatterns } = await import('../process-file-patterns'))
  })

  test('combines patterns and file patterns', async () => {
    const results = await processFilePatterns(['foo/**/*.mjs'], ['blah'])
    expect(results).toEqual(['foo/**/*.mjs', 'src2/*.mjs', 'src/**/*.mjs'])
  })
})
