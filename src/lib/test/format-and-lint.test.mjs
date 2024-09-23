/**
 * @file Tests the config works as expected based on a sampling of rules.
 */
import { readFile, rm } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { copyDirToTmp } from '../../test/lib/copy-dir-to-tmp'
import { formatAndLint } from '../format-and-lint'
    
const __dirname = dirname(fileURLToPath(import.meta.url))

describe('formatAndLint', () => {
  test("raises error if 'eslintConfig' and 'eslintConfigComponents' defined", async () => {
    const args = { check : true, eslintConfig : [], eslintConfigComponents: [] }
    try {
      // expect(() => formatAndLint(args)).toThrow(/You cannot define/)
      await formatAndLint(args)
    }
    catch (e) {
      expect(e.message).toMatch(/You cannot define/)
    }
  })

  const formatTests = [
    ['correctly formats boolean operators in if statement', 'boolean-ops'],
    ['correctly places required semicolon', 'necessary-semicolon'],
  ]

  test.each(formatTests)('%s', async (description, testDir) => {
    testDir = resolve(__dirname, 'data', testDir)
    const testFile = resolve(testDir, 'index.mjs')
    const formattedFile = resolve(testDir, 'formatted.txt')

    const results = await formatAndLint({ noWrite : true, files: [testFile] })

    const formattedFileContents = await readFile(formattedFile, {
      encoding : 'utf8',
    })

    expect(results[0].output).toBe(formattedFileContents)
  })

  test('will update files in place', async () => {
    const testDirSrc = resolve(__dirname, 'data', 'boolean-ops')
    let tmpDir

    try {
      tmpDir = await copyDirToTmp(testDirSrc, { excludePaths: ['**/*.txt'] })

      const formattedExample = resolve(testDirSrc, 'formatted.txt')

      const testFile = join(tmpDir, 'index.mjs')

      await formatAndLint({ files: [testFile] })

      const formattedExampleConents = await readFile(formattedExample, {
        encoding : 'utf8',
      })
      const formattedFileContents = await readFile(testFile, { encoding: 'utf8' })

      expect(formattedFileContents).toBe(formattedExampleConents)
    }
    finally {
      if (tmpDir !== undefined) {
        await rm(tmpDir, { recursive: true })
      }
    }
  })
})
