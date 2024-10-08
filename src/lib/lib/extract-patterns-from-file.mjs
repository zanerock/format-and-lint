import { readFile } from 'node:fs/promises'

const extractPatternsFromFile = async (path) => {
  const fileContents = await readFile(path, { encoding : 'utf8' })

  const filePatterns = fileContents
    .split(/(?:\r)?\n/) // one pattern per line
    .map((l) => l.trim()) // trim all lines
    .filter((l) => l.length > 0 && !l.startsWith('#')) // remove blank lines and comment lines

  return filePatterns
}

export { extractPatternsFromFile }
