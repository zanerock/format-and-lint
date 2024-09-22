import { setReadFileResults } from './mock-read-file'

describe('processPackageIgnores', () => {
  let processPackageIgnores
  beforeAll(async () => {
    ({ processPackageIgnores } = await import('../process-package-ignores'))
  })

  test('loads ignores from package.json', async () => {
    setReadFileResults('{ "devPkg": { "linting": { "ignores": ["foo"] }}}')

    const results = await processPackageIgnores()
    expect(results).toEqual(['foo'])
  })
})