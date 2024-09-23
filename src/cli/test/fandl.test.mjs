import { copyDirToTmp } from '../../test/lib/copy-dir-to-tmp'
import { fandl } from '../fandl'

describe('fandl', () => {
  test.each([
    ['--files', '/src/test/lib'], 
    ['copy-dir-to-tmp.mjs', 'get-formatted-text-for.mjs']
  ])("options %p selects %p", async (args, expectedFiles) => {
    
  })
})