import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { jest } from '@jest/globals'

import { processGitignore } from '../process-gitignore'

const __dirname = dirname(fileURLToPath(import.meta.url))

describe('processGitignore', () => {
  let stderr, msg

  beforeEach(() => {
    stderr = jest.spyOn(process.stderr, 'write').mockImplementation((warn) => { msg = warn })
  })

  afterEach(() => {
    stderr.mockClear()
  })

  afterAll(() => {
    stderr.mockRestore()
  })

  test('generates file patterns', async () => {
    const results = await processGitignore({ path: join(__dirname, 'data', 'test-gitignore.txt') })
    expect(results).toEqual(['qa', 'qa/**', '**/foo', '**/foo/**', '**/*.a', '**/*.a/**'])
  })

  test('throws error by default on negative ignore pattern', async () => {
    try {
      await processGitignore({ path: join(__dirname, 'data', 'test-gitignore-negative.txt')})
      throw new Error('Did not throw as expected.')
    }
    catch (e) {
      expect(e.message).toMatch(/'.gitignore' contains un-usable negative ignore pattern\./)
    }
  })

  test("prints warning on 'warnOnNotIgnore=true' on negative ignore pattern", async () => {
  const origStderr = process.stderr
    await processGitignore({ 
      warnOnNotIgnore : true,
      path: join(__dirname, 'data', 'test-gitignore-negative.txt'),
    })
    expect(msg).toMatch(/Negated '.gitignore' pattern .+ will be ignored\./)
  })
})