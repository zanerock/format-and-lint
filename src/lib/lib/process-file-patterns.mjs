import { extractPatternsFromFile } from './extract-patterns-from-file'

const processFilePatterns = async (filePatterns = [], filePaths = []) => {
  const patterns = [...filePatterns]

  const extractions = []
  for (const path of filePaths) {
    extractions.push(extractPatternsFromFile(path))
  }

  patterns.push(...(await Promise.all(extractions)).flat())

  return patterns
}

export { processFilePatterns }
