import { jest } from '@jest/globals'

jest.unstable_mockModule('node:fs/promises', () => ({
  readFile: async () =>
`src2/*.mjs
# foo
  
src/**/*.mjs

`
}))