import { extractPatternsFromFile } from './extract-patterns-from-file'

const processFilePatterns = async (patterns = [], filePaths = []) => {
  const patterns = [...patterns]

  for (const path of filePaths) {
    patterns.push(...(await extractPatternsFromFile(path)))
  }

  return patterns
}

export { processFilePatternsFile }