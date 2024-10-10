import * as fs from 'node:fs/promises'
import { tmpdir } from 'node:os'
import * as path from 'node:path'

import { find } from 'find-plus'

const appKey = 'format-and-lint'

const copyDirToTmp = async (dir, findOptions) => {
  const tmpDir = await getTmpDir()

  const filesToCopy = await find({
    ...findOptions,
    onlyFiles : true,
    root      : dir,
  })

  const copyOps = []
  for (const srcFile of filesToCopy) {
    let relPath = srcFile.slice(dir.length)
    if (relPath.startsWith(path.sep)) {
      relPath = relPath.slice(1)
    }
    const targetPath = path.join(tmpDir, relPath)
    copyOps.push(
      (async () => {
        await fs.mkdir(path.dirname(targetPath), { recursive : true })
        await fs.copyFile(srcFile, targetPath)
      })(),
    )
  }

  await Promise.all(copyOps)

  return tmpDir
}

const getTmpDir = async () => {
  const tmpDirPrefix = path.join(tmpdir(), `${appKey}-`)

  return await fs.mkdtemp(tmpDirPrefix)
}

export { getTmpDir, copyDirToTmp }
