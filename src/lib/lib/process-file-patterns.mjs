import { extractPatternsFromFile } from './extract-patterns-from-file'

const processFilePatterns = async (filePatterns = [], filePaths = []) => {
  const patterns = [...filePatterns]

  for (const path of filePaths) {
    patterns.push(...(await extractPatternsFromFile(path)))
  }

  return patterns
}

export { processFilePatterns }
