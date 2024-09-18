/**
 * @file Tests the config works as expected based on a sampling of rules.
 */
import { readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { formatAndLint } from '../format-and-lint'
    
const __dirname = dirname(fileURLToPath(import.meta.url))

describe('formatAndLint', () => {
  const formatTests = [
    ['correctly formats boolean operators in if statement', 'boolean-ops'],
    ['correctly places required semicolon', 'necessary-semicolon'],
  ]

  test.each(formatTests)('%s', async (description, testDir) => {
    testDir = resolve(__dirname, 'data', testDir)
    const testFile = resolve(testDir, 'index.mjs')
    const formattedFile = resolve(testDir, 'formatted.txt')

    const results = await formatAndLint({ files: [testFile] })

    const formattedFileConents = readFileSync(formattedFile, {
      encoding : 'utf8',
    })

    expect(results[0].output).toBe(formattedFileConents)
  })
})
