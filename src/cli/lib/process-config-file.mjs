import { readFile } from 'node:fs/promises'

import yaml from 'js-yaml'

const processConfigFile = async (path) => {
  const lowerPath = path.toLowerCase()
  if (lowerPath.endsWith('.json') || lowerPath.endsWith('.yml') || lowerPath.endsWith('.yaml')) {
    const contents = readFile(path, { encoding: 'utf8' })
    const json = yaml.load(contents)
    return json
  }
  else {
    const config = await import(path)
    return config
  }
}

export { processConfigFile }