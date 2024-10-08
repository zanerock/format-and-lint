import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { processConfigFile } from '../process-config-file'

const __dirname = dirname(fileURLToPath(import.meta.url))

describe('processConfigFile', () => {
  test.each([
    'config.cjs',
    'config.js',
    'config.json',
    'config.mjs',
    'config.yaml',
    'config.yml',
  ])("loads config file '%s'", async (file) => {
    const path = join(__dirname, 'data', file)
    const config = await processConfigFile(path)

    expect(config).toEqual({ foo : 1 })
  })
})
