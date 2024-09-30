import { selectFilesFromOptions } from '../select-files-from-options'

describe('selectFilesFromOptions', () => {
  test.each([
    [
      { files: ['src/test/lib/**'] }, 
      ['copy-dir-to-tmp.mjs', 'get-formatted-text-for.mjs', 'my-dir-from-import.mjs'].map((f) => `src/test/lib/${f}`),
    ],
  ])("options %p selects %p", async (options, expectedFiles) => {
    const selectedFiles = await selectFilesFromOptions(options)
    expect(selectedFiles).toHaveLength(expectedFiles.length)
    for (let i = 0; i < selectedFiles.length; i += 1) {
      expect(selectedFiles[i].endsWith(expectedFiles[i])).toBe(true)
    }
  })
})