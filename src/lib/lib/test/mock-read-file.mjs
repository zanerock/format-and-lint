import { jest } from '@jest/globals'

const readFile = jest.fn()

jest.unstable_mockModule('node:fs/promises', () => ({
  readFile,
}))

const setReadFileResults = (results) =>
  readFile.mockImplementation(async () => results)

setReadFileResults(`src2/*.mjs
# foo
  
src/**/*.mjs
`)

export { setReadFileResults }
