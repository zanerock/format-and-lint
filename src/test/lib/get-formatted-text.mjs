import { readFile } from 'node:fs/promises'

const getFormattedText = async (srcFile) => {
  const formattedTxtPath = srcFile.replace(/\.[^.]+$/, '') + '.formatted.txt'
  return await readFile(formattedTxtPath, { encoding: 'utf8' })
}

export { getFormattedText }