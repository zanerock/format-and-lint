import { selectFilesFromOptions } from '../select-files-from-options'

describe('selectFilesFromOptions', () => {
  test.each([
    [
      { files: ['src/test/lib/**'] }, 
      ['copy-dir-to-tmp.mjs', 'get-formatted-text-for.mjs'].map((f) => `src/test/lib/${f}`),
    ],
  ])("options %p selects %p", async (options, expectedFiles) => {
    expect(await selectFilesFromOptions(options)).toEqual(expectedFiles)
  })
})